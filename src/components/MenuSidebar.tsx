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
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export function MenuSidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { session, isError } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { data: notifications = [] } = useNotifications(session);
  const isMobile = useIsMobile();

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
              src="/lovable-uploads/f2122040-63e7-4f46-8b7c-d7c748d45e28.png" 
              alt="PicoCareer Logo" 
              className="h-10"
            />
          </Link>
          <div className="flex-1 flex items-center justify-center">
            <Button 
              variant="default" 
              onClick={() => navigate("/auth")}
              className="bg-picocareer-primary hover:bg-picocareer-primary/90"
            >
              Sign in
            </Button>
          </div>
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-4">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 pt-6">
                  <MainNavigation />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </header>
    );
  }

  const navigationContent = (
    <>
      <MainNavigation />
      <div className="flex items-center gap-4">
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
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50">
      <div className="container h-full mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/f2122040-63e7-4f46-8b7c-d7c748d45e28.png" 
              alt="PicoCareer Logo" 
              className="h-10"
            />
          </Link>
        </div>

        {isMobile ? (
          <div className="flex items-center gap-4">
            {session?.user && (
              <NotificationPanel
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={handleMarkAsRead}
              />
            )}
            {session?.user ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col gap-6 pt-6">
                    <MainNavigation />
                    <UserMenu />
                  </div>
                </SheetContent>
              </Sheet>
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
        ) : (
          navigationContent
        )}
      </div>
    </header>
  );
}