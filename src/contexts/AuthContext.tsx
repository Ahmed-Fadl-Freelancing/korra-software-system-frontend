import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { UserProfile, DepartmentName, JobTitleLevel } from "@/types";

interface AuthError {
  message: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  isStubMode: boolean;
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signUp: (email: string, password: string, fullName: string, jobTitle: JobTitleLevel, department: DepartmentName) => Promise<{ error: AuthError | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  hasDepartment: (dept: DepartmentName) => boolean;
  hasRole: (role: string) => boolean;
  isManager: boolean;
  departmentName: DepartmentName | null;
}

const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  user: null,
  loading: true,
  isStubMode: false,
  signIn: async () => null,
  signUp: async () => ({ error: null, needsConfirmation: true }),
  signOut: async () => {},
  hasDepartment: () => false,
  hasRole: () => false,
  isManager: false,
  departmentName: null,
});

export const useAuth = () => useContext(AuthContext);

const STUB_USER: UserProfile = {
  user_id: "stub-user-id",
  email: "demo@example.com",
  employee_code: "EMP-STUB",
  full_name: "Demo User",
  job_title: null,
  is_active: true,
  department: { id: "dept-1", name: "Sales" },
  roles: ["sales_engineer", "manager"],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStubMode, setIsStubMode] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await apiClient.get<UserProfile>("/me");
      setUser(profile);
      setIsAuthenticated(true);
      setIsStubMode(false);
    } catch {
      console.warn("Backend /me unavailable — using stub profile");
      setUser(STUB_USER);
      setIsAuthenticated(true);
      setIsStubMode(true);
    }
  }, []);

  // On mount: if a token exists in localStorage, validate it via /me
  useEffect(() => {
    const token = apiClient.getAccessToken();
    if (token) {
      fetchUserProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const signIn = async (email: string, password: string): Promise<AuthError | null> => {
    try {
      const data = await apiClient.post<{ access_token: string; refresh_token: string }>(
        "/auth/login",
        { email, password }
      );
      apiClient.setTokens(data.access_token, data.refresh_token);
      await fetchUserProfile();
      return null;
    } catch (err: any) {
      return { message: err.message || "Login failed" };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    jobTitle: JobTitleLevel,
    department: DepartmentName
  ) => {
    try {
      // Backend proxies to Supabase GoTrue; full_name, job_title, department go
      // into raw_user_meta_data so the DB trigger can seed user_profiles.
      const data = await apiClient.post<{ access_token?: string; refresh_token?: string }>(
        "/auth/signup",
        { email, password, full_name: fullName, job_title: jobTitle, department }
      );

      // EMAIL VERIFICATION BYPASSED (Supabase free tier — 2 emails/hour limit).
      // When Supabase "Enable email confirmations" is OFF, GoTrue returns tokens
      // immediately. We consume them here so the user lands directly on their
      // dashboard without a separate login step.
      //
      // TO RE-ENABLE EMAIL VERIFICATION:
      //   1. Turn ON "Enable email confirmations" in Supabase Auth settings.
      //   2. Remove the if-block below (or comment it out).
      //   3. The needsConfirmation=true branch will take over automatically.
      if (data.access_token) {
        apiClient.setTokens(data.access_token, data.refresh_token);
        await fetchUserProfile();
        return { error: null, needsConfirmation: false };
      }

      // Email confirmation required — no tokens yet.
      return { error: null, needsConfirmation: true };
    } catch (err: any) {
      return { error: { message: err.message || "Signup failed" }, needsConfirmation: false };
    }
  };

  const signOut = async () => {
    try {
      await apiClient.post("/auth/logout").catch(() => {});
    } finally {
      apiClient.clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = "/login";
    }
  };

  const hasDepartment = (dept: DepartmentName) => user?.department?.name === dept;
  const hasRole = (role: string) => user?.roles.includes(role as any) ?? false;
  const isManager = user?.roles.includes("manager") ?? false;
  const departmentName = user?.department?.name ?? null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, isStubMode, signIn, signUp, signOut, hasDepartment, hasRole, isManager, departmentName }}>
      {children}
    </AuthContext.Provider>
  );
}
