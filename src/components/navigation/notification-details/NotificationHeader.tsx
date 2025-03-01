
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CircleCheck, CircleDot } from "lucide-react";

interface NotificationHeaderProps {
  title: string;
  createdAt: string;
  read: boolean;
  onToggleRead: () => void;
}

export function NotificationHeader({ title, createdAt, read, onToggleRead }: NotificationHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-gray-800 flex items-center gap-2">
        {title}
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={onToggleRead}
        >
          {read ? (
            <CircleCheck className="h-4 w-4 text-emerald-500" />
          ) : (
            <CircleDot className="h-4 w-4 text-sky-500" />
          )}
        </Button>
      </h4>
      <span className="text-xs text-gray-500">
        {format(new Date(createdAt), 'MMM d, h:mm a')}
      </span>
    </div>
  );
}
