
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationData } from "./hooks/useNotificationData";
import { NotificationDialogs } from "./NotificationDialogs";
import { SessionNotificationContent } from "./SessionNotificationContent";
import type { MentorSession } from "@/types/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface NotificationContentProps {
  message: string;
  isExpanded: boolean;
  type?: string;
  action_url?: string;
}

export function NotificationContent({ 
  message, 
  isExpanded, 
  type, 
  action_url 
}: NotificationContentProps) {
  const [sessionData, setSessionData] = useState<MentorSession | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Extract token from action URL
  const token = action_url ? new URL(action_url).searchParams.get('token') : null;

  // Extract ID from action URL
  const contentId = action_url?.split('/').pop();

  // Fetch data using custom hook
  const { majorData, careerData, blogData } = useNotificationData(contentId, type, dialogOpen);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!isExpanded) return;
      setIsLoading(true);
      
      try {
        const meetingLinkMatch = message.match(/href="([^"]+)"/);
        if (meetingLinkMatch) {
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
            setSessionData(data as MentorSession);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [isExpanded, message]);

  const handleAccept = async () => {
    if (type === 'hub_invite' && token) {
      try {
        setIsLoading(true);
        // First get the invitation details to check status
        const { data: invite, error: inviteError } = await supabase
          .from('hub_member_invites')
          .select('*')
          .eq('token', token)
          .single();
          
        if (inviteError) throw inviteError;
        
        if (!invite || invite.status !== 'pending') {
          toast({
            title: "Invalid invitation",
            description: "This invitation is no longer valid.",
            variant: "destructive"
          });
          return;
        }

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // First update the invite status
        const { error: updateError } = await supabase
          .from('hub_member_invites')
          .update({ 
            status: 'accepted',
            accepted_at: new Date().toISOString()
          })
          .eq('token', token);
            
        if (updateError) throw updateError;

        // Then create the hub member record
        const { error: memberError } = await supabase
          .from('hub_members')
          .insert({
            hub_id: invite.hub_id,
            profile_id: user.id,
            role: invite.role,
            status: 'Approved'
          });

        if (memberError) throw memberError;

        toast({
          title: "Success",
          description: "You have successfully joined the hub.",
        });

        navigate(`/hubs/${invite.hub_id}`);
      } catch (error: any) {
        console.error('Error accepting invitation:', error);
        toast({
          title: "Error",
          description: "Failed to accept invitation. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleReject = async () => {
    if (type === 'hub_invite' && token) {
      try {
        setIsLoading(true);
        // First check if invitation is still valid
        const { data: invite, error: inviteError } = await supabase
          .from('hub_member_invites')
          .select('status')
          .eq('token', token)
          .single();
          
        if (inviteError) throw inviteError;
        
        if (!invite || invite.status !== 'pending') {
          toast({
            title: "Invalid invitation",
            description: "This invitation is no longer valid.",
            variant: "destructive"
          });
          return;
        }

        // Update the invite status
        const { error: updateError } = await supabase
          .from('hub_member_invites')
          .update({ 
            status: 'rejected',
            rejected_at: new Date().toISOString()
          })
          .eq('token', token);
            
        if (updateError) throw updateError;
        
        toast({
          title: "Invitation Declined",
          description: "You have declined the hub invitation.",
        });

        navigate("/hubs");
      } catch (error: any) {
        console.error('Error rejecting invitation:', error);
        toast({
          title: "Error",
          description: "Failed to reject invitation. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDetailClick = () => {
    if (type === 'availability_request') {
      // Redirect to profile page with mentor tab selected
      navigate('/profile?tab=mentor');
      return;
    }
    setDialogOpen(true);
  };

  const renderActionButton = () => {
    // Don't show buttons for session-related notifications
    if (!action_url || type?.includes('session')) return null;

    if (type === 'hub_invite') {
      return (
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
            onClick={handleAccept}
            disabled={isLoading}
          >
            <Check className="w-4 h-4 mr-2" />
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
            onClick={handleReject}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className="mt-2 text-sky-400 hover:text-sky-300 hover:bg-sky-400/10"
        onClick={handleDetailClick}
      >
        View Detail
        <ExternalLink className="w-4 h-4 ml-2" />
      </Button>
    );
  };

  if (!isExpanded) {
    return (
      <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
        {message.split(/[.!?]/)[0]}
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2 mt-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="space-y-2 mt-3 text-sm text-zinc-400">
        <p>{message}</p>
        {renderActionButton()}
        <NotificationDialogs
          type={type}
          contentId={contentId!}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          majorData={majorData}
          careerData={careerData}
          blogData={blogData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-3">
      <SessionNotificationContent sessionData={sessionData} />
      {renderActionButton()}
    </div>
  );
}
