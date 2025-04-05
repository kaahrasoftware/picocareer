
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { NotificationPanel } from "./navigation/NotificationPanel";
import { UserMenu } from "./navigation/UserMenu";
import { MainNavigation } from "./navigation/MainNavigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

export function MenuSidebar() {
  const navigate = useNavigate();
  const { session, isError, isLoading: authLoading } = useAuthSession();
  const { data: profile, isLoading: profileLoading } = useUserProfile(session);
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications(session);
  const [isInitialized, setIsInitialized] = useState(false);
  const isMobile = useIsMobile();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark UI as initialized after initial render to prevent flashing
  useEffect(() => {
    if (!authLoading && !profileLoading) {
      setIsInitialized(true);
    }
  }, [authLoading, profileLoading]);

  // Show loading state until auth is initialized
  if (!isInitialized) {
    return (
      <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50">
        <div className="container h-full mx-auto flex items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/f2122040-63e7-4f46-8b7c-d7c748d45e28.png" 
              alt="PicoCareer Logo" 
              className="h-10"
            />
            <span className="text-xl font-semibold text-foreground">PicoCareer</span>
          </Link>
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
        </div>
      </header>
    );
  }

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
            <span className="text-xl font-semibold text-foreground">PicoCareer</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button 
              variant="default" 
              onClick={() => navigate("/auth")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Sign in
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 pt-6">
                  <MainNavigation />
                </div>
              </SheetContent>
            </Sheet>
          </div>
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
              src="/lovable-uploads/f2122040-63e7-4f46-8b7c-d7c748d45e28.png" 
              alt="PicoCareer Logo" 
              className="h-10"
            />
            <span className="text-xl font-semibold text-foreground">PicoCareer</span>
          </Link>
        </div>

        {isMobile ? (
          <div className="flex items-center gap-4">
            {session?.user && (
              <NotificationPanel
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={() => {}} // We'll implement this in another PR
              />
            )}
            {!session?.user && (
              <Button 
                variant="default" 
                onClick={() => navigate("/auth")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sign in
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 pt-6">
                  <MainNavigation />
                  {session?.user && profile && <UserMenu />}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <MainNavigation />
            {session?.user && (
              <NotificationPanel
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={() => {}} // We'll implement this in another PR
              />
            )}
            {session?.user && profile ? (
              <UserMenu />
            ) : (
              <Button 
                variant="default" 
                onClick={() => navigate("/auth")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sign in
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
