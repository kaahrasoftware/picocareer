
import { supabase } from "@/integrations/supabase/client";
import type { HubInvite, Hub } from "../types/invitation";
import { useToast } from "@/hooks/use-toast";

export async function handleInvitationResponse(
  accept: boolean,
  invitation: HubInvite,
  hub: Hub | null
): Promise<void> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error('Auth error:', userError);
    throw userError;
  }

  if (!user) {
    throw new Error("Please sign in to accept/decline the invitation");
  }

  // Verify invitation again before processing
  const { data: currentInvite, error: inviteError } = await supabase
    .from('hub_member_invites')
    .select('*')
    .eq('token', invitation.token)
    .eq('invited_email', user.email)
    .single();

  if (inviteError || !currentInvite) {
    console.log('No invitation found for token:', invitation.token);
    throw new Error("Invitation not found");
  }

  if (currentInvite.status !== 'pending') {
    console.log('Invalid status:', currentInvite.status);
    throw new Error("This invitation has already been processed");
  }

  if (new Date(currentInvite.expires_at) < new Date()) {
    console.log('Invitation expired:', currentInvite.expires_at);
    throw new Error("This invitation has expired");
  }

  const timestamp = new Date().toISOString();
  
  if (accept) {
    console.log('Creating hub member record');
    // Create hub member record
    const { error: memberError } = await supabase
      .from('hub_members')
      .insert({
        hub_id: invitation.hub_id,
        profile_id: user.id,
        role: invitation.role,
        status: 'Approved',
      });

    if (memberError) {
      console.error('Error creating member record:', memberError);
      throw memberError;
    }
  }

  // Update invitation status
  const { error: updateError } = await supabase
    .from('hub_member_invites')
    .update({
      status: accept ? 'accepted' : 'rejected',
      accepted_at: accept ? timestamp : null,
      rejected_at: accept ? null : timestamp,
    })
    .eq('token', invitation.token)
    .eq('invited_email', user.email);

  if (updateError) {
    console.error('Error updating invitation status:', updateError);
    throw updateError;
  }

  // Log the audit event
  await supabase.rpc('log_hub_audit_event', {
    _hub_id: invitation.hub_id,
    _action: accept ? 'member_added' : 'member_invitation_cancelled',
    _details: { role: invitation.role }
  });

  const { toast } = useToast();
  
  toast({
    title: accept ? "Invitation Accepted" : "Invitation Declined",
    description: accept 
      ? `You are now a member of ${hub?.name}`
      : `You have declined the invitation to join ${hub?.name}`,
  });
}
