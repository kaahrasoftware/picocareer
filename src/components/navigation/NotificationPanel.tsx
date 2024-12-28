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
import { Bell, BellDot, ChevronDown, ChevronUp, CircleCheck, CircleDot, ExternalLink } from "lucide-react";
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
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(notifications);

  // Update local state when props change
  if (JSON.stringify(notifications) !== JSON.stringify(localNotifications)) {
    setLocalNotifications(notifications);
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleReadStatus = async (notification: Notification) => {
    // Update local state immediately for better UX
    setLocalNotifications(prev => prev.map(n => 
      n.id === notification.id ? { ...n, read: !n.read } : n
    ));
    
    // Call the parent handler to update the database
    onMarkAsRead(notification.id);
  };

  const handleJoinMeeting = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
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
            <Badge 
              variant="destructive" 
              className="ml-2"
            >
              {localNotifications.filter(n => !n.read).length}
            </Badge>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          {localNotifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No notifications yet
            </p>
          ) : (
            <div className="space-y-4">
              {localNotifications.map((notification) => {
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => toggleReadStatus(notification)}
                            >
                              {notification.read ? (
                                <CircleCheck className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <CircleDot className="h-4 w-4 text-sky-500" />
                              )}
                            </Button>
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
                        className="text-sky-400 hover:text-sky-300 hover:bg-sky-400/10"
                        onClick={() => toggleExpand(notification.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                        {isExpanded ? 'Show less' : 'Read more'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={notification.read ? 
                          "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10" :
                          "text-sky-400 hover:text-sky-300 hover:bg-sky-400/10"
                        }
                        onClick={() => toggleReadStatus(notification)}
                      >
                        {notification.read ? 'Mark as unread' : 'Mark as read'}
                      </Button>
                    </div>
                    {notification.action_url && isExpanded && (
                      <div className="mt-3">
                        {notification.title.toLowerCase().includes('session') ? (
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full bg-sky-500 hover:bg-sky-600 text-white"
                            onClick={() => handleJoinMeeting(notification.action_url!)}
                          >
                            Join Meeting <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        ) : (
                          <Link
                            to={notification.action_url}
                            className="text-sm text-primary hover:underline block"
                          >
                            View details
                          </Link>
                        )}
                      </div>
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