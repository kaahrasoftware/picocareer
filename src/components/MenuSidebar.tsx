import { Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, GraduationCap, Users, Plus } from "lucide-react";
import { useState } from "react";
import { ProfileDialog } from "./ProfileDialog";

export function MenuSidebar() {
  const [profileOpen, setProfileOpen] = useState(false);
  
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
        <div className="p-6 flex flex-col h-full">
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

          {/* Footer content positioned at bottom */}
          <div className="mt-auto pt-6">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setProfileOpen(true)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden"
              >
                <img src="/placeholder.svg" alt="User" className="w-8 h-8 rounded-full" />
              </button>
              <div className="flex-1">
                <h3 className="text-sm font-medium">John Doe</h3>
                <p className="text-xs text-muted-foreground">Student</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </Sidebar>
  );
}