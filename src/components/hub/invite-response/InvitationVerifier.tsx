
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { NotificationBasedInviteList } from "./NotificationBasedInviteList";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function InvitationVerifier() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isEmailMismatch, setIsEmailMismatch] = useState<boolean>(false);
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth?redirect=/hub-invite");
    } catch (err) {
      console.error("Error signing out:", err);
    }
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
        
        // Get user's email first so we have it for later
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error("Could not fetch user profile:", profileError);
          throw new Error("Could not verify your account information");
        }
        
        setCurrentUserEmail(userProfile.email);
        console.log("Current user email:", userProfile.email);
        
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
            
            // Check if the invitation is for the current user's email
            if (tokenInvite.invited_email.toLowerCase() !== userProfile.email.toLowerCase()) {
              setInvitedEmail(tokenInvite.invited_email);
              setIsEmailMismatch(true);
              throw new Error(`This invitation was sent to ${tokenInvite.invited_email}, but you're signed in as ${userProfile.email}.`);
            }
            
            invitations = [tokenInvite];
          } else {
            console.log("No invitation found with token:", token);
            
            // If no invitation found with token, check if there are any mismatched invitations
            const { data: mismatched, error: mismatchError } = await supabase
              .from('hub_member_invites')
              .select('invited_email')
              .eq('token', token)
              .maybeSingle();
            
            if (!mismatchError && mismatched) {
              setInvitedEmail(mismatched.invited_email);
              setIsEmailMismatch(true);
              throw new Error(`This invitation was sent to ${mismatched.invited_email}, but you're signed in as ${userProfile.email}.`);
            }
          }
        }
        
        // If no token or token lookup failed, get invitations by email
        if (!invitations) {
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
          // Let's check if there are any pending invitations for other emails
          const { data: allPendingInvites, error: checkError } = await supabase
            .from('hub_member_invites')
            .select('invited_email')
            .eq('status', 'pending')
            .limit(5);
          
          if (!checkError && allPendingInvites && allPendingInvites.length > 0) {
            // Find invites that don't match the current user's email
            const otherEmails = allPendingInvites
              .map(invite => invite.invited_email)
              .filter(email => email.toLowerCase() !== userProfile.email.toLowerCase());
            
            if (otherEmails.length > 0) {
              setInvitedEmail(otherEmails[0]); // Use the first one for the message
              setIsEmailMismatch(true);
              throw new Error(`No invitations found for ${userProfile.email}. There are pending invitations for other email addresses.`);
            }
          }
          
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
  
  // Show email mismatch error with sign out option
  if (isEmailMismatch && invitedEmail && currentUserEmail) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Email Mismatch Detected</AlertTitle>
          <AlertDescription>
            <p className="mb-4">
              This invitation was sent to <strong>{invitedEmail}</strong>, but you're currently 
              signed in as <strong>{currentUserEmail}</strong>.
            </p>
            <p>
              Please sign out and sign in with the email address that received the invitation.
            </p>
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={handleSignOut} 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    );
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
