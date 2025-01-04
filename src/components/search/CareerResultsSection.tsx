import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/types/search";
import { isCareerResult } from "@/types/search";

interface CareerResultsSectionProps {
  careers: SearchResult[];
  onSelectCareer: (id: string) => void;
}

export const CareerResultsSection = ({ careers, onSelectCareer }: CareerResultsSectionProps) => {
  const validCareers = careers.filter(isCareerResult);

  if (!validCareers.length) return (
    <div className="px-4 mt-6">
      <h3 className="text-lg font-semibold mb-3 text-foreground">Careers</h3>
      <p className="text-sm text-muted-foreground">No matching careers found</p>
    </div>
  );

  const shouldUseGrid = validCareers.length > 4;

  return (
    <div className="px-4 mt-6">
      <h3 className="text-lg font-semibold mb-3 text-foreground">Careers</h3>
      <div className="w-full">
        <div className={`${shouldUseGrid 
          ? 'grid grid-cols-3 gap-4 place-items-center' 
          : 'flex gap-4 justify-center'}`}
        >
          {validCareers.map((career) => (
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
              {career.salary_range && (
                <Badge variant="secondary" className="self-start">
                  {career.salary_range}
                </Badge>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};