import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api-client";
import { UserProfile, DepartmentName } from "@/types";

type ProfileStatus = "loading" | "ok" | "not_found" | "error";

interface AuthState {
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  profileStatus: ProfileStatus;
  isStubMode: boolean;
  signOut: () => Promise<void>;
  hasDepartment: (dept: DepartmentName) => boolean;
  hasRole: (role: string) => boolean;
  isManager: boolean;
  isSalesDept: boolean;
  isTechDept: boolean;
  departmentName: DepartmentName | null;
  deptCode: () => DepartmentName | null;
  sessionEmail: string | null;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  loading: true,
  profileStatus: "loading",
  isStubMode: false,
  signOut: async () => {},
  hasDepartment: () => false,
  hasRole: () => false,
  isManager: false,
  isSalesDept: false,
  isTechDept: false,
  departmentName: null,
  deptCode: () => null,
  sessionEmail: null,
});

export const useAuth = () => useContext(AuthContext);

function normalizeDeptName(raw?: string): DepartmentName | null {
  if (!raw) return null;
  const lower = raw.trim().toLowerCase().replace(/[\s_]+/g, "_");
  if (lower === "sales") return "sales";
  if (["tech_office", "technical_office", "techoffice"].includes(lower)) return "tech_office";
  return null;
}

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
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>("loading");
  const [isStubMode, setIsStubMode] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    setProfileStatus("loading");
    try {
      const profile = await apiClient.get<UserProfile>("/me");
      if (!profile.department || !normalizeDeptName(profile.department.name)) {
        setUser(null);
        setProfileStatus("not_found");
        return;
      }
      setUser(profile);
      setProfileStatus("ok");
      setIsStubMode(false);
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (msg.includes("404") || msg.includes("PROFILE_NOT_FOUND")) {
        setUser(null);
        setProfileStatus("not_found");
        setIsStubMode(false);
      } else if (msg.includes("Unauthorized") || msg.includes("401")) {
        setUser(null);
        setProfileStatus("error");
      } else {
        console.warn("Django /me unavailable, using stub user profile");
        setUser(STUB_USER);
        setProfileStatus("ok");
        setIsStubMode(true);
      }
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, sess) => {
        setSession(sess);
        if (sess) {
          await fetchUserProfile();
        } else {
          setUser(null);
          setProfileStatus("loading");
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
      setSession(sess);
      if (sess) {
        await fetchUserProfile();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfileStatus("loading");
    setIsStubMode(false);
  }, []);

  const deptCode = useCallback((): DepartmentName | null => {
    return normalizeDeptName(user?.department?.name);
  }, [user]);

  const departmentName = normalizeDeptName(user?.department?.name);
  const hasDepartment = (dept: DepartmentName) => departmentName === dept;
  const hasRole = (role: string) => user?.roles?.includes(role as any) ?? false;
  const isManager = user?.roles?.includes("manager") ?? false;
  const isSalesDept = departmentName === "sales";
  const isTechDept = departmentName === "tech_office";
  const sessionEmail = session?.user?.email ?? null;

  return (
    <AuthContext.Provider value={{
      session, user, loading, profileStatus, isStubMode, signOut,
      hasDepartment, hasRole, isManager, isSalesDept, isTechDept,
      departmentName, deptCode, sessionEmail,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
