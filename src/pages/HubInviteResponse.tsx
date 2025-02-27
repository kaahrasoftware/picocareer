
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, X, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HubInviteResponse() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [hub, setHub] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        if (!token) {
          setError("Invalid invitation link");
          setIsLoading(false);
          return;
        }

        // Get invitation details
        const { data: invite, error: inviteError } = await supabase
          .from('hub_member_invites')
          .select('*')
          .eq('token', token)
          .maybeSingle();

        if (inviteError || !invite) {
          setError("Invitation not found");
          setIsLoading(false);
          return;
        }

        if (invite.status !== 'pending') {
          setError("This invitation has already been processed");
          setIsLoading(false);
          return;
        }

        if (new Date(invite.expires_at) < new Date()) {
          setError("This invitation has expired");
          setIsLoading(false);
          return;
        }

        // Get hub details
        const { data: hubData, error: hubError } = await supabase
          .from('hubs')
          .select('*')
          .eq('id', invite.hub_id)
          .maybeSingle();

        if (hubError || !hubData) {
          setError("Hub not found");
          setIsLoading(false);
          return;
        }

        setInvitation(invite);
        setHub(hubData);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching invitation:', error);
        setError("Failed to load invitation");
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleResponse = async (accept: boolean) => {
    try {
      setIsProcessing(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const timestamp = new Date().toISOString();
      
      if (accept) {
        // Create hub member record
        const { error: memberError } = await supabase
          .from('hub_members')
          .insert({
            hub_id: invitation.hub_id,
            profile_id: user.id,
            role: invitation.role,
            status: 'Approved',
          });

        if (memberError) throw memberError;
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('hub_member_invites')
        .update({
          status: accept ? 'accepted' : 'rejected',
          accepted_at: accept ? timestamp : null,
          rejected_at: accept ? null : timestamp,
        })
        .eq('token', token);

      if (updateError) throw updateError;

      // Log the audit event
      await supabase.rpc('log_hub_audit_event', {
        _hub_id: invitation.hub_id,
        _action: accept ? 'member_added' : 'member_invitation_cancelled',
        _details: { role: invitation.role }
      });

      toast({
        title: accept ? "Invitation Accepted" : "Invitation Declined",
        description: accept 
          ? `You are now a member of ${hub.name}`
          : `You have declined the invitation to join ${hub.name}`,
      });

      // Redirect to hub page if accepted
      if (accept) {
        navigate(`/hubs/${hub.id}`);
      } else {
        navigate("/hubs");
      }
    } catch (error: any) {
      console.error('Error processing invitation:', error);
      toast({
        title: "Error",
        description: "Failed to process invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-end gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => navigate("/hubs")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Hubs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Hub Invitation</CardTitle>
          <CardDescription>
            You've been invited to join {hub.name} as a {invitation.role}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hub.description && (
            <p className="mb-6 text-sm text-muted-foreground">{hub.description}</p>
          )}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => handleResponse(false)}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Decline
            </Button>
            <Button
              onClick={() => handleResponse(true)}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Accept
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
