import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { apiClient, ApiAuthError } from "@/lib/api-client";
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

  /**
   * Fetches the user profile from GET /me.
   *
   * @param stubOnNetworkError - When true (on app mount / session restore), a
   *   network-level failure falls back to stub so engineers can work without a
   *   running backend. Auth errors (401/403) always throw — stub mode should
   *   never hide a real authentication failure.
   */
  const fetchUserProfile = useCallback(async (stubOnNetworkError = false) => {
    try {
      const profile = await apiClient.get<UserProfile>("/me");
      setUser(profile);
      setIsAuthenticated(true);
      setIsStubMode(false);
    } catch (err: unknown) {
      // ApiAuthError = 401/403/no-token — a real auth failure, never use stub
      if (err instanceof ApiAuthError) {
        throw err;
      }
      // Network / backend-down errors
      if (stubOnNetworkError) {
        console.warn("Backend /me unreachable — using stub profile for dev");
        setUser(STUB_USER);
        setIsAuthenticated(true);
        setIsStubMode(true);
      } else {
        throw err;
      }
    }
  }, []);

  // On mount: if a token exists, validate it via GET /me
  useEffect(() => {
    const token = apiClient.getAccessToken();
    if (token) {
      fetchUserProfile(true).catch(() => {
        // Auth error from GET /me — token is invalid/expired, stay logged out
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

      // stubOnNetworkError=false here: a 401 on /me means something is genuinely
      // wrong (bad token, missing /me endpoint), so surface it as a login error.
      await fetchUserProfile(false);
      return null;
    } catch (err: any) {
      // Clean up any tokens we may have stored if profile fetch failed
      if (err instanceof ApiAuthError) {
        apiClient.clearTokens();
        return { message: "Login succeeded but your session could not be loaded. Please try again." };
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
      // Backend proxies to Supabase GoTrue; full_name, job_title, department go
      // into raw_user_meta_data so the DB trigger can seed user_profiles.
      // Django returns: { user: <goTrueResponse>, session: null, message: "..." }
      const data = await apiClient.post<{
        user: { access_token?: string; refresh_token?: string } | null;
        session: null;
        message: string;
      }>(
        "/auth/signup",
        { email, password, full_name: fullName, job_title: jobTitle, department }
      );

      // EMAIL VERIFICATION BYPASSED (Supabase free tier — 2 emails/hour limit).
      // When Supabase "Enable email confirmations" is OFF, GoTrue returns a full
      // session inside `data.user`. We consume it so the user lands on their
      // dashboard immediately.
      //
      // TO RE-ENABLE EMAIL VERIFICATION:
      //   1. Turn ON "Enable email confirmations" in Supabase Auth settings.
      //   2. Remove the if-block below (or comment it out).
      //   3. The needsConfirmation=true branch takes over automatically.
      if (data.user?.access_token) {
        apiClient.setTokens(data.user.access_token, data.user.refresh_token);
        await fetchUserProfile(false);
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
