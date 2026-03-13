import {
  Inbox, PlusCircle, FolderOpen, Wrench, BarChart3,
  TrendingUp, FileCheck, Layers, DollarSign, ClipboardList
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function AppSidebar() {
  const { user, hasDepartment, hasRole } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  if (!user) return null;

  const isSales = hasDepartment("sales");
  const isTech = hasDepartment("tech_office");

  const commonItems: NavItem[] = [
    { title: "Inbox", url: "/app/inbox", icon: Inbox },
    { title: "Opportunities", url: "/app/opportunities", icon: FolderOpen },
  ];

  const salesItems: NavItem[] = isSales
    ? [
        { title: "Sales Dashboard", url: "/app/sales", icon: TrendingUp },
        { title: "New Opportunity", url: "/app/opportunities/new", icon: PlusCircle },
        { title: "Offers", url: "/app/offers", icon: FileCheck },
        { title: "Outcomes", url: "/app/outcomes", icon: BarChart3 },
      ]
    : [];

  const techItems: NavItem[] = isTech
    ? [
        { title: "Tech Dashboard", url: "/app/tech", icon: Layers },
        ...(hasRole("engineer") ? [{ title: "Engineering Workbench", url: "/app/engineering", icon: Wrench }] : []),
        { title: "Model Shortlists", url: "/app/shortlists", icon: ClipboardList },
        { title: "Pricing Queue", url: "/app/pricing", icon: DollarSign },
      ]
    : [];

  const renderSection = (label: string, items: NavItem[]) => {
    if (items.length === 0) return null;
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{!collapsed && label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
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
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {!collapsed && (
          <div className="px-4 py-3">
            <h2 className="text-sm font-bold tracking-tight text-foreground">Platform</h2>
            <p className="text-[11px] text-muted-foreground capitalize">
              {user.department.name.replace("_", " ")} Department
            </p>
          </div>
        )}
        {renderSection("Common", commonItems)}
        {salesItems.length > 0 && (
          <>
            <Separator className="mx-3 w-auto" />
            {renderSection("Sales", salesItems)}
          </>
        )}
        {techItems.length > 0 && (
          <>
            <Separator className="mx-3 w-auto" />
            {renderSection("Tech Office", techItems)}
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
