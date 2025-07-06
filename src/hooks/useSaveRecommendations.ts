
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CareerRecommendation } from '@/types/assessment';

interface UseSaveRecommendationsProps {
  assessmentId: string;
  recommendations: CareerRecommendation[];
}

export const useSaveRecommendations = ({ assessmentId, recommendations }: UseSaveRecommendationsProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const checkIfAlreadySaved = async () => {
    try {
      const { data, error } = await supabase
        .from('career_recommendations')
        .select('id')
        .eq('assessment_id', assessmentId)
        .limit(1);

      if (error) throw error;
      
      const saved = data && data.length > 0;
      setIsSaved(saved);
      return saved;
    } catch (error) {
      console.error('Error checking saved recommendations:', error);
      return false;
    }
  };

  const saveRecommendations = async () => {
    try {
      setIsSaving(true);

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save your recommendations.",
          variant: "destructive",
        });
        return;
      }

      // Check if already saved
      const alreadySaved = await checkIfAlreadySaved();
      if (alreadySaved) {
        toast({
          title: "Already Saved",
          description: "Your recommendations have already been saved.",
        });
        setIsSaved(true);
        return;
      }

      // Prepare recommendations for database insertion
      const recommendationsToSave = recommendations.map(rec => ({
        assessment_id: assessmentId,
        career_id: rec.careerId || null,
        title: rec.title,
        description: rec.description,
        match_score: rec.matchScore,
        reasoning: rec.reasoning,
        salary_range: rec.salaryRange || null,
        growth_outlook: rec.growthOutlook || null,
        time_to_entry: rec.timeToEntry || null,
        required_skills: rec.requiredSkills || [],
        education_requirements: rec.educationRequirements || [],
        work_environment: rec.workEnvironment || null,
      }));

      // Insert recommendations
      const { error } = await supabase
        .from('career_recommendations')
        .insert(recommendationsToSave);

      if (error) throw error;

      setIsSaved(true);
      toast({
        title: "Recommendations Saved!",
        description: `Successfully saved ${recommendations.length} career recommendations.`,
      });

    } catch (error) {
      console.error('Error saving recommendations:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveRecommendations,
    isSaving,
    isSaved,
    checkIfAlreadySaved,
  };
};
