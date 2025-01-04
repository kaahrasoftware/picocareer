import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/types/search";
import { useState } from "react";
import { MajorDetails } from "@/components/MajorDetails";
import { isMajorResult } from "@/types/search";
import { GraduationCap } from "lucide-react";

interface MajorResultsSectionProps {
  majors: SearchResult[];
}

export const MajorResultsSection = ({ majors }: MajorResultsSectionProps) => {
  const [selectedMajor, setSelectedMajor] = useState<SearchResult | null>(null);
  const validMajors = majors.filter(isMajorResult);

  if (!validMajors.length) return null;

  return (
    <div className="px-4 mt-8">
      <h3 className="text-lg font-semibold mb-3 text-foreground">
        Majors ({validMajors.length} results)
      </h3>
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {validMajors.map((major) => (
            <Card 
              key={major.id}
              className="group relative overflow-hidden flex flex-col p-6 hover:shadow-lg transition-all duration-200 cursor-pointer bg-card hover:bg-accent/5"
              onClick={() => setSelectedMajor(major)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-base truncate">{major.title}</h4>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {major.description}
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                {major.degree_levels?.map((level) => (
                  <Badge 
                    key={level}
                    variant="secondary" 
                    className="bg-secondary/10 text-secondary hover:bg-secondary/20"
                  >
                    {level}
                  </Badge>
                ))}
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