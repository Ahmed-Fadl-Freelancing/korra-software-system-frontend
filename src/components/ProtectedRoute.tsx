import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DepartmentName } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  department?: DepartmentName;
}

export function ProtectedRoute({ children, roles, department }: ProtectedRouteProps) {
  const { session, user, loading, profileStatus, departmentName } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (profileStatus === "not_found") return <Navigate to="/app/onboarding" replace />;

  if (department && departmentName !== department) {
    return <Navigate to="/access-denied" replace />;
  }

  if (roles && user && !roles.some((r) => user.roles?.includes(r as any))) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}
