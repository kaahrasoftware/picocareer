import { Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, BookOpen, Users, LogOut, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { ProfileDialog } from "./ProfileDialog";
import { AuthDialog } from "./AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useNavigate } from "react-router-dom";

export function MenuSidebar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const navigationItems = [
    { icon: Home, label: "Home", href: "/", active: window.location.pathname === "/" },
    { icon: BookOpen, label: "Blog", href: "/blog", active: window.location.pathname === "/blog" },
    { icon: Users, label: "Community", href: "/community", active: window.location.pathname === "/community" },
  ];

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
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
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 min-w-[32px]">
            <img src="/lovable-uploads/17542041-7873-4c47-be52-385972798475.png" alt="Logo" className="w-6 h-6" />
            <h2 className={`text-xl font-bold transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>PicoCareer</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-4">
            {navigationItems.map((item) => (
              <li key={item.label}>
                <a 
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.href);
                  }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${
                    item.active ? 'bg-muted text-foreground' : ''
                  }`}
                  data-sidebar="menu-button"
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-6">
          {session?.user ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setProfileOpen(true)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={avatarUrl || ''} alt={session.user.email || 'User'} />
                    <AvatarFallback className="bg-muted">
                      {session.user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <div className={`flex-1 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                  <h3 className="text-sm font-medium truncate">{session.user.email}</h3>
                  <p className="text-xs text-muted-foreground">Student</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleSignOut}
                data-sidebar="menu-button"
              >
                <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Sign out</span>
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              onClick={() => setAuthOpen(true)}
              data-sidebar="menu-button"
            >
              <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Sign in</span>
            </Button>
          )}
        </div>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
