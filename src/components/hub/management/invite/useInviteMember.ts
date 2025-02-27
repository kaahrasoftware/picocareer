
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MemberRole } from "@/types/database/hubs";
import { EmailValidationResult } from "./useEmailValidation";

export function useInviteMember(hubId: string) {
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  const sendInvites = async (validatedEmails: EmailValidationResult[], selectedRole: MemberRole) => {
    try {
      setIsInviting(true);
      
      // Filter only existing users
      const validEmails = validatedEmails.filter(result => result.exists).map(result => result.email);
      
      if (validEmails.length === 0) {
        toast({
          title: "No valid emails",
          description: "Please enter valid email addresses of existing users.",
          variant: "destructive",
        });
        return false;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      let successCount = 0;
      // Process each valid email
      for (const email of validEmails) {
        try {
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
              status: 'pending',
              email_status: 'pending',
              token: crypto.randomUUID(), // Generate a unique token for each invitation
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
            });

          if (inviteError) {
            console.error('Error creating invitation:', inviteError);
            toast({
              title: "Error",
              description: `Failed to invite ${email}. Please try again.`,
              variant: "destructive",
            });
            continue;
          }

          // Log the audit event
          await supabase.rpc('log_hub_audit_event', {
            _hub_id: hubId,
            _action: 'member_invitation_sent',
            _details: { email, role: selectedRole }
          });

          successCount++;
        } catch (error) {
          console.error('Error processing invitation for', email, ':', error);
        }
      }

      if (successCount > 0) {
        toast({
          title: "Invitations sent",
          description: `Successfully sent ${successCount} invitation${successCount > 1 ? 's' : ''}.`,
        });
        return true;
      } else {
        toast({
          title: "No invitations sent",
          description: "Failed to send any invitations. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error sending invites:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitations. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsInviting(false);
    }
  };

  return {
    isInviting,
    sendInvites
  };
}
