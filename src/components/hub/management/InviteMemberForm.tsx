
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";

interface InviteMemberFormProps {
  hubId: string;
}

export function InviteMemberForm({ hubId }: InviteMemberFormProps) {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async () => {
    try {
      setIsInviting(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Check for existing pending invitation - using maybeSingle() instead of single()
      const { data: existingInvite, error: checkError } = await supabase
        .from('hub_member_invites')
        .select('status')
        .eq('hub_id', hubId)
        .eq('invited_email', inviteEmail)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingInvite) {
        toast({
          title: "Invitation already exists",
          description: "This person has already been invited and hasn't responded yet.",
          variant: "destructive",
        });
        return;
      }

      // Check if already a member - using maybeSingle() instead of single()
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('hub_members')
        .select('id')
        .eq('hub_id', hubId)
        .eq('profile_id', user.id)
        .maybeSingle();

      if (existingMember) {
        toast({
          title: "Already a member",
          description: "This person is already a member of this hub.",
          variant: "destructive",
        });
        return;
      }

      // Create the invitation record
      const { data: invite, error } = await supabase
        .from('hub_member_invites')
        .insert({
          hub_id: hubId,
          invited_email: inviteEmail,
          role: selectedRole,
          invited_by: user.id,
          status: 'pending'
        })
        .select('id, token')
        .single();

      if (error) throw error;

      // Send invitation email using edge function
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/send-hub-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          inviteId: invite.id,
          hubId: hubId,
          invitedEmail: inviteEmail,
          role: selectedRole
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send invitation email');
      }

      // Log the audit event
      await supabase.rpc('log_hub_audit_event', {
        _hub_id: hubId,
        _action: 'member_invitation_sent',
        _details: { email: inviteEmail, role: selectedRole }
      });

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${inviteEmail}`,
      });

      setInviteEmail("");
      setSelectedRole("member");
    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Input
            type="email"
            placeholder="Enter email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleInvite} 
            disabled={isInviting || !inviteEmail}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {isInviting ? "Sending..." : "Invite"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
