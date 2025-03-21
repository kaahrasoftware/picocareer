
import { useState, useCallback } from 'react';
import { questionBank } from '../data/question-bank';
import { StructuredMessage } from '@/types/database/message-types';
import { CareerChatMessage } from '@/types/database/analytics';

const CATEGORIES = ['education', 'skills', 'workstyle', 'goals'];
const QUESTIONS_PER_CATEGORY = 6;

export function useStructuredQuestions() {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [categoryCompletionMap, setCategoryCompletionMap] = useState<Record<string, number>>({
    education: 0,
    skills: 0,
    workstyle: 0,
    goals: 0
  });

  const getCurrentCategory = useCallback(() => {
    if (isComplete) return 'complete';
    return CATEGORIES[currentCategoryIndex];
  }, [currentCategoryIndex, isComplete]);

  const getProgress = useCallback(() => {
    if (isComplete) return 100;
    
    const completedQuestions = (currentCategoryIndex * QUESTIONS_PER_CATEGORY) + currentQuestionIndex;
    const totalQuestions = CATEGORIES.length * QUESTIONS_PER_CATEGORY;
    return Math.floor((completedQuestions / totalQuestions) * 100);
  }, [currentCategoryIndex, currentQuestionIndex, isComplete]);

  const getCurrentCategoryProgress = useCallback(() => {
    return Math.floor(((currentQuestionIndex + 1) / QUESTIONS_PER_CATEGORY) * 100);
  }, [currentQuestionIndex]);

  const getNextQuestion = useCallback((): StructuredMessage => {
    if (isComplete) {
      return {
        type: 'session_end',
        content: {
          message: "Thank you for completing your career assessment! I've analyzed your responses and provided career recommendations above. This session is now complete. You can start a new session anytime to explore different career paths or retake the assessment.",
          suggestions: [
            "Start a new career assessment",
            "Explore these career paths in detail",
            "Save these recommendations"
          ]
        },
        metadata: {
          isSessionEnd: true,
          completionType: "career_recommendations",
          progress: {
            category: 'complete',
            current: QUESTIONS_PER_CATEGORY,
            total: QUESTIONS_PER_CATEGORY,
            overall: 100
          }
        }
      };
    }

    const category = CATEGORIES[currentCategoryIndex];
    const questionData = questionBank[category][currentQuestionIndex];

    return {
      type: 'question',
      content: {
        intro: questionData.intro || `Let's talk about your ${category}...`,
        question: questionData.question,
        options: questionData.options.map((option, index) => ({
          id: `option-${index + 1}`,
          text: option
        }))
      },
      metadata: {
        progress: {
          category: category,
          current: currentQuestionIndex + 1,
          total: QUESTIONS_PER_CATEGORY,
          overall: getProgress()
        },
        options: {
          type: 'single',
          layout: 'buttons'
        }
      }
    };
  }, [currentCategoryIndex, currentQuestionIndex, getProgress, isComplete]);

  const advanceQuestion = useCallback(() => {
    // First update our category completion map
    setCategoryCompletionMap(prev => {
      const currentCategory = CATEGORIES[currentCategoryIndex];
      return {
        ...prev,
        [currentCategory]: prev[currentCategory] + 1
      };
    });
    
    if (currentQuestionIndex < QUESTIONS_PER_CATEGORY - 1) {
      // Move to next question in current category
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentCategoryIndex < CATEGORIES.length - 1) {
      // Move to first question in next category
      setCurrentCategoryIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      // All questions have been asked
      setIsComplete(true);
    }
  }, [currentCategoryIndex, currentQuestionIndex]);

  // Check if all categories have reached their required question count
  const shouldCompleteAssessment = useCallback(() => {
    // Only consider completion after at least some questions from goals category
    if (currentCategoryIndex < 3) return false;
    
    // We must be in the goals category and have answered at least 3 questions
    return currentCategoryIndex === 3 && currentQuestionIndex >= 3;
  }, [currentCategoryIndex, currentQuestionIndex]);

  const createQuestionMessage = useCallback((sessionId: string): CareerChatMessage => {
    const question = getNextQuestion();
    const category = getCurrentCategory();
    
    return {
      id: crypto.randomUUID(),
      session_id: sessionId,
      message_type: 'bot',
      content: question.content.question,
      metadata: {
        category,
        structuredMessage: question,
        progress: getProgress()
      },
      created_at: new Date().toISOString()
    };
  }, [getCurrentCategory, getNextQuestion, getProgress]);

  return {
    getCurrentCategory,
    getProgress,
    getCurrentCategoryProgress,
    getNextQuestion,
    advanceQuestion,
    createQuestionMessage,
    isComplete,
    shouldCompleteAssessment
  };
}
