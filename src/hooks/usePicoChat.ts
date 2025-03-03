
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { CareerChatSession, CareerChatMessage, CareerRecommendation, CareerAnalysisResult } from '@/types/database/analytics';
import { useAuthSession } from '@/hooks/useAuthSession';

// Define the initial messages that Pico will use to start the conversation
const INITIAL_MESSAGES: CareerChatMessage[] = [
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

// Predefined questions that Pico will ask during the conversation
const QUESTION_FLOW = [
  "What skills do you feel you're particularly good at or enjoy using?",
  "Do you prefer working independently or as part of a team?",
  "Are you interested in a career that involves creativity, or do you prefer more structured, analytical work?",
  "What level of education have you completed or are you planning to complete?",
  "What kind of work environment would you thrive in? (e.g., fast-paced, relaxed, outdoors, office, etc.)",
  "Are there any industries or fields you're particularly interested in?",
  "How important is work-life balance to you in your career?",
  "Do you prefer variety in your work or consistent, predictable tasks?"
];

export function usePicoChat() {
  const { session } = useAuthSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  
  const [currentSession, setCurrentSession] = useState<CareerChatSession | null>(null);
  const [messages, setMessages] = useState<CareerChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<CareerAnalysisResult | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  // Fetch or create a chat session
  const { data: sessionData, isLoading: isSessionLoading } = useQuery({
    queryKey: ['picoChat', 'session', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Check for existing active session
      const { data: existingSessions } = await supabase
        .from('career_chat_sessions')
        .select('*')
        .eq('profile_id', userId)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false })
        .limit(1);
      
      if (existingSessions && existingSessions.length > 0) {
        return existingSessions[0] as CareerChatSession;
      }
      
      // Create new session if none exists
      const { data: newSession, error } = await supabase
        .from('career_chat_sessions')
        .insert({
          profile_id: userId,
          status: 'active',
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create chat session: ${error.message}`);
      }
      
      return newSession as CareerChatSession;
    },
    enabled: !!userId,
  });
  
  // Fetch messages for current session
  const { data: messagesData, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['picoChat', 'messages', currentSession?.id],
    queryFn: async () => {
      if (!currentSession?.id) return [];
      
      const { data, error } = await supabase
        .from('career_chat_messages')
        .select('*')
        .eq('session_id', currentSession.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }
      
      return data as CareerChatMessage[];
    },
    enabled: !!currentSession?.id,
  });
  
  // Create a mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (message: Omit<CareerChatMessage, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('career_chat_messages')
        .insert(message)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }
      
      // Update session last_message_at
      await supabase
        .from('career_chat_sessions')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', message.session_id);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['picoChat', 'messages', currentSession?.id] });
    },
  });
  
  // Function to analyze responses and generate career recommendations
  const analyzeResponses = useCallback(async () => {
    if (!currentSession?.id || !userId) return;
    
    setIsAnalyzing(true);
    
    try {
      // Prepare messages for the DeepSeek API (only include user and bot messages)
      const apiMessages = messages
        .filter(msg => msg.message_type === 'user' || msg.message_type === 'bot')
        .map(msg => ({
          role: msg.message_type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      
      // Call our edge function for analysis
      const { data, error } = await supabase.functions.invoke('analyze-career-path', {
        body: {
          messages: apiMessages,
          profile_id: userId,
          session_id: currentSession.id
        }
      });
      
      if (error) {
        throw new Error(`Analysis failed: ${error.message}`);
      }
      
      // Store the analysis results
      setAnalysisResults(data.parsed);
      
      // Add a system message announcing the results
      await sendMessageMutation.mutateAsync({
        session_id: currentSession.id,
        message_type: 'system',
        content: "Based on our conversation, I've analyzed your preferences and have some career recommendations for you!",
        metadata: {}
      });
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the full analysis as a bot message
      await sendMessageMutation.mutateAsync({
        session_id: currentSession.id,
        message_type: 'bot',
        content: data.analysis,
        metadata: { isAnalysis: true }
      });
      
      // For each career recommendation, add a recommendation message
      if (data.parsed?.careers) {
        for (const career of data.parsed.careers) {
          await sendMessageMutation.mutateAsync({
            session_id: currentSession.id,
            message_type: 'recommendation',
            content: career.reasoning,
            metadata: { 
              career: career.title,
              score: career.score
            }
          });
          
          // Small delay between recommendations
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Final follow-up message
      await sendMessageMutation.mutateAsync({
        session_id: currentSession.id,
        message_type: 'bot',
        content: "Would you like to explore any of these career options in more detail? Or would you like to take a more specific assessment to refine these recommendations?",
        metadata: {}
      });
      
    } catch (error) {
      console.error("Error during analysis:", error);
      toast.error("Sorry, there was a problem analyzing your responses. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentSession, userId, messages, sendMessageMutation]);
  
  // Function to send user message and get Pico's response
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !currentSession?.id) return;
    
    // Send user message
    await sendMessageMutation.mutateAsync({
      session_id: currentSession.id,
      message_type: 'user',
      content: message.trim(),
      metadata: {}
    });
    
    setInputMessage('');
    setIsTyping(true);
    
    // Wait a moment before showing the bot's response
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // If we've gone through all the questions, analyze the responses
    if (questionIndex >= QUESTION_FLOW.length) {
      await analyzeResponses();
    } else {
      // Send Pico's next question
      await sendMessageMutation.mutateAsync({
        session_id: currentSession.id,
        message_type: 'bot',
        content: QUESTION_FLOW[questionIndex],
        metadata: { questionIndex }
      });
      
      setQuestionIndex(prev => prev + 1);
    }
    
    setIsTyping(false);
  }, [currentSession, questionIndex, sendMessageMutation, analyzeResponses]);
  
  // Update state when session data is loaded
  useEffect(() => {
    if (sessionData) {
      setCurrentSession(sessionData);
    }
  }, [sessionData]);
  
  // Update messages when new messages are fetched
  useEffect(() => {
    if (messagesData) {
      // If there are no messages yet, use the initial messages
      if (messagesData.length === 0) {
        setMessages(INITIAL_MESSAGES.map(msg => ({
          ...msg,
          session_id: currentSession?.id || ''
        })));
      } else {
        setMessages(messagesData);
        
        // Determine the next question index based on existing messages
        const botQuestions = messagesData.filter(
          msg => msg.message_type === 'bot' && 
          msg.metadata && 
          typeof msg.metadata.questionIndex === 'number'
        );
        
        if (botQuestions.length > 0) {
          const maxQuestionIndex = Math.max(
            ...botQuestions.map(msg => msg.metadata.questionIndex)
          );
          setQuestionIndex(maxQuestionIndex + 1);
        }
      }
    }
  }, [messagesData, currentSession]);
  
  // Save initial messages if none exist
  useEffect(() => {
    const saveInitialMessages = async () => {
      if (
        currentSession?.id && 
        messagesData && 
        messagesData.length === 0 && 
        !isMessagesLoading
      ) {
        for (const msg of INITIAL_MESSAGES) {
          await sendMessageMutation.mutateAsync({
            ...msg,
            session_id: currentSession.id
          });
        }
      }
    };
    
    saveInitialMessages();
  }, [currentSession, messagesData, isMessagesLoading, sendMessageMutation]);
  
  return {
    currentSession,
    messages,
    isLoading: isSessionLoading || isMessagesLoading,
    isTyping,
    isAnalyzing,
    inputMessage,
    setInputMessage,
    sendMessage,
    analysisResults,
  };
}
