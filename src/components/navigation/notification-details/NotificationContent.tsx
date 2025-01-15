import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { MentorSession } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { CareerDetailsDialog } from "@/components/CareerDetailsDialog";
import { MajorDetails } from "@/components/MajorDetails";
import { BlogPostDialog } from "@/components/blog/BlogPostDialog";

interface NotificationContentProps {
  message: string;
  isExpanded: boolean;
  type?: string;
  action_url?: string;
}

export function NotificationContent({ message, isExpanded, type, action_url }: NotificationContentProps) {
  const [sessionData, setSessionData] = useState<MentorSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!isExpanded) return;
      
      setIsLoading(true);
      try {
        // Try to extract meeting link first
        const meetingLinkMatch = message.match(/href="([^"]+)"/);
        if (meetingLinkMatch) {
          console.log('Found meeting link:', meetingLinkMatch[1]);
          
          // Query sessions with this meeting link
          const { data, error } = await supabase
            .from('mentor_sessions')
            .select(`
              id,
              scheduled_at,
              notes,
              meeting_platform,
              meeting_link,
              session_type:mentor_session_types(type, duration),
              mentor:profiles!mentor_sessions_mentor_id_fkey(full_name),
              mentee:profiles!mentor_sessions_mentee_id_fkey(full_name)
            `)
            .eq('meeting_link', meetingLinkMatch[1])
            .maybeSingle();

          if (error) {
            console.error('Error fetching session data:', error);
            throw error;
          }

          if (data) {
            console.log('Session data fetched successfully:', data);
            setSessionData(data as MentorSession);
          } else {
            console.log('No session data found for meeting link');
          }
        } else {
          console.log('No meeting link found in message');
        }
      } catch (error) {
        console.error('Error in fetchSessionData:', error);
        toast({
          title: "Error loading session details",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [isExpanded, message, toast]);

  // Get first sentence for collapsed view
  const firstSentence = message.split(/[.!?]/)[0];

  const handleActionClick = () => {
    if (!action_url) return;
    
    // Extract the ID from the action URL
    const id = action_url.split('/').pop();
    if (!id) return;
    
    setDialogOpen(true);
  };

  const renderDialog = () => {
    if (!action_url || !dialogOpen) return null;
    
    const id = action_url.split('/').pop();
    if (!id) return null;

    switch (type) {
      case "major_update":
        return (
          <MajorDetails
            major={{ id }}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        );
      case "career_update":
        return (
          <CareerDetailsDialog
            careerId={id}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        );
      case "blog_update":
        return (
          <BlogPostDialog
            blog={{ id }}
            isOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
          />
        );
      default:
        return null;
    }
  };

  const renderActionButton = () => {
    if (!action_url) return null;

    let buttonText = "View Details";
    if (type === "major_update") buttonText = "View Major";
    if (type === "career_update") buttonText = "View Career";
    if (type === "blog_update") buttonText = "View Blog Post";

    return (
      <Button
        variant="outline"
        size="sm"
        className="mt-2 text-sky-400 hover:text-sky-300 hover:bg-sky-400/10"
        onClick={handleActionClick}
      >
        {buttonText}
        <ExternalLink className="w-4 h-4 ml-2" />
      </Button>
    );
  };

  if (!isExpanded) {
    return (
      <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
        {firstSentence}
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2 mt-3 text-sm text-zinc-400">
        <p>Loading session details...</p>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="space-y-2 mt-3 text-sm text-zinc-400">
        <p>{message}</p>
        {renderActionButton()}
        {renderDialog()}
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-3 text-sm text-zinc-400">
      <p><span className="font-medium text-zinc-300">Mentor:</span> {sessionData.mentor?.full_name}</p>
      <p><span className="font-medium text-zinc-300">Mentee:</span> {sessionData.mentee?.full_name}</p>
      <p><span className="font-medium text-zinc-300">Start Time:</span> {new Date(sessionData.scheduled_at).toLocaleString()}</p>
      <p><span className="font-medium text-zinc-300">Session Type:</span> {sessionData.session_type?.type}</p>
      <p><span className="font-medium text-zinc-300">Duration:</span> {sessionData.session_type?.duration} minutes</p>
      <p><span className="font-medium text-zinc-300">Platform:</span> {sessionData.meeting_platform}</p>
      {sessionData.meeting_link && (
        <p>
          <span className="font-medium text-zinc-300">Meeting Link:</span>{' '}
          <a 
            href={sessionData.meeting_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 hover:underline"
          >
            Join Meeting
          </a>
        </p>
      )}
      {sessionData.notes && (
        <p><span className="font-medium text-zinc-300">Note:</span> {sessionData.notes}</p>
      )}
      {renderActionButton()}
      {renderDialog()}
    </div>
  );
}
