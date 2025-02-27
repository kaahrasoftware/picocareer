
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useHubInvitation } from "@/hooks/hub/useHubInvitation";

interface HubInviteButtonsProps {
  token: string;
}

export function HubInviteButtons({ token }: HubInviteButtonsProps) {
  const { isProcessing, handleAccept, handleDecline } = useHubInvitation(token);

  return (
    <div className="flex gap-2 mt-2">
      <Button
        variant="outline"
        size="sm"
        className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
        onClick={handleAccept}
        disabled={isProcessing}
      >
        <Check className="w-4 h-4 mr-2" />
        Accept
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
        onClick={handleDecline}
        disabled={isProcessing}
      >
        <X className="w-4 h-4 mr-2" />
        Reject
      </Button>
    </div>
  );
}
