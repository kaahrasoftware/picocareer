
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, Bell, Users, BookOpen, Briefcase, GraduationCap, CreditCard, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { useMarkNotificationRead } from "@/hooks/useMarkNotificationRead";
import { ModernMegaMenu } from "./ModernMegaMenu";
import { ModernMobileMenu } from "./ModernMobileMenu";
import { NotificationItem } from "./NotificationItem";
import { UserMenu } from "./UserMenu";
import { WalletButton } from "@/components/wallet/WalletButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBreakpoints } from "@/hooks/useBreakpoints";

export function ModernNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isMobile } = useBreakpoints();

  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { data: notifications = [] } = useNotifications(session);
  const markNotificationRead = useMarkNotificationRead();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationRead.mutate({ 
        notificationId, 
        read: true 
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      const { signOut } = await import("@/context/AuthContext");
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const megaMenuData = {
    "Students": {
      sections: [
        {
          title: "Academic Planning",
          items: [
            { title: "Career Explorer", href: "/careers", icon: Briefcase, description: "Discover potential career paths" },
            { title: "Program Finder", href: "/majors", icon: GraduationCap, description: "Find the right academic program" },
            { title: "School Search", href: "/schools", icon: BookOpen, description: "Explore universities and colleges" },
            { title: "AI Career Chat", href: "/career-chat", icon: MessageSquare, description: "Get personalized career guidance" }
          ]
        },
        {
          title: "Community & Support",
          items: [
            { title: "Find Mentors", href: "/mentors", icon: Users, description: "Connect with experienced professionals" },
            { title: "Community Hub", href: "/community", icon: Users, description: "Join student communities" },
            { title: "Student Network", href: "/hub", icon: Users, description: "Connect with peers" }
          ]
        }
      ]
    },
    "Mentors": {
      sections: [
        {
          title: "Mentor Resources",
          items: [
            { title: "Mentor Registration", href: "/mentor-registration", icon: User, description: "Join as a mentor" },
            { title: "Student Network", href: "/community", icon: Users, description: "Find students to mentor" },
            { title: "Mentor Benefits", href: "/mentors", icon: Briefcase, description: "Learn about mentor benefits" }
          ]
        }
      ]
    },
    "Resources": {
      sections: [
        {
          title: "Learning Resources",
          items: [
            { title: "Blog & Articles", href: "/blog", icon: BookOpen, description: "Educational content and insights" },
            { title: "Events & Webinars", href: "/events", icon: Users, description: "Join live sessions and workshops" },
            { title: "Scholarships", href: "/scholarships", icon: CreditCard, description: "Find funding opportunities" },
            { title: "Opportunities", href: "/opportunities", icon: Briefcase, description: "Discover internships and jobs" }
          ]
        }
      ]
    }
  };

  // Add admin menu for admin users
  if (profile?.user_type === 'admin') {
    megaMenuData["Admin"] = {
      sections: [
        {
          title: "Content Management",
          items: [
            { title: "Email Campaigns", href: "/admin/email-campaigns", icon: MessageSquare, description: "Manage email marketing" },
            { title: "Scholarship Scraper", href: "/admin/email-campaigns?tab=scholarship-scraper", icon: CreditCard, description: "Manage scholarship data" }
          ]
        }
      ]
    };
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">PicoCareer</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8" ref={menuRef}>
            {Object.entries(megaMenuData).map(([title, data]) => (
              <div key={title} className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === title ? null : title)}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    activeMenu === title
                      ? 'text-blue-600 bg-blue-50 rounded-md'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md'
                  }`}
                >
                  {title}
                </button>
                {activeMenu === title && (
                  <ModernMegaMenu
                    sections={data.sections}
                    onClose={() => setActiveMenu(null)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Right side - Auth & User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/search')}
              className="hidden sm:flex"
            >
              <Search className="h-4 w-4" />
            </Button>

            {session?.user ? (
              <>
                {/* Wallet */}
                <WalletButton showBalance={!isMobile} />

                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[1.25rem]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-medium text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <p className="text-sm text-gray-500">{unreadCount} unread</p>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 10).map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                            />
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No notifications
                          </div>
                        )}
                      </div>
                      {notifications.length > 10 && (
                        <div className="p-3 border-t border-gray-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/notifications')}
                            className="w-full"
                          >
                            View all notifications
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Menu */}
                {profile && <UserMenu />}
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

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ModernMobileMenu
          megaMenuData={megaMenuData}
          session={session}
          profile={profile}
          onClose={() => setIsOpen(false)}
        />
      )}
    </nav>
  );
}
