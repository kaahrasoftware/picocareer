import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CircleCheck, CircleDot, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  action_url?: string;
}

interface NotificationItemProps {
  notification: Notification;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleRead: (notification: Notification) => void;
}

export function NotificationItem({ notification, isExpanded, onToggleExpand, onToggleRead }: NotificationItemProps) {
  const { toast } = useToast();

  const handleJoinMeeting = async (notification: Notification) => {
    try {
      // Check if the notification is session-related
      if (!notification.title.toLowerCase().includes('session')) {
        throw new Error('Invalid session notification');
      }

      // Extract session ID from the message using regex
      const sessionIdMatch = notification.message.match(/Session ID: ([a-f0-9-]+)/);
      const sessionId = sessionIdMatch ? sessionIdMatch[1] : null;

      if (!sessionId) {
        console.error('No session ID found in message:', notification.message);
        throw new Error('No valid session ID found');
      }

      console.log('Fetching meeting link for session:', sessionId);

      // Fetch the meeting link from mentor_sessions table
      const { data: sessionData, error } = await supabase
        .from('mentor_sessions')
        .select(`
          meeting_link,
          status,
          scheduled_at,
          session_type:mentor_session_types(type, duration),
          mentor:profiles!mentor_sessions_mentor_id_fkey(full_name),
          mentee:profiles!mentor_sessions_mentee_id_fkey(full_name),
          meeting_platform,
          notes
        `)
        .eq('id', sessionId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching session data:', error);
        throw error;
      }

      if (!sessionData) {
        throw new Error('Session not found');
      }

      if (sessionData.status === 'cancelled') {
        toast({
          title: "Session Cancelled",
          description: "This session has been cancelled and the meeting link is no longer valid",
          variant: "destructive",
        });
        return null;
      }

      if (!sessionData.meeting_link) {
        toast({
          title: "No meeting link available",
          description: "The meeting link for this session is not available yet",
          variant: "destructive",
        });
        return null;
      }

      return sessionData.meeting_link;
    } catch (error) {
      console.error('Error fetching meeting link:', error);
      toast({
        title: "Error",
        description: "Failed to retrieve meeting link. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-colors ${
        notification.read 
          ? 'bg-zinc-900 border-zinc-800' 
          : 'bg-zinc-900/90 border-zinc-700'
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-zinc-50 flex items-center gap-2">
              {notification.title}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onToggleRead(notification)}
              >
                {notification.read ? (
                  <CircleCheck className="h-4 w-4 text-emerald-500" />
                ) : (
                  <CircleDot className="h-4 w-4 text-sky-500" />
                )}
              </Button>
            </h4>
            <span className="text-xs text-zinc-400">
              {format(new Date(notification.created_at), 'MMM d, h:mm a')}
            </span>
          </div>
          {isExpanded ? (
            <div className="space-y-2 mt-3 text-sm text-zinc-400">
              <p><span className="font-medium text-zinc-300">Mentor:</span> {notification.message.match(/Mentor: ([^\n]+)/)?.[1] || 'N/A'}</p>
              <p><span className="font-medium text-zinc-300">Mentee:</span> {notification.message.match(/Mentee: ([^\n]+)/)?.[1] || 'N/A'}</p>
              <p><span className="font-medium text-zinc-300">Start Time:</span> {notification.message.match(/Start Time: ([^\n]+)/)?.[1] || 'N/A'}</p>
              <p><span className="font-medium text-zinc-300">Duration:</span> {notification.message.match(/Duration: ([^\n]+)/)?.[1] || 'N/A'}</p>
              <p><span className="font-medium text-zinc-300">Platform:</span> {notification.message.match(/Platform: ([^\n]+)/)?.[1] || 'N/A'}</p>
              {notification.message.includes('Note:') && (
                <p><span className="font-medium text-zinc-300">Note:</span> {notification.message.match(/Note: ([^\n]+)/)?.[1] || 'N/A'}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
              {notification.message}
            </p>
          )}
        </div>
      </div>
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
          className={notification.read ? 
            "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10" :
            "text-sky-400 hover:text-sky-300 hover:bg-sky-400/10"
          }
          onClick={() => onToggleRead(notification)}
        >
          {notification.read ? 'Mark as unread' : 'Mark as read'}
        </Button>
      </div>
      {notification.action_url && isExpanded && (
        <div className="mt-3">
          {notification.title.toLowerCase().includes('session') ? (
            <Button
              variant="default"
              size="sm"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white"
              onClick={async () => {
                const meetingLink = await handleJoinMeeting(notification);
                if (meetingLink) {
                  // Open the meeting link in a new window
                  window.open(meetingLink, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              Join Meeting <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Link
              to={notification.action_url}
              className="text-sm text-primary hover:underline block"
            >
              View details
            </Link>
          )}
        </div>
      )}
    </div>
  );
}