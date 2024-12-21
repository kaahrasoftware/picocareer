import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, BellDot } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function MenuSidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get initial session and listen for auth changes
  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    staleTime: Infinity,
  });

  // Set up auth state listener
  useQuery({
    queryKey: ['auth-listener'],
    queryFn: async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        queryClient.setQueryData(['auth-session'], session);
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
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
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
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    if (!session?.user?.id) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    queryClient.invalidateQueries({ queryKey: ['notifications', session.user.id] });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate("/");
  };

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
                to="/career" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Careers
              </Link>
            </li>
            <li>
              <Link 
                to="/program" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Programs
              </Link>
            </li>
            <li>
              <Link 
                to="/mentor" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Find a Mentor
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
                to="/video" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Videos
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-4 ml-auto">
          {session?.user && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  {unreadCount > 0 ? (
                    <>
                      <BellDot className="h-5 w-5" />
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    </>
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Notifications</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                  {notifications.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No notifications yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border ${
                            notification.read ? 'bg-background' : 'bg-muted'
                          }`}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          {notification.action_url && (
                            <Link
                              to={notification.action_url}
                              className="text-sm text-primary hover:underline mt-2 block"
                            >
                              View details
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </SheetContent>
            </Sheet>
          )}

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-12 rounded-full p-0 border-0 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-picocareer-primary to-picocareer-secondary" />
                  <div className="absolute inset-[3px] rounded-full bg-background" />
                  <Avatar className="h-10 w-10 relative">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || session.user.email || ''} />
                    <AvatarFallback>{profile?.full_name?.[0] || session.user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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