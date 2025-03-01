
import { TabsContent, TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "../NotificationItem";
import { NotificationCategory } from "@/types/calendar";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: string;
  action_url?: string;
}

interface NotificationTabsProps {
  categorizedNotifications: Record<NotificationCategory, Notification[]>;
  expandedIds: string[];
  onToggleExpand: (id: string) => void;
  onToggleRead: (notification: Notification) => void;
  mentorshipUnreadCount: number;
  generalUnreadCount: number;
}

export function NotificationTabs({
  categorizedNotifications,
  expandedIds,
  onToggleExpand,
  onToggleRead,
  mentorshipUnreadCount,
  generalUnreadCount
}: NotificationTabsProps) {
  return (
    <Tabs defaultValue="mentorship" className="w-full">
      <TabsList className="w-full grid grid-cols-2 mb-4">
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
      
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <TabsContent value="mentorship" className="mt-0 space-y-4">
          {categorizedNotifications.mentorship?.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              isExpanded={expandedIds.includes(notification.id)}
              onToggleExpand={() => onToggleExpand(notification.id)}
              onToggleRead={onToggleRead}
            />
          ))}
          {(!categorizedNotifications.mentorship || categorizedNotifications.mentorship.length === 0) && (
            <p className="text-center text-muted-foreground py-4">
              No mentorship notifications
            </p>
          )}
        </TabsContent>
        
        <TabsContent value="general" className="mt-0 space-y-4">
          {categorizedNotifications.general?.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              isExpanded={expandedIds.includes(notification.id)}
              onToggleExpand={() => onToggleExpand(notification.id)}
              onToggleRead={onToggleRead}
            />
          ))}
          {(!categorizedNotifications.general || categorizedNotifications.general.length === 0) && (
            <p className="text-center text-muted-foreground py-4">
              No general notifications
            </p>
          )}
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}
