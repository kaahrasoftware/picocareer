
import { useState } from "react";
import { useOpportunities } from "@/hooks/useOpportunities";
import { OpportunityFilters } from "@/components/opportunity/OpportunityFilters";
import { OpportunityGrid } from "@/components/opportunity/OpportunityGrid";
import { OpportunityHeader } from "@/components/opportunity/OpportunityHeader";
import { OpportunityType } from "@/types/database/enums";
import { OpportunityFilters as IOpportunityFilters } from "@/types/opportunity/types";
import { useResponsive } from "@/hooks/useResponsive";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";

export default function Opportunities() {
  const [filters, setFilters] = useState<IOpportunityFilters>({
    type: "all",
    search: "",
  });

  const { data: opportunities, isLoading, error } = useOpportunities(filters);
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const { session } = useAuthSession();

  const handleFilterChange = (newFilters: Partial<IOpportunityFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleTypeChange = (type: OpportunityType | "all") => {
    setFilters((prev) => ({ ...prev, type }));
  };

  const handleCreateOpportunity = () => {
    navigate("/opportunities/create");
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <OpportunityHeader 
        onSearch={(search) => handleFilterChange({ search })}
        onTypeChange={handleTypeChange}
        selectedType={filters.type}
      />

      <div className="flex flex-col lg:flex-row gap-6 mt-8">
        {!isMobile && (
          <div className="w-full lg:w-1/4">
            <OpportunityFilters 
              filters={filters} 
              onFilterChange={handleFilterChange} 
            />
          </div>
        )}

        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {filters.type === "all" 
                ? "All Opportunities" 
                : `${filters.type?.charAt(0).toUpperCase()}${filters.type?.slice(1)} Opportunities`}
            </h2>
            
            {session && (
              <Button 
                onClick={handleCreateOpportunity}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Post Opportunity
              </Button>
            )}
          </div>

          <OpportunityGrid 
            opportunities={opportunities || []} 
            isLoading={isLoading} 
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
