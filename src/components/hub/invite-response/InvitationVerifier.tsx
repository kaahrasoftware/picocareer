
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { InvitationDetailsDialog } from "./InvitationDetailsDialog";
import { ErrorState } from "./ErrorState";
import { LoadingSpinner } from "./LoadingSpinner";
import type { HubInvite, Hub } from "@/hooks/hub/types/invitation";

export function InvitationVerifier() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [invitation, setInvitation] = useState<HubInvite | null>(null);
  const [hub, setHub] = useState<Hub | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    const verifyInvitation = async () => {
      const token = getTokenFromUrl();
      
      if (!token) {
        setError("No invitation token found. Please check your invitation link.");
        setIsVerifying(false);
        return;
      }

      try {
        // For demo purposes, we'll create mock data
        // In a real implementation, you would verify against the hub_member_invites table
        const mockInvitation: HubInvite = {
          id: "mock-invite-id",
          hub_id: "mock-hub-id",
          invited_email: "user@example.com",
          role: "member",
          status: "pending",
          token: token,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        };

        const mockHub: Hub = {
          id: "mock-hub-id",
          name: "Career Development Hub",
          description: "A community focused on career growth and professional development"
        };

        setInvitation(mockInvitation);
        setHub(mockHub);
        setShowDialog(true);
        
      } catch (err: any) {
        console.error("Error verifying invitation:", err);
        setError(err.message || "Failed to verify invitation. Please try again or contact support.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyInvitation();
  }, [location]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!invitation || !hub) {
    return <ErrorState error="Invitation data not found." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Hub Invitation</h1>
        <p className="text-muted-foreground mb-6">
          Processing your invitation to join {hub.name}
        </p>
        
        <InvitationDetailsDialog
          invitation={invitation}
          hub={hub}
          isOpen={showDialog}
          onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) {
              navigate('/hubs');
            }
          }}
        />
      </div>
    </div>
  );
}
