import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationPanel } from "./navigation/NotificationPanel";
import { UserMenu } from "./navigation/UserMenu";
import { MainNavigation } from "./navigation/MainNavigation";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNotifications } from "@/hooks/useNotifications";

export function MenuSidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { session, isError } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { data: notifications = [] } = useNotifications(session);

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
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
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
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/41303ab3-797b-42cd-88b0-839e882a8abf.png" 
              alt="PicoCareer Logo" 
              className="h-10"
            />
            <img 
              src="/lovable-uploads/e578ccd5-49b7-4780-8adf-f191492791f4.png" 
              alt="PicoCareer Title" 
              className="h-8"
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
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/41303ab3-797b-42cd-88b0-839e882a8abf.png" 
              alt="PicoCareer Logo" 
              className="h-10"
            />
            <img 
              src="/lovable-uploads/e578ccd5-49b7-4780-8adf-f191492791f4.png" 
              alt="PicoCareer Title" 
              className="h-8"
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
            <UserMenu />
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