import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function DepartmentRedirect() {
  const { departmentName, loading } = useAuth();

  if (loading) return null;

  if (departmentName === "Tech Office") return <Navigate to="/app/tech" replace />;
  if (departmentName === "Sales") return <Navigate to="/app/sales" replace />;

  // No department assigned yet — admin hasn't activated the account
  return <Navigate to="/pending" replace />;
}
