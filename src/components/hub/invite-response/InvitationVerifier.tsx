
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  // Extract token from URL if present
  const getTokenFromUrl = (): string | null => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    
    if (token) return token;
    
    // Check if token is in the path part instead
    const pathMatch = location.pathname.match(/\/hub-invite\/([^/?]+)/);
    if (pathMatch && pathMatch[1]) return pathMatch[1];
    
    return null;
  };

  useEffect(() => {
    const fetchPendingInvites = async () => {
      if (!session?.user) {
        setError("Please sign in to view your hub invitations");
        setIsLoading(false);
        return;
      }

      try {
        const token = getTokenFromUrl();
        let invitations = null;
        
        console.log("Looking up hub invitations...");
        
        // If we have a token, try to find the specific invitation
        if (token) {
          console.log("Looking up invitation by token:", token);
          
          const { data: tokenInvite, error: tokenError } = await supabase
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
            .eq('token', token)
            .eq('status', 'pending')
            .maybeSingle();
            
          if (tokenError) {
            console.error("Error fetching invitation by token:", tokenError);
            throw new Error("Error retrieving invitation details. Please try again.");
          } 
          
          if (tokenInvite) {
            console.log("Found invitation by token:", tokenInvite);
            invitations = [tokenInvite];
          } else {
            console.log("No invitation found with token:", token);
            throw new Error("No invitation found with this token. It may have expired or already been processed.");
          }
        } else {
          // No token provided, get all pending invitations for the user's email
          console.log("Looking up pending invitations for user email");
          
          const userEmail = session.user.email;
          console.log("User email:", userEmail);
          
          if (!userEmail) {
            throw new Error("Could not determine your email address. Please update your profile.");
          }
          
          const { data: userInvitations, error: inviteError } = await supabase
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
            .eq('status', 'pending')
            .eq('invited_email', userEmail);

          if (inviteError) {
            console.error("Error fetching user invitations:", inviteError);
            throw inviteError;
          }
          
          console.log("Found user invitations:", userInvitations);
          invitations = userInvitations;
        }

        if (!invitations || invitations.length === 0) {
          setError("No pending invitations found. If you received an invitation, it may have already been processed or expired.");
          toast({
            title: "No Pending Invitations",
            description: "You don't have any pending hub invitations.",
          });
        } else {
          setPendingInvites(invitations);
        }
      } catch (err: any) {
        console.error("Failed to fetch invitations:", err);
        setError(err.message || "Failed to fetch your hub invitations");
        toast({
          title: "Error",
          description: err.message || "Failed to fetch your hub invitations",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingInvites();
  }, [session, navigate, toast, location]);

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
  
  // This should rarely be reached due to the error handling above
  return <ErrorState error="No pending invitations found" />;
}
