
import { useEffect } from 'react';
import { CareerChatMessage } from "@/types/database/analytics";
import { StructuredMessage } from "@/types/database/message-types";

export function useProgressTracker(
  messages: CareerChatMessage[],
  setCurrentCategory: (category: string | null) => void,
  setQuestionProgress: (progress: number) => void,
  questionCounts: Record<string, number>,
  setIsSessionComplete: (isComplete: boolean) => void
) {
  useEffect(() => {
    if (messages.length === 0) return;

    const hasSessionEndMessage = messages.some(msg => 
      msg.message_type === 'session_end' || 
      msg.metadata?.isSessionEnd === true
    );
    
    if (hasSessionEndMessage) {
      setIsSessionComplete(true);
      setCurrentCategory('complete');
      setQuestionProgress(100);
      return;
    }

    const hasRecommendationMessage = messages.some(msg => 
      msg.message_type === 'recommendation' || 
      msg.metadata?.isRecommendation === true
    );
    
    if (hasRecommendationMessage) {
      setQuestionProgress(100);
      setCurrentCategory('complete');
      return;
    }

    const botMessages = messages.filter(m => m.message_type === 'bot');
    if (botMessages.length === 0) return;
    
    const latestBotMessage = botMessages[botMessages.length - 1];
    
    const structuredMessage = latestBotMessage.metadata?.structuredMessage as StructuredMessage | undefined;
    
    if (structuredMessage?.type === 'question' && structuredMessage.metadata.progress) {
      const category = structuredMessage.metadata.progress.category?.toLowerCase() || 'general';
      const overall = structuredMessage.metadata.progress.overall;
      
      setCurrentCategory(category);
      
      if (typeof overall === 'number') {
        setQuestionProgress(overall);
      } else if (typeof overall === 'string' && overall.includes('%')) {
        setQuestionProgress(parseInt(overall.replace('%', '')));
      } else if (typeof overall === 'string') {
        setQuestionProgress(parseInt(overall));
      } else {
        const current = structuredMessage.metadata.progress.current || 1;
        const total = 24;
        setQuestionProgress(Math.min(Math.round((current / total) * 100), 100));
      }
    } 
    else if (latestBotMessage.metadata?.category) {
      const category = (latestBotMessage.metadata.category as string).toLowerCase();
      setCurrentCategory(category);
      
      const totalAnswered = Object.values(questionCounts).reduce((a, b) => a + b, 0) + 1;
      setQuestionProgress(Math.min(Math.round((totalAnswered / 24) * 100), 100));
    }
  }, [messages, questionCounts, setCurrentCategory, setQuestionProgress, setIsSessionComplete]);
}
