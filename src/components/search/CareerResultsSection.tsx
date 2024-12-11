import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/hooks/useSearchData";

interface CareerResultsSectionProps {
  careers: SearchResult[];
  onSelectCareer: (id: string) => void;
}

export const CareerResultsSection = ({ careers, onSelectCareer }: CareerResultsSectionProps) => {
  if (!careers.length) return (
    <div className="px-4 mt-6">
      <h3 className="text-lg font-semibold mb-3 text-foreground">Careers</h3>
      <p className="text-sm text-muted-foreground">No matching careers found</p>
    </div>
  );

  const shouldUseGrid = careers.length > 4;

  return (
    <div className="px-4 mt-6">
      <h3 className="text-lg font-semibold mb-3 text-foreground">Careers</h3>
      <div className="w-full">
        <div className={`${shouldUseGrid 
          ? 'grid grid-cols-3 gap-4 place-items-center' 
          : 'flex gap-4 justify-center'}`}
        >
          {careers.map((career) => (
            <Card 
              key={career.id}
              className="flex-shrink-0 flex flex-col p-4 w-[250px] hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => onSelectCareer(career.id)}
            >
              <div className="flex-1 min-w-0 mb-3">
                <h4 className="font-medium text-sm mb-1">{career.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {career.description}
                </p>
              </div>
              <Badge variant="secondary" className="self-start">
                {career.salary_range || `$${career.average_salary?.toLocaleString()}`}
              </Badge>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};