import { ScrollArea } from "@/components/ui/scroll-area";
import { AboutSection } from "./AboutSection";
import { SkillsAndTools } from "./SkillsAndTools";
import { AdditionalInfo } from "./AdditionalInfo";
import { CareerMentorList } from "./CareerMentorList";
import { AcademicMajorsSection } from "./AcademicMajorsSection";
import { KeywordsSection } from "./KeywordsSection";
import type { Tables } from "@/integrations/supabase/types";

interface DialogContentProps {
  career: Tables<"careers"> & {
    career_major_relations: {
      major: {
        title: string;
        id: string;
      };
    }[];
  };
}

export function DialogContent({ career }: DialogContentProps) {
  return (
    <ScrollArea className="h-[calc(85vh-120px)] md:h-[calc(85vh-100px)]">
      <div className="max-w-3xl mx-auto">
        <div className="space-y-8 px-4 py-6 md:px-6">
          {career.image_url && (
            <div className="flex justify-center">
              <img 
                src={career.image_url} 
                alt={career.title} 
                className="max-h-[150px] md:max-h-[250px] w-auto object-contain rounded-lg"
              />
            </div>
          )}

          <div className="space-y-8">
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <AboutSection
                description={career.description}
                learning_objectives={[]}
                industry={career.industry}
                work_environment={career.work_environment}
                growth_potential={career.growth_potential}
                job_outlook={career.job_outlook}
                important_note={career.important_note}
              />
            </div>

            <div className="bg-card rounded-lg p-4 shadow-sm">
              <AcademicMajorsSection academicMajors={career.academic_majors} />
            </div>

            <div className="bg-card rounded-lg p-4 shadow-sm">
              <KeywordsSection keywords={career.keywords} />
            </div>

            <div className="bg-card rounded-lg p-4 shadow-sm">
              <CareerMentorList careerId={career.id} />
            </div>

            <div className="bg-card rounded-lg p-4 shadow-sm">
              <SkillsAndTools
                required_skills={career.required_skills}
                required_tools={career.required_tools}
                tools_knowledge={[]}
                skill_match={[]}
                transferable_skills={career.transferable_skills}
                required_education={career.required_education}
              />
            </div>

            <div className="bg-card rounded-lg p-4 shadow-sm">
              <AdditionalInfo
                professional_associations={[]}
                common_difficulties={[]}
                certifications_to_consider={[]}
                affiliated_programs={[]}
                majors_to_consider_switching_to={career.careers_to_consider_switching_to}
                job_prospects={null}
                passion_for_subject={null}
                global_applicability={null}
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}