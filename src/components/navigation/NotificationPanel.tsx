
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationTrigger } from "./notification-details/NotificationTrigger";
import { NotificationSheetContent } from "./notification-details/NotificationSheetContent";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await onMarkAsRead(notificationId);
    } catch (error) {
      console.error('Error toggling notification status:', error);
      toast({
        title: "Error updating notification",
        description: "Please try again later",
        variant: "destructive",
      });

      if (error instanceof Error && error.message.includes('JWT')) {
        queryClient.clear();
        navigate("/auth");
      }
    }
  };

  return (
    <Sheet>
      <NotificationTrigger unreadCount={unreadCount} />
      <SheetContent className="w-[400px]">
        <NotificationSheetContent 
          notifications={notifications} 
          onMarkAsRead={handleMarkAsRead} 
        />
      </SheetContent>
    </Sheet>
  );
}
