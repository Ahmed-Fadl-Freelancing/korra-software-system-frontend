import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api-client";
import { UserProfile, DepartmentName } from "@/types";

interface AuthState {
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  isStubMode: boolean;
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  hasDepartment: (dept: DepartmentName) => boolean;
  hasRole: (role: string) => boolean;
  isManager: boolean;
  departmentName: DepartmentName | null;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  loading: true,
  isStubMode: false,
  signIn: async () => null,
  signUp: async () => ({ error: null, needsConfirmation: false }),
  signOut: async () => {},
  hasDepartment: () => false,
  hasRole: () => false,
  isManager: false,
  departmentName: null,
});

export const useAuth = () => useContext(AuthContext);

const STUB_USER: UserProfile = {
  id: "stub-user-id",
  email: "demo@example.com",
  name: "Demo User",
  department: { id: "dept-1", name: "sales" },
  roles: ["sales", "manager"],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStubMode, setIsStubMode] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const profile = await apiClient.get<UserProfile>("/me");
      setUser(profile);
      setIsStubMode(false);
    } catch {
      console.warn("Django /me unavailable, using stub user profile");
      setUser(STUB_USER);
      setIsStubMode(true);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          await fetchUserProfile();
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        await fetchUserProfile();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{ access_token: string; refresh_token: string }>("/auth/login", { email, password });
      
      // Sync local Supabase client so Storage/Realtime work
      const { error } = await supabase.auth.setSession({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      });

      if (error) throw error;
      return null;
    } catch (error: any) {
      console.error("Login error:", error);
      return { message: error.message || "Login failed" } as AuthError;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await apiClient.post<{ access_token?: string; refresh_token?: string }>("/auth/signup", {
        email,
        password,
        full_name: fullName,
      });

      // If backend logs in immediately
      if (response.access_token && response.refresh_token) {
        await supabase.auth.setSession({
          access_token: response.access_token,
          refresh_token: response.refresh_token,
        });
        return { error: null, needsConfirmation: false };
      }

      return { error: null, needsConfirmation: true };
    } catch (error: any) {
      console.error("Signup error:", error);
      return { error: { message: error.message || "Signup failed" } as AuthError, needsConfirmation: false };
    }
  };

  const signOut = async () => {
    try {
      // Notify backend if needed
      await apiClient.post("/auth/logout").catch(() => {});
      
      await supabase.auth.signOut();
      // Explicitly clear any items that might be cached or stuck
      localStorage.clear();
    } catch (error) {
      console.error("SignOut error:", error);
    } finally {
      setSession(null);
      setUser(null);
      window.location.href = "/login";
    }
  };

  const hasDepartment = (dept: DepartmentName) => user?.department.name === dept;
  const hasRole = (role: string) => user?.roles.includes(role as any) ?? false;
  const isManager = user?.roles.includes("manager") ?? false;
  const departmentName = user?.department.name ?? null;

  return (
    <AuthContext.Provider value={{ session, user, loading, isStubMode, signIn, signUp, signOut, hasDepartment, hasRole, isManager, departmentName }}>
      {children}
    </AuthContext.Provider>
  );
}
