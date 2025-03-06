
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
    advanceQuestion, 
    createQuestionMessage,
    isComplete
  } = useStructuredQuestions();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasConfigError, setHasConfigError] = useState(false);
  const [questionProgress, setQuestionProgress] = useState(0);
  
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
      // Check if we need to generate recommendations after a certain number of questions
      if (getProgress() >= 90 && !isAnalyzing) {
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
        
        setCurrentCategory(newCategory);
        setQuestionProgress(newProgress);
        
        // Update session metadata
        updateSessionMetadata({
          lastCategory: newCategory,
          overallProgress: newProgress
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
    getProgress, 
    isAnalyzing, 
    analyzeResponses, 
    messages, 
    updateSessionMetadata, 
    sessionMetadata, 
    updateSessionTitle, 
    advanceQuestion, 
    getCurrentCategory, 
    createQuestionMessage, 
    addMessage,
    endCurrentSession
  ]);

  // Create a dedicated function for starting a new chat
  const handleStartNewChat = async () => {
    try {
      setIsTyping(true);
      await startNewSession();
      
      // We need to initialize the session with a welcome message
      // This runs after startNewSession has created a new session and set sessionId
      setTimeout(async () => {
        if (sessionId) {
          // Welcome message
          const welcomeMessage = {
            id: uuidv4(),
            session_id: sessionId,
            message_type: 'system',
            content: "Hi there! I'm your Career Assistant. I'll ask you a series of questions about your education, skills, work preferences, and goals to help suggest career paths that might be a good fit for you. Let's get started!",
            metadata: {},
            created_at: new Date().toISOString()
          };
          
          await addMessage(welcomeMessage);
          
          // Add a small delay before sending the first question
          setTimeout(async () => {
            if (sessionId) {
              const questionMessage = createQuestionMessage(sessionId);
              await addMessage(questionMessage);
            }
            setIsTyping(false);
          }, 1000);
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
    handleStartNewChat
  };
}
