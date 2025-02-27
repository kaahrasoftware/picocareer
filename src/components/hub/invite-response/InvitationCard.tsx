
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

interface InvitationCardProps {
  hubName: string;
  role: string;
  description?: string;
  isProcessing: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function InvitationCard({ 
  hubName, 
  role, 
  description, 
  isProcessing, 
  onAccept, 
  onDecline 
}: InvitationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hub Invitation</CardTitle>
        <CardDescription>
          You've been invited to join {hubName} as a {role}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {description && (
          <p className="mb-6 text-sm text-muted-foreground">{description}</p>
        )}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={onDecline}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Decline
          </Button>
          <Button
            onClick={onAccept}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Accept
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
