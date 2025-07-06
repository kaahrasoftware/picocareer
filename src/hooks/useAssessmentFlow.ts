
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { detectProfileType, shouldShowQuestion } from '@/utils/profileDetection';
import type { AssessmentQuestion, QuestionResponse, CareerRecommendation, ProfileType } from '@/types/assessment';

type AssessmentStep = 'profile_detection' | 'profile_specific' | 'ai_generation' | 'results';

export const useAssessmentFlow = () => {
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [allQuestions, setAllQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('profile_detection');
  const [stepQuestions, setStepQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [detectedProfileType, setDetectedProfileType] = useState<ProfileType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
  const [showProfileResult, setShowProfileResult] = useState(false);
  const { toast } = useToast();

  // Load questions and create assessment
  useEffect(() => {
    const initializeAssessment = async () => {
      try {
        setIsCreatingAssessment(true);
        
        const { data: questionsData, error: questionsError } = await supabase
          .from('assessment_questions')
          .select('*')
          .eq('is_active', true)
          .order('order_index');

        if (questionsError) {
          console.error('Error fetching questions:', questionsError);
          toast({
            title: "Error",
            description: "Failed to load assessment questions",
            variant: "destructive",
          });
          return;
        }

        console.log('Fetched questions:', questionsData);
        
        if (!questionsData || questionsData.length === 0) {
          toast({
            title: "No Questions Available",
            description: "No assessment questions are currently available",
            variant: "destructive",
          });
          return;
        }

        const transformedQuestions: AssessmentQuestion[] = questionsData.map(q => ({
          id: q.id,
          title: q.title,
          description: q.description,
          type: q.type as 'multiple_choice' | 'multiple_select' | 'scale' | 'text',
          options: Array.isArray(q.options) ? q.options : (q.options ? Object.values(q.options) : []),
          order: q.order_index,
          isRequired: q.is_required,
          profileType: q.profile_type,
          targetAudience: q.target_audience,
          prerequisites: q.prerequisites,
          conditionalLogic: q.conditional_logic
        }));

        setAllQuestions(transformedQuestions);
        
        // Start with profile detection questions (order 1-2)
        const profileDetectionQuestions = transformedQuestions.filter(q => q.order <= 2);
        setStepQuestions(profileDetectionQuestions);
        console.log('Profile detection questions:', profileDetectionQuestions);

        // Create assessment record
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('career_assessments')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            status: 'in_progress'
          })
          .select()
          .single();

        if (assessmentError) {
          console.error('Error creating assessment:', assessmentError);
          toast({
            title: "Error",
            description: "Failed to create assessment",
            variant: "destructive",
          });
          return;
        }

        console.log('Created assessment:', assessmentData);
        setAssessmentId(assessmentData.id);
      } catch (error) {
        console.error('Error initializing assessment:', error);
        toast({
          title: "Error",
          description: "Failed to initialize assessment",
          variant: "destructive",
        });
      } finally {
        setIsCreatingAssessment(false);
      }
    };

    initializeAssessment();
  }, [toast]);

  const proceedToProfileSpecific = useCallback(() => {
    if (!detectedProfileType || !allQuestions.length) return;

    console.log('Proceeding to profile-specific questions for:', detectedProfileType);
    
    // Filter questions for the detected profile type (order 10-42)
    const profileSpecificQuestions = allQuestions.filter(q => 
      q.profileType && 
      q.profileType.includes(detectedProfileType) && 
      q.order >= 10 && 
      q.order <= 42
    ).sort((a, b) => a.order - b.order);
    
    console.log('Profile-specific questions:', profileSpecificQuestions);
    
    setStepQuestions(profileSpecificQuestions);
    setCurrentQuestionIndex(0);
    setCurrentStep('profile_specific');
    setShowProfileResult(false);
  }, [detectedProfileType, allQuestions]);

  const proceedToAiGeneration = useCallback(() => {
    console.log('Proceeding to AI generation with responses:', responses);
    setCurrentStep('ai_generation');
    setIsGenerating(true);
    
    // Auto-start generation
    setTimeout(() => {
      generateRecommendations();
    }, 1000);
  }, [responses]);

  const handleAnswer = useCallback(async (answer: string | string[] | number) => {
    if (!assessmentId || !stepQuestions[currentQuestionIndex]) {
      console.error('No assessment ID or current question available');
      return;
    }

    const currentQuestion = stepQuestions[currentQuestionIndex];
    console.log('Processing answer for question:', currentQuestion.id, 'Answer:', answer);

    const response: QuestionResponse = {
      questionId: currentQuestion.id,
      answer,
      timestamp: new Date().toISOString()
    };

    // Save response to database
    try {
      const { error } = await supabase
        .from('assessment_responses')
        .insert({
          assessment_id: assessmentId,
          question_id: currentQuestion.id,
          answer: answer
        });

      if (error) {
        console.error('Error saving response:', error);
        toast({
          title: "Error",
          description: "Failed to save response",
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      console.error('Error saving response:', error);
      return;
    }

    const newResponses = [...responses, response];
    setResponses(newResponses);

    // Handle step transitions
    if (currentStep === 'profile_detection') {
      // Check if we've completed profile detection (2 questions)
      if (newResponses.length >= 2) {
        console.log('Profile detection completed, detecting profile type...');
        const profileType = detectProfileType(newResponses);
        console.log('Detected profile type:', profileType);
        
        if (profileType) {
          setDetectedProfileType(profileType);
          setShowProfileResult(true);

          // Update assessment with detected profile type
          await supabase
            .from('career_assessments')
            .update({
              detected_profile_type: profileType,
              profile_detection_completed: true
            })
            .eq('id', assessmentId);
        }
        return;
      }
    }

    // Move to next question within current step
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < stepQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      // Completed current step
      if (currentStep === 'profile_specific') {
        proceedToAiGeneration();
      }
    }
  }, [assessmentId, stepQuestions, currentQuestionIndex, responses, currentStep, toast, proceedToAiGeneration]);

  const generateRecommendations = useCallback(async () => {
    if (!assessmentId || responses.length === 0) {
      console.error('No assessment ID or responses available');
      return;
    }

    console.log('Generating recommendations for assessment:', assessmentId);

    try {
      const { data, error } = await supabase.functions.invoke('ai-career-assessment', {
        body: {
          assessmentId,
          responses: responses.map(r => ({
            questionId: r.questionId,
            answer: r.answer
          }))
        }
      });

      if (error) {
        console.error('Error generating recommendations:', error);
        toast({
          title: "Error",
          description: "Failed to generate career recommendations",
          variant: "destructive",
        });
        return;
      }

      console.log('Recommendations generated:', data);
      
      // Fetch the saved recommendations from the database
      const { data: recommendationsData, error: fetchError } = await supabase
        .from('career_recommendations')
        .select('*')
        .eq('assessment_id', assessmentId);

      if (fetchError) {
        console.error('Error fetching recommendations:', fetchError);
        return;
      }

      const transformedRecommendations: CareerRecommendation[] = recommendationsData.map(rec => ({
        careerId: rec.career_id || '',
        title: rec.title,
        description: rec.description,
        matchScore: rec.match_score,
        reasoning: rec.reasoning,
        salaryRange: rec.salary_range,
        growthOutlook: rec.growth_outlook,
        timeToEntry: rec.time_to_entry,
        requiredSkills: rec.required_skills || [],
        educationRequirements: rec.education_requirements || [],
        workEnvironment: rec.work_environment
      }));

      setRecommendations(transformedRecommendations);
      setCurrentStep('results');
    } catch (error) {
      console.error('Error in generateRecommendations:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating recommendations",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [assessmentId, responses, toast]);

  const resetAssessment = useCallback(() => {
    setAssessmentId(null);
    setAllQuestions([]);
    setCurrentStep('profile_detection');
    setStepQuestions([]);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setRecommendations([]);
    setDetectedProfileType(null);
    setIsGenerating(false);
    setShowProfileResult(false);
  }, []);

  const currentQuestion = stepQuestions[currentQuestionIndex] || null;
  const totalQuestionsInStep = stepQuestions.length;
  const stepProgress = totalQuestionsInStep > 0 ? ((currentQuestionIndex + 1) / totalQuestionsInStep) * 100 : 0;
  const isLastQuestionInStep = currentQuestionIndex === totalQuestionsInStep - 1;
  const isAssessmentReady = !isCreatingAssessment && stepQuestions.length > 0;

  return {
    currentStep,
    currentQuestion,
    responses,
    recommendations,
    detectedProfileType,
    showProfileResult,
    isGenerating,
    stepProgress,
    isLastQuestionInStep,
    isAssessmentReady,
    isCreatingAssessment,
    totalQuestionsInStep,
    currentQuestionIndex,
    handleAnswer,
    proceedToProfileSpecific,
    proceedToAiGeneration,
    generateRecommendations,
    resetAssessment
  };
};
