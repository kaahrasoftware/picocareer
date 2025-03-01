
import { useState, useEffect } from "react";
import { NotificationSheetHeader } from "./NotificationHeader";
import { NotificationTabs } from "./NotificationTabs";
import { getNotificationCategory, type NotificationCategory } from "@/types/calendar";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: string;
  action_url?: string;
}

interface NotificationSheetContentProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

export function NotificationSheetContent({ notifications, onMarkAsRead }: NotificationSheetContentProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(notifications);

  // Update local state when props change
  useEffect(() => {
    if (JSON.stringify(notifications) !== JSON.stringify(localNotifications)) {
      setLocalNotifications(notifications);
    }
  }, [notifications]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleReadStatus = async (notification: Notification) => {
    try {
      setLocalNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, read: !n.read } : n
      ));
      await onMarkAsRead(notification.id);
    } catch (error) {
      // Error handling happens in the parent component
      // Revert the local state if there's an error
      setLocalNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, read: notification.read } : n
      ));
    }
  };

  // Safely categorize notifications to prevent errors
  const categorizedNotifications = localNotifications.reduce((acc, notification) => {
    try {
      const category = getNotificationCategory(notification.type as any);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(notification);
    } catch (error) {
      // If there's an error categorizing, put in general
      if (!acc.general) {
        acc.general = [];
      }
      acc.general.push(notification);
    }
    return acc;
  }, {} as Record<NotificationCategory, Notification[]>);

  const mentorshipUnreadCount = categorizedNotifications.mentorship?.filter(n => !n.read).length || 0;
  const generalUnreadCount = categorizedNotifications.general?.filter(n => !n.read).length || 0;

  return (
    <div className="mt-4">
      <NotificationSheetHeader unreadCount={localNotifications.filter(n => !n.read).length} />
      
      {localNotifications.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">
          No notifications yet
        </p>
      ) : (
        <NotificationTabs
          categorizedNotifications={categorizedNotifications}
          expandedIds={expandedIds}
          onToggleExpand={toggleExpand}
          onToggleRead={toggleReadStatus}
          mentorshipUnreadCount={mentorshipUnreadCount}
          generalUnreadCount={generalUnreadCount}
        />
      )}
    </div>
  );
}
