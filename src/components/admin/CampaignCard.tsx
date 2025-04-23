
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

type Campaign = {
  id: string;
  subject: string;
  content_type: string;
  content_id: string;
  frequency: string;
  scheduled_for: string;
  status: string;
  sent_at: string | null;
  recipient_type: string;
  sent_count: number;
  failed_count: number;
  recipients_count: number;
  created_at: string;
  error_message: string | null;
  last_checked_at: string | null;
};

interface CampaignCardProps {
  campaign: Campaign;
  sendingCampaign: string | null;
  onSend: (id: string) => void;
}

function renderStatusBadge(campaign: Campaign) {
  switch (campaign.status) {
    case 'sent':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Sent
        </Badge>
      );
    case 'sending':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Sending
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Scheduled
        </Badge>
      );
    case 'partial':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Partial
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
          {campaign.status || 'Unknown'}
        </Badge>
      );
  }
}

export function CampaignCard({ campaign, sendingCampaign, onSend }: CampaignCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{campaign.subject || "Unnamed Campaign"}</h3>
              {renderStatusBadge(campaign)}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Type: {campaign.content_type}</p>
              <p>Scheduled: {new Date(campaign.scheduled_for).toLocaleString()}</p>
              <p>Recipients: {campaign.recipient_type}</p>
              {campaign.sent_at && <p>Sent At: {new Date(campaign.sent_at).toLocaleString()}</p>}
              <p>Sent: {campaign.sent_count}/{campaign.recipients_count || 0}</p>
              <p>Failed: {campaign.failed_count}</p>
              {campaign.error_message && (
                <p className="text-red-500 mt-1">Error: {campaign.error_message}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {campaign.status === 'sent' ? (
              <div className="text-sm text-green-600 font-medium">
                Sent ({campaign.sent_count} recipients)
              </div>
            ) : campaign.status === 'partial' ? (
              <div className="text-sm text-amber-600 font-medium">
                Partially Sent ({campaign.sent_count}/{campaign.recipients_count})
              </div>
            ) : campaign.status === 'failed' ? (
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-300"
                onClick={() => onSend(campaign.id)}
                disabled={sendingCampaign === campaign.id}
              >
                {sendingCampaign === campaign.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : "Retry Send"}
              </Button>
            ) : campaign.status === 'sending' ? (
              <div className="text-sm text-blue-600 font-medium flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => onSend(campaign.id)}
                disabled={sendingCampaign === campaign.id}
              >
                {sendingCampaign === campaign.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : "Send Now"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

