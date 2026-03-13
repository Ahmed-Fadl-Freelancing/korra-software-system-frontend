import { Inbox, PlusCircle, FolderOpen, Wrench, BarChart3 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Inbox", url: "/app/inbox", icon: Inbox, roles: ["sales", "engineer", "manager"] },
  { title: "New Opportunity", url: "/app/opportunities/new", icon: PlusCircle, roles: ["sales", "manager"] },
  { title: "Opportunities", url: "/app/opportunities", icon: FolderOpen, roles: ["sales", "engineer", "manager"] },
  { title: "Engineering", url: "/app/engineering", icon: Wrench, roles: ["engineer", "manager"] },
  { title: "Manager", url: "/app/manager", icon: BarChart3, roles: ["manager"] },
];

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && "Platform"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-accent"
                      activeClassName="bg-accent text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
