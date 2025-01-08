import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { Mail, Phone } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useState } from "react";

export function NotificationPanel() {
  const { session } = useAuthSession();
  const { data: notifications = [] } = useNotifications(session);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleToggleRead = async (notification: any) => {
    // Implement the logic to mark the notification as read
    // This could involve an API call to update the notification status
  };

  return (
    <div className="flex flex-col h-[85vh] sm:h-[600px]">
      <ScrollArea className="flex-grow">
        <div className="space-y-4 p-4">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground">No notifications</p>
          ) : (
            notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification}
                isExpanded={expandedId === notification.id}
                onToggleExpand={() => handleToggleExpand(notification.id)}
                onToggleRead={handleToggleRead}
              />
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Footer content - only visible on mobile */}
      <div className="sm:hidden border-t border-border mt-auto p-4 space-y-3">
        <div className="space-y-3">
          <a href="mailto:info@picocareer.com" 
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Mail className="w-4 h-4 mr-2" />
            info@picocareer.com
          </a>
          <a href="tel:+22897476446" 
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="w-4 h-4 mr-2" />
            +228 97 47 64 46
          </a>
        </div>
        <div className="text-sm text-muted-foreground text-center">
          <p>© {new Date().getFullYear()} PicoCareer</p>
          <p className="mt-1">A product of <strong>Kaahra</strong></p>
        </div>
      </div>
    </div>
  );
}
