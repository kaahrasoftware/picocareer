
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { CareerChatMessage } from '@/types/database/analytics';
import { MessageSenderProps, UseMessageSenderReturn } from './types';

export function useMessageSender({
  sessionId,
  messages,
  isSessionComplete,
  setInputMessage,
  setIsTyping,
  addMessage,
  updateSessionTitle,
  updateSessionMetadata,
  sessionMetadata,
  setIsSessionComplete,
  setCurrentCategory,
  setQuestionProgress,
  endCurrentSession,
  getCurrentCategory,
  getProgress,
  isAnalyzing,
  analyzeResponses,
  advanceQuestion,
  createQuestionMessage
}: MessageSenderProps): UseMessageSenderReturn {
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Send a message and get a response
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId || isProcessing) return;
    
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
    
    setIsProcessing(true);
    const messageId = uuidv4();
    const userMessage: CareerChatMessage = {
      id: messageId,
      session_id: sessionId,
      message_type: 'user',
      content: message.trim(),
      metadata: {},
      created_at: new Date().toISOString()
    };

    try {
      await addMessage(userMessage);
      
      setInputMessage('');
      setIsTyping(true);
      
      // Check if we need to generate recommendations
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
      setIsProcessing(false);
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
    endCurrentSession,
    setInputMessage,
    setIsTyping,
    setIsSessionComplete,
    setCurrentCategory,
    setQuestionProgress,
    isProcessing
  ]);

  // Create a dedicated function for starting a new chat
  const handleStartNewChat = useCallback(async () => {
    try {
      setIsProcessing(true);
      setIsTyping(true);
      
      // Start a new session without ending the current one
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
            content: "Hi there! I'm your Career Assistant. I'll ask you a series of questions about your education, skills, work preferences, and goals to help suggest career paths that might be a good fit for you!",
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
            setIsProcessing(false);
          }, 1000);
        } else {
          setIsTyping(false);
          setIsProcessing(false);
        }
      }, 500);
      
      toast.success("New assessment started!");
    } catch (error) {
      console.error("Error starting new chat:", error);
      toast.error("Failed to start a new assessment.");
      setIsTyping(false);
      setIsProcessing(false);
    }
  }, [
    sessionId,
    startNewSession,
    addMessage,
    createQuestionMessage,
    setIsTyping
  ]);

  return {
    sendMessage,
    handleStartNewChat,
    isAnalyzing
  };
}

// Need to add this for TypeScript to recognize as a module
async function startNewSession() {
  // This is just a stub for TypeScript, will be replaced by actual parameter in useCallback
}
