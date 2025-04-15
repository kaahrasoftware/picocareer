
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OpportunityWithAuthor } from "@/types/opportunity/types";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, CalendarClock, Clock, Globe } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface OpportunityCardProps {
  opportunity: OpportunityWithAuthor;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/opportunities/${opportunity.id}`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No deadline";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const createdDate = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return format(createdDate, "MMM d, yyyy");
  };

  return (
    <Card 
      key={opportunity.id} 
      className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border border-border/50"
      onClick={handleClick}
    >
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className="uppercase text-xs font-medium"
            >
              {opportunity.opportunity_type}
            </Badge>
            {opportunity.featured && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 text-xs">
                Featured
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {getTimeAgo(opportunity.created_at)}
          </div>
        </div>

        <CardTitle className="text-xl font-bold line-clamp-2 hover:text-primary transition-colors">
          {opportunity.title}
        </CardTitle>
        
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={opportunity.profiles?.avatar_url || ''} />
            <AvatarFallback>{opportunity.profiles?.full_name?.[0] || opportunity.provider_name[0]}</AvatarFallback>
          </Avatar>
          <CardDescription className="line-clamp-1 font-medium">
            {opportunity.provider_name}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm line-clamp-2 text-muted-foreground">
          {opportunity.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-2">
          {opportunity.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{opportunity.location}</span>
            </div>
          )}
          
          {opportunity.remote && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span>Remote</span>
            </div>
          )}
          
          {opportunity.deadline && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarClock className="h-3 w-3" />
              <span>{formatDate(opportunity.deadline)}</span>
            </div>
          )}
        </div>

        {opportunity.compensation && (
          <div className="text-sm font-medium">
            {opportunity.compensation}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 flex-wrap">
        {opportunity.categories?.slice(0, 3).map(category => (
          <Badge key={category} variant="secondary" className="text-[10px]">
            {category}
          </Badge>
        ))}
        
        {opportunity.categories && opportunity.categories.length > 3 && (
          <Badge variant="secondary" className="text-[10px]">
            +{opportunity.categories.length - 3}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
