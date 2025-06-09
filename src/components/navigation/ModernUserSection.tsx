
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { useMarkNotificationRead } from "@/hooks/useMarkNotificationRead";
import { NotificationPanel } from "./NotificationPanel";
import { UserMenu } from "./UserMenu";
import { useBreakpoints } from "@/hooks/useBreakpoints";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function ModernUserSection() {
  const { session, isLoading: sessionLoading } = useAuthSession();
  const { data: profile, isLoading: profileLoading } = useUserProfile(session);
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications(session);
  const markNotificationRead = useMarkNotificationRead();
  const { isMobile } = useBreakpoints();

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

  // Show loading state
  if (sessionLoading || profileLoading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {/* Notifications */}
      <NotificationPanel
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkAsRead}
      />

      {/* User Avatar/Menu - Always show UserMenu when authenticated */}
      <UserMenu />
    </div>
  );
}
