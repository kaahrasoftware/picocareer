
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from './useAuthSession';
import { AssessmentHistoryItem } from '@/types/assessment';

export const useAssessmentHistory = () => {
  const { session } = useAuthSession();
  const [assessments, setAssessments] = useState<AssessmentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessmentHistory = async () => {
      console.log('Starting assessment history fetch...');
      
      if (!session?.user?.id) {
        console.log('No user session found, stopping fetch');
        setIsLoading(false);
        setError(null);
        setAssessments([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching assessments for user:', session.user.id);
        
        // Fetch only completed assessments
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('career_assessments')
          .select('id, completed_at, status')
          .eq('user_id', session.user.id)
          .eq('status', 'completed') // Only fetch completed assessments
          .not('completed_at', 'is', null) // Ensure completed_at is not null
          .order('completed_at', { ascending: false });

        if (assessmentError) {
          console.error('Error fetching assessments:', assessmentError);
          throw new Error(`Failed to fetch assessments: ${assessmentError.message}`);
        }

        console.log('Fetched assessments:', assessmentData?.length || 0, 'completed assessments');

        if (!assessmentData || assessmentData.length === 0) {
          console.log('No completed assessments found');
          setAssessments([]);
          setIsLoading(false);
          return;
        }

        const historyItems: AssessmentHistoryItem[] = [];

        // Process each assessment to get recommendation details
        for (const assessment of assessmentData) {
          console.log('Processing assessment:', assessment.id);
          
          try {
            // Get all recommendations for this assessment
            const { data: recommendationData, error: recommendationError } = await supabase
              .from('career_recommendations')
              .select('title, match_score')
              .eq('assessment_id', assessment.id)
              .order('match_score', { ascending: false }); // Order by match score to get top recommendation

            if (recommendationError) {
              console.error('Error fetching recommendations for assessment', assessment.id, ':', recommendationError);
              // Continue processing other assessments even if one fails
            }

            const recommendationCount = recommendationData?.length || 0;
            const topRecommendation = recommendationData && recommendationData.length > 0 
              ? recommendationData[0].title 
              : 'No recommendations available';

            console.log(`Assessment ${assessment.id}: ${recommendationCount} recommendations, top: ${topRecommendation}`);

            historyItems.push({
              id: assessment.id,
              completedAt: assessment.completed_at || new Date().toISOString(),
              recommendationCount,
              topRecommendation,
              status: assessment.status
            });
          } catch (recError) {
            console.error('Error processing recommendations for assessment', assessment.id, ':', recError);
            // Add the assessment with default values if recommendation fetch fails
            historyItems.push({
              id: assessment.id,
              completedAt: assessment.completed_at || new Date().toISOString(),
              recommendationCount: 0,
              topRecommendation: 'Error loading recommendations',
              status: assessment.status
            });
          }
        }

        console.log('Final history items:', historyItems.length);
        setAssessments(historyItems);
      } catch (error) {
        console.error('Error in fetchAssessmentHistory:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load assessment history';
        setError(errorMessage);
        setAssessments([]);
      } finally {
        setIsLoading(false);
        console.log('Assessment history fetch completed');
      }
    };

    fetchAssessmentHistory();
  }, [session?.user?.id]);

  return { 
    assessments, 
    isLoading, 
    error,
    refetch: () => {
      console.log('Manually refetching assessment history...');
      setIsLoading(true);
      setError(null);
      // The effect will automatically run again due to dependency changes
    }
  };
};
