import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Major } from "@/types/database/majors";
import { AboutSection } from "./major-details/AboutSection";
import { AcademicRequirements } from "./major-details/AcademicRequirements";
import { CareerProspects } from "./major-details/CareerProspects";
import { SkillsAndTools } from "./major-details/SkillsAndTools";
import { AdditionalInfo } from "./major-details/AdditionalInfo";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MajorDialogHeader } from "./major-details/MajorDialogHeader";

interface MajorDetailsProps {
  major: Major;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MajorDetails({ major, open, onOpenChange }: MajorDetailsProps) {
  const { data: majorWithCareers } = useQuery({
    queryKey: ['major-careers', major.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select(`
          *,
          career_major_relations(
            career:careers(id, title, salary_range)
          )
        `)
        .eq('id', major.id)
        .single();

      if (error) throw error;
      return data as Major;
    },
    enabled: open && !!major.id,
  });

  if (!major) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <MajorDialogHeader 
          title={major.title}
          potentialSalary={major.potential_salary}
          profilesCount={major.profiles_count}
          majorId={major.id}
        />
        
        <ScrollArea className="h-[calc(85vh-120px)]">
          <div className="space-y-3 p-2 md:space-y-6 md:p-4">
            <div className="rounded-lg bg-card p-2 shadow-sm md:p-4">
              <AboutSection 
                description={major.description}
                learning_objectives={major.learning_objectives}
                interdisciplinary_connections={major.interdisciplinary_connections}
                majorId={major.id}
              />
            </div>

            <div className="rounded-lg bg-card p-2 shadow-sm md:p-4">
              <AcademicRequirements 
                gpa_expectations={major.gpa_expectations}
                common_courses={major.common_courses}
                degree_levels={major.degree_levels}
                affiliated_programs={major.affiliated_programs}
              />
            </div>

            <div className="rounded-lg bg-card p-2 shadow-sm md:p-4">
              <CareerProspects 
                job_prospects={major.job_prospects}
                career_opportunities={major.career_opportunities}
                professional_associations={major.professional_associations}
                global_applicability={major.global_applicability}
                related_careers={majorWithCareers?.career_major_relations}
              />
            </div>

            <div className="rounded-lg bg-card p-2 shadow-sm md:p-4">
              <SkillsAndTools 
                skill_match={major.skill_match}
                transferable_skills={major.transferable_skills}
              />
            </div>

            <div className="rounded-lg bg-card p-2 shadow-sm md:p-4">
              <AdditionalInfo 
                intensity={major.intensity}
                passion_for_subject={major.passion_for_subject}
                stress_level={major.stress_level}
                dropout_rates={major.dropout_rates}
                common_difficulties={major.common_difficulties}
                majors_to_consider_switching_to={major.majors_to_consider_switching_to}
                certifications_to_consider={major.certifications_to_consider}
              />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}