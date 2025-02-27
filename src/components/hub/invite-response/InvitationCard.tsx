
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { HubMemberRole } from "@/types/database/hubs";

interface InvitationCardProps {
  hubName: string;
  role: HubMemberRole;
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
        <CardTitle>Invitation to Join {hubName}</CardTitle>
        <CardDescription>
          You have been invited to join as a {role}
        </CardDescription>
      </CardHeader>
      {description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      )}
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={onDecline}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Decline"}
        </Button>
        <Button
          onClick={onAccept}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Accept"}
        </Button>
      </CardFooter>
    </Card>
  );
}
