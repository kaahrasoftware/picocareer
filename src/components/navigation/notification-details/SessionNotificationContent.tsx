
import { formatDistanceToNow } from "date-fns";
import { CalendarClock, UserCheck, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SessionNotificationContentProps {
  message: string;
  isExpanded: boolean;
  type?: string;
  action_url?: string;
}

export function SessionNotificationContent({ 
  message, 
  isExpanded, 
  type,
  action_url 
}: SessionNotificationContentProps) {
  const navigate = useNavigate();
  
  // Function to safely extract session data from message
  // Messages might be in JSON format or plain text
  const getSessionData = () => {
    try {
      // Try to parse as JSON first
      const data = JSON.parse(message);
      return data.session || {};
    } catch (e) {
      // If not JSON, return empty object
      return {};
    }
  };

  const sessionData = getSessionData();
  
  // Return a badge based on notification type
  const getBadge = () => {
    switch(type) {
      case 'session_booked':
        return <Badge className="bg-green-600 text-white">Session Booked</Badge>;
      case 'session_cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'session_reminder':
        return <Badge className="bg-amber-500 text-white">Reminder</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="mt-1">
      <div className="flex items-center gap-2 mb-1">
        {getBadge()}
        {type === 'session_booked' && <UserCheck className="h-4 w-4 text-green-400" />}
        {type === 'session_cancelled' && <UserX className="h-4 w-4 text-red-400" />}
        {type === 'session_reminder' && <CalendarClock className="h-4 w-4 text-amber-400" />}
      </div>

      <p className={`text-sm text-zinc-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
        {message}
      </p>

      {action_url && isExpanded && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => navigate(action_url)}
        >
          View Session Details
        </Button>
      )}
    </div>
  );
}
