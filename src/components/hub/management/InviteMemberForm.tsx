
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
import { UserPlus, Loader2 } from "lucide-react";

interface InviteMemberFormProps {
  hubId: string;
}

interface EmailValidationResult {
  email: string;
  exists: boolean;
}

export function InviteMemberForm({ hubId }: InviteMemberFormProps) {
  const { toast } = useToast();
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const [isInviting, setIsInviting] = useState(false);
  const [validatedEmails, setValidatedEmails] = useState<EmailValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateEmails = async (emails: string[]) => {
    setIsValidating(true);
    try {
      const results: EmailValidationResult[] = [];
      
      for (const email of emails) {
        const { data } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email.trim())
          .maybeSingle();
          
        results.push({
          email: email.trim(),
          exists: !!data
        });
      }
      
      setValidatedEmails(results);
      return results;
    } catch (error) {
      console.error('Error validating emails:', error);
      return [];
    } finally {
      setIsValidating(false);
    }
  };

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
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter email addresses (comma-separated)"
                  value={emailInput}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="w-full"
                />
              </div>
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
                disabled={isInviting || isValidating || !emailInput || validatedEmails.every(e => !e.exists)}
                className="w-[120px]"
              >
                {isInviting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </>
                )}
              </Button>
            </div>
            
            {validatedEmails.length > 0 && (
              <div className="text-sm space-y-1">
                {validatedEmails.map((result, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-2 ${
                      result.exists ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    <span>•</span>
                    <span>{result.email}</span>
                    <span className="text-xs">
                      {result.exists ? '(valid)' : '(not registered)'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
