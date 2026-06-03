import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api-client";
import { UserProfile, DepartmentName } from "@/types";

interface AuthState {
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  isStubMode: boolean;
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

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Explicitly clear any items that might be cached or stuck
      localStorage.removeItem("sb-" + import.meta.env.VITE_SUPABASE_URL.split("//")[1].split(".")[0] + "-auth-token");
      localStorage.clear(); // Nuclear option for logout safety
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
    <AuthContext.Provider value={{ session, user, loading, isStubMode, signOut, hasDepartment, hasRole, isManager, departmentName }}>
      {children}
    </AuthContext.Provider>
  );
}
