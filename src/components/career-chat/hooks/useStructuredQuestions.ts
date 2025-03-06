
import { useState, useCallback, useMemo } from 'react';
import { questionBank, CATEGORIES } from '../data/question-bank';
import { 
  calculateCategoryProgress, 
  calculateOverallProgress, 
  getNextQuestion 
} from '../data/question-types';
import { CareerChatMessage } from '@/types/database/analytics';
import { StructuredMessage } from '@/types/database/message-types';

export type AnswerType = { 
  questionId: string; 
  optionId: string; 
  text: string;
  customText?: string;
};

interface UseStructuredQuestionsProps {
  sessionId: string;
  addMessage: (message: CareerChatMessage) => Promise<CareerChatMessage>;
}

export function useStructuredQuestions({ 
  sessionId, 
  addMessage 
}: UseStructuredQuestionsProps) {
  const [currentCategory, setCurrentCategory] = useState(CATEGORIES[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerType[]>([]);
  const [isCustomAnswer, setIsCustomAnswer] = useState(false);
  const [customAnswerText, setCustomAnswerText] = useState('');
  
  // Get current question data
  const currentQuestion = useMemo(() => {
    if (!questionBank[currentCategory]) return null;
    return questionBank[currentCategory].questions[currentQuestionIndex] || null;
  }, [currentCategory, currentQuestionIndex]);
  
  // Calculate progress
  const progress = useMemo(() => {
    if (!currentQuestion) return { category: 0, overall: 0 };
    
    return {
      category: calculateCategoryProgress(
        currentCategory, 
        currentQuestionIndex, 
        questionBank
      ),
      overall: calculateOverallProgress(
        CATEGORIES, 
        currentCategory, 
        currentQuestionIndex, 
        questionBank
      )
    };
  }, [currentCategory, currentQuestionIndex]);
  
  // Submit answer and move to next question
  const submitAnswer = useCallback(async (
    optionId: string, 
    optionText: string,
    customText?: string
  ) => {
    if (!currentQuestion || !sessionId) return;
    
    // Store the answer
    const answer: AnswerType = {
      questionId: currentQuestion.id,
      optionId,
      text: optionText,
      customText
    };
    
    setAnswers(prev => [...prev, answer]);
    
    // Create user message
    const userMessage: CareerChatMessage = {
      session_id: sessionId,
      message_type: 'user',
      content: customText || optionText,
      metadata: {
        isStructured: true,
        questionId: currentQuestion.id,
        optionId,
        category: currentCategory
      },
      created_at: new Date().toISOString()
    };
    
    await addMessage(userMessage);
    
    // Determine next question
    const next = getNextQuestion(
      CATEGORIES,
      currentCategory,
      currentQuestionIndex,
      questionBank
    );
    
    if (next) {
      // Move to next question
      setCurrentCategory(next.category);
      setCurrentQuestionIndex(next.questionIndex);
      setIsCustomAnswer(false);
      setCustomAnswerText('');
      
      // Create bot message with next question
      const nextQuestion = questionBank[next.category].questions[next.questionIndex];
      
      const structuredMessage: StructuredMessage = {
        type: "question",
        content: {
          intro: `Let's talk about your ${questionBank[next.category].name.toLowerCase()}.`,
          question: nextQuestion.text,
          options: nextQuestion.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            icon: opt.icon
          }))
        },
        metadata: {
          progress: {
            category: next.category,
            current: next.questionIndex + 1,
            total: questionBank[next.category].questions.length,
            overall: calculateOverallProgress(
              CATEGORIES, 
              next.category, 
              next.questionIndex, 
              questionBank
            )
          },
          options: {
            type: "single",
            layout: "cards",
            allow_custom: nextQuestion.allowCustom
          }
        }
      };
      
      const botMessage: CareerChatMessage = {
        session_id: sessionId,
        message_type: 'bot',
        content: `${structuredMessage.content.intro || ''} ${structuredMessage.content.question}`,
        metadata: {
          isStructured: true,
          structuredMessage,
          category: next.category,
          questionNumber: next.questionIndex + 1,
          totalInCategory: questionBank[next.category].questions.length,
          progress: calculateOverallProgress(
            CATEGORIES, 
            next.category, 
            next.questionIndex, 
            questionBank
          )
        },
        created_at: new Date().toISOString()
      };
      
      await addMessage(botMessage);
      
      return true;
    } else {
      // No more questions - generate final message
      // This would be implemented in the next phase
      console.log("Assessment complete!");
      return false;
    }
  }, [currentQuestion, currentCategory, currentQuestionIndex, sessionId, addMessage]);
  
  // Handle selecting an option
  const selectOption = useCallback(async (optionId: string, optionText: string) => {
    // Check if this is a custom option
    if (optionId.includes("custom")) {
      setIsCustomAnswer(true);
      return;
    }
    
    // Submit normal answer
    await submitAnswer(optionId, optionText);
  }, [submitAnswer]);
  
  // Handle submitting a custom answer
  const submitCustomAnswer = useCallback(async (optionId: string, optionText: string) => {
    if (!customAnswerText.trim()) return;
    
    await submitAnswer(optionId, optionText, customAnswerText);
    setIsCustomAnswer(false);
    setCustomAnswerText('');
  }, [customAnswerText, submitAnswer]);
  
  // Handle starting the structured assessment
  const startStructuredAssessment = useCallback(async () => {
    if (!sessionId) return;
    
    // Reset state
    setCurrentCategory(CATEGORIES[0]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    
    // Get first question
    const firstCategory = CATEGORIES[0];
    const firstQuestion = questionBank[firstCategory].questions[0];
    
    // Create bot message with first question
    const structuredMessage: StructuredMessage = {
      type: "question",
      content: {
        intro: `Let's start with questions about your ${questionBank[firstCategory].name.toLowerCase()}.`,
        question: firstQuestion.text,
        options: firstQuestion.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          icon: opt.icon
        }))
      },
      metadata: {
        progress: {
          category: firstCategory,
          current: 1,
          total: questionBank[firstCategory].questions.length,
          overall: calculateOverallProgress(
            CATEGORIES, 
            firstCategory, 
            0, 
            questionBank
          )
        },
        options: {
          type: "single",
          layout: "cards",
          allow_custom: firstQuestion.allowCustom
        }
      }
    };
    
    const botMessage: CareerChatMessage = {
      session_id: sessionId,
      message_type: 'bot',
      content: `${structuredMessage.content.intro || ''} ${structuredMessage.content.question}`,
      metadata: {
        isStructured: true,
        structuredMessage,
        category: firstCategory,
        questionNumber: 1,
        totalInCategory: questionBank[firstCategory].questions.length,
        progress: calculateOverallProgress(
          CATEGORIES, 
          firstCategory, 
          0, 
          questionBank
        )
      },
      created_at: new Date().toISOString()
    };
    
    await addMessage(botMessage);
  }, [sessionId, addMessage]);
  
  return {
    currentQuestion,
    progress,
    answers,
    isCustomAnswer,
    customAnswerText,
    setCustomAnswerText,
    selectOption,
    submitCustomAnswer,
    startStructuredAssessment
  };
}
