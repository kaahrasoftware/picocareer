import { Link } from "react-router-dom";

export function NotificationContent({
  message,
  isExpanded,
  type,
  action_url,
}: {
  message: string;
  isExpanded: boolean;
  type?: string;
  action_url?: string;
}) {
  // Helper function to determine if this is a hub invitation
  const isHubInvite = type === 'hub_invite';
  
  // Render appropriate content based on notification type
  if (isHubInvite) {
    return (
      <div className="mt-1 text-sm text-muted-foreground">
        <p className={isExpanded ? "line-clamp-none" : "line-clamp-2"}>
          {message}
        </p>
        {action_url && (
          <Link 
            to={action_url}
            className="text-primary hover:underline mt-2 inline-block"
          >
            View Invitation
          </Link>
        )}
      </div>
    );
  }
  
  // Default content for other notification types
  return (
    <p className={`mt-1 text-sm text-muted-foreground ${isExpanded ? "line-clamp-none" : "line-clamp-2"}`}>
      {message}
    </p>
  );
}
