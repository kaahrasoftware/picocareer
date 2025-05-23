
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Major } from "@/types/database/majors";
import { AboutSection } from "./AboutSection";
import { AcademicRequirements } from "./AcademicRequirements";
import { CareerProspects } from "./CareerProspects";
import { SkillsAndTools } from "./SkillsAndTools";
import { AdditionalInfo } from "./AdditionalInfo";
import { SchoolsOfferingSection } from "./SchoolsOfferingSection";
import { Card } from "@/components/ui/card";

interface MajorDetailsContentProps {
  major: Major;
  majorWithCareers?: Major;
}

export function MajorDetailsContent({ major, majorWithCareers }: MajorDetailsContentProps) {
  return (
    <ScrollArea className="h-[calc(90vh-120px)]">
      <div className="px-4 py-6 space-y-6">
        <div className="grid gap-6">
          <Card className="p-4 border-blue-100/70 dark:border-blue-800/30 shadow-sm overflow-hidden">
            <AboutSection 
              description={major.description}
              learning_objectives={major.learning_objectives}
              interdisciplinary_connections={major.interdisciplinary_connections}
              majorId={major.id}
            />
          </Card>

          <Card className="p-4 border-cyan-100/70 dark:border-cyan-800/30 shadow-sm overflow-hidden">
            <SchoolsOfferingSection majorId={major.id} />
          </Card>

          <Card className="p-4 border-amber-100/70 dark:border-amber-800/30 shadow-sm overflow-hidden">
            <AcademicRequirements 
              gpa_expectations={major.gpa_expectations}
              common_courses={major.common_courses}
              degree_levels={major.degree_levels}
              affiliated_programs={major.affiliated_programs}
            />
          </Card>

          <Card className="p-4 border-green-100/70 dark:border-green-800/30 shadow-sm overflow-hidden">
            <CareerProspects 
              job_prospects={major.job_prospects}
              career_opportunities={major.career_opportunities}
              professional_associations={major.professional_associations}
              global_applicability={major.global_applicability}
              related_careers={majorWithCareers?.career_major_relations}
              potential_salary={major.potential_salary}
            />
          </Card>

          <Card className="p-4 border-purple-100/70 dark:border-purple-800/30 shadow-sm overflow-hidden">
            <SkillsAndTools 
              skill_match={major.skill_match}
              tools_knowledge={major.tools_knowledge}
              transferable_skills={major.transferable_skills}
              interdisciplinary_connections={major.interdisciplinary_connections}
            />
          </Card>

          <Card className="p-4 border-rose-100/70 dark:border-rose-800/30 shadow-sm overflow-hidden">
            <AdditionalInfo 
              intensity={major.intensity}
              passion_for_subject={major.passion_for_subject}
              stress_level={major.stress_level}
              dropout_rates={major.dropout_rates}
              common_difficulties={major.common_difficulties}
              majors_to_consider_switching_to={major.majors_to_consider_switching_to}
              certifications_to_consider={major.certifications_to_consider}
            />
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
