
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarClock, MapPin, Globe, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { OpportunityWithAuthor } from "@/types/opportunity/types";
import { getOpportunityTypeStyles } from "@/utils/opportunityUtils";

interface OpportunityHeaderProps {
  opportunity: OpportunityWithAuthor;
}

export function OpportunityHeader({ opportunity }: OpportunityHeaderProps) {
  const typeStyles = getOpportunityTypeStyles(opportunity.opportunity_type);
  const postedDate = format(new Date(opportunity.created_at), "MMM d, yyyy");
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No deadline";
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge 
          className={cn(
            "capitalize font-medium",
            typeStyles.bg,
            typeStyles.text,
            typeStyles.border,
            typeStyles.hoverBg,
            "border"
          )}
        >
          {opportunity.opportunity_type}
        </Badge>
        
        {opportunity.featured && (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Featured
          </Badge>
        )}
        
        {opportunity.remote && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            Remote
          </Badge>
        )}
      </div>

      <h1 className="text-3xl font-bold">{opportunity.title}</h1>
      
      <div className="flex items-center gap-2 text-muted-foreground">
        <Avatar className="h-6 w-6">
          <AvatarImage src={opportunity.profiles?.avatar_url || ''} />
          <AvatarFallback>{opportunity.profiles?.full_name?.[0] || opportunity.provider_name[0]}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{opportunity.provider_name}</span>
        <span className="text-sm">• Posted on {postedDate}</span>
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        {opportunity.deadline && (
          <div className="flex items-center gap-1.5 text-sm">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <span>Deadline: <span className="font-medium">{formatDate(opportunity.deadline)}</span></span>
          </div>
        )}
        
        {opportunity.location && (
          <div className="flex items-center gap-1.5 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{opportunity.location}</span>
          </div>
        )}
        
        {opportunity.compensation && (
          <div className="flex items-center gap-1.5 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{opportunity.compensation}</span>
          </div>
        )}
      </div>
    </div>
  );
}
