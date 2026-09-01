import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { apiClient, ApiAuthError } from "@/lib/api-client";
import { UserProfile, DepartmentName, JobTitleLevel } from "@/types";

interface AuthError {
  message: string;
}

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  user: UserProfile | null;
  isStubMode: boolean;
  hasDepartment: (dept: DepartmentName) => boolean;
  hasRole: (role: string) => boolean;
  isManager: boolean;
  departmentName: DepartmentName | null;
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signUp: (email: string, password: string, fullName: string, jobTitle: JobTitleLevel, department: DepartmentName) => Promise<{ error: AuthError | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  loading: true,
  user: null,
  isStubMode: false,
  hasDepartment: () => false,
  hasRole: () => false,
  isManager: false,
  departmentName: null,
  signIn: async () => null,
  signUp: async () => ({ error: null, needsConfirmation: true }),
  signOut: async () => {},
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

  /**
   * Calls GET /me and populates user state.
   *
   * stubOnNetworkError=true  → backend-down falls back to stub (used on app mount)
   * stubOnNetworkError=false → auth/network failures propagate (used after login)
   */
  const fetchUserProfile = useCallback(async (stubOnNetworkError = false) => {
    try {
      const profile = await apiClient.get<UserProfile>("/me");
      setUser(profile);
      setIsAuthenticated(true);
      setIsStubMode(false);
    } catch (err: unknown) {
      if (err instanceof ApiAuthError) {
        throw err;
      }
      if (stubOnNetworkError) {
        console.warn("GET /me unreachable — using stub profile for dev");
        setUser(STUB_USER);
        setIsAuthenticated(true);
        setIsStubMode(true);
      } else {
        throw err;
      }
    }
  }, []);

  // On mount: if token exists, validate it via GET /me
  useEffect(() => {
    const token = apiClient.getAccessToken();
    if (token) {
      fetchUserProfile(true).catch(() => {
        apiClient.clearTokens();
        setIsAuthenticated(false);
        setUser(null);
      }).finally(() => setLoading(false));
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
      if (!data.access_token) {
        return { message: "Login succeeded but no token was returned. Please try again." };
      }
      apiClient.setTokens(data.access_token, data.refresh_token);
      await fetchUserProfile(false);
      return null;
    } catch (err: any) {
      if (err instanceof ApiAuthError) {
        apiClient.clearTokens();
        return { message: "Login succeeded but your profile could not be loaded. Please try again." };
      }
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
      // Django returns: { user: <goTrueResponse>, session: null, message: "..." }
      // When email confirmation is OFF, GoTrue session lives inside data.user.
      const data = await apiClient.post<{
        user: { access_token?: string; refresh_token?: string } | null;
        session: null;
        message: string;
      }>(
        "/auth/signup",
        { email, password, full_name: fullName, job_title: jobTitle, department }
      );

      // EMAIL VERIFICATION BYPASSED (Supabase free tier — 2 emails/hour).
      // When "Enable email confirmations" is OFF, GoTrue returns tokens in data.user.
      // TO RE-ENABLE: turn ON "Enable email confirmations" in Supabase Auth settings,
      // then remove the if-block below — the needsConfirmation=true path takes over.
      if (data.user?.access_token) {
        apiClient.setTokens(data.user.access_token, data.user.refresh_token);
        await fetchUserProfile(false);
        return { error: null, needsConfirmation: false };
      }

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
    <AuthContext.Provider value={{
      isAuthenticated,
      loading,
      user,
      isStubMode,
      hasDepartment,
      hasRole,
      isManager,
      departmentName,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
