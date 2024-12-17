import { useState, useEffect } from "react";
import { ProfileDialog } from "./ProfileDialog";
import { AuthDialog } from "./AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { UserSection } from "./sidebar/UserSection";
import { Link } from "react-router-dom";

export function MenuSidebar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { toast } = useToast();

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

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50">
      <div className="container h-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/d6bd8d63-8ea3-433f-a766-b056fda20667.png" 
            alt="PicoCareer Logo" 
            className="h-10" 
          />
        </div>

        <nav className="flex-1 flex justify-center">
          <ul className="flex gap-8">
            <li>
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/blog" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link 
                to="/community" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Community
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <UserSection
            session={session}
            avatarUrl={avatarUrl}
            isCollapsed={false}
            onSignOut={handleSignOut}
            onProfileClick={() => setProfileOpen(true)}
            onAuthClick={() => setAuthOpen(true)}
          />
        </div>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}