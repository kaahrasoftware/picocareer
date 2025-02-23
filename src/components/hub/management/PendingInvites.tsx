
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInviteSubscription } from "./invite/useInviteSubscription";
import { useCancelInvite } from "./invite/useCancelInvite";
import { InviteItem } from "./invite/InviteItem";

interface PendingInvitesProps {
  hubId: string;
  pendingInvites: any[];
}

export function PendingInvites({ hubId, pendingInvites }: PendingInvitesProps) {
  useInviteSubscription(hubId);
  const { cancelInvite } = useCancelInvite(hubId);

  if (!pendingInvites?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invites</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingInvites.map((invite) => (
            <InviteItem 
              key={invite.id} 
              invite={invite} 
              onCancel={cancelInvite}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
