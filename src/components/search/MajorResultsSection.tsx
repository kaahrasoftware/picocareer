import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/types/search";
import { useState } from "react";
import { MajorDetails } from "@/components/MajorDetails";
import { isMajorResult } from "@/types/search";

interface MajorResultsSectionProps {
  majors: SearchResult[];
}

export const MajorResultsSection = ({ majors }: MajorResultsSectionProps) => {
  const [selectedMajor, setSelectedMajor] = useState<SearchResult | null>(null);
  const validMajors = majors.filter(isMajorResult);

  if (!validMajors.length) return null;

  const shouldUseGrid = validMajors.length > 4;

  return (
    <div className="px-4 mt-6">
      <h3 className="text-lg font-semibold mb-3 text-foreground">Majors</h3>
      <div className="w-full">
        <div className={`${shouldUseGrid 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 place-items-center' 
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
                {major.degree_levels?.join(", ") || 'Major'}
              </Badge>
            </Card>
          ))}
        </div>
      </div>

      {selectedMajor && isMajorResult(selectedMajor) && (
        <MajorDetails
          major={{
            id: selectedMajor.id,
            title: selectedMajor.title,
            description: selectedMajor.description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            featured: false,
            learning_objectives: [],
            common_courses: selectedMajor.common_courses || [],
            interdisciplinary_connections: [],
            job_prospects: null,
            certifications_to_consider: [],
            degree_levels: selectedMajor.degree_levels || [],
            affiliated_programs: [],
            gpa_expectations: null,
            transferable_skills: [],
            tools_knowledge: [],
            potential_salary: null,
            passion_for_subject: null,
            skill_match: [],
            professional_associations: [],
            global_applicability: null,
            common_difficulties: [],
            career_opportunities: selectedMajor.career_opportunities || [],
            intensity: null,
            stress_level: null,
            dropout_rates: null,
            majors_to_consider_switching_to: [],
            profiles_count: 0,
          }}
          open={!!selectedMajor}
          onOpenChange={(open) => !open && setSelectedMajor(null)}
        />
      )}
    </div>
  );
};