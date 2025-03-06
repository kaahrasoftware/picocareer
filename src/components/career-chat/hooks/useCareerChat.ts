
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
      setIsSessionComplete(isComplete);
    }
  }, [isLoading, getCurrentCategory, getProgress, isComplete]);

  // Check if we need to send the first question
  useEffect(() => {
    const checkAndSendFirstQuestion = async () => {
      if (!isLoading && sessionId && messages.length <= 1) {
        // This is a new session, send the first question
        try {
          const welcomeMessage = {
            id: uuidv4(),
            session_id: sessionId,
            message_type: 'system',
            content: "Hi there! I'm your Career Assistant. I'll ask you a series of questions about your education, skills, work preferences, and goals to help suggest career paths that might be a good fit for you. Let's get started!",
            metadata: {},
            created_at: new Date().toISOString()
          };
          
          await addMessage(welcomeMessage);
          
          // Add a small delay before sending the first question for a better UX
          setTimeout(async () => {
            const questionMessage = createQuestionMessage(sessionId);
            await addMessage(questionMessage);
          }, 1000);
        } catch (error) {
          console.error('Error sending first question:', error);
        }
      }
    };
    
    checkAndSendFirstQuestion();
  }, [isLoading, sessionId, messages.length, addMessage, createQuestionMessage]);

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
    if (!message.trim() || !sessionId || isSessionComplete) return;
    
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
        setIsSessionComplete(true);
        setCurrentCategory('complete');
        setQuestionProgress(100);
        
        // Update session metadata
        updateSessionMetadata({
          isComplete: true,
          overallProgress: 100,
          lastCategory: 'complete'
        });
      } else {
        // Process the user message but don't need to call API for most responses
        // Just save the user's answer and advance to the next question
        
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
          
          // Update session metadata
          updateSessionMetadata({
            isComplete: true,
            overallProgress: 100,
            lastCategory: 'complete'
          });
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
    addMessage
  ]);

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
    isSessionComplete
  };
}
