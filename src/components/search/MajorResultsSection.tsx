
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
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'flex gap-4 flex-wrap'}`}
        >
          {validMajors.map((major) => (
            <Card 
              key={major.id}
              className="flex-shrink-0 flex flex-col p-4 w-full md:w-[250px] hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => setSelectedMajor(major)}
            >
              <div className="flex-1 min-w-0 mb-3">
                <h4 className="font-medium text-sm mb-1">{major.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {major.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {major.degree_levels?.map((level, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {level}
                  </Badge>
                ))}
                {!major.degree_levels?.length && (
                  <Badge variant="secondary" className="text-xs">Major</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedMajor && isMajorResult(selectedMajor) && (
        <MajorDetails
          major={{
            id: selectedMajor.id,
            title: selectedMajor.title,
            description: selectedMajor.description || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            featured: false,
            learning_objectives: selectedMajor.learning_objectives || [],
            common_courses: selectedMajor.common_courses || [],
            interdisciplinary_connections: selectedMajor.interdisciplinary_connections || [],
            job_prospects: selectedMajor.job_prospects || null,
            certifications_to_consider: selectedMajor.certifications_to_consider || [],
            degree_levels: selectedMajor.degree_levels || [],
            affiliated_programs: selectedMajor.affiliated_programs || [],
            gpa_expectations: selectedMajor.gpa_expectations || null,
            transferable_skills: selectedMajor.transferable_skills || [],
            tools_knowledge: selectedMajor.tools_knowledge || [],
            potential_salary: selectedMajor.potential_salary || null,
            passion_for_subject: selectedMajor.passion_for_subject || null,
            skill_match: selectedMajor.skill_match || [],
            professional_associations: selectedMajor.professional_associations || [],
            global_applicability: selectedMajor.global_applicability || null,
            common_difficulties: selectedMajor.common_difficulties || [],
            career_opportunities: selectedMajor.career_opportunities || [],
            intensity: selectedMajor.intensity || null,
            stress_level: selectedMajor.stress_level || null,
            dropout_rates: selectedMajor.dropout_rates || null,
            majors_to_consider_switching_to: selectedMajor.majors_to_consider_switching_to || [],
            profiles_count: selectedMajor.profiles_count || 0,
          }}
          open={!!selectedMajor}
          onOpenChange={(open) => !open && setSelectedMajor(null)}
        />
      )}
    </div>
  );
}
