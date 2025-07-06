
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CareerRecommendation } from '@/types/assessment';

interface UseSaveRecommendationsProps {
  assessmentId: string;
  recommendations: CareerRecommendation[];
}

// Helper function to validate UUID format
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const useSaveRecommendations = ({ assessmentId, recommendations }: UseSaveRecommendationsProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const checkIfAlreadySaved = useCallback(async () => {
    // Only check for valid UUIDs
    if (!isValidUUID(assessmentId)) {
      console.log('Skipping duplicate check for non-UUID assessment ID:', assessmentId);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('career_recommendations')
        .select('id')
        .eq('assessment_id', assessmentId)
        .limit(1);

      if (error) {
        console.error('Error checking saved recommendations:', error);
        return false;
      }
      
      const saved = data && data.length > 0;
      setIsSaved(saved);
      return saved;
    } catch (error) {
      console.error('Error checking saved recommendations:', error);
      return false;
    }
  }, [assessmentId]);

  const saveRecommendations = async () => {
    if (!isValidUUID(assessmentId)) {
      toast({
        title: "Cannot Save",
        description: "Please complete a full assessment to save recommendations.",
        variant: "destructive",
      });
      return;
    }

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

      console.log('Saving recommendations:', {
        assessmentId,
        count: recommendationsToSave.length,
        userId: user.id
      });

      // Insert recommendations
      const { error } = await supabase
        .from('career_recommendations')
        .insert(recommendationsToSave);

      if (error) {
        console.error('Database error saving recommendations:', error);
        throw error;
      }

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
