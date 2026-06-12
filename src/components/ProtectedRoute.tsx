import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DepartmentName } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  department?: DepartmentName;
}

export function ProtectedRoute({ children, roles, department }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading, hasRole, hasDepartment, departmentName } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Department not yet assigned — waiting for admin activation
  if (!user?.department) return <Navigate to="/pending" replace />;

  if (department && !hasDepartment(department)) {
    const fallback = departmentName === "Tech Office" ? "/app/tech" : "/app/sales";
    return <Navigate to={fallback} replace />;
  }

  if (roles && user && !roles.some((r) => hasRole(r))) {
    const fallback = departmentName === "Tech Office" ? "/app/tech" : "/app/sales";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
