
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OpportunityWithAuthor } from "@/types/opportunity/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, CalendarClock, Clock, Globe, ExternalLink, Building, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatOpportunityDate, getOpportunityTypeStyles } from "@/utils/opportunityUtils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface OpportunityCardProps {
  opportunity: OpportunityWithAuthor;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/opportunities/${opportunity.id}`);
  };

  // Get style based on opportunity type
  const typeStyles = getOpportunityTypeStyles(opportunity.opportunity_type);
  
  // Format deadline display
  const deadlineFormatted = opportunity.deadline ? formatOpportunityDate(opportunity.deadline) : null;

  // Format date for "posted on" display
  const postedDate = format(new Date(opportunity.created_at), "MMM d, yyyy");
  
  // Calculate how long ago the opportunity was posted
  const getTimeAgo = () => {
    const now = new Date();
    const createdDate = new Date(opportunity.created_at);
    const diffInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <Card 
      key={opportunity.id} 
      className="group overflow-hidden cursor-pointer transition-all duration-300 border-muted hover:shadow-lg hover:-translate-y-1"
      onClick={handleClick}
    >
      <CardHeader className="p-5 pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <Badge 
            className={cn(
              "capitalize font-medium text-xs",
              typeStyles.bg,
              typeStyles.text,
              typeStyles.border,
              typeStyles.hoverBg,
              "border"
            )}
          >
            {opportunity.opportunity_type}
          </Badge>
          
          <div className="text-xs text-muted-foreground">
            {getTimeAgo()}
          </div>
        </div>

        <CardTitle className="text-xl font-bold mt-2 line-clamp-2 group-hover:text-primary transition-colors">
          {opportunity.title}
        </CardTitle>
        
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={opportunity.profiles?.avatar_url || ''} />
            <AvatarFallback>{opportunity.profiles?.full_name?.[0] || opportunity.provider_name[0]}</AvatarFallback>
          </Avatar>
          <CardDescription className="line-clamp-1 font-medium text-foreground/80">
            {opportunity.provider_name}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-3">
        <p className="text-sm line-clamp-2 text-muted-foreground">
          {opportunity.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {opportunity.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span className="truncate">{opportunity.location}</span>
            </div>
          )}
          
          {opportunity.remote && (
            <div className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>Remote</span>
            </div>
          )}
          
          {deadlineFormatted && (
            <div className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>{deadlineFormatted}</span>
            </div>
          )}

          {opportunity.compensation && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span className="truncate">{opportunity.compensation}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex gap-2 flex-wrap border-t mt-3 pt-3">
        {opportunity.categories?.slice(0, 2).map(category => (
          <Badge key={category} variant="secondary" className="text-xs">
            {category}
          </Badge>
        ))}
        
        {opportunity.categories && opportunity.categories.length > 2 && (
          <Badge variant="secondary" className="text-xs">
            +{opportunity.categories.length - 2}
          </Badge>
        )}
        
        {opportunity.featured && (
          <Badge className="ml-auto bg-amber-100 text-amber-800 hover:bg-amber-200">
            Featured
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
