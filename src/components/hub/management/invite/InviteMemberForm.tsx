
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
import { UserPlus, Loader2 } from "lucide-react";
import { MemberRole } from "@/types/database/hubs";
import { InviteMemberFormProps } from "./types";
import { useEmailValidation } from "./useEmailValidation";
import { useInviteMember } from "./useInviteMember";
import { EmailValidationList } from "./EmailValidationList";

export function InviteMemberForm({ hubId }: InviteMemberFormProps) {
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<MemberRole>("member");
  const { validatedEmails, isValidating, validateEmails, setValidatedEmails } = useEmailValidation();
  const { isInviting, sendInvites } = useInviteMember(hubId);

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
    const success = await sendInvites(validatedEmails, selectedRole);
    if (success) {
      setEmailInput("");
      setValidatedEmails([]);
      setSelectedRole("member");
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
              <Select 
                value={selectedRole} 
                onValueChange={(value: MemberRole) => setSelectedRole(value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
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
            
            <EmailValidationList validatedEmails={validatedEmails} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
