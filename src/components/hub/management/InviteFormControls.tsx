
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InviteFormControlsProps {
  emailInput: string;
  selectedRole: string;
  isInviting: boolean;
  isValidating: boolean;
  disabled: boolean;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onInvite: () => void;
}

export function InviteFormControls({
  emailInput,
  selectedRole,
  isInviting,
  isValidating,
  disabled,
  onEmailChange,
  onRoleChange,
  onInvite
}: InviteFormControlsProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Enter email addresses (comma-separated)"
          value={emailInput}
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-full"
        />
      </div>
      <Select value={selectedRole} onValueChange={onRoleChange}>
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
        onClick={onInvite} 
        disabled={disabled || isInviting || isValidating}
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
  );
}
