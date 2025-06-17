
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OpportunityWithAuthor } from "@/types/opportunity/types";
import { OpportunitiesDataTable } from "./OpportunitiesDataTable";

export function OpportunitiesManagementTab() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityWithAuthor | null>(null);

  const handleEditOpportunity = (opportunity: OpportunityWithAuthor) => {
    // Ensure analytics compatibility
    const normalizedOpportunity: OpportunityWithAuthor = {
      ...opportunity,
      analytics: opportunity.analytics ? {
        id: opportunity.analytics.id || '',
        opportunity_id: opportunity.analytics.opportunity_id || opportunity.id,
        views_count: opportunity.analytics.views_count || 0,
        checked_out_count: opportunity.analytics.checked_out_count || 0,
        bookmarks_count: opportunity.analytics.bookmarks_count || 0,
        created_at: opportunity.analytics.created_at || new Date().toISOString(),
        updated_at: opportunity.analytics.updated_at || new Date().toISOString(),
        applications_count: opportunity.analytics.applications_count || 0,
      } : undefined
    };
    
    setSelectedOpportunity(normalizedOpportunity);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Opportunities Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Opportunity
        </Button>
      </div>
      
      <OpportunitiesDataTable onEdit={handleEditOpportunity} />
    </div>
  );
}
