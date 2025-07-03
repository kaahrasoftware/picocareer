
import { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CareerChatMessage } from '@/types/database/analytics';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { callCareerChatAI } from '../services/aiChatService';
import { toast } from 'sonner';

export function useCareerChatSimple() {
  const { session } = useAuthSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [messages, setMessages] = useState<CareerChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>('education');
  const [questionProgress, setQuestionProgress] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize session and welcome message
  useEffect(() => {
    if (session?.user && !sessionId) {
      initializeSession();
    }
  }, [session, sessionId]);

  const initializeSession = async () => {
    if (!session?.user) return;

    try {
      // Create new session
      const { data: newSession, error } = await supabase
        .from('career_chat_sessions')
        .insert({
          profile_id: session.user.id,
          status: 'active',
          session_metadata: {
            startedAt: new Date().toISOString(),
            questionCounts: { education: 0, skills: 0, workstyle: 0, goals: 0 },
            overallProgress: 0,
            isComplete: false,
            lastCategory: 'education'
          },
          progress_data: {
            education: 0,
            skills: 0,
            workstyle: 0,
            goals: 0,
            overall: 0
          }
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(newSession.id);

      // Add welcome message
      const welcomeMessage: CareerChatMessage = {
        id: uuidv4(),
        session_id: newSession.id,
        message_type: "system",
        content: "Hi there! I'm your AI Career Discovery Assistant. I'll help you explore career paths that match your interests, skills, and goals. Ready to begin your personalized career assessment?",
        metadata: {
          hasOptions: true,
          suggestions: ['Start Assessment', 'Tell me more about this process']
        },
        created_at: new Date().toISOString()
      };

      await addMessage(welcomeMessage);
    } catch (error) {
      console.error('Error initializing session:', error);
      toast.error('Failed to start session. Please try again.');
    }
  };

  const addMessage = async (message: CareerChatMessage) => {
    if (!sessionId) return null;

    try {
      const { data, error } = await supabase
        .from('career_chat_messages')
        .insert({
          ...message,
          session_id: sessionId
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data as CareerChatMessage]);
      return data as CareerChatMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  };

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !sessionId || isTyping) return;

    setIsTyping(true);
    
    // Add user message
    const userMessage: CareerChatMessage = {
      id: uuidv4(),
      session_id: sessionId,
      message_type: 'user',
      content: message.trim(),
      metadata: {},
      created_at: new Date().toISOString()
    };

    await addMessage(userMessage);
    setInputMessage('');

    try {
      // Call AI service (preserving existing API integration)
      const aiResponse = await callCareerChatAI({
        sessionId,
        messages: [...messages, userMessage],
        userMessage: message.trim(),
        currentCategory: currentCategory || 'education',
        questionCount: Math.floor(questionProgress / 25) + 1
      });

      // Process AI response
      const aiMessage: CareerChatMessage = {
        id: uuidv4(),
        session_id: sessionId,
        message_type: aiResponse.type === 'session_end' ? 'session_end' : 'bot',
        content: aiResponse.content.question || aiResponse.content.message || 'Thank you for sharing!',
        metadata: {
          structuredMessage: aiResponse,
          category: currentCategory,
          suggestions: aiResponse.content.suggestions || []
        },
        created_at: new Date().toISOString()
      };

      await addMessage(aiMessage);

      // Update progress
      if (aiResponse.type === 'session_end') {
        setIsSessionComplete(true);
        setQuestionProgress(100);
      } else {
        setQuestionProgress(prev => Math.min(prev + 10, 90));
      }

    } catch (error) {
      console.error('Error processing AI response:', error);
      
      const errorMessage: CareerChatMessage = {
        id: uuidv4(),
        session_id: sessionId,
        message_type: 'system',
        content: "I'm sorry, I encountered an error. Could you please try again?",
        metadata: { error: true },
        created_at: new Date().toISOString()
      };
      
      await addMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  }, [sessionId, messages, currentCategory, questionProgress, isTyping]);

  const handleSuggestionClick = (suggestion: string) => {
    if (isTyping) return;
    sendMessage(suggestion);
  };

  const handleStartNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setIsSessionComplete(false);
    setQuestionProgress(0);
    setCurrentCategory('education');
    initializeSession();
  };

  const handleDownloadResults = () => {
    toast.info('Download feature coming soon!');
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return {
    messages,
    inputMessage,
    isTyping,
    isAnalyzing,
    currentCategory,
    questionProgress,
    isSessionComplete,
    messagesEndRef,
    setInputMessage,
    sendMessage,
    handleStartNewChat,
    handleSuggestionClick,
    handleDownloadResults
  };
}
