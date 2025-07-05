
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { detectProfileType, shouldShowQuestion } from '@/utils/profileDetection';
import type { AssessmentQuestion, QuestionResponse, ProfileType } from '@/types/assessment';

export const useAssessmentFlow = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [detectedProfileType, setDetectedProfileType] = useState<ProfileType | null>(null);
  const [profileDetectionCompleted, setProfileDetectionCompleted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch assessment questions with conditional logic support
  const { data: allQuestions = [], isLoading } = useQuery({
    queryKey: ['assessment-questions'],
    queryFn: async () => {
      console.log('Fetching assessment questions...');
      const { data, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      
      if (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }
      
      console.log('Fetched questions:', data?.length || 0);
      
      // Map database fields to AssessmentQuestion interface
      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        options: item.options as string[],
        order: item.order_index,
        isRequired: item.is_required,
        profileType: item.profile_type,
        targetAudience: item.target_audience,
        prerequisites: item.prerequisites,
        conditionalLogic: item.conditional_logic
      })) as AssessmentQuestion[];
    }
  });

  // Filter questions based on detected profile type
  const filteredQuestions = allQuestions.filter(question => 
    shouldShowQuestion(question, detectedProfileType, currentQuestionIndex)
  );

  // Create new assessment - now happens immediately when component mounts
  const createAssessment = useMutation({
    mutationFn: async () => {
      console.log('Creating new assessment...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated for assessment creation');
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('career_assessments')
        .insert({
          user_id: user.id,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating assessment:', error);
        throw error;
      }
      
      console.log('Assessment created successfully:', data.id);
      return data;
    },
    onSuccess: (data) => {
      setAssessmentId(data.id);
      console.log('Assessment ID set:', data.id);
    },
    onError: (error) => {
      console.error('Assessment creation failed:', error);
      toast({
        title: "Error",
        description: "Failed to start assessment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update assessment with detected profile type
  const updateAssessmentProfile = useMutation({
    mutationFn: async (profileType: ProfileType) => {
      if (!assessmentId) return;

      const { error } = await supabase
        .from('career_assessments')
        .update({
          detected_profile_type: profileType,
          profile_detection_completed: true
        })
        .eq('id', assessmentId);

      if (error) {
        console.error('Error updating assessment profile:', error);
        throw error;
      }
    }
  });

  // Create assessment immediately when questions are loaded
  useEffect(() => {
    if (allQuestions.length > 0 && !assessmentId && !createAssessment.isPending) {
      console.log('Auto-creating assessment with', allQuestions.length, 'questions available');
      createAssessment.mutate();
    }
  }, [allQuestions.length, assessmentId, createAssessment]);

  // Detect profile type from responses
  useEffect(() => {
    if (responses.length >= 1 && !profileDetectionCompleted) {
      const detected = detectProfileType(responses);
      if (detected) {
        console.log('Profile type detected:', detected);
        setDetectedProfileType(detected);
        setProfileDetectionCompleted(true);
        updateAssessmentProfile.mutate(detected);
      }
    }
  }, [responses, profileDetectionCompleted, updateAssessmentProfile]);

  // Save individual response
  const saveResponse = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: any }) => {
      if (!assessmentId) {
        console.error('Cannot save response: No assessment ID');
        throw new Error('No active assessment');
      }

      console.log('Saving response for question:', questionId, 'Answer:', answer);

      const { error } = await supabase
        .from('assessment_responses')
        .upsert({
          assessment_id: assessmentId,
          question_id: questionId,
          answer: JSON.stringify(answer)
        });

      if (error) {
        console.error('Error saving response:', error);
        throw error;
      }
      
      console.log('Response saved successfully');
    },
    onError: (error) => {
      console.error('Error saving response:', error);
    }
  });

  // Generate recommendations using AI
  const generateRecommendations = useMutation({
    mutationFn: async () => {
      console.log('Generating recommendations...');
      console.log('Assessment ID:', assessmentId);
      console.log('Responses count:', responses.length);
      console.log('Detected profile type:', detectedProfileType);

      if (!assessmentId || responses.length === 0) {
        console.error('Invalid assessment data - Assessment ID:', assessmentId, 'Responses:', responses.length);
        throw new Error('Invalid assessment data');
      }

      const requestPayload = {
        assessmentId,
        responses: responses.map(r => ({
          questionId: r.questionId,
          answer: r.answer
        })),
        profileType: detectedProfileType
      };

      console.log('Calling ai-career-assessment function with payload:', requestPayload);

      const response = await supabase.functions.invoke('ai-career-assessment', {
        body: requestPayload
      });

      console.log('Edge function response:', response);

      if (response.error) {
        console.error('Edge function error:', response.error);
        throw new Error(response.error.message || 'Failed to process assessment');
      }

      console.log('Recommendations generated successfully:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Recommendations processing completed:', data);
      setRecommendations(data.recommendations || []);
      queryClient.invalidateQueries({ queryKey: ['career-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['assessment-history'] });
      toast({
        title: "Assessment Complete!",
        description: "Your personalized career recommendations are ready.",
      });
    },
    onError: (error) => {
      console.error('Error processing assessment:', error);
      toast({
        title: "Processing Error",
        description: `Failed to generate recommendations: ${error.message}. Please try again.`,
        variant: "destructive",
      });
    }
  });

  const handleAnswer = useCallback((answer: string | string[] | number) => {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    if (!currentQuestion) {
      console.error('No current question available');
      return;
    }

    console.log('Handling answer for question:', currentQuestion.id, 'Answer:', answer);

    const newResponse: QuestionResponse = {
      questionId: currentQuestion.id,
      answer,
      timestamp: new Date().toISOString()
    };

    // Update responses
    const updatedResponses = responses.filter(r => r.questionId !== currentQuestion.id);
    updatedResponses.push(newResponse);
    setResponses(updatedResponses);
    
    console.log('Updated responses count:', updatedResponses.length);

    // Save to database if assessment exists
    if (assessmentId) {
      saveResponse.mutate({ questionId: currentQuestion.id, answer });
    } else {
      console.warn('Cannot save response: Assessment not created yet');
    }

    // Auto-advance to next question
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      console.log('Advancing to next question:', currentQuestionIndex + 1);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      console.log('Reached last question');
    }
  }, [currentQuestionIndex, filteredQuestions, responses, assessmentId, saveResponse]);

  const resetAssessment = useCallback(() => {
    console.log('Resetting assessment');
    setCurrentQuestionIndex(0);
    setResponses([]);
    setAssessmentId(null);
    setRecommendations([]);
    setDetectedProfileType(null);
    setProfileDetectionCompleted(false);
  }, []);

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;
  const canProceed = responses.some(r => r.questionId === currentQuestion?.id);
  const progress = filteredQuestions.length > 0 ? ((currentQuestionIndex + 1) / filteredQuestions.length) * 100 : 0;

  // Add assessment ready state
  const isAssessmentReady = Boolean(assessmentId && filteredQuestions.length > 0);

  console.log('Assessment Flow State:', {
    currentQuestionIndex,
    filteredQuestionsCount: filteredQuestions.length,
    allQuestionsCount: allQuestions.length,
    responsesCount: responses.length,
    assessmentId,
    detectedProfileType,
    profileDetectionCompleted,
    isLastQuestion,
    isAssessmentReady,
    progress
  });

  return {
    // State
    questions: filteredQuestions,
    currentQuestion,
    currentQuestionIndex,
    responses,
    recommendations,
    assessmentId,
    detectedProfileType,
    profileDetectionCompleted,
    isLastQuestion,
    canProceed,
    progress,
    isAssessmentReady,
    
    // Loading states
    isLoading,
    isGenerating: generateRecommendations.isPending,
    isCreatingAssessment: createAssessment.isPending,
    
    // Actions
    handleAnswer,
    generateRecommendations: generateRecommendations.mutate,
    resetAssessment,
  };
};
