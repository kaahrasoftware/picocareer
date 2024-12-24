import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-foreground">{career.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{career.description}</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(85vh-120px)] px-6">
          <div className="space-y-6 pb-6">
            {career.image_url && (
              <img 
                src={career.image_url} 
                alt={career.title} 
                className="w-full h-48 object-cover rounded-lg"
              />
            )}

            {career.career_major_relations && career.career_major_relations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Related Majors</h3>
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

            <CareerMetrics
              intensity={career.intensity}
              stress_levels={career.stress_levels}
              dropout_rates={career.dropout_rates}
              average_salary={career.average_salary}
              potential_salary={career.potential_salary}
              tuition_and_fees={career.tuition_and_fees}
            />

            <AboutSection
              description={career.description}
              learning_objectives={career.learning_objectives}
              industry={career.industry}
              work_environment={career.work_environment}
              growth_potential={career.growth_potential}
            />

            <SkillsAndTools
              required_skills={career.required_skills}
              required_tools={career.required_tools}
              tools_knowledge={career.tools_knowledge}
              skill_match={career.skill_match}
              transferable_skills={career.transferable_skills}
            />

            <AdditionalInfo
              professional_associations={career.professional_associations}
              common_difficulties={career.common_difficulties}
              certifications_to_consider={career.certifications_to_consider}
              affiliated_programs={career.affiliated_programs}
              majors_to_consider_switching_to={career.majors_to_consider_switching_to}
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