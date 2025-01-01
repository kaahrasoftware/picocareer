import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Heart } from "lucide-react";
import type { Major } from "@/types/database/majors";
import { AboutSection } from "./major-details/AboutSection";
import { AcademicRequirements } from "./major-details/AcademicRequirements";
import { CareerProspects } from "./major-details/CareerProspects";
import { SkillsAndTools } from "./major-details/SkillsAndTools";
import { AdditionalInfo } from "./major-details/AdditionalInfo";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";

interface MajorDetailsProps {
  major: Major;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MajorDetails({ major, open, onOpenChange }: MajorDetailsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();
  const { session } = useAuthSession();

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

  // Check if the major is bookmarked
  useQuery({
    queryKey: ['major-bookmark', major.id, session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return null;
      
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('*')
        .eq('profile_id', session.user.id)
        .eq('content_type', 'major')
        .eq('content_id', major.id)
        .maybeSingle();

      if (error) throw error;
      setIsBookmarked(!!data);
      return data;
    },
    enabled: open && !!major.id && !!session?.user.id,
  });

  const handleBookmarkToggle = async () => {
    if (!session?.user.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark majors",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isBookmarked) {
        await supabase
          .from('user_bookmarks')
          .delete()
          .eq('profile_id', session.user.id)
          .eq('content_type', 'major')
          .eq('content_id', major.id);
      } else {
        await supabase
          .from('user_bookmarks')
          .insert({
            profile_id: session.user.id,
            content_type: 'major',
            content_id: major.id,
          });
      }
      
      setIsBookmarked(!isBookmarked);
      toast({
        title: isBookmarked ? "Major unbookmarked" : "Major bookmarked",
        description: isBookmarked ? "Major removed from your bookmarks" : "Major added to your bookmarks",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  };

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
            <div className="flex flex-col items-end gap-2">
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {formatProfileCount(major.profiles_count)} Mentors
              </Badge>
              <div className="w-[120px] flex justify-center">
                <Heart 
                  className={`h-5 w-5 cursor-pointer hover:scale-110 transition-transform ${
                    isBookmarked ? 'fill-current text-[#ea384c]' : 'text-gray-400'
                  }`}
                  onClick={handleBookmarkToggle}
                />
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(85vh-120px)] px-6">
          <div className="space-y-6 pb-6">
            {major.degree_levels && major.degree_levels.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-lg font-semibold">Degree Levels</h4>
                <div className="flex flex-wrap gap-2">
                  {major.degree_levels.map((level, index) => (
                    <Badge 
                      key={index} 
                      variant="outline"
                      className="bg-[#F2FCE2] text-[#4B5563]"
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

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
              related_careers={majorWithCareers?.career_major_relations}
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