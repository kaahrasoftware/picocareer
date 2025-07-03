
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from './useAuthSession';
import { AssessmentHistoryItem } from '@/types/assessment';

export const useAssessmentHistory = () => {
  const { session } = useAuthSession();
  const [assessments, setAssessments] = useState<AssessmentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssessmentHistory = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Query career_assessments and get recommendations separately
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('career_assessments')
          .select('id, completed_at, status')
          .eq('user_id', session.user.id)
          .order('completed_at', { ascending: false });

        if (assessmentError) throw assessmentError;

        const historyItems: AssessmentHistoryItem[] = [];

        for (const assessment of assessmentData || []) {
          // Get recommendations for each assessment
          const { data: recommendationData, error: recommendationError } = await supabase
            .from('career_recommendations')
            .select('title')
            .eq('assessment_id', assessment.id)
            .limit(1);

          if (recommendationError) {
            console.error('Error fetching recommendations:', recommendationError);
          }

          historyItems.push({
            id: assessment.id,
            completedAt: assessment.completed_at || new Date().toISOString(),
            recommendationCount: recommendationData?.length || 0,
            topRecommendation: recommendationData?.[0]?.title || 'No recommendations',
            status: assessment.status
          });
        }

        setAssessments(historyItems);
      } catch (error) {
        console.error('Error fetching assessment history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessmentHistory();
  }, [session]);

  return { assessments, isLoading };
};
