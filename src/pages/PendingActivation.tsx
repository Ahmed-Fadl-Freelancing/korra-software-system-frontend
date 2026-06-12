import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function PendingActivation() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm border-slate-200 bg-white text-center shadow-sm">
        <CardHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <Clock className="h-6 w-6 text-blue-700" />
          </div>
          <CardTitle className="text-xl font-bold">Account pending activation</CardTitle>
          <CardDescription className="text-sm">
            Your account was created successfully
            {user?.employee_code ? ` (${user.employee_code})` : ""}.
            An administrator needs to assign your department and role before you can access the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-500">
            Contact your manager or IT admin and share your email address.
          </p>
          <Button variant="outline" className="w-full" onClick={signOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
