
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OpportunityWithAuthor } from "@/types/opportunity/types";
import { OpportunitiesDataTable } from "./OpportunitiesDataTable";

export function OpportunitiesManagementTab() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityWithAuthor | null>(null);

  const handleEditOpportunity = (opportunityId: string) => {
    // For now, we'll just log the ID since we need to fetch the full opportunity data
    console.log('Edit opportunity:', opportunityId);
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
