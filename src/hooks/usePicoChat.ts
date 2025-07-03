
import { useState } from 'react';
import { CareerChatMessage, CareerAnalysisResult } from '@/types/database/analytics';

export const usePicoChat = () => {
  const [messages, setMessages] = useState<CareerChatMessage[]>([
    {
      id: '1',
      message: "Hello! I'm PicoChat, your career guidance assistant. How can I help you today?",
      timestamp: new Date().toISOString(),
      sender: 'assistant'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: CareerChatMessage = {
      id: Date.now().toString(),
      message: content,
      timestamp: new Date().toISOString(),
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add assistant response
      const assistantMessage: CareerChatMessage = {
        id: (Date.now() + 1).toString(),
        message: "Thank you for your question! I'm here to help with career guidance and advice.",
        timestamp: new Date().toISOString(),
        sender: 'assistant'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        message: "Hello! I'm PicoChat, your career guidance assistant. How can I help you today?",
        timestamp: new Date().toISOString(),
        sender: 'assistant'
      }
    ]);
  };

  const getCareerAnalysis = async (): Promise<CareerAnalysisResult> => {
    // Simulate analysis
    return {
      recommendations: ['Explore software engineering', 'Consider data science'],
      analysis: 'Based on your interests and skills, you might enjoy technical roles.',
      confidence: 85
    };
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    getCareerAnalysis
  };
};
