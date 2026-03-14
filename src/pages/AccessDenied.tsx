import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function AccessDenied() {
  const { departmentName } = useAuth();
  const navigate = useNavigate();

  const dashboard = departmentName === "tech_office" ? "/app/tech" : "/app/sales";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-0 shadow-lg">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
            <ShieldX className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Access Denied</CardTitle>
            <CardDescription className="text-sm">
              You don't have permission to view this page. Contact your administrator if you believe this is an error.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button className="w-full gap-2" onClick={() => navigate(dashboard)}>
            <ArrowLeft className="h-4 w-4" /> Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
