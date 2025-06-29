
import { Notification } from "../NotificationPanel";

export type NotificationFilterCategory = 'all' | 'general' | 'session' | 'mentorship';
export type NotificationFilterStatus = 'all' | 'unread' | 'read';
export type NotificationFilterTime = 'all' | 'today' | 'week' | 'month';

export interface NotificationFilters {
  category: NotificationFilterCategory;
  status: NotificationFilterStatus;
  timeRange: NotificationFilterTime;
}

export function filterNotifications(
  notifications: Notification[],
  filters: NotificationFilters
): Notification[] {
  return notifications.filter(notification => {
    // Category filter
    if (filters.category !== 'all' && notification.category !== filters.category) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'read' && !notification.read) return false;
      if (filters.status === 'unread' && notification.read) return false;
    }

    // Time filter
    if (filters.timeRange !== 'all') {
      const notificationDate = new Date(notification.created_at);
      const now = new Date();
      
      switch (filters.timeRange) {
        case 'today':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (notificationDate < today) return false;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (notificationDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (notificationDate < monthAgo) return false;
          break;
      }
    }

    return true;
  });
}
