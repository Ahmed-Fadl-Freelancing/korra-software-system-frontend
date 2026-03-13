import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DepartmentName } from "@/types";

interface RoleGuardProps {
  roles?: string[];
  department?: DepartmentName;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ roles, department, children, fallback = null }: RoleGuardProps) {
  const { user, hasRole, hasDepartment } = useAuth();
  if (!user) return <>{fallback}</>;
  if (department && !hasDepartment(department)) return <>{fallback}</>;
  if (roles && !roles.some((r) => hasRole(r))) return <>{fallback}</>;
  return <>{children}</>;
}
