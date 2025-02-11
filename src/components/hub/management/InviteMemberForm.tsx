
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

      const { error } = await supabase
        .from('hub_member_invites')
        .insert({
          hub_id: hubId,
          invited_email: inviteEmail,
          role: selectedRole,
          invited_by: user.id
        });

      if (error) throw error;

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
    } catch (error) {
      console.error('Error sending invite:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
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
