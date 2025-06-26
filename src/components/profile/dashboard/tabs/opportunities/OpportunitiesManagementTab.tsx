
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OpportunitiesDataTable } from "./OpportunitiesDataTable";

export function OpportunitiesManagementTab() {
  // Mock data - replace with actual data fetching
  const opportunities = [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Opportunities Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Opportunity
        </Button>
      </div>
      
      <OpportunitiesDataTable 
        opportunities={opportunities}
      />
    </div>
  );
}
