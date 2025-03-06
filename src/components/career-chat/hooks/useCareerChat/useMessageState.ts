
import { useState, useRef } from 'react';
import { CareerChatMessage } from "@/types/database/analytics";
import { QuestionCounts } from './types';

export function useMessageState() {
  const [messages, setMessages] = useState<CareerChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [localIsTyping, setLocalIsTyping] = useState(false);
  const [hasConfigError, setHasConfigError] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [questionProgress, setQuestionProgress] = useState(0);
  const [messageCache, setMessageCache] = useState<Map<string, CareerChatMessage>>(new Map());
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [questionCounts, setQuestionCounts] = useState<QuestionCounts>({
    education: 0,
    skills: 0,
    workstyle: 0,
    goals: 0
  });

  return {
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isTyping,
    setIsTyping,
    localIsTyping,
    setLocalIsTyping,
    hasConfigError,
    setHasConfigError,
    currentCategory,
    setCurrentCategory,
    questionProgress,
    setQuestionProgress,
    messageCache,
    setMessageCache,
    messagesEndRef,
    questionCounts,
    setQuestionCounts,
    isSessionComplete,
    setIsSessionComplete
  };
}
