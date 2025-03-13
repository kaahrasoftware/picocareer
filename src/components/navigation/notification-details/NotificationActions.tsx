
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CircleCheck, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationActionsProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleRead: () => void;
  read: boolean;
}

export function NotificationActions({ 
  isExpanded, 
  onToggleExpand, 
  onToggleRead, 
  read
}: NotificationActionsProps) {
  return (
    <div className="flex items-center justify-between mt-2 border-t pt-2 border-gray-100">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 h-8 px-2"
        onClick={onToggleExpand}
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
        className={cn(
          "h-8 px-2 flex items-center gap-1",
          read 
            ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100" 
            : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        )}
        onClick={onToggleRead}
      >
        {read ? (
          <CircleDot className="h-4 w-4 mr-1" />
        ) : (
          <CircleCheck className="h-4 w-4 mr-1" />
        )}
        {read ? 'Mark as unread' : 'Mark as read'}
      </Button>
    </div>
  );
}
