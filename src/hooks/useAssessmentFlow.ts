
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AssessmentQuestion, QuestionResponse, CareerRecommendation, ProfileType } from '@/types/assessment';
import { profileDetection } from '@/utils/profileDetection';

export const useAssessmentFlow = () => {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [detectedProfileType, setDetectedProfileType] = useState<ProfileType | null>(null);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load questions on component mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;

      const formattedQuestions: AssessmentQuestion[] = (data || []).map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        type: q.type as 'multiple_choice' | 'multiple_select' | 'scale' | 'text',
        options: q.options ? Object.values(q.options) as string[] : undefined,
        order: q.order_index,
        isRequired: q.is_required,
        profileType: q.profile_type,
        targetAudience: q.target_audience,
        prerequisites: q.prerequisites,
        conditionalLogic: q.conditional_logic
      }));

      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load assessment questions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startAssessment = async () => {
    try {
      // Create a new assessment record in the database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('career_assessments')
          .insert({
            user_id: user.id,
            status: 'in_progress'
          })
          .select()
          .single();

        if (error) throw error;
        
        setAssessmentId(data.id);
      } else {
        // Generate a temporary UUID for non-authenticated users
        setAssessmentId(crypto.randomUUID());
      }
      
      setHasStarted(true);
    } catch (error) {
      console.error('Error starting assessment:', error);
      // Still allow the assessment to continue with a temporary ID
      setAssessmentId(crypto.randomUUID());
      setHasStarted(true);
    }
  };

  const handleAnswer = useCallback((questionId: string, answer: string | string[] | number) => {
    const newResponse: QuestionResponse = {
      questionId,
      answer,
      timestamp: new Date().toISOString(),
    };

    setResponses(prev => {
      const existingIndex = prev.findIndex(r => r.questionId === questionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newResponse;
        return updated;
      }
      return [...prev, newResponse];
    });

    // Detect profile type after first few responses
    if (responses.length >= 2 && !detectedProfileType) {
      const allResponses = [...responses, newResponse];
      const profileType = profileDetection.detectProfileType(allResponses);
      setDetectedProfileType(profileType);
    }

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [responses, detectedProfileType, currentQuestionIndex, questions.length]);

  const completeAssessment = async () => {
    try {
      setIsGenerating(true);
      
      // Update assessment status if we have a real assessment ID
      if (assessmentId && assessmentId.length === 36) { // UUID length check
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('career_assessments')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              detected_profile_type: detectedProfileType
            })
            .eq('id', assessmentId);
        }
      }

      // Generate AI recommendations
      const { data, error } = await supabase.functions.invoke('ai-career-assessment', {
        body: {
          responses,
          detectedProfileType,
          assessmentId
        }
      });

      if (error) throw error;

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        setShowResults(true);
      } else {
        throw new Error('No recommendations received');
      }

    } catch (error) {
      console.error('Error completing assessment:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const retakeAssessment = () => {
    setCurrentQuestionIndex(0);
    setResponses([]);
    setDetectedProfileType(null);
    setRecommendations([]);
    setShowResults(false);
    setHasStarted(false);
    setAssessmentId(null);
  };

  const currentQuestion = questions[currentQuestionIndex] || null;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions: questions.length,
    responses,
    detectedProfileType,
    recommendations,
    isLoading,
    isGenerating,
    showResults,
    hasStarted,
    isLastQuestion,
    assessmentId,
    handleAnswer,
    completeAssessment,
    retakeAssessment,
    startAssessment
  };
};
