
import { useState } from "react";
import { Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { BookmarksList } from "./BookmarksList";

interface OpportunityProfile {
  id: string;
  title: string;
  description: string;
  provider_name: string;
  location: string | null;
  deadline: string | null;
  opportunity_type: string | null;
  status: string;
  application_url: string | null;
  requirements: string[] | null;
  benefits: string[] | null;
  featured: boolean | null;
}

interface OpportunityBookmarksProps {
  activePage: string;
  onViewOpportunityDetails: (opportunityId: string) => void;
}

export function OpportunityBookmarks({ activePage, onViewOpportunityDetails }: OpportunityBookmarksProps) {
  const { user } = useAuthState();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const opportunityBookmarksQuery = useQuery({
    queryKey: ["bookmarked-opportunities", user?.id, currentPage],
    queryFn: async () => {
      if (!user) return {
        data: [],
        count: 0
      };

      // Get total count first
      const {
        count,
        error: countError
      } = await supabase.from("user_bookmarks").select('*', {
        count: 'exact'
      }).eq("profile_id", user.id).eq("content_type", "opportunity");
      
      if (countError) {
        console.error("Error counting opportunity bookmarks:", countError);
        throw countError;
      }

      // Calculate pagination offsets
      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      // First get bookmark IDs
      const {
        data: bookmarks,
        error: bookmarksError
      } = await supabase.from("user_bookmarks").select("content_id").eq("profile_id", user.id).eq("content_type", "opportunity").range(start, end);
      
      if (bookmarksError) {
        console.error("Error fetching opportunity bookmarks:", bookmarksError);
        throw bookmarksError;
      }
      
      if (!bookmarks || bookmarks.length === 0) {
        return {
          data: [],
          count: count || 0
        };
      }

      // Get the actual opportunity data using the bookmark IDs
      const opportunityIds = bookmarks.map(bookmark => bookmark.content_id);
      const {
        data: opportunities,
        error: opportunitiesError
      } = await supabase.from("opportunities").select(`
          id,
          title,
          description,
          provider_name,
          location,
          deadline,
          opportunity_type,
          status,
          application_url,
          requirements,
          benefits,
          featured
        `).in("id", opportunityIds);
      
      if (opportunitiesError) {
        console.error("Error fetching opportunities data:", opportunitiesError);
        throw opportunitiesError;
      }
      
      return {
        data: opportunities || [],
        count: count || 0
      };
    },
    enabled: !!user && activePage === "opportunities"
  });

  const opportunityBookmarks = opportunityBookmarksQuery.data?.data || [];
  const totalCount = opportunityBookmarksQuery.data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Deadline passed';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderOpportunityCard = (opportunity: OpportunityProfile, handleView: (opportunity: OpportunityProfile) => void) => (
    <Card key={opportunity.id} className="hover:shadow transition-all overflow-hidden group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              {opportunity.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{opportunity.provider_name}</p>
          </div>
          {opportunity.featured && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {opportunity.description}
        </p>
        
        <div className="space-y-2 mb-4">
          {opportunity.location && (
            <p className="text-xs text-muted-foreground">📍 {opportunity.location}</p>
          )}
          {opportunity.deadline && (
            <p className="text-xs text-muted-foreground">📅 {formatDeadline(opportunity.deadline)}</p>
          )}
          {opportunity.opportunity_type && (
            <Badge variant="outline" className="text-xs">
              {opportunity.opportunity_type}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => handleView(opportunity)} 
            variant="outline" 
            size="sm" 
            className="flex-1"
          >
            View Details
          </Button>
          {opportunity.application_url && (
            <Button 
              onClick={() => window.open(opportunity.application_url!, '_blank')} 
              size="sm"
              className="flex-1"
            >
              Apply
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <BookmarksList
      bookmarks={opportunityBookmarks}
      isLoading={opportunityBookmarksQuery.isLoading}
      emptyStateProps={{
        icon: <Briefcase className="h-8 w-8 text-primary" />,
        linkPath: "/opportunities",
        type: "opportunities"
      }}
      totalPages={totalPages}
      currentPage={currentPage}
      setPage={setCurrentPage}
      onViewDetails={(opportunity) => onViewOpportunityDetails(opportunity.id)}
      renderCard={renderOpportunityCard}
      bookmarkType="opportunity"
    />
  );
}
