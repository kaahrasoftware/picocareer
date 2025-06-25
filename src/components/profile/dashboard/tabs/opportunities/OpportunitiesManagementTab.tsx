
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OpportunitiesDataTable } from "./OpportunitiesDataTable";

export function OpportunitiesManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

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
        searchQuery={searchQuery}
        selectedType={selectedType}
        selectedLocation={selectedLocation}
      />
    </div>
  );
}
