
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
        
        console.log("Looking up invite by token:", token);
        
        // If we have a token, try to find the specific invitation
        if (token) {
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
          } else if (tokenInvite) {
            console.log("Found invitation by token:", tokenInvite);
            invitations = [tokenInvite];
          } else {
            console.log("No invitation found with token:", token);
          }
        }
        
        // If no token or token lookup failed, get invitations by email
        if (!invitations) {
          // Get user's email
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error("Could not fetch user profile:", profileError);
            throw new Error("Could not verify your account information");
          }
            
          console.log("Looking up invites for email:", userProfile.email);
          
          // Fetch pending invitations for the current user's email
          const { data: emailInvitations, error: inviteError } = await supabase
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
            .eq('invited_email', userProfile.email)
            .eq('status', 'pending');

          if (inviteError) {
            console.error("Error fetching invitations by email:", inviteError);
            throw inviteError;
          }
          
          console.log("Found invitations by email:", emailInvitations);
          invitations = emailInvitations;
        }

        if (!invitations || invitations.length === 0) {
          setError("No pending invitations found. If you received an invitation, please make sure you're signed in with the correct email address.");
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
          description: "Failed to fetch your hub invitations",
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
