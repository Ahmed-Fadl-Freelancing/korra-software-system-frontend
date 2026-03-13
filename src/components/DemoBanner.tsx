import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle } from "lucide-react";

export function DemoBanner() {
  const { isStubMode } = useAuth();
  if (!isStubMode) return null;

  return (
    <div className="flex items-center gap-2 bg-warning/10 px-4 py-1.5 text-xs font-medium text-warning">
      <AlertCircle className="h-3.5 w-3.5" />
      Demo mode — backend not connected. Showing sample data.
    </div>
  );
}
