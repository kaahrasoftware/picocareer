
import { CareerChatMessage } from '@/types/database/analytics';

// Initial welcome messages
export const WELCOME_MESSAGES: CareerChatMessage[] = [
  {
    id: 'welcome',
    session_id: '',
    message_type: 'bot',
    content: "Hi there! 👋 I'm Pico, your AI career guide. I'll help you discover career paths that match your interests, skills, and preferences. Let's have a conversation to explore what might be right for you!",
    metadata: {},
    created_at: new Date().toISOString(),
  },
  {
    id: 'intro-question',
    session_id: '',
    message_type: 'bot',
    content: "To start, could you tell me a bit about yourself? What subjects or activities do you enjoy the most?",
    metadata: {},
    created_at: new Date().toISOString(),
  }
];
