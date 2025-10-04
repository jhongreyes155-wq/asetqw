import { ClipboardList, FileText, Settings, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  role: "admin" | "author";
}

const adminItems = [
  {
    title: "Review Queue",
    url: "/admin/review",
    icon: ClipboardList,
    testId: "link-review-queue",
  },
  {
    title: "All Labs",
    url: "/admin/labs",
    icon: FileText,
    testId: "link-all-labs",
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    testId: "link-settings",
  },
];

const authorItems = [
  {
    title: "My Labs",
    url: "/author/labs",
    icon: FileText,
    testId: "link-my-labs",
  },
  {
    title: "Profile",
    url: "/author/profile",
    icon: User,
    testId: "link-profile",
  },
];

export function AppSidebar({ role }: AppSidebarProps) {
  const [location] = useLocation();
  const items = role === "admin" ? adminItems : authorItems;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">LM</span>
          </div>
          <div>
            <h2 className="font-semibold text-sidebar-foreground">Lab Manager</h2>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    data-testid={item.testId}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
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
