
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import type { Campaign } from "@/types/database/email";
import { getContentTypeStyles } from "./campaign-card/styles";
import { CampaignHeader } from "./campaign-card/CampaignHeader";
import { CampaignMetrics } from "./campaign-card/CampaignMetrics";
import { CampaignActions } from "./campaign-card/CampaignActions";

interface CampaignCardProps {
  campaign: Campaign;
  sendingCampaign: string | null;
  onSend: (id: string) => void;
}

export function CampaignCard({ campaign, sendingCampaign, onSend }: CampaignCardProps) {
  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg border-0 shadow-sm ${getContentTypeStyles(campaign.content_type)}`}>
      <CardContent className="p-0">
        {/* Modern Header with gradient background */}
        <div className="p-6 bg-gradient-to-r from-white/80 to-white/40 backdrop-blur-sm">
          <CampaignHeader campaign={campaign} />
        </div>

        {/* Metrics Section */}
        <div className="p-6 bg-white/60 backdrop-blur-sm">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Campaign Metrics
            </h4>
            <CampaignMetrics campaign={campaign} />
          </div>
        </div>

        {/* Actions Section */}
        <div className="p-6 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm border-t border-gray-100/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Campaign ID:</span>
              <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {campaign.id.slice(0, 8)}...
              </span>
            </div>
            <CampaignActions 
              campaign={campaign}
              sendingCampaign={sendingCampaign}
              onSend={onSend}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
