
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AssessmentQuestion, QuestionResponse, CareerRecommendation } from '@/types/assessment';
import { useAuthSession } from './useAuthSession';

const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: '1',
    title: 'What type of work environment do you prefer?',
    type: 'multiple_choice',
    options: [
      'Office setting with team collaboration',
      'Remote work with flexibility',
      'Field work with variety',
      'Laboratory or research setting',
      'Customer-facing environment'
    ],
    order: 1,
    isRequired: true
  },
  {
    id: '2',
    title: 'Which activities do you find most engaging?',
    description: 'Select all that apply',
    type: 'multiple_select',
    options: [
      'Problem solving and analysis',
      'Creative design and art',
      'Leading and managing people',
      'Teaching and mentoring',
      'Building and creating things',
      'Research and investigation',
      'Helping and supporting others'
    ],
    order: 2,
    isRequired: true
  },
  {
    id: '3',
    title: 'How important is work-life balance to you?',
    type: 'scale',
    order: 3,
    isRequired: true
  },
  {
    id: '4',
    title: 'What are your long-term career goals?',
    description: 'Share your aspirations and what you hope to achieve',
    type: 'text',
    order: 4,
    isRequired: true
  },
  {
    id: '5',
    title: 'Which skills do you feel most confident about?',
    type: 'multiple_select',
    options: [
      'Communication and presentation',
      'Technical and analytical',
      'Creative and artistic',
      'Leadership and management',
      'Research and critical thinking',
      'Organizational and planning',
      'Interpersonal and social'
    ],
    order: 5,
    isRequired: true,
    isLast: true
  }
];

export const useAssessmentFlow = () => {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  const handleAnswer = useCallback((response: QuestionResponse) => {
    setResponses(prev => [...prev, response]);
    
    if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex]);

  const generateRecommendations = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsGenerating(true);
    
    try {
      // Call the AI edge function to generate recommendations
      const { data, error } = await supabase.functions.invoke('ai-career-assessment', {
        body: {
          responses: responses,
          userId: session.user.id
        }
      });

      if (error) throw error;

      setRecommendations(data.recommendations);
      
      // Save the assessment to the database
      const { error: saveError } = await supabase
        .from('career_assessments')
        .insert({
          user_id: session.user.id,
          responses: responses,
          recommendations: data.recommendations,
          status: 'completed'
        });

      if (saveError) throw saveError;

      toast({
        title: "Assessment Complete!",
        description: "Your personalized career recommendations are ready.",
      });

    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [responses, session, toast]);

  const resetAssessment = useCallback(() => {
    setCurrentQuestionIndex(0);
    setResponses([]);
    setRecommendations([]);
    setIsGenerating(false);
  }, []);

  return {
    currentQuestion,
    responses,
    recommendations,
    isGenerating,
    progress,
    handleAnswer,
    generateRecommendations,
    resetAssessment
  };
};
