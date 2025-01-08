import { ScrollArea } from "@/components/ui/scroll-area";
import type { Tables } from "@/integrations/supabase/types";
import { AboutSection } from "./AboutSection";
import { SkillsAndTools } from "./SkillsAndTools";
import { AdditionalInfo } from "./AdditionalInfo";
import { CareerMentorList } from "./CareerMentorList";
import { AcademicMajorsSection } from "./AcademicMajorsSection";
import { KeywordsSection } from "./KeywordsSection";

type CareerWithMajors = Tables<"careers"> & {
  career_major_relations: {
    major: {
      title: string;
      id: string;
    };
  }[];
};

interface DialogContentProps {
  career: CareerWithMajors;
}

export function DialogContent({ career }: DialogContentProps) {
  return (
    <ScrollArea className="h-[calc(85vh-120px)]">
      <div className="space-y-4 p-3 md:space-y-6 md:p-4">
        {career.image_url && (
          <div className="flex justify-center">
            <img 
              src={career.image_url} 
              alt={career.title} 
              className="max-h-[200px] w-auto object-contain rounded-lg md:max-h-[300px]"
            />
          </div>
        )}

        <div className="grid gap-4 md:gap-6">
          <div className="rounded-lg bg-card p-3 shadow-sm md:p-4">
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

          <div className="rounded-lg bg-card p-3 shadow-sm md:p-4">
            <AcademicMajorsSection academicMajors={career.academic_majors} />
          </div>

          <div className="rounded-lg bg-card p-3 shadow-sm md:p-4">
            <KeywordsSection keywords={career.keywords} />
          </div>

          <div className="rounded-lg bg-card p-3 shadow-sm md:p-4">
            <CareerMentorList careerId={career.id} />
          </div>

          <div className="rounded-lg bg-card p-3 shadow-sm md:p-4">
            <SkillsAndTools
              required_skills={career.required_skills}
              required_tools={career.required_tools}
              tools_knowledge={[]}
              skill_match={[]}
              transferable_skills={career.transferable_skills}
              required_education={career.required_education}
            />
          </div>

          <div className="rounded-lg bg-card p-3 shadow-sm md:p-4">
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
    </ScrollArea>
  );
}