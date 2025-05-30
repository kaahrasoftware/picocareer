
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { CareerChatMessage, ChatSessionMetadata } from '@/types/database/analytics';
import { callCareerChatAI, generateCareerRecommendations, AIResponseData } from '../../services/aiChatService';

interface UseEnhancedMessageSenderProps {
  sessionId: string | null;
  messages: CareerChatMessage[];
  isSessionComplete: boolean;
  setInputMessage: (message: string) => void;
  setIsTyping: (typing: boolean) => void;
  addMessage: (message: CareerChatMessage) => Promise<CareerChatMessage | null>;
  updateSessionTitle: (sessionId: string, title: string) => void;
  updateSessionMetadata: (metadata: Partial<ChatSessionMetadata>) => void;
  sessionMetadata: ChatSessionMetadata | null;
  setIsSessionComplete: (complete: boolean) => void;
  setCurrentCategory: (category: string | null) => void;
  setQuestionProgress: (progress: number) => void;
  endCurrentSession: () => Promise<void>;
}

export function useEnhancedMessageSender({
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
  endCurrentSession
}: UseEnhancedMessageSenderProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Categories and their question limits
  const categories = ['education', 'skills', 'workstyle', 'goals'];
  const questionsPerCategory = 6;
  const totalQuestions = categories.length * questionsPerCategory;

  const getCurrentCategory = () => {
    const questionCounts = sessionMetadata?.questionCounts || {
      education: 0,
      skills: 0,
      workstyle: 0,
      goals: 0
    };

    // Find the category with the least questions answered
    for (const category of categories) {
      if ((questionCounts[category] || 0) < questionsPerCategory) {
        return category;
      }
    }
    
    return 'complete';
  };

  const getQuestionCount = (category: string) => {
    const questionCounts = sessionMetadata?.questionCounts || {
      education: 0,
      skills: 0,
      workstyle: 0,
      goals: 0
    };
    return questionCounts[category] || 0;
  };

  const calculateProgress = () => {
    const questionCounts = sessionMetadata?.questionCounts || {
      education: 0,
      skills: 0,
      workstyle: 0,
      goals: 0
    };

    const totalAnswered = Object.values(questionCounts).reduce((sum, count) => sum + count, 0);
    return Math.min(Math.round((totalAnswered / totalQuestions) * 100), 100);
  };

  const shouldGenerateRecommendations = () => {
    const questionCounts = sessionMetadata?.questionCounts || {
      education: 0,
      skills: 0,
      workstyle: 0,
      goals: 0
    };

    // Generate recommendations when we have at least 4 questions in each category
    return categories.every(category => (questionCounts[category] || 0) >= 4);
  };

  const processAIResponse = async (aiResponse: AIResponseData) => {
    if (!sessionId) return;

    let messageType: CareerChatMessage['message_type'] = 'bot';
    let content = '';
    let metadata: any = {};

    if (aiResponse.type === 'question') {
      content = aiResponse.content.question || 'What would you like to share next?';
      metadata = {
        structuredMessage: aiResponse,
        category: aiResponse.metadata?.category,
        hasOptions: false
      };
    } else if (aiResponse.type === 'recommendation' || aiResponse.type === 'session_end') {
      messageType = 'session_end';
      content = aiResponse.content.message || 'Thank you for completing the assessment!';
      metadata = {
        rawResponse: aiResponse,
        isSessionEnd: true,
        suggestions: aiResponse.content.suggestions || []
      };
    }

    const aiMessage: CareerChatMessage = {
      id: uuidv4(),
      session_id: sessionId,
      message_type: messageType,
      content,
      metadata,
      created_at: new Date().toISOString()
    };

    await addMessage(aiMessage);
  };

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId) return;
    
    // Handle completed sessions
    if (isSessionComplete) {
      const isCareerExploreRequest = message.toLowerCase().includes('tell me more about') || 
                                    (message.toLowerCase().includes('explore') && 
                                     message.toLowerCase().includes('career'));
      
      const isNewAssessmentRequest = message.toLowerCase().includes('start') && 
                                    (message.toLowerCase().includes('new') || 
                                     message.toLowerCase().includes('assessment'));
      
      if (!isCareerExploreRequest && !isNewAssessmentRequest) {
        toast.info("This assessment is complete. You can explore specific careers or start a new assessment.");
        return;
      }
      
      if (isNewAssessmentRequest) {
        await handleStartNewChat();
        return;
      }
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

    try {
      await addMessage(userMessage);
      setInputMessage('');
      setIsTyping(true);
      
      // Update session title if needed
      if (!sessionMetadata?.title && messages.length <= 3) {
        const suggestedTitle = message.slice(0, 30) + '...';
        updateSessionTitle(sessionId, suggestedTitle);
      }

      const currentCategory = getCurrentCategory();
      const questionCount = getQuestionCount(currentCategory);

      // Check if we should generate recommendations
      if (shouldGenerateRecommendations()) {
        setIsAnalyzing(true);
        
        try {
          const recommendationResponse = await generateCareerRecommendations({
            sessionId,
            messages: [...messages, userMessage]
          });
          
          await processAIResponse(recommendationResponse);
          
          // Mark session as complete
          setIsSessionComplete(true);
          setCurrentCategory('complete');
          setQuestionProgress(100);
          
          await updateSessionMetadata({
            isComplete: true,
            overallProgress: 100,
            lastCategory: 'complete',
            completedAt: new Date().toISOString()
          });
          
          await endCurrentSession();
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        // Regular question flow
        try {
          const aiResponse = await callCareerChatAI({
            sessionId,
            messages: [...messages, userMessage],
            userMessage: message.trim(),
            currentCategory,
            questionCount: questionCount + 1
          });
          
          await processAIResponse(aiResponse);
          
          // Update question counts and progress
          const updatedQuestionCounts: {[key: string]: number; education: number; skills: number; workstyle: number; goals: number} = {
            education: (sessionMetadata?.questionCounts?.education || 0),
            skills: (sessionMetadata?.questionCounts?.skills || 0),
            workstyle: (sessionMetadata?.questionCounts?.workstyle || 0),
            goals: (sessionMetadata?.questionCounts?.goals || 0),
            [currentCategory]: questionCount + 1
          };
          
          const newProgress = calculateProgress();
          const newCategory = getCurrentCategory();
          
          setCurrentCategory(newCategory);
          setQuestionProgress(newProgress);
          
          await updateSessionMetadata({
            questionCounts: updatedQuestionCounts,
            lastCategory: newCategory,
            overallProgress: newProgress
          });
        } catch (error) {
          console.error('Error processing AI response:', error);
          
          // Fallback message
          const fallbackMessage: CareerChatMessage = {
            id: uuidv4(),
            session_id: sessionId,
            message_type: 'system',
            content: "I'm sorry, I encountered an error. Could you please try again?",
            metadata: { error: true },
            created_at: new Date().toISOString()
          };
          
          await addMessage(fallbackMessage);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsTyping(false);
    }
  }, [
    sessionId,
    isSessionComplete,
    messages,
    sessionMetadata,
    setInputMessage,
    setIsTyping,
    addMessage,
    updateSessionTitle,
    updateSessionMetadata,
    setIsSessionComplete,
    setCurrentCategory,
    setQuestionProgress,
    endCurrentSession
  ]);

  const handleStartNewChat = async () => {
    try {
      setIsTyping(true);
      toast.success("Starting new assessment...");
      
      // This would trigger the session restart logic
      window.location.reload();
    } catch (error) {
      console.error("Error starting new chat:", error);
      toast.error("Failed to start a new assessment.");
    } finally {
      setIsTyping(false);
    }
  };

  return {
    sendMessage,
    handleStartNewChat,
    isAnalyzing
  };
}
