
import { formatDistanceToNow } from "date-fns";
import { SessionNotificationContent } from "./SessionNotificationContent";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NotificationContentProps {
  message: string;
  isExpanded: boolean;
  type?: string;
  action_url?: string;
  notification_id: string;
}

export function NotificationContent({ 
  message, 
  isExpanded, 
  type,
  action_url,
  notification_id
}: NotificationContentProps) {
  const navigate = useNavigate();

  // Handle specific notification types
  if (type === 'session_booked' || type === 'session_cancelled' || type === 'session_reminder') {
    return (
      <SessionNotificationContent
        message={message}
        isExpanded={isExpanded}
        type={type}
        action_url={action_url}
      />
    );
  }

  // Special handling for hub membership notification
  if (type === 'hub_membership' && action_url) {
    return (
      <div className="mt-1">
        <p className={`text-sm text-zinc-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
          {message}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => navigate(action_url)}
        >
          View Hub
        </Button>
      </div>
    );
  }

  // Default notification content
  return (
    <p className={`mt-1 text-sm text-zinc-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
      {message}
      {action_url && isExpanded && (
        <Button 
          variant="link" 
          className="p-0 h-auto text-blue-400 hover:text-blue-300"
          onClick={() => navigate(action_url)}
        >
          View details
        </Button>
      )}
    </p>
  );
}
