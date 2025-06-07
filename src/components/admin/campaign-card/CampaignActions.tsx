
import { Button } from "@/components/ui/button";
import { Loader2, Clock, CheckCircle, AlertTriangle, XCircle, Send, RotateCcw } from "lucide-react";
import type { Campaign } from "@/types/database/email";

interface CampaignActionsProps {
  campaign: Campaign;
  sendingCampaign: string | null;
  onSend: (id: string) => void;
}

export function CampaignActions({ campaign, sendingCampaign, onSend }: CampaignActionsProps) {
  const isLoading = sendingCampaign === campaign.id;

  if (campaign.status === 'sent') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50/80 px-3 py-2 rounded-lg border border-green-200/60">
        <CheckCircle className="h-4 w-4" />
        <span className="font-medium">Campaign Complete</span>
        <span className="text-green-600">({campaign.sent_count} sent)</span>
      </div>
    );
  }

  if (campaign.status === 'partial') {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-orange-700 bg-orange-50/80 px-3 py-2 rounded-lg border border-orange-200/60 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Partial: {campaign.sent_count}/{campaign.recipients_count}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="text-orange-600 border-orange-300 hover:bg-orange-50 bg-white/80"
          onClick={() => onSend(campaign.id)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RotateCcw className="mr-2 h-4 w-4" />
              Retry Failed
            </>
          )}
        </Button>
      </div>
    );
  }

  if (campaign.status === 'failed') {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-red-700 bg-red-50/80 px-3 py-2 rounded-lg border border-red-200/60 flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          <span>Failed to Send</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-300 hover:bg-red-50 bg-white/80"
          onClick={() => onSend(campaign.id)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RotateCcw className="mr-2 h-4 w-4" />
              Retry Send
            </>
          )}
        </Button>
      </div>
    );
  }

  if (campaign.status === 'sending') {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50/80 px-3 py-2 rounded-lg border border-blue-200/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="font-medium">Sending Campaign...</span>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      onClick={() => onSend(campaign.id)}
      disabled={isLoading}
      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Send Now
        </>
      )}
    </Button>
  );
}
