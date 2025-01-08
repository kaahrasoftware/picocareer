import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./NotificationItem";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell, BellDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    try {
      // Update local state immediately for better UX
      setLocalNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, read: !n.read } : n
      ));
      
      // Call the parent handler to update the database
      await onMarkAsRead(notification.id);
    } catch (error) {
      console.error('Error toggling notification status:', error);
      toast({
        title: "Error updating notification",
        description: "Please try again later",
        variant: "destructive",
      });

      // Revert local state if the update failed
      setLocalNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, read: notification.read } : n
      ));

      // If it's an auth error, redirect to login
      if (error instanceof Error && error.message.includes('JWT')) {
        queryClient.clear();
        navigate("/auth");
      }
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
              {localNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  isExpanded={expandedIds.includes(notification.id)}
                  onToggleExpand={() => toggleExpand(notification.id)}
                  onToggleRead={toggleReadStatus}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}