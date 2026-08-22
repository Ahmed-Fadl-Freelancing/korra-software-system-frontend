import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiClient } from "@/lib/api-client";
import { UserProfile, MeResponse, DepartmentName, JobTitleLevel } from "@/types";

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

// Fetches GET /me and merges in the email claim from the JWT (GET /me itself doesn't return email).
// Returns null on any failure — a 401 that survives apiClient's own refresh attempt already clears
// the stored tokens as a side effect, which the caller checks for via apiClient.getAccessToken().
async function fetchProfile(): Promise<UserProfile | null> {
  try {
    const data = await apiClient.get<MeResponse>("/me");
    return { ...data, email: apiClient.getEmailFromToken() ?? "" };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  // On mount: if a token exists, mark authenticated and hydrate the real profile via GET /me.
  useEffect(() => {
    const token = apiClient.getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setIsAuthenticated(true);
    fetchProfile()
      .then(setUser)
      .finally(() => {
        // apiClient clears tokens itself on an unrecoverable 401 — reflect that here so a dead
        // token doesn't leave the app stuck thinking it's authenticated with no profile.
        if (!apiClient.getAccessToken()) setIsAuthenticated(false);
        setLoading(false);
      });
  }, []);

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
      setIsAuthenticated(true);
      setUser(await fetchProfile());
      return null;
    } catch (err) {
      return { message: err instanceof Error ? err.message : "Login failed" };
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
        setIsAuthenticated(true);
        setUser(await fetchProfile());
        return { error: null, needsConfirmation: false };
      }

      return { error: null, needsConfirmation: true };
    } catch (err) {
      return { error: { message: err instanceof Error ? err.message : "Signup failed" }, needsConfirmation: false };
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
  const hasRole = (role: string) => user?.roles.some((r) => r === role) ?? false;
  const isManager = user?.roles.includes("manager") ?? false;
  const departmentName = user?.department?.name ?? null;

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      loading,
      user,
      isStubMode: false,
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
