
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { useMarkNotificationRead } from "@/hooks/useMarkNotificationRead";
import { NotificationPanel } from "./NotificationPanel";
import { UserMenu } from "./UserMenu";
import { useBreakpoints } from "@/hooks/useBreakpoints";

export function ModernUserSection() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { data: notifications = [] } = useNotifications(session);
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

      {/* User Menu */}
      {profile && <UserMenu />}
    </div>
  );
}
