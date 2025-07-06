
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AssessmentQuestion, QuestionResponse, CareerRecommendation, AssessmentResult, ProfileType } from '@/types/assessment';
import { useToast } from '@/hooks/use-toast';

export const useAssessmentFlow = () => {
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [detectedProfileType, setDetectedProfileType] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const { data: questions, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;

      if (questions && questions.length > 0) {
        // Transform database question to match our type
        const transformedQuestion: AssessmentQuestion = {
          id: questions[0].id,
          title: questions[0].title,
          description: questions[0].description,
          type: questions[0].type as 'multiple_choice' | 'multiple_select' | 'scale' | 'text',
          options: questions[0].options as string[] | undefined,
          order: questions[0].order_index,
          isRequired: questions[0].is_required,
          profileType: questions[0].profile_type as string[] | undefined,
          targetAudience: questions[0].target_audience as string[] | undefined,
          prerequisites: questions[0].prerequisites,
          conditionalLogic: questions[0].conditional_logic
        };
        
        setCurrentQuestion(transformedQuestion);
        setTotalQuestions(questions.length);
        setIsLastQuestion(questions.length === 1);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load assessment questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startAssessment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to start the assessment.",
          variant: "destructive",
        });
        return;
      }

      const { data: assessment, error } = await supabase
        .from('career_assessments')
        .insert({
          user_id: user.id,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentAssessmentId(assessment.id);
      setHasStarted(true);
      
      toast({
        title: "Assessment Started",
        description: "Good luck! Take your time with each question.",
      });
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast({
        title: "Error",
        description: "Failed to start assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnswer = async (answer: string | string[] | number) => {
    if (!currentQuestion || !currentAssessmentId) return;

    const newResponse: QuestionResponse = {
      questionId: currentQuestion.id,
      answer,
      timestamp: new Date().toISOString(),
    };

    try {
      await supabase
        .from('assessment_responses')
        .insert({
          assessment_id: currentAssessmentId,
          question_id: currentQuestion.id,
          answer: answer
        });

      const updatedResponses = [...responses, newResponse];
      setResponses(updatedResponses);

      const { data: questions } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (questions && currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        const nextQuestion = questions[nextIndex];
        
        // Transform database question to match our type
        const transformedQuestion: AssessmentQuestion = {
          id: nextQuestion.id,
          title: nextQuestion.title,
          description: nextQuestion.description,
          type: nextQuestion.type as 'multiple_choice' | 'multiple_select' | 'scale' | 'text',
          options: nextQuestion.options as string[] | undefined,
          order: nextQuestion.order_index,
          isRequired: nextQuestion.is_required,
          profileType: nextQuestion.profile_type as string[] | undefined,
          targetAudience: nextQuestion.target_audience as string[] | undefined,
          prerequisites: nextQuestion.prerequisites,
          conditionalLogic: nextQuestion.conditional_logic
        };
        
        setCurrentQuestion(transformedQuestion);
        setCurrentQuestionIndex(nextIndex);
        setIsLastQuestion(nextIndex === questions.length - 1);
      }
    } catch (error) {
      console.error('Error saving response:', error);
      toast({
        title: "Error",
        description: "Failed to save your response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const completeAssessment = async () => {
    if (!currentAssessmentId) return;

    setIsGenerating(true);
    
    try {
      console.log('Completing assessment with responses:', responses);

      // Generate AI recommendations
      const { data, error } = await supabase.functions.invoke('ai-career-assessment', {
        body: { responses }
      });

      if (error) {
        console.error('Error calling AI function:', error);
        throw error;
      }

      console.log('AI function response:', data);

      if (!data?.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error('Invalid response format from AI service');
      }

      const aiRecommendations = data.recommendations;

      // Save recommendations to database
      const recommendationsToInsert = aiRecommendations.map((rec: any) => ({
        assessment_id: currentAssessmentId,
        title: rec.title || 'Untitled Career',
        description: rec.description || '',
        match_score: Math.round(rec.matchScore || 0),
        reasoning: rec.reasoning || '',
        salary_range: rec.salaryRange || null,
        growth_outlook: rec.growthOutlook || null,
        time_to_entry: rec.timeToEntry || null,
        required_skills: rec.requiredSkills || [],
        education_requirements: rec.educationRequirements || [],
        work_environment: rec.workEnvironment || null,
        career_id: null // We'll implement career matching later if needed
      }));

      console.log('Inserting recommendations:', recommendationsToInsert);

      const { error: insertError } = await supabase
        .from('career_recommendations')
        .insert(recommendationsToInsert);

      if (insertError) {
        console.error('Error saving recommendations:', insertError);
        // Don't throw here - we still want to show results even if saving fails
        toast({
          title: "Warning",
          description: "Recommendations generated but not saved. You may need to retake the assessment.",
          variant: "destructive",
        });
      } else {
        console.log('Successfully saved recommendations to database');
      }

      // Update assessment status
      await supabase
        .from('career_assessments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', currentAssessmentId);

      // Transform AI recommendations to match our CareerRecommendation type
      const transformedRecommendations: CareerRecommendation[] = aiRecommendations.map((rec: any) => ({
        careerId: rec.careerId || null,
        title: rec.title || 'Untitled Career',
        description: rec.description || '',
        matchScore: Math.round(rec.matchScore || 0),
        reasoning: rec.reasoning || '',
        salaryRange: rec.salaryRange,
        growthOutlook: rec.growthOutlook,
        timeToEntry: rec.timeToEntry,
        requiredSkills: rec.requiredSkills || [],
        educationRequirements: rec.educationRequirements || [],
        workEnvironment: rec.workEnvironment,
        relatedCareers: rec.relatedCareers || []
      }));

      setRecommendations(transformedRecommendations);
      setShowResults(true);

      toast({
        title: "Assessment Complete!",
        description: `Generated ${transformedRecommendations.length} personalized career recommendations.`,
      });

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
    setRecommendations([]);
    setDetectedProfileType(null);
    setShowResults(false);
    setHasStarted(false);
    setCurrentAssessmentId(null);
    
    const firstQuestion = currentQuestion;
    if (firstQuestion) {
      setCurrentQuestion(firstQuestion);
      setIsLastQuestion(totalQuestions === 1);
    }
    
    loadQuestions();
  };

  const viewHistory = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your assessment history.",
          variant: "destructive",
        });
        return;
      }

      // Get the latest completed assessment with its recommendations
      const { data: latestAssessment, error } = await supabase
        .from('career_assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading assessment:', error);
        toast({
          title: "No History Found",
          description: "You haven't completed any assessments yet.",
        });
        return;
      }

      if (latestAssessment) {
        // Get the recommendations for this assessment
        const { data: savedRecommendations, error: recError } = await supabase
          .from('career_recommendations')
          .select('*')
          .eq('assessment_id', latestAssessment.id);

        if (recError) {
          console.error('Error loading recommendations:', recError);
          toast({
            title: "Error",
            description: "Failed to load assessment recommendations.",
            variant: "destructive",
          });
          return;
        }

        if (savedRecommendations && savedRecommendations.length > 0) {
          const transformedRecommendations: CareerRecommendation[] = savedRecommendations.map((rec: any) => ({
            careerId: rec.career_id,
            title: rec.title,
            description: rec.description,
            matchScore: rec.match_score,
            reasoning: rec.reasoning,
            salaryRange: rec.salary_range,
            growthOutlook: rec.growth_outlook,
            timeToEntry: rec.time_to_entry,
            requiredSkills: rec.required_skills || [],
            educationRequirements: rec.education_requirements || [],
            workEnvironment: rec.work_environment,
            relatedCareers: []
          }));

          setRecommendations(transformedRecommendations);
          setShowResults(true);
          setHasStarted(true);
        } else {
          toast({
            title: "No Recommendations Found",
            description: "No recommendations found for your latest assessment.",
          });
        }
      } else {
        toast({
          title: "No History Found",
          description: "You haven't completed any assessments yet.",
        });
      }
    } catch (error) {
      console.error('Error loading assessment history:', error);
      toast({
        title: "Error",
        description: "Failed to load assessment history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
    handleAnswer,
    completeAssessment,
    retakeAssessment,
    startAssessment,
    viewHistory
  };
};
