
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CareerRecommendation, QuestionResponse } from '@/types/assessment';

export const useAssessmentResults = (assessmentId: string | null) => {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessmentResults = async () => {
      if (!assessmentId) {
        setRecommendations([]);
        setResponses([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching results for assessment:', assessmentId);
        
        // Fetch career recommendations
        const { data: recommendationsData, error: recommendationsError } = await supabase
          .from('career_recommendations')
          .select('*')
          .eq('assessment_id', assessmentId)
          .order('match_score', { ascending: false });

        if (recommendationsError) {
          throw new Error(`Failed to fetch recommendations: ${recommendationsError.message}`);
        }

        // Fetch assessment responses
        const { data: responsesData, error: responsesError } = await supabase
          .from('assessment_responses')
          .select('*')
          .eq('assessment_id', assessmentId);

        if (responsesError) {
          throw new Error(`Failed to fetch responses: ${responsesError.message}`);
        }

        console.log('Fetched recommendations:', recommendationsData?.length || 0);
        console.log('Fetched responses:', responsesData?.length || 0);

        // Transform the data to match our types
        const transformedRecommendations: CareerRecommendation[] = recommendationsData?.map(rec => ({
          careerId: rec.career_id || rec.id,
          title: rec.title,
          description: rec.description,
          matchScore: rec.match_score,
          reasoning: rec.reasoning,
          salaryRange: rec.salary_range,
          growthOutlook: rec.growth_outlook,
          timeToEntry: rec.time_to_entry,
          requiredSkills: rec.required_skills,
          educationRequirements: rec.education_requirements,
          workEnvironment: rec.work_environment
        })) || [];

        // Transform responses with proper type handling for the answer field
        const transformedResponses: QuestionResponse[] = responsesData?.map(response => {
          // Handle the Json type conversion properly
          let answer: string | string[] | number;
          
          if (Array.isArray(response.answer)) {
            answer = response.answer as string[];
          } else if (typeof response.answer === 'string') {
            answer = response.answer;
          } else if (typeof response.answer === 'number') {
            answer = response.answer;
          } else {
            // Convert other types (including boolean) to string
            answer = String(response.answer);
          }

          return {
            questionId: response.question_id,
            answer: answer,
            timestamp: new Date().toISOString() // Use current timestamp as fallback
          };
        }) || [];

        setRecommendations(transformedRecommendations);
        setResponses(transformedResponses);
      } catch (err) {
        console.error('Error fetching assessment results:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assessment results';
        setError(errorMessage);
        setRecommendations([]);
        setResponses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessmentResults();
  }, [assessmentId]);

  return { 
    recommendations, 
    responses, 
    isLoading, 
    error 
  };
};
