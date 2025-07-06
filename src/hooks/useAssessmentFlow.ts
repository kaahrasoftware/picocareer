import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from './useAuthSession';
import { AssessmentQuestion, QuestionResponse, CareerRecommendation, AssessmentResult, ProfileType } from '@/types/assessment';
import { detectProfileType, shouldShowQuestion } from '@/utils/profileDetection';

export const useAssessmentFlow = () => {
  const { session } = useAuthSession();
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [detectedProfileType, setDetectedProfileType] = useState<ProfileType | null>(null);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Load questions on component mount
  useEffect(() => {
    loadQuestions();
  }, []);

  // Filter questions when profile type is detected
  useEffect(() => {
    if (detectedProfileType && questions.length > 0) {
      filterQuestionsForProfile();
    }
  }, [detectedProfileType, questions]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;

      // Transform database questions to match our types
      const transformedQuestions: AssessmentQuestion[] = (data || []).map(q => ({
        id: q.id,
        title: q.title,
        description: q.description || undefined,
        type: q.type as AssessmentQuestion['type'],
        options: Array.isArray(q.options) ? q.options as string[] : undefined,
        order: q.order_index,
        isRequired: q.is_required,
        profileType: q.profile_type || undefined,
        targetAudience: q.target_audience || undefined,
        prerequisites: q.prerequisites || undefined,
        conditionalLogic: q.conditional_logic || undefined
      }));

      setQuestions(transformedQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuestionsForProfile = () => {
    if (!detectedProfileType) return;

    // Get filtered questions based on profile type
    const filteredQuestions = questions.filter(question => 
      shouldShowQuestion(question, detectedProfileType, 0)
    );

    // Ensure we have exactly 8 questions in the right order
    const orderedQuestions = filteredQuestions
      .sort((a, b) => a.order - b.order)
      .slice(0, 8);

    setQuestions(orderedQuestions);
  };

  const startAssessment = async () => {
    console.log('Starting assessment...');
    setHasStarted(true);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setDetectedProfileType(null);
    setRecommendations([]);
    setShowResults(false);
    
    // Create assessment record if user is logged in
    if (session?.user?.id) {
      await createOrUpdateAssessment();
    }
  };

  const viewHistory = async () => {
    console.log('Viewing assessment history...');
    // For now, just show a simple message - this could be expanded to show actual history
    if (!session?.user?.id) {
      alert('Please sign in to view your assessment history.');
      return;
    }
    
    try {
      const { data: assessments, error } = await supabase
        .from('career_assessments')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (assessments && assessments.length > 0) {
        // Load the most recent completed assessment
        const latestAssessment = assessments[0];
        
        // Load responses for this assessment
        const { data: responsesData, error: responsesError } = await supabase
          .from('assessment_responses')
          .select('*')
          .eq('assessment_id', latestAssessment.id);

        if (responsesError) throw responsesError;

        // Load recommendations for this assessment
        const { data: recommendationsData, error: recommendationsError } = await supabase
          .from('career_recommendations')
          .select('*')
          .eq('assessment_id', latestAssessment.id);

        if (recommendationsError) throw recommendationsError;

        // Transform database responses to match our TypeScript interfaces
        const transformedResponses: QuestionResponse[] = (responsesData || []).map(dbResponse => ({
          questionId: dbResponse.question_id,
          answer: dbResponse.answer as string | string[] | number,
          timestamp: dbResponse.created_at
        }));

        // Transform database recommendations to match our TypeScript interfaces
        const transformedRecommendations: CareerRecommendation[] = (recommendationsData || []).map(dbRec => ({
          careerId: dbRec.career_id || dbRec.id,
          title: dbRec.title,
          description: dbRec.description,
          matchScore: dbRec.match_score,
          reasoning: dbRec.reasoning,
          salaryRange: dbRec.salary_range,
          growthOutlook: dbRec.growth_outlook,
          timeToEntry: dbRec.time_to_entry,
          requiredSkills: dbRec.required_skills || [],
          educationRequirements: dbRec.education_requirements || [],
          workEnvironment: dbRec.work_environment
        }));

        // Set the state to show the previous results
        setResponses(transformedResponses);
        setRecommendations(transformedRecommendations);
        setDetectedProfileType(latestAssessment.detected_profile_type);
        setShowResults(true);
        setHasStarted(true);
      } else {
        alert('No previous assessment results found. Take your first assessment!');
      }
    } catch (error) {
      console.error('Error loading assessment history:', error);
      alert('Failed to load assessment history. Please try again.');
    }
  };

  const handleAnswer = async (response: QuestionResponse) => {
    const newResponses = [...responses, response];
    setResponses(newResponses);

    // Detect profile type from first question
    if (currentQuestionIndex === 0 && !detectedProfileType) {
      const profileType = detectProfileType([response]);
      if (profileType) {
        setDetectedProfileType(profileType);
        // Start or update assessment record
        await createOrUpdateAssessment(profileType);
      }
    }

    // Save response to database
    if (assessmentId) {
      await saveResponse(response);
    }

    // Move to next question or complete assessment
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await completeAssessment(newResponses);
    }
  };

  const createOrUpdateAssessment = async (profileType?: ProfileType) => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('career_assessments')
        .insert({
          user_id: session.user.id,
          status: 'in_progress',
          detected_profile_type: profileType || null,
          profile_detection_completed: !!profileType
        })
        .select()
        .single();

      if (error) throw error;
      setAssessmentId(data.id);
    } catch (error) {
      console.error('Error creating assessment:', error);
    }
  };

  const saveResponse = async (response: QuestionResponse) => {
    if (!assessmentId) return;

    try {
      await supabase
        .from('assessment_responses')
        .insert({
          assessment_id: assessmentId,
          question_id: response.questionId,
          answer: response.answer
        });
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const completeAssessment = async (allResponses: QuestionResponse[]) => {
    setIsGenerating(true);
    console.log('Completing assessment with responses:', allResponses);
    console.log('Detected profile type:', detectedProfileType);
    console.log('Assessment ID:', assessmentId);

    try {
      if (!assessmentId) {
        throw new Error('No assessment ID found');
      }

      // Call the AI career assessment edge function
      console.log('Calling ai-career-assessment edge function...');
      const { data: functionResponse, error: functionError } = await supabase.functions.invoke(
        'ai-career-assessment',
        {
          body: {
            assessmentId,
            responses: allResponses,
            profileType: detectedProfileType
          }
        }
      );

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw functionError;
      }

      console.log('Edge function response:', functionResponse);

      if (!functionResponse?.recommendations || !Array.isArray(functionResponse.recommendations)) {
        throw new Error('Invalid response format from AI assessment');
      }

      // Transform AI recommendations to match our interface
      const aiRecommendations: CareerRecommendation[] = functionResponse.recommendations.map((rec: any, index: number) => ({
        careerId: rec.careerId || `ai-${index + 1}`,
        title: rec.title || 'Career Recommendation',
        description: rec.description || 'AI-generated career recommendation',
        matchScore: rec.matchScore || 75,
        reasoning: rec.reasoning || 'Based on your assessment responses',
        salaryRange: rec.salaryRange,
        growthOutlook: rec.growthOutlook,
        timeToEntry: rec.timeToEntry,
        requiredSkills: rec.requiredSkills || [],
        educationRequirements: rec.educationRequirements || [],
        workEnvironment: rec.workEnvironment
      }));

      console.log('Setting AI recommendations:', aiRecommendations);
      setRecommendations(aiRecommendations);

      // Update assessment status
      if (assessmentId) {
        await supabase
          .from('career_assessments')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', assessmentId);
      }

    } catch (error) {
      console.error('Error in AI assessment or fallback to mock:', error);
      
      // Fallback to mock recommendations only if AI fails
      console.log('Using fallback mock recommendations due to error');
      const mockRecommendations: CareerRecommendation[] = [
        {
          careerId: '1',
          title: 'Software Developer',
          description: 'Design and develop software applications',
          matchScore: 85,
          reasoning: 'Based on your interests in technology and problem-solving',
          salaryRange: '$70,000 - $120,000',
          growthOutlook: 'Much faster than average',
          timeToEntry: '2-4 years',
          requiredSkills: ['Programming', 'Problem Solving', 'Critical Thinking'],
          educationRequirements: ['Bachelor\'s degree in Computer Science or related field'],
          workEnvironment: 'Office or remote work environment'
        }
      ];

      setRecommendations(mockRecommendations);

      // Still update assessment status even with fallback
      if (assessmentId) {
        await supabase
          .from('career_assessments')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', assessmentId);
      }
    } finally {
      setIsGenerating(false);
      setShowResults(true);
    }
  };

  const retakeAssessment = () => {
    setCurrentQuestionIndex(0);
    setResponses([]);
    setDetectedProfileType(null);
    setRecommendations([]);
    setAssessmentId(null);
    setShowResults(false);
    setHasStarted(false);
    loadQuestions();
  };

  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex] || null;
  };

  const isLastQuestion = () => {
    return currentQuestionIndex === questions.length - 1;
  };

  return {
    questions,
    currentQuestion: getCurrentQuestion(),
    currentQuestionIndex,
    totalQuestions: questions.length,
    responses,
    detectedProfileType,
    recommendations,
    isLoading,
    isGenerating,
    showResults,
    hasStarted,
    isLastQuestion: isLastQuestion(),
    handleAnswer,
    completeAssessment: () => completeAssessment(responses),
    retakeAssessment,
    startAssessment,
    viewHistory
  };
};
