
import { useState } from 'react';
import { useChatSession } from '../chat-session';
import { CareerChatMessage } from '@/types/database/analytics';

export function useMessageState() {
  const { messages, isLoading } = useChatSession();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  return {
    messages,
    inputMessage,
    isLoading,
    isTyping,
    setIsTyping,
    setInputMessage
  };
}
