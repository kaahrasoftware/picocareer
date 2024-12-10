import { Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, GraduationCap, Users, Plus, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ProfileDialog } from "./ProfileDialog";
import { AuthDialog } from "./AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function MenuSidebar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { toast } = useToast();
  
  const navigationItems = [
    { icon: Home, label: "Home", href: "#", active: true },
    { icon: GraduationCap, label: "Featured Careers", href: "#" },
    { icon: GraduationCap, label: "Featured Majors", href: "#" },
    { icon: Users, label: "Top Rated Mentors", href: "#" },
    { icon: Plus, label: "", href: "#" },
  ];

  const companyLinks = [
    { label: "About Us", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ];

  const otherLinks = [
    { label: "Blog", href: "#" },
    { label: "How Kahra works", href: "#" },
  ];

  const socialLinks = [
    { icon: "tiktok", href: "#" },
    { icon: "youtube", href: "#" },
    { icon: "linkedin", href: "#" },
    { icon: "instagram", href: "#" },
    { icon: "facebook", href: "#" },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    } else {
      toast({
        title: "Success",
        description: "You have been logged out.",
      });
    }
  };

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
          
          <nav className="flex-1 mb-8">
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

          <div className="mt-auto mb-8">
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
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              onClick={() => setAuthOpen(true)}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="border-t border-border pt-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Company</h4>
                <ul className="space-y-2">
                  {companyLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Other Links</h4>
                <ul className="space-y-2">
                  {otherLinks.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <i className={`fab fa-${link.icon} w-5 h-5`}></i>
                </a>
              ))}
            </div>

            <div>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </Sidebar>
  );
}