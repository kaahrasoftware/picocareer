import { CareerCard } from "@/components/CareerCard";
import type { Tables } from "@/integrations/supabase/types";

interface CareerResultsProps {
  filteredCareers: Tables<"careers">[];
}

export const CareerResults = ({ filteredCareers }: CareerResultsProps) => {
  // Filter for complete careers only
  const completeCareers = filteredCareers.filter(career => career.complete_career);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {completeCareers.map((career) => (
          <CareerCard key={career.id} {...career} />
        ))}
      </div>
      
      {completeCareers.length === 0 && (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No careers found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </>
  );
};