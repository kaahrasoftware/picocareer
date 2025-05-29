
import { useState, useEffect } from "react";
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
import { Bell, BellDot, Check, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getNotificationCategory, type NotificationCategory } from "@/types/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useMarkNotificationRead } from "@/hooks/useMarkNotificationRead";

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
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(notifications || []);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [readFilter, setReadFilter] = useState<"all" | "read" | "unread">("all");
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const markNotificationRead = useMarkNotificationRead();

  // Update local notifications when props change
  useEffect(() => {
    setLocalNotifications(notifications || []);
  }, [notifications]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleReadStatus = async (notification: Notification) => {
    try {
      // Update local state immediately for responsive UI
      setLocalNotifications(prev => (prev || []).map(n => 
        n.id === notification.id ? { ...n, read: !n.read } : n
      ));
      
      // Call the provided callback (for backward compatibility)
      if (onMarkAsRead) {
        onMarkAsRead(notification.id);
      }
      
      // Persist change to database using our mutation hook
      await markNotificationRead.mutate({ 
        notificationId: notification.id, 
        read: !notification.read 
      });
    } catch (error) {
      console.error('Error toggling notification status:', error);
      
      // Revert local state if mutation failed
      setLocalNotifications(prev => (prev || []).map(n => 
        n.id === notification.id ? { ...n, read: notification.read } : n
      ));
      
      toast({
        title: "Error updating notification",
        description: "Please try again later",
        variant: "destructive",
      });

      // If JWT error, clear queries and redirect to auth
      if (error instanceof Error && error.message.includes('JWT')) {
        queryClient.clear();
        navigate("/auth");
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      // Only proceed if there are unread notifications
      const safeLocalNotifications = localNotifications || [];
      const hasUnreadNotifications = safeLocalNotifications.some(n => !n.read);
      if (!hasUnreadNotifications) {
        toast({
          title: "No unread notifications",
          description: "All your notifications are already marked as read",
          variant: "default",
        });
        return;
      }

      setIsMarkingAllRead(true);
      
      // Update local state immediately for responsive UI
      setLocalNotifications(prev => (prev || []).map(n => ({ ...n, read: true })));
      
      // Persist changes to database
      await markNotificationRead.mutate({ 
        allUnread: true 
      });
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      
      // Revert local state if mutation failed
      setLocalNotifications(notifications || []);
      
      toast({
        title: "Error updating notifications",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  // Apply search and filters to notifications
  const safeLocalNotifications = localNotifications || [];
  const filteredNotifications = safeLocalNotifications.filter(notification => {
    // For HTML content, we need to check against the plaintext version for search
    const plainTextMessage = notification.message.replace(/<[^>]*>?/gm, '');
    
    // Search text filter
    const matchesSearch = searchTerm === "" || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      plainTextMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Read status filter
    const matchesReadStatus = 
      readFilter === "all" || 
      (readFilter === "read" && notification.read) || 
      (readFilter === "unread" && !notification.read);
    
    // Date filter
    let matchesDate = true;
    const notificationDate = new Date(notification.created_at);
    const now = new Date();
    
    if (dateFilter === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      matchesDate = notificationDate >= today;
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      matchesDate = notificationDate >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      matchesDate = notificationDate >= monthAgo;
    }
    
    return matchesSearch && matchesReadStatus && matchesDate;
  });

  // Categorize the filtered notifications
  const categorizedNotifications = filteredNotifications.reduce((acc, notification) => {
    const category = getNotificationCategory(notification.type as any);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(notification);
    return acc;
  }, {} as Record<NotificationCategory, Notification[]>);

  const mentorshipUnreadCount = (categorizedNotifications.mentorship || []).filter(n => !n.read).length;
  const generalUnreadCount = (categorizedNotifications.general || []).filter(n => !n.read).length;
  const hubUnreadCount = (categorizedNotifications.hub || []).filter(n => !n.read).length;

  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter("all");
    setReadFilter("all");
  };

  const hasActiveFilters = searchTerm !== "" || dateFilter !== "all" || readFilter !== "all";

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
      <SheetContent className="w-[400px] bg-white">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-gray-800">
              Notifications
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2"
                >
                  {safeLocalNotifications.filter(n => !n.read).length}
                </Badge>
              )}
            </SheetTitle>
            
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs flex items-center gap-1"
                onClick={markAllAsRead}
                disabled={isMarkingAllRead}
              >
                <Check className="h-3.5 w-3.5" />
                {isMarkingAllRead ? "Marking..." : "Mark all as read"}
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-8 py-2 bg-gray-50"
            />
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1 h-8 w-8 text-gray-400"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select 
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value as "all" | "read" | "unread")}
              className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-sm"
            >
              <option value="all">All status</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>
            
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as "all" | "today" | "week" | "month")}
              className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-sm"
            >
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>

            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8 ml-auto"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* No results message */}
          {filteredNotifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50 rounded-md mt-4">
              <Bell className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-center">
                {safeLocalNotifications.length === 0 
                  ? "No notifications yet" 
                  : "No matching notifications"}
              </p>
              {safeLocalNotifications.length > 0 && hasActiveFilters && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="mt-2"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {/* Notifications list */}
          {filteredNotifications.length > 0 && (
            <Tabs defaultValue="mentorship" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-4 bg-gray-100">
                <TabsTrigger value="mentorship" className="relative flex items-center gap-2 data-[state=active]:bg-white">
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
                <TabsTrigger value="hub" className="relative flex items-center gap-2 data-[state=active]:bg-white">
                  Hub
                  {hubUnreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {hubUnreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="general" className="relative flex items-center gap-2 data-[state=active]:bg-white">
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
              
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <TabsContent value="mentorship" className="mt-0 space-y-4">
                  {(categorizedNotifications.mentorship || []).map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      isExpanded={expandedIds.includes(notification.id)}
                      onToggleExpand={() => toggleExpand(notification.id)}
                      onToggleRead={toggleReadStatus}
                    />
                  ))}
                  {(!categorizedNotifications.mentorship || categorizedNotifications.mentorship.length === 0) && (
                    <p className="text-center text-gray-400 py-4 bg-gray-50 rounded-md">
                      No mentorship notifications
                    </p>
                  )}
                </TabsContent>
                
                <TabsContent value="hub" className="mt-0 space-y-4">
                  {(categorizedNotifications.hub || []).map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      isExpanded={expandedIds.includes(notification.id)}
                      onToggleExpand={() => toggleExpand(notification.id)}
                      onToggleRead={toggleReadStatus}
                    />
                  ))}
                  {(!categorizedNotifications.hub || categorizedNotifications.hub.length === 0) && (
                    <p className="text-center text-gray-400 py-4 bg-gray-50 rounded-md">
                      No hub notifications
                    </p>
                  )}
                </TabsContent>
                
                <TabsContent value="general" className="mt-0 space-y-4">
                  {(categorizedNotifications.general || []).map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      isExpanded={expandedIds.includes(notification.id)}
                      onToggleExpand={() => toggleExpand(notification.id)}
                      onToggleRead={toggleReadStatus}
                    />
                  ))}
                  {(!categorizedNotifications.general || categorizedNotifications.general.length === 0) && (
                    <p className="text-center text-gray-400 py-4 bg-gray-50 rounded-md">
                      No general notifications
                    </p>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
