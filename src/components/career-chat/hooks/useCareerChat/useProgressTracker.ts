
import { useState, useEffect } from 'react';
import { useChatSession } from '../chat-session';
import { QuestionCounts } from './types';

export function useProgressTracker() {
  const { sessionMetadata } = useChatSession();
  
  // Track question progress and categories
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [questionProgress, setQuestionProgress] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Update progress from session metadata
  useEffect(() => {
    if (sessionMetadata) {
      setCurrentCategory(sessionMetadata.lastCategory || null);
      setQuestionProgress(sessionMetadata.overallProgress || 0);
      setIsSessionComplete(sessionMetadata.isComplete === true);
    }
  }, [sessionMetadata]);

  return {
    currentCategory,
    questionProgress,
    isSessionComplete,
    setCurrentCategory,
    setQuestionProgress,
    setIsSessionComplete,
    
    // Helper functions for analyzing question progress
    calculateCategoryProgress: (counts: QuestionCounts) => {
      // Calculate the overall progress based on question counts in each category
      const totalQuestions = 
        counts.education + 
        counts.skills + 
        counts.workstyle + 
        counts.goals;
      
      const MAX_QUESTIONS = 12; // Adjust as needed based on actual flow
      
      return Math.min(Math.round((totalQuestions / MAX_QUESTIONS) * 100), 100);
    },
    
    getCategoryFromContent: (content: string) => {
      // Helper to determine category from question content
      const lowerContent = content.toLowerCase();
      
      if (lowerContent.includes('education') || lowerContent.includes('study') || lowerContent.includes('degree')) {
        return 'education';
      } else if (lowerContent.includes('skill') || lowerContent.includes('strength') || lowerContent.replace(/\s+/g, '').includes('goodat')) {
        return 'skills';
      } else if (lowerContent.includes('prefer') || lowerContent.includes('environment') || lowerContent.includes('work style')) {
        return 'workstyle';
      } else if (lowerContent.includes('goal') || lowerContent.includes('aspire') || lowerContent.includes('future')) {
        return 'goals';
      }
      
      return 'general';
    }
  };
}
