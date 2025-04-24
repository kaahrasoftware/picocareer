import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  last_error: string | null;
  last_checked_at: string | null;
};

interface CampaignCardProps {
  campaign: Campaign;
  sendingCampaign: string | null;
  onSend: (id: string) => void;
}

function getContentTypeStyles(contentType: string) {
  switch (contentType) {
    case 'scholarships':
      return 'bg-gradient-to-br from-purple-50/90 to-purple-100/50 border-purple-200';
    case 'opportunities':
      return 'bg-gradient-to-br from-blue-50/90 to-blue-100/50 border-blue-200';
    case 'careers':
      return 'bg-gradient-to-br from-teal-50/90 to-teal-100/50 border-teal-200';
    case 'majors':
      return 'bg-gradient-to-br from-indigo-50/90 to-indigo-100/50 border-indigo-200';
    case 'schools':
      return 'bg-gradient-to-br from-sky-50/90 to-sky-100/50 border-sky-200';
    case 'mentors':
      return 'bg-gradient-to-br from-amber-50/90 to-amber-100/50 border-amber-200';
    case 'blogs':
      return 'bg-gradient-to-br from-rose-50/90 to-rose-100/50 border-rose-200';
    default:
      return 'bg-gradient-to-br from-gray-50/90 to-gray-100/50 border-gray-200';
  }
}

function renderContentTypeBadge(contentType: string) {
  switch (contentType) {
    case 'scholarships':
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Scholarship
        </Badge>
      );
    case 'opportunities':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Opportunity
        </Badge>
      );
    case 'careers':
      return (
        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
          Career
        </Badge>
      );
    case 'majors':
      return (
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          Major
        </Badge>
      );
    case 'schools':
      return (
        <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
          School
        </Badge>
      );
    case 'mentors':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Mentor
        </Badge>
      );
    case 'blogs':
      return (
        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
          Blog
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          {contentType}
        </Badge>
      );
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'sent':
      return 'bg-gradient-to-br from-green-50/90 to-green-100/50 border-green-200 hover:bg-green-50/80';
    case 'sending':
      return 'bg-gradient-to-br from-blue-50/90 to-blue-100/50 border-blue-200 hover:bg-blue-50/80';
    case 'pending':
      return 'bg-gradient-to-br from-amber-50/90 to-amber-100/50 border-amber-200 hover:bg-amber-50/80';
    case 'partial':
      return 'bg-gradient-to-br from-orange-50/90 to-orange-100/50 border-orange-200 hover:bg-orange-50/80';
    case 'failed':
      return 'bg-gradient-to-br from-red-50/90 to-red-100/50 border-red-200 hover:bg-red-50/80';
    default:
      return 'bg-gradient-to-br from-gray-50/90 to-gray-100/50 border-gray-200 hover:bg-gray-50/80';
  }
}

function renderStatusBadge(campaign: Campaign) {
  switch (campaign.status) {
    case 'sent':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Sent
        </Badge>
      );
    case 'sending':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Sending
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Scheduled
        </Badge>
      );
    case 'partial':
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Partial
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          {campaign.status || 'Unknown'}
        </Badge>
      );
  }
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
                {renderContentTypeBadge(campaign.content_type)}
                {renderStatusBadge(campaign)}
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
            {campaign.status === 'sent' ? (
              <div className="text-sm text-green-600 font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Sent ({campaign.sent_count} recipients)
              </div>
            ) : campaign.status === 'partial' ? (
              <div className="text-sm text-orange-600 font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Partially Sent ({campaign.sent_count}/{campaign.recipients_count})
              </div>
            ) : campaign.status === 'failed' ? (
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
            ) : campaign.status === 'sending' ? (
              <div className="text-sm text-blue-600 font-medium flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
