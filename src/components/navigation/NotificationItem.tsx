import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NotificationHeader } from "./notification-details/NotificationHeader";
import { NotificationContent } from "./notification-details/NotificationContent";
import { NotificationActions } from "./notification-details/NotificationActions";

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

export function NotificationItem({ 
  notification, 
  isExpanded, 
  onToggleExpand, 
  onToggleRead 
}: NotificationItemProps) {
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
          <NotificationHeader
            title={notification.title}
            createdAt={notification.created_at}
            read={notification.read}
            onToggleRead={() => onToggleRead(notification)}
          />
          <NotificationContent
            message={notification.message}
            isExpanded={isExpanded}
          />
        </div>
      </div>
      <NotificationActions
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onToggleRead={() => onToggleRead(notification)}
        read={notification.read}
        showJoinButton={notification.title.toLowerCase().includes('session')}
        onJoinMeeting={async () => {
          const meetingLink = await handleJoinMeeting(notification);
          if (meetingLink) {
            window.open(meetingLink, '_blank', 'noopener,noreferrer');
          }
        }}
      />
    </div>
  );
}