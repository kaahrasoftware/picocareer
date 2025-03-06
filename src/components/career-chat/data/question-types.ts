
/**
 * Type definitions for the structured question bank
 */

export interface QuestionOption {
  id: string;
  text: string;
  icon?: string;
  description?: string;
}

export interface Question {
  id: string;
  text: string;
  allowCustom: boolean;
  customPrompt?: string;
  options: QuestionOption[];
}

export interface CategoryQuestions {
  name: string;
  description?: string;
  questions: Question[];
}

export interface QuestionBank {
  [category: string]: CategoryQuestions;
}

/**
 * Utility functions for question progression
 */

export const calculateCategoryProgress = (
  category: string, 
  currentQuestionIndex: number,
  questionBank: QuestionBank
): number => {
  if (!questionBank[category]) return 0;
  
  const totalQuestions = questionBank[category].questions.length;
  if (totalQuestions === 0) return 0;
  
  return Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
};

export const calculateOverallProgress = (
  categories: string[],
  currentCategory: string,
  currentQuestionIndex: number,
  questionBank: QuestionBank
): number => {
  // Count total questions across all categories
  const totalQuestions = categories.reduce((total, category) => {
    return total + (questionBank[category]?.questions.length || 0);
  }, 0);
  
  if (totalQuestions === 0) return 0;
  
  // Count completed questions
  let completedQuestions = 0;
  
  // Add questions from completed categories
  const currentCategoryIndex = categories.indexOf(currentCategory);
  for (let i = 0; i < currentCategoryIndex; i++) {
    completedQuestions += questionBank[categories[i]]?.questions.length || 0;
  }
  
  // Add questions from current category
  completedQuestions += currentQuestionIndex + 1;
  
  return Math.round((completedQuestions / totalQuestions) * 100);
};

export const getNextQuestion = (
  categories: string[],
  currentCategory: string,
  currentQuestionIndex: number,
  questionBank: QuestionBank
): { category: string; questionIndex: number } | null => {
  // Check if we can go to next question in current category
  if (questionBank[currentCategory] && 
      currentQuestionIndex + 1 < questionBank[currentCategory].questions.length) {
    return {
      category: currentCategory,
      questionIndex: currentQuestionIndex + 1
    };
  }
  
  // Try to move to next category
  const currentCategoryIndex = categories.indexOf(currentCategory);
  if (currentCategoryIndex < categories.length - 1) {
    const nextCategory = categories[currentCategoryIndex + 1];
    if (questionBank[nextCategory] && questionBank[nextCategory].questions.length > 0) {
      return {
        category: nextCategory,
        questionIndex: 0
      };
    }
  }
  
  // No more questions
  return null;
};
