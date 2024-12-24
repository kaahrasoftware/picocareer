import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { AboutSection } from "./career-details/AboutSection";
import { CareerMetrics } from "./career-details/CareerMetrics";
import { SkillsAndTools } from "./career-details/SkillsAndTools";
import { AdditionalInfo } from "./career-details/AdditionalInfo";
import { Users, DollarSign, Book, ArrowRight, Tag } from "lucide-react";

interface CareerDetailsDialogProps {
  careerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CareerWithMajors = Tables<"careers"> & {
  career_major_relations: {
    major: {
      title: string;
      id: string;
    };
  }[];
} & {
  learning_objectives?: string[];
  intensity?: string;
  dropout_rates?: string;
  average_salary?: string;
  potential_salary?: string;
  tuition_and_fees?: string;
  tools_knowledge?: string[];
  skill_match?: string[];
  professional_associations?: string[];
  common_difficulties?: string[];
  certifications_to_consider?: string[];
  affiliated_programs?: string[];
  job_prospects?: string;
  passion_for_subject?: string;
  global_applicability?: string;
};

export function CareerDetailsDialog({ careerId, open, onOpenChange }: CareerDetailsDialogProps) {
  const { data: career, isLoading } = useQuery({
    queryKey: ['career', careerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select(`
          *,
          career_major_relations(
            major:majors(id, title)
          )
        `)
        .eq('id', careerId)
        .single();

      if (error) throw error;
      return data as CareerWithMajors;
    },
    enabled: open && !!careerId,
  });

  if (!open) return null;
  if (isLoading) return <div>Loading...</div>;
  if (!career) return <div>Career not found</div>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <DialogHeader className="p-4 pb-0">
          <div className="relative">
            <DialogTitle className="text-2xl font-bold text-foreground">{career.title}</DialogTitle>
            <Badge variant="secondary" className="absolute top-0 right-0 flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{career.profiles_count || 0} mentors</span>
            </Badge>
          </div>
          {career.salary_range && (
            <Badge 
              variant="outline"
              className="mt-2 bg-[#FFDEE2] text-[#4B5563] hover:bg-[#FFD1D6] transition-colors border border-[#FFD1D6] flex w-fit items-center gap-1"
            >
              <DollarSign className="h-4 w-4" />
              {career.salary_range}
            </Badge>
          )}
        </DialogHeader>
        
        <ScrollArea className="h-[calc(85vh-120px)]">
          <div className="space-y-6 p-4">
            {career.image_url && (
              <div className="flex justify-center">
                <img 
                  src={career.image_url} 
                  alt={career.title} 
                  className="max-h-[300px] w-auto object-contain rounded-lg"
                />
              </div>
            )}

            <AboutSection
              description={career.description}
              learning_objectives={career.learning_objectives}
              industry={career.industry}
              work_environment={career.work_environment}
              growth_potential={career.growth_potential}
              job_outlook={career.job_outlook}
            />

            {career.academic_majors && career.academic_majors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Book className="h-5 w-5 text-primary" />
                  Academic Majors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {career.academic_majors.map((major, index) => (
                    <Badge 
                      key={index}
                      className="bg-primary/10 text-primary rounded-full"
                    >
                      {major}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {career.career_major_relations && career.career_major_relations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-primary" />
                  Related Majors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {career.career_major_relations.map(({ major }) => (
                    <Badge 
                      key={major.id} 
                      className="bg-primary/10 text-primary rounded-full"
                    >
                      {major.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {career.keywords && career.keywords.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {career.keywords.map((keyword, index) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className="bg-[#E5DEFF] text-[#4B5563] hover:bg-[#D8D1F2] transition-colors border border-[#D8D1F2]"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <CareerMetrics
              intensity={career.intensity}
              stress_levels={career.stress_levels}
              dropout_rates={career.dropout_rates}
              average_salary={career.average_salary}
              potential_salary={career.potential_salary}
              tuition_and_fees={career.tuition_and_fees}
            />

            <SkillsAndTools
              required_skills={career.required_skills}
              required_tools={career.required_tools}
              tools_knowledge={career.tools_knowledge}
              skill_match={career.skill_match}
              transferable_skills={career.transferable_skills}
              required_education={career.required_education}
            />

            <AdditionalInfo
              professional_associations={career.professional_associations}
              common_difficulties={career.common_difficulties}
              certifications_to_consider={career.certifications_to_consider}
              affiliated_programs={career.affiliated_programs}
              majors_to_consider_switching_to={career.careers_to_consider_switching_to}
              job_prospects={career.job_prospects}
              passion_for_subject={career.passion_for_subject}
              global_applicability={career.global_applicability}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}