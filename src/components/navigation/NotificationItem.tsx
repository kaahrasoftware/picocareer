
import { forwardRef } from "react";
import { NotificationHeader } from "./notification-details/NotificationHeader";
import { NotificationContent } from "./notification-details/NotificationContent";
import { NotificationActions } from "./notification-details/NotificationActions";

export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type?: string;
  action_url?: string;
}

interface NotificationItemProps {
  notification: Notification;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleRead: (notification: Notification) => void;
}

export const NotificationItem = forwardRef<HTMLDivElement, NotificationItemProps>(
  ({ notification, isExpanded, onToggleExpand, onToggleRead }, ref) => {
    return (
      <div 
        ref={ref}
        className={`p-3 rounded-md border ${
          notification.read 
            ? 'bg-white border-gray-200' 
            : 'bg-gray-50 border-gray-300'
        } transition-colors duration-200 hover:shadow-sm`}
      >
        <NotificationHeader 
          title={notification.title} 
          createdAt={notification.created_at}
          read={notification.read}
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
