
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Campaign } from '@/types/database/email';

interface CampaignMetricsProps {
  campaign: Campaign;
}

export function CampaignMetrics({ campaign }: CampaignMetricsProps) {
  const successRate = campaign.recipients_count > 0 
    ? Math.round((campaign.sent_count / campaign.recipients_count) * 100) 
    : 0;
  
  const failureRate = campaign.recipients_count > 0 
    ? Math.round((campaign.failed_count / campaign.recipients_count) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Total Recipients */}
      <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 rounded-md">
            <Users className="h-3 w-3 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-blue-600 font-medium">Recipients</p>
            <p className="text-lg font-bold text-blue-800">
              {campaign.recipients_count || 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Sent Count */}
      <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-500/10 rounded-md">
            <Send className="h-3 w-3 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-green-600 font-medium">Sent</p>
            <p className="text-lg font-bold text-green-800">
              {campaign.sent_count}
            </p>
          </div>
        </div>
      </Card>

      {/* Success Rate */}
      <Card className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded-md">
            <CheckCircle className="h-3 w-3 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-emerald-600 font-medium">Success</p>
            <p className="text-lg font-bold text-emerald-800">
              {successRate}%
            </p>
          </div>
        </div>
      </Card>

      {/* Failed Count */}
      <Card className="p-3 bg-gradient-to-br from-red-50 to-red-100/50 border-red-200/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-500/10 rounded-md">
            <AlertTriangle className="h-3 w-3 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-red-600 font-medium">Failed</p>
            <p className="text-lg font-bold text-red-800">
              {campaign.failed_count}
            </p>
          </div>
        </div>
      </Card>

      {/* Progress Bar */}
      {campaign.recipients_count > 0 && (
        <div className="col-span-2 lg:col-span-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Campaign Progress</span>
              <span>{Math.round(((campaign.sent_count + campaign.failed_count) / campaign.recipients_count) * 100)}% Complete</span>
            </div>
            <Progress 
              value={((campaign.sent_count + campaign.failed_count) / campaign.recipients_count) * 100} 
              className="h-2"
            />
            <div className="flex justify-between text-xs">
              <Badge variant="outline" className="text-green-600 bg-green-50">
                {campaign.sent_count} sent
              </Badge>
              {campaign.failed_count > 0 && (
                <Badge variant="outline" className="text-red-600 bg-red-50">
                  {campaign.failed_count} failed
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
