import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    <div className="flex items-center justify-between mt-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-sky-400 hover:text-sky-300 hover:bg-sky-400/10"
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
        className={read ? 
          "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10" :
          "text-sky-400 hover:text-sky-300 hover:bg-sky-400/10"
        }
        onClick={onToggleRead}
      >
        {read ? 'Mark as unread' : 'Mark as read'}
      </Button>
    </div>
  );
}