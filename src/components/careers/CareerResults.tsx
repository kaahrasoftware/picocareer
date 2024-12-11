import { Career } from "@/integrations/supabase/types/career.types";
import { CareerCard } from "@/components/CareerCard";

interface CareerResultsProps {
  careers: Career[];
}

export function CareerResults({ careers }: CareerResultsProps) {
  if (careers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No careers found matching your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {careers.map((career) => (
        <CareerCard key={career.id} {...career} />
      ))}
    </div>
  );
}