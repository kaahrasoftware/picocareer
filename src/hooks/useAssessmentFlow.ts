
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { detectProfileType, shouldShowQuestion } from '@/utils/profileDetection';
import type { AssessmentQuestion, QuestionResponse, CareerRecommendation, ProfileType } from '@/types/assessment';

interface AssessmentState {
  assessmentId: string | null;
  currentQuestionIndex: number;
  responses: QuestionResponse[];
  selectedProfileType: ProfileType | null;
  isComplete: boolean;
  isGenerating: boolean;
}

export const useAssessmentFlow = () => {
  const queryClient = useQueryClient();
  
  const [state, setState] = useState<AssessmentState>({
    assessmentId: null,
    currentQuestionIndex: 0,
    responses: [],
    selectedProfileType: null,
    isComplete: false,
    isGenerating: false,
  });

  // Fetch all questions
  const { data: allQuestions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['assessment-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('is_active', true)
        .order('order_index');
      
      if (error) throw error;
      return data as AssessmentQuestion[];
    },
  });

  // Filter questions based on profile selection
  const filteredQuestions = useMemo(() => {
    if (!allQuestions.length) return [];
    
    const profileQuestion = allQuestions.find(q => q.order_index === 1);
    if (!profileQuestion) return [];
    
    // If no profile selected yet, only show the profile question
    if (!state.selectedProfileType) {
      return [profileQuestion];
    }
    
    // After profile selection, show profile question + universal + profile-specific questions
    const questionSequence = [];
    
    // 1. Profile question (already answered)
    questionSequence.push(profileQuestion);
    
    // 2. Universal question 2
    const universalQ2 = allQuestions.find(q => q.order_index === 2);
    if (universalQ2) questionSequence.push(universalQ2);
    
    // 3. Profile-specific questions (3 questions)
    const profileSpecificQuestions = allQuestions
      .filter(q => 
        q.profile_type?.includes(state.selectedProfileType) && 
        q.order_index >= 10 && 
        q.order_index < 50
      )
      .sort((a, b) => a.order_index - b.order_index)
      .slice(0, 3);
    
    questionSequence.push(...profileSpecificQuestions);
    
    // 4. Universal questions 50-52
    const universalEndQuestions = allQuestions
      .filter(q => 
        q.order_index >= 50 && 
        q.target_audience?.includes('all') &&
        // Handle question 52 profile filtering
        (q.order_index !== 52 || state.selectedProfileType !== 'middle_school')
      )
      .sort((a, b) => a.order_index - b.order_index);
    
    questionSequence.push(...universalEndQuestions);
    
    return questionSequence;
  }, [allQuestions, state.selectedProfileType]);

  const currentQuestion = filteredQuestions[state.currentQuestionIndex] || null;
  const totalQuestions = filteredQuestions.length;
  const isLastQuestion = state.currentQuestionIndex === totalQuestions - 1;

  // Create assessment mutation
  const createAssessmentMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('career_assessments')
        .insert({
          status: 'in_progress',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setState(prev => ({ ...prev, assessmentId: data.id }));
    },
  });

  // Submit response and move to next question
  const handleQuestionResponse = async (response: QuestionResponse) => {
    if (!state.assessmentId) return;

    // Save response to database
    const { error } = await supabase
      .from('assessment_responses')
      .insert({
        assessment_id: state.assessmentId,
        question_id: response.questionId,
        response_value: response.answer,
      });

    if (error) {
      console.error('Error saving response:', error);
      return;
    }

    const updatedResponses = [...state.responses, response];
    
    // Check if this is the profile type question (first question)
    let newProfileType = state.selectedProfileType;
    if (state.currentQuestionIndex === 0 && typeof response.answer === 'string') {
      newProfileType = detectProfileType([response]);
      
      // Update assessment with detected profile
      if (newProfileType) {
        await supabase
          .from('career_assessments')
          .update({ 
            detected_profile_type: newProfileType,
            profile_detection_completed: true 
          })
          .eq('id', state.assessmentId);
      }
    }

    setState(prev => ({
      ...prev,
      responses: updatedResponses,
      selectedProfileType: newProfileType,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
    }));
  };

  // Complete assessment and generate recommendations
  const completeAssessment = async () => {
    if (!state.assessmentId) return;

    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      const { data, error } = await supabase.functions.invoke('ai-career-assessment', {
        body: {
          assessmentId: state.assessmentId,
          responses: state.responses,
        },
      });

      if (error) throw error;

      setState(prev => ({ 
        ...prev, 
        isComplete: true, 
        isGenerating: false 
      }));

      // Refresh recommendations query
      queryClient.invalidateQueries({ queryKey: ['career-recommendations', state.assessmentId] });
      
    } catch (error) {
      console.error('Error completing assessment:', error);
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  // Fetch recommendations
  const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery({
    queryKey: ['career-recommendations', state.assessmentId],
    queryFn: async () => {
      if (!state.assessmentId) return [];
      
      const { data, error } = await supabase
        .from('career_recommendations')
        .select('*')
        .eq('assessment_id', state.assessmentId)
        .order('match_score', { ascending: false });
      
      if (error) throw error;
      return data as CareerRecommendation[];
    },
    enabled: !!state.assessmentId && state.isComplete,
  });

  // Reset assessment
  const resetAssessment = () => {
    setState({
      assessmentId: null,
      currentQuestionIndex: 0,
      responses: [],
      selectedProfileType: null,
      isComplete: false,
      isGenerating: false,
    });
  };

  // Start assessment
  const startAssessment = () => {
    if (!state.assessmentId) {
      createAssessmentMutation.mutate();
    }
  };

  useEffect(() => {
    startAssessment();
  }, []);

  return {
    // State
    currentQuestion,
    currentQuestionIndex: state.currentQuestionIndex,
    totalQuestions,
    responses: state.responses,
    selectedProfileType: state.selectedProfileType,
    isComplete: state.isComplete,
    isGenerating: state.isGenerating,
    isLastQuestion,
    
    // Data
    recommendations,
    
    // Loading states
    isLoading: questionsLoading || createAssessmentMutation.isPending,
    recommendationsLoading,
    
    // Actions
    handleQuestionResponse,
    completeAssessment,
    resetAssessment,
  };
};
