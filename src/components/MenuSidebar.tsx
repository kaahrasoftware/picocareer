import { Home, BookOpen, Users, RefreshCw, Search } from "lucide-react";
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

export function MenuSidebar() {
  return (
    <Sidebar side="left">
      <div className="relative">
        <SidebarTrigger 
          className="absolute -right-3 top-3 z-50 bg-kahra-dark border border-border"
          side="left"
        />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Explore</SidebarGroupLabel>
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
      </div>
    </Sidebar>
  );
}