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
import { AboutSection } from "./career-details/AboutSection";
import { SkillsAndTools } from "./career-details/SkillsAndTools";
import { AdditionalInfo } from "./career-details/AdditionalInfo";
import { CareerMentorList } from "./career-details/CareerMentorList";
import { HeaderBadges } from "./career-details/HeaderBadges";
import { AcademicMajorsSection } from "./career-details/AcademicMajorsSection";
import { RelatedMajorsSection } from "./career-details/RelatedMajorsSection";
import { KeywordsSection } from "./career-details/KeywordsSection";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

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
      
      console.log('Career with relations:', data);
      return data as CareerWithMajors;
    },
    enabled: open && !!careerId,
  });

  // Subscribe to real-time updates for the careers table
  useEffect(() => {
    if (!open || !careerId) return;

    const channel = supabase
      .channel('career-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'careers',
          filter: `id=eq.${careerId}`,
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          queryClient.setQueryData(['career', careerId], (oldData: CareerWithMajors | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              ...payload.new,
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [careerId, open, queryClient]);

  if (!open) return null;
  if (isLoading) return <div>Loading...</div>;
  if (!career) return <div>Career not found</div>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <DialogHeader className="p-4 pb-0">
          <div className="relative">
            <DialogTitle className="text-2xl font-bold text-foreground pr-24">
              {career.title}
            </DialogTitle>
            <HeaderBadges 
              profilesCount={career.profiles_count || 0}
              salaryRange={career.salary_range}
            />
          </div>
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
              learning_objectives={[]}
              industry={career.industry}
              work_environment={career.work_environment}
              growth_potential={career.growth_potential}
              job_outlook={career.job_outlook}
              important_note={career.important_note}
            />

            <AcademicMajorsSection academicMajors={career.academic_majors} />
            <RelatedMajorsSection careerMajorRelations={career.career_major_relations} />
            <KeywordsSection keywords={career.keywords} />

            <CareerMentorList careerId={career.id} />

            <SkillsAndTools
              required_skills={career.required_skills}
              required_tools={career.required_tools}
              tools_knowledge={[]}
              skill_match={[]}
              transferable_skills={career.transferable_skills}
              required_education={career.required_education}
            />

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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}