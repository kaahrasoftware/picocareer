import { Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, GraduationCap, Users, Plus } from "lucide-react";
import { useState } from "react";
import { ProfileDialog } from "./ProfileDialog";
import { AuthDialog } from "./AuthDialog";
import { useSession } from "@supabase/auth-helpers-react";
import { SidebarFooter } from "./SidebarFooter";

export function MenuSidebar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const session = useSession();
  
  const navigationItems = [
    { icon: Home, label: "Home", href: "#", active: true },
    { icon: GraduationCap, label: "Featured Careers", href: "#" },
    { icon: GraduationCap, label: "Featured Majors", href: "#" },
    { icon: Users, label: "Top Rated Mentors", href: "#" },
    { icon: Plus, label: "", href: "#" },
  ];

  return (
    <Sidebar side="left">
      <div className="flex flex-col h-full bg-background border-r border-border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <img src="/lovable-uploads/6acdf1f4-1127-4008-b833-3b68780f1741.png" alt="Logo" className="w-6 h-6" />
              <h2 className="text-xl font-bold">Explore</h2>
            </div>
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
          </div>
          
          <nav className="flex-1">
            <ul className="space-y-4">
              {navigationItems.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${
                      item.active ? 'bg-muted text-foreground' : ''
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <SidebarFooter />
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </Sidebar>
  );
}