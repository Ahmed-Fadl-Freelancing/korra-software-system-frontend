import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, LogOut, Mail, Clock } from "lucide-react";

export default function Onboarding() {
  const { signOut, sessionEmail } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-warning/10">
            <Clock className="h-7 w-7 text-warning" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Account Not Provisioned</CardTitle>
            <CardDescription className="text-sm">
              Your account has been created but is not yet linked to a department or role.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {sessionEmail && (
            <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium truncate">{sessionEmail}</span>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> What to do next
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
              <li>Contact your system administrator or team lead</li>
              <li>Ask them to assign your department (Sales or Tech Office) and roles</li>
              <li>Once provisioned, log out and back in to access the platform</li>
            </ul>
          </div>

          <Button variant="outline" className="w-full gap-2" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
