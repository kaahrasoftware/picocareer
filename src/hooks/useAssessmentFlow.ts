
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { detectProfileType, shouldShowQuestion } from '@/utils/profileDetection';
import type { AssessmentQuestion, QuestionResponse, ProfileType, DatabaseAssessmentQuestion } from '@/types/assessment';

export const useAssessmentFlow = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [allQuestions, setAllQuestions] = useState<AssessmentQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<AssessmentQuestion[]>([]);
  const [recommendations, setRecommendations] = useState([]);
  const [detectedProfileType, setDetectedProfileType] = useState<ProfileType | null>(null);
  const [profileDetectionCompleted, setProfileDetectionCompleted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAssessmentReady, setIsAssessmentReady] = useState(false);
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all assessment questions
  const fetchQuestions = useCallback(async () => {
    try {
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
      
      // Map database fields to AssessmentQuestion interface with safe property access
      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        options: item.options as string[],
        order: item.order_index,
        isRequired: item.is_required,
        profileType: item.profile_type || [],
        targetAudience: item.target_audience || [],
        prerequisites: item.prerequisites,
        conditionalLogic: item.conditional_logic
      })) as AssessmentQuestion[];
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      throw error;
    }
  }, []);

  // Filter questions based on profile type
  const filterQuestionsForProfile = useCallback((questions: AssessmentQuestion[], profileType: ProfileType | null) => {
    console.log('Filtering questions for profile:', profileType);
    
    return questions.filter((question, index) => 
      shouldShowQuestion(question, profileType, index)
    ).sort((a, b) => a.order - b.order);
  }, []);

  // Create assessment
  const createAssessment = useCallback(async () => {
    if (assessmentId) return assessmentId;
    
    setIsCreatingAssessment(true);
    try {
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

      console.log('Created assessment:', data.id);
      setAssessmentId(data.id);
      return data.id;
    } catch (error) {
      console.error('Failed to create assessment:', error);
      toast({
        title: "Error",
        description: "Failed to create assessment. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreatingAssessment(false);
    }
  }, [assessmentId, toast]);

  // Update assessment with profile type
  const updateAssessmentProfile = useCallback(async (profileType: ProfileType) => {
    if (!assessmentId) return;

    try {
      console.log('Updating assessment with profile type:', profileType);
      
      // Direct update with proper error handling
      const { error } = await supabase
        .from('career_assessments')
        .update({
          detected_profile_type: profileType as any,
          profile_detection_completed: true as any
        } as any)
        .eq('id', assessmentId);

      if (error) {
        console.error('Error updating assessment profile:', error);
        throw error;
      }
      
      console.log('Assessment profile updated successfully');
    } catch (error) {
      console.error('Failed to update assessment profile:', error);
      // Don't throw here to prevent blocking the flow
    }
  }, [assessmentId]);

  // Initialize assessment
  useEffect(() => {
    const initializeAssessment = async () => {
      try {
        console.log('Initializing assessment...');
        const questions = await fetchQuestions();
        setAllQuestions(questions);
        
        // Show initial profile detection questions
        const initialQuestions = filterQuestionsForProfile(questions, null);
        setFilteredQuestions(initialQuestions);
        
        await createAssessment();
        setIsAssessmentReady(true);
        console.log('Assessment initialization complete');
      } catch (error) {
        console.error('Failed to initialize assessment:', error);
        toast({
          title: "Error",
          description: "Failed to initialize assessment. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    initializeAssessment();
  }, [fetchQuestions, filterQuestionsForProfile, createAssessment, toast]);

  // Handle answer submission
  const handleAnswer = useCallback(async (answer: string | string[] | number) => {
    if (!filteredQuestions[currentQuestionIndex]) return;

    const currentQuestion = filteredQuestions[currentQuestionIndex];
    const newResponse: QuestionResponse = {
      questionId: currentQuestion.id,
      answer,
      timestamp: new Date().toISOString(),
    };

    console.log('Recording answer:', newResponse);

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Detect profile type after first few questions
    if (!profileDetectionCompleted && updatedResponses.length >= 2) {
      const profileType = detectProfileType(updatedResponses);
      console.log('Detected profile type:', profileType);
      
      if (profileType) {
        setDetectedProfileType(profileType);
        setProfileDetectionCompleted(true);
        
        // Update assessment in database
        await updateAssessmentProfile(profileType);
        
        // Re-filter questions based on detected profile
        const newFilteredQuestions = filterQuestionsForProfile(allQuestions, profileType);
        setFilteredQuestions(newFilteredQuestions);
        
        console.log('Updated questions for profile:', newFilteredQuestions.length);
      }
    }

    // Move to next question
    setCurrentQuestionIndex(prev => prev + 1);
  }, [
    filteredQuestions,
    currentQuestionIndex,
    responses,
    profileDetectionCompleted,
    allQuestions,
    filterQuestionsForProfile,
    updateAssessmentProfile
  ]);

  // Generate recommendations
  const generateRecommendations = useCallback(async () => {
    if (!assessmentId || responses.length === 0) {
      toast({
        title: "Error",
        description: "No responses to analyze. Please complete the assessment.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating recommendations for assessment:', assessmentId);
      
      const { data, error } = await supabase.functions.invoke('generate-career-recommendations', {
        body: {
          assessmentId,
          responses,
          detectedProfileType
        }
      });

      if (error) throw error;

      console.log('Generated recommendations:', data?.recommendations?.length || 0);
      setRecommendations(data?.recommendations || []);

      // Update assessment status
      await supabase
        .from('career_assessments')
        .update({ 
          status: 'completed' as any,
          completed_at: new Date().toISOString() as any
        } as any)
        .eq('id', assessmentId);

    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [assessmentId, responses, detectedProfileType, toast]);

  // Reset assessment
  const resetAssessment = useCallback(() => {
    setCurrentQuestionIndex(0);
    setResponses([]);
    setRecommendations([]);
    setDetectedProfileType(null);
    setProfileDetectionCompleted(false);
    setIsGenerating(false);
    setAssessmentId(null);
    setIsAssessmentReady(false);
    
    // Re-filter questions to show initial profile detection questions
    const initialQuestions = filterQuestionsForProfile(allQuestions, null);
    setFilteredQuestions(initialQuestions);
  }, [allQuestions, filterQuestionsForProfile]);

  // Calculate progress
  const progress = filteredQuestions.length > 0 
    ? Math.min((currentQuestionIndex / filteredQuestions.length) * 100, 100)
    : 0;

  const currentQuestion = filteredQuestions[currentQuestionIndex] || null;
  const isLastQuestion = currentQuestionIndex >= filteredQuestions.length - 1;

  return {
    currentQuestion,
    responses,
    recommendations,
    detectedProfileType,
    profileDetectionCompleted,
    isGenerating,
    progress,
    isLastQuestion,
    isAssessmentReady,
    isCreatingAssessment,
    handleAnswer,
    generateRecommendations,
    resetAssessment
  };
};
