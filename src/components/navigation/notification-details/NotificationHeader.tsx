
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface NotificationHeaderProps {
  unreadCount: number;
}

export function NotificationSheetHeader({ unreadCount }: NotificationHeaderProps) {
  return (
    <SheetHeader>
      <SheetTitle className="flex items-center gap-2">
        Notifications
        <Badge 
          variant="destructive" 
          className="ml-2"
        >
          {unreadCount}
        </Badge>
      </SheetTitle>
    </SheetHeader>
  );
}
