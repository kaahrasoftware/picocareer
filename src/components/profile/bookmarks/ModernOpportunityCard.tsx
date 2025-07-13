import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  MapPin, 
  Building, 
  Calendar, 
  Bookmark,
  Clock,
  TrendingUp
} from "lucide-react";

interface OpportunityItem {
  id: string;
  title?: string;
  description?: string;
  organization?: string;
  location?: string;
  deadline?: string;
  type?: string;
  status?: string;
  external_url?: string;
  bookmark_id: string;
}

interface ModernOpportunityCardProps {
  opportunity: OpportunityItem;
  onView?: (opportunity: OpportunityItem) => void;
}

export function ModernOpportunityCard({ opportunity, onView }: ModernOpportunityCardProps) {
  const getTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'internship':
        return 'bg-gradient-to-r from-primary/20 to-primary/30 text-primary border-primary/20';
      case 'job':
        return 'bg-gradient-to-r from-secondary/20 to-secondary/30 text-secondary border-secondary/20';
      case 'scholarship':
        return 'bg-gradient-to-r from-green-500/20 to-green-600/30 text-green-700 border-green-500/20';
      default:
        return 'bg-gradient-to-r from-muted/40 to-muted/60 text-muted-foreground border-muted/30';
    }
  };

  const getDeadlineUrgency = (deadline?: string) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { text: 'Expired', color: 'text-destructive', urgency: 'high' };
    if (daysLeft <= 7) return { text: `${daysLeft} days left`, color: 'text-orange-600', urgency: 'high' };
    if (daysLeft <= 30) return { text: `${daysLeft} days left`, color: 'text-yellow-600', urgency: 'medium' };
    return { text: `${daysLeft} days left`, color: 'text-muted-foreground', urgency: 'low' };
  };

  const deadlineInfo = getDeadlineUrgency(opportunity.deadline);

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/95 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 card-hover-lift">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Bookmark indicator */}
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-primary/10 rounded-full p-1.5 border border-primary/20">
          <Bookmark className="h-3.5 w-3.5 text-primary fill-primary/20" />
        </div>
      </div>

      <CardContent className="relative p-5 space-y-4">
        {/* Header section */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-card-foreground group-hover:text-primary transition-colors duration-200">
            {opportunity.title || `Opportunity ${opportunity.id}`}
          </h3>
          
          {opportunity.organization && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building className="h-4 w-4 text-primary/70" />
              <span className="font-medium">{opportunity.organization}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {opportunity.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {opportunity.description}
          </p>
        )}

        {/* Details section */}
        <div className="space-y-2">
          {opportunity.location && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary/70" />
              <span>{opportunity.location}</span>
            </div>
          )}
          
          {opportunity.deadline && deadlineInfo && (
            <div className="flex items-center gap-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5 text-primary/70" />
              <span className={deadlineInfo.color}>
                {deadlineInfo.text}
              </span>
              {deadlineInfo.urgency === 'high' && (
                <Clock className="h-3 w-3 text-orange-600 animate-pulse" />
              )}
            </div>
          )}
        </div>

        {/* Footer section */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-2">
            {opportunity.type && (
              <Badge 
                variant="outline" 
                className={`text-xs font-medium border ${getTypeColor(opportunity.type)}`}
              >
                {opportunity.type}
              </Badge>
            )}
            
            {opportunity.status === 'trending' && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>Trending</span>
              </div>
            )}
          </div>
          
          {opportunity.external_url ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all duration-200"
              asChild
            >
              <a 
                href={opportunity.external_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5"
              >
                <span>View Details</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all duration-200"
              onClick={() => onView?.(opportunity)}
            >
              <span>View Details</span>
            </Button>
          )}
        </div>
      </CardContent>
      
      {/* Bottom gradient accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}