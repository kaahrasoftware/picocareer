
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

// Predefined questions for the chat flow - we'll use this for now
// In a full implementation, the edge function would determine the next question
export const QUESTION_FLOW = [
  "What skills do you feel you're particularly good at or enjoy using?",
  "Do you prefer working independently or as part of a team?",
  "Are you interested in a career that involves creativity, or do you prefer more structured, analytical work?",
  "What level of education have you completed or are you planning to complete?",
  "What kind of work environment would you thrive in? (e.g., fast-paced, relaxed, outdoors, office, etc.)",
  "Are there any industries or fields you're particularly interested in?",
  "How important is work-life balance to you in your career?",
  "Do you prefer variety in your work or consistent, predictable tasks?"
];
