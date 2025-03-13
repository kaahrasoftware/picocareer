
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { CircleCheck, CircleDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NotificationHeaderProps {
  title: string;
  createdAt: string;
  read: boolean;
  onToggleRead: () => void;
  type?: string;
}

export function NotificationHeader({ title, createdAt, read, onToggleRead, type }: NotificationHeaderProps) {
  const createdDate = new Date(createdAt);
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });
  const fullDateTime = format(createdDate, 'MMM d, yyyy h:mm a');
  
  // Function to get notification type badge color
  const getNotificationTypeColor = () => {
    switch (type) {
      case 'session_booked':
      case 'session_reminder':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'hub_invite':
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case 'hub_membership':
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Function to get readable notification type
  const getNotificationTypeLabel = () => {
    switch (type) {
      case 'session_booked':
        return "Session";
      case 'session_reminder':
        return "Reminder";
      case 'hub_invite':
        return "Invitation";
      case 'hub_membership':
        return "Membership";
      default:
        return "Notification";
    }
  };

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-800">
            {title}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 hover:bg-transparent"
            onClick={onToggleRead}
          >
            {read ? (
              <CircleCheck className="h-4 w-4 text-emerald-500" />
            ) : (
              <CircleDot className="h-4 w-4 text-sky-500" />
            )}
          </Button>
          
          {type && (
            <Badge 
              variant="outline" 
              className={`text-xs px-2 py-0 h-5 ${getNotificationTypeColor()}`}
            >
              {getNotificationTypeLabel()}
            </Badge>
          )}
        </div>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-gray-500 shrink-0 mt-1">
              {timeAgo}
            </span>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">{fullDateTime}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
