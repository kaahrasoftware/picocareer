import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  LogOut, 
  Settings, 
  Calendar,
  Bell,
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  Users,
  BookOpen,
  Briefcase,
  MessageSquare,
  School,
  Award,
  Building,
  Mail,
  ChartBar,
  Bot,
  Handshake,
  Database
} from "lucide-react";
import { useAuthState } from "@/hooks/useAuthState";
import { UserMenu } from "./UserMenu";
import { NotificationItem } from "./NotificationItem";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export function ModernNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, profile, signOut } = useAuthState();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const isAdmin = profile?.user_type === 'admin';

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              StudyAbroad
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/career" className={cn("group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50", isActive('/career') && "bg-accent/50")}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Careers
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center">
                    <School className="w-4 h-4 mr-2" />
                    Education
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      <div className="grid gap-1">
                        <h4 className="font-medium leading-none">Academic Resources</h4>
                        <p className="text-sm text-muted-foreground">Explore schools, majors, and funding opportunities</p>
                      </div>
                      <div className="grid gap-2">
                        <NavigationMenuLink asChild>
                          <Link to="/school" className="block p-3 rounded-md hover:bg-accent">
                            <div className="flex items-center space-x-2">
                              <School className="w-4 h-4" />
                              <div>
                                <div className="text-sm font-medium">Universities</div>
                                <div className="text-xs text-muted-foreground">Browse global institutions</div>
                              </div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/scholarships" className="block p-3 rounded-md hover:bg-accent">
                            <div className="flex items-center space-x-2">
                              <Award className="w-4 h-4" />
                              <div>
                                <div className="text-sm font-medium">Scholarships</div>
                                <div className="text-xs text-muted-foreground">Find funding opportunities</div>
                              </div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/opportunities" className="block p-3 rounded-md hover:bg-accent">
                            <div className="flex items-center space-x-2">
                              <Briefcase className="w-4 h-4" />
                              <div>
                                <div className="text-sm font-medium">Opportunities</div>
                                <div className="text-xs text-muted-foreground">Internships & programs</div>
                              </div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/mentor" className={cn("group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50", isActive('/mentor') && "bg-accent/50")}>
                    <Users className="w-4 h-4 mr-2" />
                    Mentors
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Resources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      <div className="grid gap-1">
                        <h4 className="font-medium leading-none">Learning Resources</h4>
                        <p className="text-sm text-muted-foreground">Tools and content to support your journey</p>
                      </div>
                      <div className="grid gap-2">
                        <NavigationMenuLink asChild>
                          <Link to="/blog" className="block p-3 rounded-md hover:bg-accent">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="w-4 h-4" />
                              <div>
                                <div className="text-sm font-medium">Blog</div>
                                <div className="text-xs text-muted-foreground">Articles and insights</div>
                              </div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/event" className="block p-3 rounded-md hover:bg-accent">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <div>
                                <div className="text-sm font-medium">Events</div>
                                <div className="text-xs text-muted-foreground">Webinars and workshops</div>
                              </div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link to="/resource-bank" className="block p-3 rounded-md hover:bg-accent">
                            <div className="flex items-center space-x-2">
                              <Database className="w-4 h-4" />
                              <div>
                                <div className="text-sm font-medium">Resource Bank</div>
                                <div className="text-xs text-muted-foreground">Study materials & guides</div>
                              </div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Admin Menu - Only visible to admins */}
                {isAdmin && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="flex items-center text-purple-600">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-[450px]">
                        <div className="grid gap-1">
                          <h4 className="font-medium leading-none text-purple-600">Administrator Tools</h4>
                          <p className="text-sm text-muted-foreground">Manage content and system operations</p>
                        </div>
                        <div className="grid gap-2">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Marketing Tools</div>
                          <NavigationMenuLink asChild>
                            <Link to="/admin/email-campaigns" className="block p-3 rounded-md hover:bg-accent">
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4" />
                                <div>
                                  <div className="text-sm font-medium">Email Campaigns</div>
                                  <div className="text-xs text-muted-foreground">Manage marketing campaigns</div>
                                </div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link to="/admin/email-campaigns?tab=scholarship-scraper" className="block p-3 rounded-md hover:bg-accent">
                              <div className="flex items-center space-x-2">
                                <Bot className="w-4 h-4" />
                                <div>
                                  <div className="text-sm font-medium">Scholarship Scraper</div>
                                  <div className="text-xs text-muted-foreground">AI-powered content discovery</div>
                                </div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-3">System</div>
                          <NavigationMenuLink asChild>
                            <Link to="/partnerships" className="block p-3 rounded-md hover:bg-accent">
                              <div className="flex items-center space-x-2">
                                <Handshake className="w-4 h-4" />
                                <div>
                                  <div className="text-sm font-medium">Partnerships</div>
                                  <div className="text-xs text-muted-foreground">Manage institutional partnerships</div>
                                </div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border z-50">
                      <div className="p-4 border-b">
                        <h3 className="font-medium">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <NotificationItem 
                              key={notification.id} 
                              notification={notification}
                              onClose={() => setShowNotifications(false)}
                            />
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No new notifications
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <UserMenu 
                  user={user} 
                  profile={profile} 
                  onSignOut={handleSignOut}
                />
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-3/4 max-w-sm bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  StudyAbroad
                </span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="overflow-y-auto h-full pb-16">
              <div className="px-4 py-6 space-y-4">
                <Link 
                  to="/career" 
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Briefcase className="w-5 h-5" />
                  <span>Careers</span>
                </Link>
                
                <Link 
                  to="/school" 
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <School className="w-5 h-5" />
                  <span>Universities</span>
                </Link>
                
                <Link 
                  to="/scholarships" 
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Award className="w-5 h-5" />
                  <span>Scholarships</span>
                </Link>
                
                <Link 
                  to="/mentor" 
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Users className="w-5 h-5" />
                  <span>Mentors</span>
                </Link>
                
                <Link 
                  to="/blog" 
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Blog</span>
                </Link>

                {isAdmin && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <div className="text-xs font-medium text-purple-600 uppercase tracking-wider mb-3">Admin Tools</div>
                      <Link 
                        to="/admin/email-campaigns" 
                        className="flex items-center space-x-3 text-gray-700 hover:text-purple-600 py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Mail className="w-5 h-5" />
                        <span>Email Campaigns</span>
                      </Link>
                      <Link 
                        to="/admin/email-campaigns?tab=scholarship-scraper" 
                        className="flex items-center space-x-3 text-gray-700 hover:text-purple-600 py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Bot className="w-5 h-5" />
                        <span>Scholarship Scraper</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
