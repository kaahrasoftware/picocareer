import { useToast } from "@/hooks/use-toast";
import { NotificationHeader } from "./notification-details/NotificationHeader";
import { NotificationContent } from "./notification-details/NotificationContent";
import { NotificationActions } from "./notification-details/NotificationActions";

export interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    created_at: string;
    read: boolean;
    action_url?: string;
  };
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleRead: (notification: any) => void;
}

export function NotificationItem({ 
  notification, 
  isExpanded, 
  onToggleExpand, 
  onToggleRead 
}: NotificationItemProps) {
  const { toast } = useToast();

  return (
    <div
      className={`p-4 rounded-lg border transition-colors max-w-[90%] mx-auto ${
        notification.read 
          ? 'bg-zinc-900 border-zinc-800' 
          : 'bg-zinc-900/90 border-zinc-700'
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1">
          <NotificationHeader
            title={notification.title}
            createdAt={notification.created_at}
            read={notification.read}
            onToggleRead={() => onToggleRead(notification)}
          />
          <NotificationContent
            message={notification.message}
            isExpanded={isExpanded}
          />
        </div>
      </div>
      <NotificationActions
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onToggleRead={() => onToggleRead(notification)}
        read={notification.read}
      />
    </div>
  );
}