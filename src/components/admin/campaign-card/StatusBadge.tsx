
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, CheckCircle, AlertTriangle, XCircle, Calendar } from "lucide-react";
import type { Campaign } from "@/types/database/email";

interface StatusBadgeProps {
  campaign: Campaign;
}

export function StatusBadge({ campaign }: StatusBadgeProps) {
  switch (campaign.status) {
    case 'sent':
      return (
        <Badge variant="outline" className="bg-green-50/80 text-green-700 border-green-200/60 flex items-center gap-1.5 font-medium">
          <CheckCircle className="h-3 w-3" />
          Sent Successfully
        </Badge>
      );
    case 'sending':
      return (
        <Badge variant="outline" className="bg-blue-50/80 text-blue-700 border-blue-200/60 flex items-center gap-1.5 font-medium">
          <Loader2 className="h-3 w-3 animate-spin" />
          Sending Now
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="bg-amber-50/80 text-amber-700 border-amber-200/60 flex items-center gap-1.5 font-medium">
          <Calendar className="h-3 w-3" />
          Scheduled
        </Badge>
      );
    case 'partial':
      return (
        <Badge variant="outline" className="bg-orange-50/80 text-orange-700 border-orange-200/60 flex items-center gap-1.5 font-medium">
          <AlertTriangle className="h-3 w-3" />
          Partially Sent
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="outline" className="bg-red-50/80 text-red-700 border-red-200/60 flex items-center gap-1.5 font-medium">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-50/80 text-gray-700 border-gray-200/60 flex items-center gap-1.5 font-medium">
          <Clock className="h-3 w-3" />
          {campaign.status || 'Unknown'}
        </Badge>
      );
  }
}
