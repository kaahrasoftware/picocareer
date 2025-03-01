
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellDot } from "lucide-react";
import { SheetTrigger } from "@/components/ui/sheet";

interface NotificationTriggerProps {
  unreadCount: number;
}

export function NotificationTrigger({ unreadCount }: NotificationTriggerProps) {
  return (
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
  );
}
