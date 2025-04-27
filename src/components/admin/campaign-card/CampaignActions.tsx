
import { Button } from "@/components/ui/button";
import { Loader2, Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { Campaign } from "@/types/database/email";

interface CampaignActionsProps {
  campaign: Campaign;
  sendingCampaign: string | null;
  onSend: (id: string) => void;
}

export function CampaignActions({ campaign, sendingCampaign, onSend }: CampaignActionsProps) {
  if (campaign.status === 'sent') {
    return (
      <div className="text-sm text-green-600 font-medium flex items-center gap-2">
        <CheckCircle className="h-4 w-4" />
        Sent ({campaign.sent_count} recipients)
      </div>
    );
  }

  if (campaign.status === 'partial') {
    return (
      <div className="text-sm text-orange-600 font-medium flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Partially Sent ({campaign.sent_count}/{campaign.recipients_count})
      </div>
    );
  }

  if (campaign.status === 'failed') {
    return (
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 border-red-300 hover:bg-red-50"
        onClick={() => onSend(campaign.id)}
        disabled={sendingCampaign === campaign.id}
      >
        {sendingCampaign === campaign.id ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Retrying...
          </>
        ) : (
          <>
            <XCircle className="mr-2 h-4 w-4" />
            Retry Send
          </>
        )}
      </Button>
    );
  }

  if (campaign.status === 'sending') {
    return (
      <div className="text-sm text-blue-600 font-medium flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Sending...
      </div>
    );
  }

  return (
    <Button
      size="sm"
      onClick={() => onSend(campaign.id)}
      disabled={sendingCampaign === campaign.id}
      className="bg-primary hover:bg-primary/90"
    >
      {sendingCampaign === campaign.id ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Clock className="mr-2 h-4 w-4" />
          Send Now
        </>
      )}
    </Button>
  );
}
