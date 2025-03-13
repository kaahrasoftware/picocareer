
import { FC } from "react";
import { Notification } from "../NotificationItem";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { sanitizeHtml } from "@/lib/sanitize-html";

interface NotificationContentProps {
  message: string;
  isExpanded: boolean;
  type?: string;
  action_url?: string;
  notification_id: string;
}

export const NotificationContent: FC<NotificationContentProps> = ({
  message,
  isExpanded,
  type,
  action_url,
  notification_id
}) => {
  // Define the truncated length based on notification type
  const getTruncatedLength = () => {
    if (type === 'session_booking' || type === 'hub_invitation') return 100;
    return 75; // Default for other notification types
  };

  // Get initial message display length
  const truncateLength = getTruncatedLength();
  
  // Sanitize the message HTML content
  const sanitizedMessage = sanitizeHtml(message);
  
  // For collapsed state, show truncated message without HTML
  const plainTextMessage = message.replace(/<[^>]*>/g, '');
  const truncatedMessage = plainTextMessage.length > truncateLength && !isExpanded
    ? `${plainTextMessage.substring(0, truncateLength)}...`
    : plainTextMessage;

  return (
    <div className="mt-2 mb-2">
      {isExpanded ? (
        // When expanded, show full message with HTML
        <div 
          className="notification-message text-sm text-gray-700" 
          dangerouslySetInnerHTML={{ __html: sanitizedMessage }}
        />
      ) : (
        // When collapsed, show truncated plain text
        <p className="text-sm text-gray-700">
          {truncatedMessage}
        </p>
      )}
      
      {action_url && isExpanded && (
        <div className="mt-3">
          {action_url.startsWith('/') ? (
            // Internal link
            <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
              <Link to={action_url}>
                View Details
              </Link>
            </Button>
          ) : (
            // External link
            <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
              <a href={action_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                Open Link <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
