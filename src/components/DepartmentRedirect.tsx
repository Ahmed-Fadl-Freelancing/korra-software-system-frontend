import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function DepartmentRedirect() {
  const { departmentName, loading } = useAuth();

  if (loading) return null;

  if (departmentName === "tech_office") {
    return <Navigate to="/app/tech" replace />;
  }
  return <Navigate to="/app/sales" replace />;
}
