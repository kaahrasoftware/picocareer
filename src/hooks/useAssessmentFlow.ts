
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AssessmentQuestion, QuestionResponse, AssessmentResult } from '@/types/assessment';

export const useAssessmentFlow = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch assessment questions
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['assessment-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      
      if (error) throw error;
      return data as AssessmentQuestion[];
    }
  });

  // Create new assessment
  const createAssessment = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('career_assessments')
        .insert({
          user_id: user.id,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setAssessmentId(data.id);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start assessment. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating assessment:', error);
    }
  });

  // Save individual response
  const saveResponse = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: any }) => {
      if (!assessmentId) throw new Error('No active assessment');

      const { error } = await supabase
        .from('assessment_responses')
        .upsert({
          assessment_id: assessmentId,
          question_id: questionId,
          answer: JSON.stringify(answer)
        });

      if (error) throw error;
    },
    onError: (error) => {
      console.error('Error saving response:', error);
    }
  });

  // Process assessment with AI
  const processAssessment = useMutation({
    mutationFn: async () => {
      if (!assessmentId || responses.length === 0) {
        throw new Error('Invalid assessment data');
      }

      const response = await supabase.functions.invoke('ai-career-assessment', {
        body: {
          assessmentId,
          responses: responses.map(r => ({
            questionId: r.questionId,
            answer: r.answer
          }))
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to process assessment');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['assessment-history'] });
      toast({
        title: "Assessment Complete!",
        description: "Your personalized career recommendations are ready.",
      });
    },
    onError: (error) => {
      toast({
        title: "Processing Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
      console.error('Error processing assessment:', error);
    }
  });

  const startAssessment = useCallback(() => {
    if (!assessmentId) {
      createAssessment.mutate();
    }
    setCurrentQuestionIndex(0);
    setResponses([]);
  }, [assessmentId, createAssessment]);

  const answerQuestion = useCallback((answer: string | string[] | number) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const newResponse: QuestionResponse = {
      questionId: currentQuestion.id,
      answer,
      timestamp: new Date().toISOString()
    };

    // Update responses
    const updatedResponses = responses.filter(r => r.questionId !== currentQuestion.id);
    updatedResponses.push(newResponse);
    setResponses(updatedResponses);

    // Save to database
    if (assessmentId) {
      saveResponse.mutate({ questionId: currentQuestion.id, answer });
    }
  }, [currentQuestionIndex, questions, responses, assessmentId, saveResponse]);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);

  const completeAssessment = useCallback(() => {
    if (responses.length === questions.length) {
      processAssessment.mutate();
    }
  }, [responses.length, questions.length, processAssessment]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canProceed = responses.some(r => r.questionId === currentQuestion?.id);
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return {
    // State
    questions,
    currentQuestion,
    currentQuestionIndex,
    responses,
    assessmentId,
    isLastQuestion,
    canProceed,
    progress,
    
    // Loading states
    isLoading,
    isCreating: createAssessment.isPending,
    isSaving: saveResponse.isPending,
    isProcessing: processAssessment.isPending,
    
    // Actions
    startAssessment,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    completeAssessment,
  };
};
