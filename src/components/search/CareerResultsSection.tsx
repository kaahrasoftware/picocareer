import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";
import type { CareerSearchResult } from "@/types/search";

interface CareerResultsSectionProps {
  careers: CareerSearchResult[];
}

export const CareerResultsSection = ({ careers }: CareerResultsSectionProps) => {
  return (
    <div className="px-4">
      <h3 className="text-lg font-semibold mb-3 text-foreground">
        Careers ({careers.length} results)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {careers.map((career) => (
          <Card 
            key={career.id}
            className="flex-shrink-0 flex flex-col p-4 hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4" />
              <h4 className="font-medium text-sm">{career.title}</h4>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {career.description}
            </p>
            {career.salary_range && (
              <Badge variant="secondary" className="self-start">
                {career.salary_range}
              </Badge>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};