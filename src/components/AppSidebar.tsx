import { Home, BookOpen, Users, RefreshCw, Search, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const menuItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: BookOpen, label: "Featured Careers", href: "#careers" },
  { icon: Users, label: "Top Rated Mentors", href: "#mentors" },
  { icon: RefreshCw, label: "Career Switch", href: "#switch" },
  { icon: Search, label: "Most Searched Majors", href: "#majors" },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 py-2">
            <SidebarGroupLabel>Explore</SidebarGroupLabel>
            <SidebarTrigger />
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <a href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </a>
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