
import { FC } from "react";
import { Notification } from "../NotificationPanel";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { sanitizeHtml } from "@/lib/sanitize-html";

interface NotificationContentProps {
  notification: Notification;
}

export const NotificationContent: FC<NotificationContentProps> = ({
  notification
}) => {
  // Safely extract message with fallback
  const message = notification?.message || '';
  
  // Define the truncated length based on notification type
  const getTruncatedLength = () => {
    if (notification?.type === 'session_booking' || notification?.type === 'hub_invitation') return 100;
    return 75; // Default for other notification types
  };

  // Get initial message display length
  const truncateLength = getTruncatedLength();
  
  // Sanitize the message HTML content
  const sanitizedMessage = sanitizeHtml(message);
  
  // For collapsed state, show truncated message without HTML
  const plainTextMessage = message.replace(/<[^>]*>/g, '');
  const shouldTruncate = plainTextMessage.length > truncateLength;
  const displayMessage = shouldTruncate 
    ? `${plainTextMessage.substring(0, truncateLength)}...`
    : plainTextMessage;

  return (
    <div className="mt-2 mb-2">
      <div 
        className="notification-message text-sm text-gray-700" 
        dangerouslySetInnerHTML={{ __html: sanitizedMessage }}
      />
      
      {notification?.action_url && (
        <div className="mt-3">
          {notification.action_url.startsWith('/') ? (
            // Internal link
            <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
              <Link to={notification.action_url}>
                View Details
              </Link>
            </Button>
          ) : (
            // External link
            <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
              <a href={notification.action_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                Open Link <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
