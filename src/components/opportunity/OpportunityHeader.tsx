
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarClock, MapPin, Globe, DollarSign, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { OpportunityWithAuthor } from "@/types/opportunity/types";
import { getOpportunityTypeStyles } from "@/utils/opportunityUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OpportunityType } from "@/types/database/enums";

interface OpportunityHeaderProps {
  opportunity?: OpportunityWithAuthor;
  onSearch?: (search: string) => void;
  onTypeChange?: (type: OpportunityType | "all") => void;
  selectedType?: OpportunityType | "all";
}

export function OpportunityHeader({ 
  opportunity,
  onSearch,
  onTypeChange,
  selectedType
}: OpportunityHeaderProps) {
  if (opportunity) {
    // Only access opportunity_type if opportunity exists
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
  
  // List view rendering (when opportunity is not defined)
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Opportunities</h1>
        <p className="text-muted-foreground">
          Discover jobs, internships, scholarships, and more
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search opportunities..." 
            className="pl-9"
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {["all", "job", "internship", "scholarship", "fellowship", "grant", "competition", "event", "other"].map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeChange && onTypeChange(type as OpportunityType | "all")}
              className={cn(
                "capitalize",
                selectedType === type 
                  ? "" 
                  : getOpportunityTypeStyles(type as OpportunityType | "all").border
              )}
            >
              {type === "all" ? "All" : type}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
