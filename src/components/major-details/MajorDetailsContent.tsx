
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Major } from "@/types/database/majors";
import { AboutSection } from "./AboutSection";
import { AcademicRequirements } from "./AcademicRequirements";
import { CareerProspects } from "./CareerProspects";
import { SkillsAndTools } from "./SkillsAndTools";
import { AdditionalInfo } from "./AdditionalInfo";
import { SchoolsOfferingSection } from "./SchoolsOfferingSection";

interface MajorDetailsContentProps {
  major: Major;
  majorWithCareers?: Major;
}

export function MajorDetailsContent({ major, majorWithCareers }: MajorDetailsContentProps) {
  return (
    <ScrollArea className="h-[calc(90vh-120px)]">
      <div className="px-4 py-6 space-y-6">
        <div className="grid gap-6">
          <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/10 border-blue-100/70 dark:border-blue-800/30 shadow-sm">
            <AboutSection 
              description={major.description}
              learning_objectives={major.learning_objectives}
              interdisciplinary_connections={major.interdisciplinary_connections}
              majorId={major.id}
            />
          </div>

          <div className="p-4 rounded-lg border bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/20 dark:to-blue-900/10 border-cyan-100/70 dark:border-cyan-800/30 shadow-sm">
            <SchoolsOfferingSection majorId={major.id} />
          </div>

          <div className="p-4 rounded-lg border bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-900/20 dark:to-yellow-900/10 border-amber-100/70 dark:border-amber-800/30 shadow-sm">
            <AcademicRequirements 
              gpa_expectations={major.gpa_expectations}
              common_courses={major.common_courses}
              degree_levels={major.degree_levels}
              affiliated_programs={major.affiliated_programs}
            />
          </div>

          <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/10 border-green-100/70 dark:border-green-800/30 shadow-sm">
            <CareerProspects 
              job_prospects={major.job_prospects}
              career_opportunities={major.career_opportunities}
              professional_associations={major.professional_associations}
              global_applicability={major.global_applicability}
              related_careers={majorWithCareers?.career_major_relations}
            />
          </div>

          <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/20 dark:to-violet-900/10 border-purple-100/70 dark:border-purple-800/30 shadow-sm">
            <SkillsAndTools 
              skill_match={major.skill_match}
              tools_knowledge={major.tools_knowledge}
              transferable_skills={major.transferable_skills}
              interdisciplinary_connections={major.interdisciplinary_connections}
            />
          </div>

          <div className="p-4 rounded-lg border bg-gradient-to-br from-rose-50/50 to-pink-50/50 dark:from-rose-900/20 dark:to-pink-900/10 border-rose-100/70 dark:border-rose-800/30 shadow-sm">
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
      </div>
    </ScrollArea>
  );
}
