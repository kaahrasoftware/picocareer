import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";
import type { Major } from "@/types/database/majors";
import { AboutSection } from "./major-details/AboutSection";
import { AcademicRequirements } from "./major-details/AcademicRequirements";
import { CareerProspects } from "./major-details/CareerProspects";
import { SkillsAndTools } from "./major-details/SkillsAndTools";
import { AdditionalInfo } from "./major-details/AdditionalInfo";

interface MajorDetailsProps {
  major: Major;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MajorDetails({ major, open, onOpenChange }: MajorDetailsProps) {
  if (!major) return null;

  const formatProfileCount = (count: number | undefined) => {
    if (!count) return "0";
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + "K";
    return (count / 1000000).toFixed(1) + "M";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col gap-2">
              <DialogTitle className="text-2xl font-bold">{major.title}</DialogTitle>
              {major.potential_salary && (
                <Badge variant="outline" className="bg-[#FFDEE2] text-[#4B5563] self-start">
                  {major.potential_salary}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatProfileCount(major.profiles_count)} Users
              </span>
            </div>
          </div>
          {major.degree_levels && major.degree_levels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {major.degree_levels.map((level, index) => (
                <Badge key={index} variant="outline" className="bg-[#F2FCE2] text-[#4B5563]">
                  {level}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>
        
        <ScrollArea className="h-[calc(85vh-120px)] px-6">
          <div className="space-y-6 pb-6">
            <AboutSection 
              description={major.description}
              learning_objectives={major.learning_objectives}
              interdisciplinary_connections={major.interdisciplinary_connections}
              majorId={major.id}
            />

            <AcademicRequirements 
              gpa_expectations={major.gpa_expectations}
              affiliated_programs={major.affiliated_programs}
            />

            <CareerProspects 
              job_prospects={major.job_prospects}
              career_opportunities={major.career_opportunities}
              professional_associations={major.professional_associations}
              global_applicability={major.global_applicability}
            />

            <SkillsAndTools 
              skill_match={major.skill_match}
              transferable_skills={major.transferable_skills}
            />

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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}