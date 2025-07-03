
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
        const { data, error } = await supabase
          .from('career_assessments')
          .select('id, completed_at, recommendations, status')
          .eq('user_id', session.user.id)
          .order('completed_at', { ascending: false });

        if (error) throw error;

        const historyItems: AssessmentHistoryItem[] = data?.map(assessment => ({
          id: assessment.id,
          completedAt: assessment.completed_at,
          recommendationCount: assessment.recommendations?.length || 0,
          topRecommendation: assessment.recommendations?.[0]?.title || 'No recommendations',
          status: assessment.status
        })) || [];

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
