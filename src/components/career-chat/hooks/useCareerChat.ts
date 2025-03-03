
import { useState, useRef, useCallback } from 'react';
import { useChatSession } from './useChatSession';
import { useCareerAnalysis } from './useCareerAnalysis';
import { QUESTION_FLOW } from '../constants';

export function useCareerChat() {
  const { messages, sessionId, isLoading, addMessage } = useChatSession();
  const { isAnalyzing, analyzeResponses } = useCareerAnalysis(sessionId, addMessage);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to send message and get response
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId) return;
    
    // Add user message
    await addMessage({
      session_id: sessionId,
      message_type: 'user',
      content: message.trim(),
      metadata: {},
      created_at: new Date().toISOString()
    });
    
    setInputMessage('');
    setIsTyping(true);
    
    // Simulate response delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // If we've gone through all the questions, analyze the responses
    if (questionIndex >= QUESTION_FLOW.length) {
      await analyzeResponses();
    } else {
      // Add bot response with next question
      await addMessage({
        session_id: sessionId,
        message_type: 'bot',
        content: QUESTION_FLOW[questionIndex],
        metadata: { questionIndex },
        created_at: new Date().toISOString()
      });
      
      setQuestionIndex(prev => prev + 1);
    }
    
    setIsTyping(false);
  }, [sessionId, questionIndex, addMessage, analyzeResponses]);

  return {
    messages,
    inputMessage,
    isLoading,
    isTyping,
    isAnalyzing,
    messagesEndRef,
    setInputMessage,
    sendMessage
  };
}
