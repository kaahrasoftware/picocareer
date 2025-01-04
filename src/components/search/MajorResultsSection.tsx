import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";
import type { MajorSearchResult } from "@/types/search";

interface MajorResultsSectionProps {
  majors: MajorSearchResult[];
}

export const MajorResultsSection = ({ majors }: MajorResultsSectionProps) => {
  return (
    <div className="px-4">
      <h3 className="text-lg font-semibold mb-3 text-foreground">
        Majors ({majors.length} results)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {majors.map((major) => (
          <Card 
            key={major.id}
            className="flex-shrink-0 flex flex-col p-4 hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4" />
              <h4 className="font-medium text-sm">{major.title}</h4>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {major.description}
            </p>
            {major.degree_levels && major.degree_levels.length > 0 && (
              <Badge variant="secondary" className="self-start">
                {major.degree_levels.join(", ")}
              </Badge>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};