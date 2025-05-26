
import { useState, useCallback } from 'react';
import { CareerChatMessage, ChatSessionMetadata } from '../types';

export function useCareerChat() {
  const [messages, setMessages] = useState<CareerChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progressData, setProgressData] = useState<{ [category: string]: number }>({});

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    
    try {
      // Add user message
      const userMessage: CareerChatMessage = {
        id: Date.now().toString(),
        session_id: 'current-session',
        message_type: 'user',
        content,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Simulate bot response
      setTimeout(() => {
        const botMessage: CareerChatMessage = {
          id: (Date.now() + 1).toString(),
          session_id: 'current-session',
          message_type: 'bot',
          content: 'Thank you for your message. This is a placeholder response.',
          metadata: {
            hasOptions: false,
            suggestions: []
          },
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  }, []);

  const createSession = useCallback(async (sessionName?: string) => {
    console.log('Creating session:', sessionName);
    return 'new-session-id';
  }, []);

  const updateSessionMetadata = useCallback(async (sessionId: string, metadata: ChatSessionMetadata) => {
    console.log('Updating session metadata:', sessionId, metadata);
  }, []);

  return {
    messages,
    isLoading,
    progressData,
    sendMessage,
    createSession,
    updateSessionMetadata
  };
}
