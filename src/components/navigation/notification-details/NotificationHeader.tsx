
import { formatDistanceToNow } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationHeaderProps {
  title: string;
  createdAt: string;
  read: boolean;
  onToggleRead: () => void;
}

export function NotificationHeader({ 
  title, 
  createdAt, 
  read, 
  onToggleRead 
}: NotificationHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h4 className={`font-medium text-sm ${!read ? 'text-white' : 'text-zinc-300'}`}>
        {title}
      </h4>
      <div className="flex items-center gap-1">
        <span className="text-xs text-zinc-500">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="p-1 h-auto"
          onClick={onToggleRead}
          title={read ? "Mark as unread" : "Mark as read"}
        >
          {read ? (
            <CheckCheck className="h-3.5 w-3.5 text-zinc-500" />
          ) : (
            <Check className="h-3.5 w-3.5 text-zinc-500" />
          )}
        </Button>
      </div>
    </div>
  );
}
