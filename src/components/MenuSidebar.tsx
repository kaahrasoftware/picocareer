import { Home, BookOpen, Users, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { ProfileDialog } from "./ProfileDialog";
import { AuthDialog } from "./AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { NavigationItem } from "./sidebar/NavigationItem";
import { UserSection } from "./sidebar/UserSection";

const navigationItems = [
  { icon: Home, label: "Home", href: "/", active: window.location.pathname === "/" },
  { icon: BookOpen, label: "Blog", href: "/blog", active: window.location.pathname === "/blog" },
  { icon: Users, label: "Community", href: "/community", active: window.location.pathname === "/community" },
];

export function MenuSidebar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
        setAuthOpen(false);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      } else {
        setAvatarUrl(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, email')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setAvatarUrl(data?.avatar_url || null);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    setSession(null);
    setAvatarUrl(null);
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`fixed left-0 top-0 h-screen flex flex-col bg-background border-r border-border sidebar-transition ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Logo Section */}
      <div className={`p-4 border-b border-border ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <img 
            src="/lovable-uploads/17542041-7873-4c47-be52-385972798475.png" 
            alt="Logo" 
            className="w-8 h-8" 
          />
          <h2 className={`text-xl font-bold transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            PicoCareer
          </h2>
        </div>
      </div>

      {/* Toggle Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar}
        className="absolute right-2 top-16 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
      </Button>

      {/* Main Content Container with flex-1 to take remaining space */}
      <div className="flex-1 flex flex-col">
        {/* Spacer to push content down */}
        <div className="flex-1 min-h-[60px]" />
        
        {/* Navigation Menu - centered in the remaining space */}
        <nav className="flex-1 p-4">
          <ul className="space-y-4">
            {navigationItems.map((item) => (
              <NavigationItem
                key={item.label}
                {...item}
                isCollapsed={isCollapsed}
              />
            ))}
          </ul>
        </nav>
        
        {/* Spacer to push content up */}
        <div className="flex-1 min-h-[60px]" />

        {/* User Section at bottom */}
        <div className="p-4 border-t border-border">
          <UserSection
            session={session}
            avatarUrl={avatarUrl}
            isCollapsed={isCollapsed}
            onSignOut={handleSignOut}
            onProfileClick={() => setProfileOpen(true)}
            onAuthClick={() => setAuthOpen(true)}
          />
        </div>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}