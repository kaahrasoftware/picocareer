
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Mail } from 'lucide-react';
import type { Campaign } from '@/types/database/email';
import { ContentTypeBadge } from './ContentTypeBadge';
import { StatusBadge } from './StatusBadge';

interface CampaignHeaderProps {
  campaign: Campaign;
}

export function CampaignHeader({ campaign }: CampaignHeaderProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Title and Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {campaign.subject || "Unnamed Campaign"}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <ContentTypeBadge contentType={campaign.content_type} />
            <StatusBadge campaign={campaign} />
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span className="font-medium">Type:</span>
          <span className="capitalize">{campaign.recipient_type}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">Scheduled:</span>
          <span>{formatDate(campaign.scheduled_for)}</span>
        </div>

        {campaign.sent_at && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Sent:</span>
            <span>{formatDate(campaign.sent_at)}</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {campaign.last_error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">Latest Error:</p>
          <p className="text-xs text-red-600 mt-1 break-words">
            {campaign.last_error}
          </p>
        </div>
      )}
    </div>
  );
}
