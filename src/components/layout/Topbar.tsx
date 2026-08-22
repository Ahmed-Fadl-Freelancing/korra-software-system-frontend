import { LogOut, User, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Topbar() {
  const { user, signOut, isManager } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <>
            {user.department && (
              <Badge variant="secondary" className="text-xs">
                {user.department.name}
              </Badge>
            )}
            {isManager && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Shield className="h-3 w-3" />
                Manager
              </Badge>
            )}
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              {user.full_name}
            </span>
          </>
        )}
        <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
