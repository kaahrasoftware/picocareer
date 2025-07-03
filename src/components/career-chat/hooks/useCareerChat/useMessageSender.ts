
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { CareerChatMessage, ChatSessionMetadata } from '@/types/database/analytics';
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
          if (sessionId) {
            updateSessionTitle(sessionId, suggestedTitle);
          }
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
      
      // This is just a placeholder for whatever logic your app uses
      // to start a new session - this will be provided by the parent component
      console.log("Starting new session...");
      
      toast.success("New assessment started!");
    } catch (error) {
      console.error("Error starting new chat:", error);
      toast.error("Failed to start a new assessment.");
    } finally {
      setIsTyping(false);
      setIsProcessing(false);
    }
  }, [setIsTyping]);

  return {
    sendMessage,
    handleStartNewChat,
    isAnalyzing
  };
}
