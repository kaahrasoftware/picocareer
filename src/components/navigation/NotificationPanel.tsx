import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell, BellDot, ChevronDown, ChevronUp, CircleCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  action_url?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
}

export function NotificationPanel({ notifications, unreadCount, onMarkAsRead }: NotificationPanelProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 ? (
            <>
              <BellDot className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Notifications
            <Badge variant="secondary" className="ml-2">
              {notifications.length}
            </Badge>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No notifications yet
            </p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const isExpanded = expandedIds.includes(notification.id);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      notification.read 
                        ? 'bg-zinc-900 border-zinc-800' 
                        : 'bg-zinc-900/90 border-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-zinc-50 flex items-center gap-2">
                            {notification.title}
                            {notification.read && (
                              <CircleCheck className="h-4 w-4 text-green-500" />
                            )}
                          </h4>
                          <span className="text-xs text-zinc-400">
                            {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className={`text-sm text-zinc-400 mt-1 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-zinc-50"
                        onClick={() => toggleExpand(notification.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                        {isExpanded ? 'Show less' : 'Read more'}
                      </Button>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-zinc-400 hover:text-zinc-50"
                          onClick={() => onMarkAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                    {notification.action_url && isExpanded && (
                      <Link
                        to={notification.action_url}
                        className="text-sm text-primary hover:underline mt-2 block"
                      >
                        View details
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}