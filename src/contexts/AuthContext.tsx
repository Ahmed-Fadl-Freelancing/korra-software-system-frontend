import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiClient } from "@/lib/api-client";
import { UserProfile, DepartmentName, JobTitleLevel } from "@/types";

interface AuthError {
  message: string;
}

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  // user/role fields kept for interface compatibility — populated by the
  // department branch (GET /me). Until then they return null/false stubs.
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // On mount: if a valid token exists in localStorage, mark as authenticated.
  // No /me call — profile hydration is handled by the department branch.
  useEffect(() => {
    const token = apiClient.getAccessToken();
    if (token) setIsAuthenticated(true);
    setLoading(false);
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
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      loading,
      user: null,
      isStubMode: false,
      hasDepartment: () => false,
      hasRole: () => false,
      isManager: false,
      departmentName: null,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
