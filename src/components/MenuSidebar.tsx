import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationPanel } from "./navigation/NotificationPanel";
import { UserMenu } from "./navigation/UserMenu";
import { MainNavigation } from "./navigation/MainNavigation";
import { useToast } from "@/hooks/use-toast";

export function MenuSidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get initial session and listen for auth changes
  const { data: session, isError } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
      } catch (error: any) {
        console.error('Error fetching session:', error);
        toast({
          title: "Authentication Error",
          description: "Please try signing in again",
          variant: "destructive",
        });
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Consider session data fresh for 5 minutes
  });

  // Set up auth state listener
  useQuery({
    queryKey: ['auth-listener'],
    queryFn: async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          queryClient.setQueryData(['auth-session'], null);
          queryClient.removeQueries(['profile']);
          queryClient.removeQueries(['notifications']);
          navigate("/auth");
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          queryClient.setQueryData(['auth-session'], session);
        }
      });
      return subscription;
    },
    staleTime: Infinity,
  });

  // Fetch user profile data only if we have a session
  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!session?.user?.id,
    retry: 1,
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
      return data;
    },
    enabled: !!session?.user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['notifications', session.user.id] });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      queryClient.clear();
      navigate("/auth");
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // If there's an auth error, show sign in button
  if (isError) {
    return (
      <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50">
        <div className="container h-full mx-auto flex items-center justify-between px-4">
          <Link to="/">
            <img 
              src="/lovable-uploads/2b1bee0a-4952-41f3-8220-963b51130b04.png" 
              alt="PicoCareer Logo" 
              className="h-10"
            />
          </Link>
          <Button 
            variant="default" 
            onClick={() => navigate("/auth")}
            className="bg-picocareer-primary hover:bg-picocareer-primary/90"
          >
            Sign in
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50">
      <div className="container h-full mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img 
              src="/lovable-uploads/2b1bee0a-4952-41f3-8220-963b51130b04.png" 
              alt="PicoCareer Logo" 
              className="h-10"
            />
          </Link>
        </div>

        <MainNavigation />

        <div className="flex items-center gap-4 ml-auto">
          {session?.user && (
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={handleMarkAsRead}
            />
          )}

          {session?.user ? (
            <UserMenu
              session={session}
              profile={profile}
              onSignOut={handleSignOut}
            />
          ) : (
            <Button 
              variant="default" 
              onClick={() => navigate("/auth")}
              className="bg-picocareer-primary hover:bg-picocareer-primary/90"
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}