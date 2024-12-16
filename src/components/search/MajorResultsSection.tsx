import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/hooks/useSearchData";
import { useState } from "react";
import { MajorDetailsDialog } from "@/components/MajorDetailsDialog";
import { isMajorResult } from "@/types/search";

interface MajorResultsSectionProps {
  majors: SearchResult[];
}

export const MajorResultsSection = ({ majors }: MajorResultsSectionProps) => {
  const [selectedMajor, setSelectedMajor] = useState<SearchResult | null>(null);
  const validMajors = majors.filter(isMajorResult);

  if (!validMajors.length) return (
    <div className="px-4 mt-6">
      <h3 className="text-lg font-semibold mb-3 text-foreground">Majors</h3>
      <p className="text-sm text-muted-foreground">No matching majors found</p>
    </div>
  );

  const shouldUseGrid = validMajors.length > 4;

  return (
    <div className="px-4 mt-6">
      <h3 className="text-lg font-semibold mb-3 text-foreground">Majors</h3>
      <div className="w-full">
        <div className={`${shouldUseGrid 
          ? 'grid grid-cols-3 gap-4 place-items-center' 
          : 'flex gap-4 justify-center'}`}
        >
          {validMajors.map((major) => (
            <Card 
              key={major.id}
              className="flex-shrink-0 flex flex-col p-4 w-[250px] hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => setSelectedMajor(major)}
            >
              <div className="flex-1 min-w-0 mb-3">
                <h4 className="font-medium text-sm mb-1">{major.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {major.description}
                </p>
              </div>
              <Badge variant="secondary" className="self-start">
                {major.field_of_study || major.degree_level || 'Major'}
              </Badge>
            </Card>
          ))}
        </div>
      </div>

      {selectedMajor && isMajorResult(selectedMajor) && (
        <MajorDetailsDialog
          major={{
            title: selectedMajor.title,
            description: selectedMajor.description || '',
            users: '0',
            imageUrl: selectedMajor.image_url || '/placeholder.svg',
            relatedCareers: selectedMajor.career_opportunities || [],
            requiredCourses: selectedMajor.required_courses || [],
            averageGPA: 'N/A',
            fieldOfStudy: selectedMajor.field_of_study || undefined,
            degreeLevel: selectedMajor.degree_level || undefined
          }}
          open={!!selectedMajor}
          onOpenChange={(open) => !open && setSelectedMajor(null)}
        />
      )}
    </div>
  );
};