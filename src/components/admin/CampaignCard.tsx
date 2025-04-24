
import { Card } from "@/components/ui/card";
import type { Campaign } from "@/types/database/email";
import { getContentTypeStyles } from "./campaign-card/styles";
import { ContentTypeBadge } from "./campaign-card/ContentTypeBadge";
import { StatusBadge } from "./campaign-card/StatusBadge";
import { CampaignActions } from "./campaign-card/CampaignActions";

interface CampaignCardProps {
  campaign: Campaign;
  sendingCampaign: string | null;
  onSend: (id: string) => void;
}

export function CampaignCard({ campaign, sendingCampaign, onSend }: CampaignCardProps) {
  return (
    <Card className={`overflow-hidden transition-all duration-200 ${getContentTypeStyles(campaign.content_type)}`}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{campaign.subject || "Unnamed Campaign"}</h3>
              <div className="flex items-center gap-2">
                <ContentTypeBadge contentType={campaign.content_type} />
                <StatusBadge campaign={campaign} />
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium">Type:</span> {campaign.content_type}</p>
              <p><span className="font-medium">Scheduled:</span> {new Date(campaign.scheduled_for).toLocaleString()}</p>
              <p><span className="font-medium">Recipients:</span> {campaign.recipient_type}</p>
              {campaign.sent_at && 
                <p><span className="font-medium">Sent At:</span> {new Date(campaign.sent_at).toLocaleString()}</p>
              }
              <div className="flex gap-4">
                <p><span className="font-medium">Sent:</span> {campaign.sent_count}/{campaign.recipients_count || 0}</p>
                <p><span className="font-medium">Failed:</span> {campaign.failed_count}</p>
              </div>
              {campaign.last_error && (
                <p className="text-red-500 mt-1 bg-red-50 p-2 rounded-md">
                  Error: {campaign.last_error}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <CampaignActions 
              campaign={campaign}
              sendingCampaign={sendingCampaign}
              onSend={onSend}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
