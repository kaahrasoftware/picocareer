
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AssessmentQuestion, QuestionResponse, CareerRecommendation, ProfileType } from '@/types/assessment';
import { detectProfileType, shouldShowQuestion } from '@/utils/profileDetection';

export const useAssessmentFlow = () => {
  const [allQuestions, setAllQuestions] = useState<AssessmentQuestion[]>([]);
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

  // Dynamically filter questions based on detected profile type
  const filteredQuestions = useMemo(() => {
    if (allQuestions.length === 0) return [];
    
    return allQuestions.filter(question => 
      shouldShowQuestion(question, detectedProfileType, currentQuestionIndex)
    );
  }, [allQuestions, detectedProfileType, currentQuestionIndex]);

  // Get current question from filtered set
  const currentQuestion = filteredQuestions[currentQuestionIndex] || null;
  const totalQuestions = filteredQuestions.length;
  const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;

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

      setAllQuestions(formattedQuestions);
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
        // Generate a valid UUID for non-authenticated users
        setAssessmentId(crypto.randomUUID());
      }
      
      setHasStarted(true);
    } catch (error) {
      console.error('Error starting assessment:', error);
      // Still allow the assessment to continue with a valid UUID
      setAssessmentId(crypto.randomUUID());
      setHasStarted(true);
    }
  };

  const handleAnswer = useCallback(async (response: QuestionResponse) => {
    setResponses(prev => {
      const existingIndex = prev.findIndex(r => r.questionId === response.questionId);
      const updatedResponses = existingIndex >= 0 
        ? prev.map((r, i) => i === existingIndex ? response : r)
        : [...prev, response];

      // Detect profile type after first response (academic status question)
      if (updatedResponses.length === 1 && !detectedProfileType) {
        const profileType = detectProfileType(updatedResponses);
        if (profileType) {
          console.log('Profile type detected:', profileType);
          setDetectedProfileType(profileType);
        }
      }

      return updatedResponses;
    });

    // Save response to database if we have a valid assessment ID
    if (assessmentId && assessmentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      try {
        await supabase
          .from('assessment_responses')
          .upsert({
            assessment_id: assessmentId,
            question_id: response.questionId,
            answer: response.answer
          });
      } catch (error) {
        console.error('Error saving response:', error);
        // Continue with assessment even if saving fails
      }
    }

    // Move to next question in filtered set
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, detectedProfileType, filteredQuestions.length, assessmentId]);

  const completeAssessment = async () => {
    try {
      setIsGenerating(true);
      
      // Update assessment status if we have a real assessment ID (UUID format)
      if (assessmentId && assessmentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
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

  return {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
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
