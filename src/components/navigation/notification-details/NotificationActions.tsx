import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface NotificationActionsProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleRead: () => void;
  read: boolean;
  showJoinButton: boolean;
  onJoinMeeting?: () => void;
}

export function NotificationActions({ 
  isExpanded, 
  onToggleExpand, 
  onToggleRead, 
  read,
  showJoinButton,
  onJoinMeeting 
}: NotificationActionsProps) {
  return (
    <>
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
      {showJoinButton && isExpanded && onJoinMeeting && (
        <div className="mt-3">
          <Button
            variant="default"
            size="sm"
            className="w-full bg-sky-500 hover:bg-sky-600 text-white"
            onClick={onJoinMeeting}
          >
            Join Meeting <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}