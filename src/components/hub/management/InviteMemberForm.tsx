
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEmailValidation } from "@/hooks/useEmailValidation";
import { EmailValidationList } from "./EmailValidationList";
import { InviteFormControls } from "./InviteFormControls";

interface InviteMemberFormProps {
  hubId: string;
}

export function InviteMemberForm({ hubId }: InviteMemberFormProps) {
  const { toast } = useToast();
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const [isInviting, setIsInviting] = useState(false);
  const { validatedEmails, isValidating, validateEmails, setValidatedEmails } = useEmailValidation();

  const handleEmailChange = async (value: string) => {
    setEmailInput(value);
    if (value) {
      const emails = value.split(',').map(email => email.trim());
      await validateEmails(emails);
    } else {
      setValidatedEmails([]);
    }
  };

  const handleInvite = async () => {
    try {
      setIsInviting(true);
      const emails = emailInput.split(',').map(email => email.trim());
      
      // Filter only existing users
      const validEmails = validatedEmails.filter(result => result.exists).map(result => result.email);
      
      if (validEmails.length === 0) {
        toast({
          title: "No valid emails",
          description: "Please enter valid email addresses of existing users.",
          variant: "destructive",
        });
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Process each valid email
      for (const email of validEmails) {
        // Check for existing pending invitation
        const { data: existingInvite } = await supabase
          .from('hub_member_invites')
          .select('status')
          .eq('hub_id', hubId)
          .eq('invited_email', email)
          .eq('status', 'pending')
          .maybeSingle();

        if (existingInvite) {
          toast({
            title: "Duplicate invitation",
            description: `${email} has already been invited and hasn't responded yet.`,
            variant: "destructive",
          });
          continue;
        }

        // Check if already a member
        const { data: existingMember } = await supabase
          .from('hub_members')
          .select('id')
          .eq('hub_id', hubId)
          .eq('status', 'Approved')
          .maybeSingle();

        if (existingMember) {
          toast({
            title: "Already a member",
            description: `${email} is already a member of this hub.`,
            variant: "destructive",
          });
          continue;
        }

        // Create the invitation
        const { error: inviteError } = await supabase
          .from('hub_member_invites')
          .insert({
            hub_id: hubId,
            invited_email: email,
            role: selectedRole,
            invited_by: user.id,
            status: 'pending'
          });

        if (inviteError) throw inviteError;

        // Log the audit event
        await supabase.rpc('log_hub_audit_event', {
          _hub_id: hubId,
          _action: 'member_invitation_sent',
          _details: { email, role: selectedRole }
        });
      }

      toast({
        title: "Invitations sent",
        description: `Invitations have been sent to ${validEmails.length} user(s)`,
      });

      setEmailInput("");
      setValidatedEmails([]);
      setSelectedRole("member");
    } catch (error: any) {
      console.error('Error sending invites:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitations. Please try again.",
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
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <InviteFormControls
              emailInput={emailInput}
              selectedRole={selectedRole}
              isInviting={isInviting}
              isValidating={isValidating}
              disabled={!emailInput || validatedEmails.every(e => !e.exists)}
              onEmailChange={handleEmailChange}
              onRoleChange={setSelectedRole}
              onInvite={handleInvite}
            />
            <EmailValidationList validatedEmails={validatedEmails} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
