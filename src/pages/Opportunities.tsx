import { useState, useEffect } from "react";
import { useOpportunities } from "@/hooks/useOpportunities";
import { OpportunityFilters } from "@/components/opportunity/OpportunityFilters";
import { OpportunityGrid } from "@/components/opportunity/OpportunityGrid";
import { OpportunityHeader } from "@/components/opportunity/OpportunityHeader";
import { OpportunityType } from "@/types/database/enums";
import { OpportunityFilters as IOpportunityFilters } from "@/types/opportunity/types";
import { useResponsive } from "@/hooks/useResponsive";
import { Button } from "@/components/ui/button";
import { PlusCircle, FilterIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Opportunities() {
  const [filters, setFilters] = useState<IOpportunityFilters>({
    type: "all",
    search: "",
  });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const { data: opportunities, isLoading, error, refetch } = useOpportunities(filters);
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const { session } = useAuthSession();

  const handleFilterChange = (newFilters: Partial<IOpportunityFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleTypeChange = (type: OpportunityType | "all") => {
    setFilters(prev => ({
      type,
      search: prev.search,
    }));
    
    if (filterSheetOpen) {
      setFilterSheetOpen(false);
    }
  };

  const handleCreateOpportunity = () => {
    navigate("/opportunities/create");
  };

  const getFilterTitle = () => {
    if (filters.type === "all") {
      return "All Opportunities";
    }
    const typeLabel = filters.type?.charAt(0).toUpperCase() + filters.type?.slice(1);
    return `${typeLabel} Opportunities`;
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
            <div className="sticky top-4">
              <OpportunityFilters 
                filters={filters} 
                onFilterChange={handleFilterChange} 
              />
            </div>
          </div>
        )}

        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {getFilterTitle()}
            </h2>
            
            <div className="flex items-center gap-2">
              {isMobile && (
                <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <FilterIcon className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <OpportunityFilters 
                      filters={filters} 
                      onFilterChange={(newFilters) => {
                        handleFilterChange(newFilters);
                        setFilterSheetOpen(false);
                      }} 
                    />
                  </SheetContent>
                </Sheet>
              )}
              
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
          </div>

          <OpportunityGrid 
            opportunities={opportunities || []} 
            isLoading={isLoading} 
            error={error}
            onRetry={() => refetch()}
          />
        </div>
      </div>
    </div>
  );
}
