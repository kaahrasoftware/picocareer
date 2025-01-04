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

  if (!validCareers.length) return null;

  return (
    <div className="px-4 mt-8">
      <h3 className="text-lg font-semibold mb-3 text-foreground">
        Careers ({validCareers.length} results)
      </h3>
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {validCareers.map((career) => (
            <Card 
              key={career.id}
              className="group relative overflow-hidden flex flex-col p-6 hover:shadow-lg transition-all duration-200 cursor-pointer bg-card hover:bg-accent/5"
              onClick={() => onSelectCareer(career.id)}
            >
              <h4 className="font-medium text-base mb-2">{career.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {career.description}
              </p>
              {career.salary_range && (
                <div className="mt-auto">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {career.salary_range}
                  </Badge>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};