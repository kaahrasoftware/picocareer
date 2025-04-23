import { useState, useRef, useCallback, useEffect } from 'react';
import { useChatSession } from './chat-session'; 
import { useCareerAnalysis } from './useCareerAnalysis';
import { useStructuredQuestions } from './useStructuredQuestions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CareerChatMessage } from '@/types/database/analytics';
import { v4 as uuidv4 } from 'uuid';

export function useCareerChat() {
  const { 
    messages, 
    sessionId, 
    isLoading, 
    addMessage, 
    pastSessions,
    isFetchingPastSessions,
    fetchPastSessions,
    endCurrentSession,
    startNewSession,
    resumeSession,
    deleteSession,
    updateSessionTitle,
    updateSessionMetadata,
    sessionMetadata
  } = useChatSession();
  
  const { isAnalyzing, analyzeResponses } = useCareerAnalysis(sessionId || '', addMessage);
  const { 
    getCurrentCategory,
    getProgress,
    getCurrentCategoryProgress,
    advanceQuestion, 
    createQuestionMessage,
    isComplete,
    shouldCompleteAssessment
  } = useStructuredQuestions();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasConfigError, setHasConfigError] = useState(false);
  const [questionProgress, setQuestionProgress] = useState(0);
  const [shouldShowFirstQuestion, setShouldShowFirstQuestion] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track session state
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Set question progress and category based on the structured questions
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setCurrentCategory(getCurrentCategory());
      setQuestionProgress(getProgress());
      setIsSessionComplete(isComplete || (sessionMetadata?.isComplete === true));
    }
  }, [isLoading, getCurrentCategory, getProgress, isComplete, sessionMetadata]);

  // For API error checking
  useEffect(() => {
    const checkApiConfig = async () => {
      if (!sessionId) return;
      
      try {
        const response = await supabase.functions.invoke('career-chat-ai', {
          body: { type: 'config-check' }
        });
        
        if (response.error || response.data?.error) {
          console.warn('DeepSeek API configuration issue:', response.error || response.data?.error);
          setHasConfigError(true);
        } else {
          setHasConfigError(false);
        }
      } catch (error) {
        console.error('Failed to check API configuration:', error);
      }
    };
    
    checkApiConfig();
  }, [sessionId]);

  // Show first question when shouldShowFirstQuestion state is set
  useEffect(() => {
    if (shouldShowFirstQuestion && sessionId && !isTyping) {
      const sendFirstQuestion = async () => {
        setIsTyping(true);
        try {
          const questionMessage = createQuestionMessage(sessionId);
          await addMessage(questionMessage);
        } finally {
          setIsTyping(false);
          setShouldShowFirstQuestion(false);
        }
      };
      
      sendFirstQuestion();
    }
  }, [shouldShowFirstQuestion, sessionId, addMessage, createQuestionMessage, isTyping]);

  // Handler for starting the assessment after welcome message
  const handleBeginAssessment = async () => {
    if (!sessionId || isTyping) return;
    
    setShouldShowFirstQuestion(true);
  };

  // Process user responses and advance to next question
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId) return;
    
    // Check allowed actions in completed sessions
    if (isSessionComplete) {
      // Allow career exploration requests
      const isCareerExploreRequest = message.toLowerCase().includes('tell me more about') || 
                                    (message.toLowerCase().includes('explore') && 
                                     message.toLowerCase().includes('career'));
      
      // Allow requests to start a new assessment
      const isNewAssessmentRequest = message.toLowerCase().includes('start') && 
                                    (message.toLowerCase().includes('new') || 
                                     message.toLowerCase().includes('assessment'));
      
      // If not an allowed action, show a message and return
      if (!isCareerExploreRequest && !isNewAssessmentRequest) {
        toast.info("This assessment is complete. You can explore specific careers or start a new assessment.");
        return;
      }
      
      // Handle new assessment requests
      if (isNewAssessmentRequest) {
        await handleStartNewChat();
        return;
      }
      
      // For career exploration, continue with sending the message
    }
    
    const messageId = uuidv4();
    const userMessage: CareerChatMessage = {
      id: messageId,
      session_id: sessionId,
      message_type: 'user',
      content: message.trim(),
      metadata: {},
      created_at: new Date().toISOString()
    };

    await addMessage(userMessage);
    
    setInputMessage('');
    setIsTyping(true);
    
    try {
      // Check if we should complete the assessment (for 'goals' category after enough questions)
      const checkCompletion = shouldCompleteAssessment();
      
      if (checkCompletion && !isAnalyzing) {
        // Time to generate recommendations
        await analyzeResponses(messages);
        
        // Mark session as complete
        setIsSessionComplete(true);
        setCurrentCategory('complete');
        setQuestionProgress(100);
        
        // Update session metadata
        await updateSessionMetadata({
          isComplete: true,
          overallProgress: 100,
          lastCategory: 'complete',
          completedAt: new Date().toISOString()
        });
        
        // End the current session in the database
        await endCurrentSession();
      } else {
        // Regular question flow
        // If this is one of the first messages, suggest a title
        if (!sessionMetadata?.title && messages.length <= 3) {
          const suggestedTitle = message.slice(0, 30);
          updateSessionTitle(sessionId, suggestedTitle);
        }
        
        // Wait a moment for a more natural conversation flow
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Move to the next question
        advanceQuestion();
        
        // Update category and progress
        const newCategory = getCurrentCategory();
        const newProgress = getProgress();
        const categoryProgress = getCurrentCategoryProgress();
        
        setCurrentCategory(newCategory);
        setQuestionProgress(newProgress);
        
        // Update session metadata
        updateSessionMetadata({
          lastCategory: newCategory,
          overallProgress: newProgress,
          categoryProgress: categoryProgress
        });
        
        // Send the next question, unless we're at the end
        if (newCategory !== 'complete') {
          const nextQuestionMessage = createQuestionMessage(sessionId);
          await addMessage(nextQuestionMessage);
        } else {
          // Start the recommendation process
          await analyzeResponses(messages);
          setIsSessionComplete(true);
          
          // Update session metadata and end session
          await updateSessionMetadata({
            isComplete: true,
            overallProgress: 100,
            lastCategory: 'complete',
            completedAt: new Date().toISOString()
          });
          
          // End the current session in the database
          await endCurrentSession();
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Failed to get a response. Please try again.');
      
      await addMessage({
        id: uuidv4(),
        session_id: sessionId,
        message_type: 'system',
        content: "I'm sorry, I encountered an error. Please try again.",
        metadata: { error: true },
        created_at: new Date().toISOString()
      });
    } finally {
      setIsTyping(false);
    }
  }, [
    sessionId, 
    isSessionComplete, 
    isAnalyzing, 
    analyzeResponses, 
    messages, 
    updateSessionMetadata, 
    sessionMetadata, 
    updateSessionTitle, 
    advanceQuestion, 
    getCurrentCategory, 
    getCurrentCategoryProgress,
    getProgress, 
    createQuestionMessage, 
    addMessage,
    endCurrentSession,
    shouldCompleteAssessment
  ]);

  // Create a dedicated function for starting a new chat
  const handleStartNewChat = async () => {
    try {
      setIsTyping(true);
      // Start a new session without ending the current one
      await startNewSession();
      
      // Initialize the session with a welcome message
      setTimeout(async () => {
        if (sessionId) {
          // Welcome message
          const welcomeMessage = {
            id: uuidv4(),
            session_id: sessionId,
            message_type: 'system',
            content: "Hi there! I'm your Career Assistant. I'll ask you a series of questions about your education, skills, work preferences, and goals to help suggest career paths that might be a good fit for you.",
            metadata: {
              hasOptions: true,
              suggestions: [
                "Begin Assessment"
              ]
            },
            created_at: new Date().toISOString()
          };
          
          await addMessage(welcomeMessage);
          setIsTyping(false);
        } else {
          setIsTyping(false);
        }
      }, 500);
      
      toast.success("New assessment started!");
    } catch (error) {
      console.error("Error starting new chat:", error);
      toast.error("Failed to start a new assessment.");
      setIsTyping(false);
    }
  };

  // Complete the session
  const completeSession = async () => {
    if (!sessionId) return;

    const updatedMetadata: Partial<ChatSessionMetadata> = {
      isComplete: true,
      completedAt: new Date().toISOString(),
    };
    
    try {
      await updateSessionMetadata(updatedMetadata);
      await endCurrentSession();
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  // Update category progress
  const updateCategoryProgress = (category: string, increment: number = 1) => {
    if (!sessionMetadata) return;
    
    const currentCounts = sessionMetadata.questionCounts || {
      education: 0,
      skills: 0,
      workstyle: 0,
      goals: 0
    };
    
    const updatedCounts = {
      ...currentCounts,
      [category]: (currentCounts[category] || 0) + increment
    };
    
    // Calculate overall progress (simple average for now)
    const categoryKeys = Object.keys(updatedCounts);
    const totalProgress = categoryKeys.reduce((sum, key) => sum + (updatedCounts[key] || 0), 0);
    const overallProgress = Math.min(100, Math.round((totalProgress / (categoryKeys.length * 3)) * 100));
    
    const updatedMetadata: Partial<ChatSessionMetadata> = {
      questionCounts: updatedCounts,
      overallProgress,
      categoryProgress: {
        ...(sessionMetadata.categoryProgress || {}),
        [category]: Math.min(100, ((updatedCounts[category] || 0) / 3) * 100)
      }
    };
    
    updateSessionMetadata(updatedMetadata);
  };

  return {
    messages,
    inputMessage,
    isLoading,
    isTyping,
    isAnalyzing,
    hasConfigError,
    currentCategory,
    questionProgress,
    pastSessions,
    isFetchingPastSessions,
    fetchPastSessions,
    endCurrentSession,
    startNewSession,
    resumeSession,
    deleteSession,
    updateSessionTitle,
    messagesEndRef,
    setInputMessage,
    sendMessage,
    addMessage,
    isSessionComplete,
    handleStartNewChat,
    handleBeginAssessment,
    completeSession,
    updateCategoryProgress
  };
}
