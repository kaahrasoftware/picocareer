
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InviteItemProps {
  invite: {
    id: string;
    invited_email: string;
    role: string;
  };
  onCancel: (inviteId: string) => void;
}

export function InviteItem({ invite, onCancel }: InviteItemProps) {
  return (
    <div className="flex items-center justify-between p-2 border rounded">
      <div>
        <p className="font-medium">{invite.invited_email}</p>
        <p className="text-sm text-muted-foreground">Role: {invite.role}</p>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => onCancel(invite.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
