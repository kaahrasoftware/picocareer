
import { forwardRef } from "react";
import { NotificationHeader } from "./notification-details/NotificationHeader";
import { NotificationContent } from "./notification-details/NotificationContent";
import { NotificationActions } from "./notification-details/NotificationActions";
import { cn } from "@/lib/utils";
import { getNotificationCategory } from "@/types/calendar";

export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type?: string;
  action_url?: string;
  category?: string;
}

interface NotificationItemProps {
  notification: Notification;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleRead: (notification: Notification) => void;
}

export const NotificationItem = forwardRef<HTMLDivElement, NotificationItemProps>(
  ({ notification, isExpanded, onToggleExpand, onToggleRead }, ref) => {
    // Style based on read status
    const getItemStyles = () => {
      return cn(
        "p-3 rounded-lg border mb-2 transition-all duration-200 notification-item",
        notification.read 
          ? 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm' 
          : 'bg-blue-50 border-blue-200 hover:border-blue-300 hover:shadow-sm'
      );
    };
    
    // Get category for the notification
    const category = notification.category || 
      (notification.type ? getNotificationCategory(notification.type) : 'general');
    
    return (
      <div 
        ref={ref}
        className={getItemStyles()}
        data-category={category}
      >
        <NotificationHeader 
          title={notification.title} 
          createdAt={notification.created_at}
          read={notification.read}
          type={notification.type}
          onToggleRead={() => onToggleRead(notification)}
        />
        
        <NotificationContent 
          message={notification.message}
          isExpanded={isExpanded}
          type={notification.type}
          action_url={notification.action_url}
          notification_id={notification.id}
        />
        
        <NotificationActions 
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          onToggleRead={() => onToggleRead(notification)}
          read={notification.read}
        />
      </div>
    );
  }
);

NotificationItem.displayName = "NotificationItem";
