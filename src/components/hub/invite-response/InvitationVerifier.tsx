
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { NotificationBasedInviteList } from "./NotificationBasedInviteList";

export function InvitationVerifier() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuthSession();

  useEffect(() => {
    const fetchPendingInvites = async () => {
      if (!session?.user) {
        setError("Please sign in to view your hub invitations");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch pending invitations for the current user's email
        const { data: invitations, error: inviteError } = await supabase
          .from('hub_member_invites')
          .select(`
            *,
            hub:hubs (
              id,
              name,
              description,
              logo_url
            )
          `)
          .eq('invited_email', session.user.email)
          .eq('status', 'pending');

        if (inviteError) {
          console.error("Error fetching invitations:", inviteError);
          throw inviteError;
        }

        console.log("Fetched invitations:", invitations);
        setPendingInvites(invitations || []);
        
        if (!invitations || invitations.length === 0) {
          toast({
            title: "No Pending Invitations",
            description: "You don't have any pending hub invitations.",
          });
          navigate("/hubs"); // Redirect to hubs page if no invitations
        }
      } catch (err: any) {
        console.error("Failed to fetch invitations:", err);
        setError(err.message || "Failed to fetch your hub invitations");
        toast({
          title: "Error",
          description: "Failed to fetch your hub invitations",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingInvites();
  }, [session, navigate, toast]);

  // Show loading state while fetching invitations
  if (isLoading) {
    return <LoadingState />;
  }
  
  // Show error state if fetch failed
  if (error) {
    return <ErrorState error={error} />;
  }

  // If no session, show auth required error
  if (!session) {
    return <ErrorState error="Please sign in to view your hub invitations" />;
  }
  
  // Show pending invitations if available
  if (pendingInvites.length > 0) {
    return <NotificationBasedInviteList invitations={pendingInvites} />;
  }
  
  // This should rarely be reached due to the redirect in the useEffect
  return <ErrorState error="No pending invitations found" />;
}
