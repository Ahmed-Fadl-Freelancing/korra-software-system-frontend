import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

interface RoleGuardProps {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
