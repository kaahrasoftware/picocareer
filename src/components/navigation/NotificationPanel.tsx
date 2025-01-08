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
import { getNotificationCategory, type NotificationCategory } from "@/types/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: string;
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
      setLocalNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, read: !n.read } : n
      ));
      await onMarkAsRead(notification.id);
    } catch (error) {
      console.error('Error toggling notification status:', error);
      toast({
        title: "Error updating notification",
        description: "Please try again later",
        variant: "destructive",
      });

      setLocalNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, read: notification.read } : n
      ));

      if (error instanceof Error && error.message.includes('JWT')) {
        queryClient.clear();
        navigate("/auth");
      }
    }
  };

  const categorizedNotifications = localNotifications.reduce((acc, notification) => {
    const category = getNotificationCategory(notification.type as any);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(notification);
    return acc;
  }, {} as Record<NotificationCategory, Notification[]>);

  const mentorshipUnreadCount = categorizedNotifications.mentorship?.filter(n => !n.read).length || 0;
  const generalUnreadCount = categorizedNotifications.general?.filter(n => !n.read).length || 0;

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
            <Tabs defaultValue="mentorship" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="mentorship" className="relative flex items-center gap-2">
                  Mentorship
                  {mentorshipUnreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {mentorshipUnreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="general" className="relative flex items-center gap-2">
                  General
                  {generalUnreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {generalUnreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="mentorship" className="mt-4 space-y-4">
                {categorizedNotifications.mentorship?.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isExpanded={expandedIds.includes(notification.id)}
                    onToggleExpand={() => toggleExpand(notification.id)}
                    onToggleRead={toggleReadStatus}
                  />
                ))}
                {(!categorizedNotifications.mentorship || categorizedNotifications.mentorship.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">
                    No mentorship notifications
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="general" className="mt-4 space-y-4">
                {categorizedNotifications.general?.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isExpanded={expandedIds.includes(notification.id)}
                    onToggleExpand={() => toggleExpand(notification.id)}
                    onToggleRead={toggleReadStatus}
                  />
                ))}
                {(!categorizedNotifications.general || categorizedNotifications.general.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">
                    No general notifications
                  </p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}