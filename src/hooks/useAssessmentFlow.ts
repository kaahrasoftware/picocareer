import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { detectProfileType, shouldShowQuestion } from '@/utils/profileDetection';
import type { AssessmentQuestion, QuestionResponse, CareerRecommendation, ProfileType } from '@/types/assessment';

export const useAssessmentFlow = () => {
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [allQuestions, setAllQuestions] = useState<AssessmentQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [detectedProfileType, setDetectedProfileType] = useState<ProfileType | null>(null);
  const [profileDetectionCompleted, setProfileDetectionCompleted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
  const { toast } = useToast();

  // Load questions and create assessment
  useEffect(() => {
    const initializeAssessment = async () => {
      try {
        setIsCreatingAssessment(true);
        
        // Fetch questions
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

        // Transform questions to match our interface
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
        
        // Initially show profile detection questions (order 1-2)
        const initialQuestions = transformedQuestions.filter(q => q.order <= 2);
        setFilteredQuestions(initialQuestions);
        console.log('Initial profile detection questions:', initialQuestions);

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

  const handleAnswer = useCallback(async (answer: string | string[] | number) => {
    if (!assessmentId || !filteredQuestions[currentQuestionIndex]) {
      console.error('No assessment ID or current question available');
      return;
    }

    const currentQuestion = filteredQuestions[currentQuestionIndex];
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

    // Check if we need to detect profile type (after first 2 questions)
    if (!profileDetectionCompleted && newResponses.length >= 2) {
      console.log('Attempting profile detection with responses:', newResponses);
      const profileType = detectProfileType(newResponses);
      console.log('Detected profile type:', profileType);
      
      if (profileType) {
        setDetectedProfileType(profileType);
        setProfileDetectionCompleted(true);

        // Update assessment with detected profile type
        await supabase
          .from('career_assessments')
          .update({
            detected_profile_type: profileType,
            profile_detection_completed: true
          })
          .eq('id', assessmentId);

        // Filter questions for the detected profile type - include both profile-specific AND universal questions
        const relevantQuestions = allQuestions.filter(q => 
          shouldShowQuestion(q, profileType, 0)
        ).sort((a, b) => a.order - b.order);
        
        console.log('All relevant questions for', profileType, ':', relevantQuestions);
        setFilteredQuestions(relevantQuestions);
        
        // Find the next question after profile detection (order > 2)
        const nextQuestionIndex = relevantQuestions.findIndex(q => q.order > 2);
        if (nextQuestionIndex !== -1) {
          setCurrentQuestionIndex(nextQuestionIndex);
        } else {
          // If no more questions, we're done
          setCurrentQuestionIndex(relevantQuestions.length);
        }
        return;
      }
    }

    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < filteredQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
    }
  }, [assessmentId, filteredQuestions, currentQuestionIndex, responses, profileDetectionCompleted, allQuestions, toast]);

  const generateRecommendations = useCallback(async () => {
    if (!assessmentId || responses.length === 0) {
      console.error('No assessment ID or responses available');
      return;
    }

    setIsGenerating(true);
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
    setFilteredQuestions([]);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setRecommendations([]);
    setDetectedProfileType(null);
    setProfileDetectionCompleted(false);
    setIsGenerating(false);
  }, []);

  const currentQuestion = filteredQuestions[currentQuestionIndex] || null;
  const progress = filteredQuestions.length > 0 ? ((currentQuestionIndex + 1) / filteredQuestions.length) * 100 : 0;
  const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;
  const isAssessmentReady = !isCreatingAssessment && filteredQuestions.length > 0;

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
