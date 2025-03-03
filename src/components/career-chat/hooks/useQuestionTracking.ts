
import { useState, useEffect } from 'react';
import { CareerChatMessage } from '@/types/database/analytics';

export function useQuestionTracking(messages: CareerChatMessage[]) {
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [questionProgress, setQuestionProgress] = useState(0);
  
  // Track questions by category
  const [questionCounts, setQuestionCounts] = useState({
    education: 0,
    skills: 0,
    workstyle: 0,
    goals: 0
  });

  // Update category and question counts based on messages
  useEffect(() => {
    if (messages.length === 0) return;

    // Check latest bot message for category
    const botMessages = messages.filter(m => m.message_type === 'bot');
    if (botMessages.length === 0) return;
    
    const latestBotMessage = botMessages[botMessages.length - 1];
    
    // If we have a category in the metadata, update the current category
    if (latestBotMessage.metadata?.category) {
      const newCategory = latestBotMessage.metadata.category;
      setCurrentCategory(newCategory);
      
      // Update counts for this category
      setQuestionCounts(prev => ({
        ...prev,
        [newCategory as keyof typeof prev]: prev[newCategory as keyof typeof prev] + 1
      }));
      
      // Calculate overall progress (assuming 12-15 questions total plan)
      const totalQuestions = Object.values(questionCounts).reduce((a, b) => a + b, 0) + 1;
      setQuestionProgress(Math.min(Math.round((totalQuestions / 15) * 100), 100));
    }
    
    // If this is a recommendation message, set progress to 100%
    if (latestBotMessage.metadata?.isRecommendation) {
      setQuestionProgress(100);
      setCurrentCategory('complete');
    }
  }, [messages, questionCounts]);

  return {
    currentCategory,
    questionProgress,
    questionCounts
  };
}
