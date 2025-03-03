
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CareerChatMessage } from '@/types/database/analytics';
import { toast } from 'sonner';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Initial welcome messages
const WELCOME_MESSAGES: CareerChatMessage[] = [
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

export function PicoChat() {
  const [messages, setMessages] = useState<CareerChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Initialize or get existing session
  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      try {
        // Check for auth user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // For now, create a demo session without requiring auth
          const tempSessionId = uuidv4();
          setSessionId(tempSessionId);
          
          // Set welcome messages with the session ID
          const welcomeWithSession = WELCOME_MESSAGES.map(msg => ({
            ...msg,
            session_id: tempSessionId,
          }));
          
          setMessages(welcomeWithSession);
          setIsLoading(false);
          return;
        }
        
        // Get most recent active session or create new one
        const { data: existingSessions, error: sessionError } = await supabase
          .from('career_chat_sessions')
          .select('*')
          .eq('profile_id', user.id)
          .eq('status', 'active')
          .order('last_message_at', { ascending: false })
          .limit(1);
          
        if (sessionError) {
          console.error("Error fetching sessions:", sessionError);
          toast("Error loading chat session");
          setIsLoading(false);
          return;
        }
        
        let currentSessionId;
        
        if (existingSessions && existingSessions.length > 0) {
          // Use existing session
          currentSessionId = existingSessions[0].id;
          setSessionId(currentSessionId);
          
          // Fetch existing messages for this session
          const { data: existingMessages, error: messagesError } = await supabase
            .from('career_chat_messages')
            .select('*')
            .eq('session_id', currentSessionId)
            .order('created_at', { ascending: true });
            
          if (messagesError) {
            console.error("Error fetching messages:", messagesError);
            toast("Error loading chat messages");
          } else if (existingMessages && existingMessages.length > 0) {
            // Cast the messages to the correct type
            const typedMessages = existingMessages.map(msg => ({
              ...msg,
              message_type: msg.message_type as 'bot' | 'user' | 'system' | 'recommendation'
            }));
            
            setMessages(typedMessages as CareerChatMessage[]);
            // Determine the current question index based on bot messages
            const botMessages = typedMessages.filter(msg => msg.message_type === 'bot');
            // Skip the welcome messages
            setQuestionIndex(Math.max(0, botMessages.length - 2));
          }
        } else {
          // Create new session
          const newSessionId = uuidv4();
          const { error: createError } = await supabase
            .from('career_chat_sessions')
            .insert({
              id: newSessionId,
              profile_id: user.id,
              status: 'active',
              last_message_at: new Date().toISOString()
            });
            
          if (createError) {
            console.error("Error creating session:", createError);
            toast("Error creating chat session");
            setIsLoading(false);
            return;
          }
          
          currentSessionId = newSessionId;
          setSessionId(currentSessionId);
          
          // Add welcome messages to database
          const welcomeMessages = WELCOME_MESSAGES.map(msg => ({
            ...msg,
            session_id: currentSessionId,
          }));
          
          const { error: messagesError } = await supabase
            .from('career_chat_messages')
            .insert(welcomeMessages);
            
          if (messagesError) {
            console.error("Error adding welcome messages:", messagesError);
            toast("Error initializing chat");
          }
          
          setMessages(welcomeMessages);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast("Error initializing chat");
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Function to add a message to state and database
  const addMessage = async (message: Omit<CareerChatMessage, 'id'>) => {
    const messageWithId = {
      ...message,
      id: uuidv4()
    };
    
    // Ensure message_type is cast to the expected type
    const typedMessage = {
      ...messageWithId,
      message_type: messageWithId.message_type as 'bot' | 'user' | 'system' | 'recommendation'
    };
    
    // Optimistically update UI
    setMessages(prev => [...prev, typedMessage]);
    
    // Save to database
    const { error } = await supabase
      .from('career_chat_messages')
      .insert(messageWithId);
      
    if (error) {
      console.error("Error saving message:", error);
      toast("Error saving message");
    }
    
    // Update session last_message_at
    if (sessionId) {
      await supabase
        .from('career_chat_sessions')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', sessionId);
    }
    
    return typedMessage;
  };
  
  // Function to analyze responses and generate career recommendations
  const analyzeResponses = async () => {
    setIsAnalyzing(true);
    
    try {
      // Add a system message announcing results
      await addMessage({
        session_id: sessionId,
        message_type: 'system',
        content: "Based on our conversation, I've analyzed your preferences and have some career recommendations for you!",
        metadata: {},
        created_at: new Date().toISOString()
      });
      
      // In a complete implementation, we would call the analyze-career-path edge function here
      // For now, we'll use a timeout to simulate processing and then use mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add analysis summary
      await addMessage({
        session_id: sessionId,
        message_type: 'bot',
        content: "I've analyzed your responses and identified your strengths in problem-solving, creativity, and communication. You seem to value work-life balance and prefer collaborative environments with some flexibility. Here are some career paths that might be a good fit for you:",
        metadata: { isAnalysis: true },
        created_at: new Date().toISOString()
      });
      
      // For now, use mock recommendations until we fully integrate with the edge function
      const mockRecommendations = [
        {
          title: "Software Developer",
          score: 95,
          reasoning: "Based on your interest in problem-solving and logical thinking, software development could be an excellent fit. This career offers flexibility, good compensation, and opportunities for remote work, which aligns with your work-life balance preferences."
        },
        {
          title: "Data Scientist",
          score: 88,
          reasoning: "Your analytical skills and interest in finding patterns would make you successful in data science. This growing field combines statistics, programming, and domain expertise to extract insights from data."
        },
        {
          title: "UX/UI Designer",
          score: 82,
          reasoning: "Your creative tendencies and interest in how people interact with technology suggest you might enjoy UX/UI design. This field allows you to combine creative and analytical thinking to create intuitive digital experiences."
        }
      ];
      
      // Add recommendations
      for (const career of mockRecommendations) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const recommendationMsg = await addMessage({
          session_id: sessionId,
          message_type: 'recommendation',
          content: career.reasoning,
          metadata: {
            career: career.title,
            score: career.score
          },
          created_at: new Date().toISOString()
        });
        
        // In a complete implementation, we would also save to career_chat_recommendations table
        // with proper career_id references
        await supabase
          .from('career_chat_recommendations')
          .insert({
            session_id: sessionId,
            career_title: career.title,
            score: career.score,
            reasoning: career.reasoning,
            created_at: new Date().toISOString()
          });
      }
      
      // Final follow-up message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await addMessage({
        session_id: sessionId,
        message_type: 'bot',
        content: "Would you like to explore any of these career options in more detail? Or would you like to take a more specific assessment to refine these recommendations?",
        metadata: {},
        created_at: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Error during analysis:", error);
      toast("Sorry, there was a problem analyzing your responses. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Function to send message and get response
  const sendMessage = async (message: string) => {
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
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
      <ChatHeader isAnalyzing={isAnalyzing} />
      
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={message.id || index} message={message} />
          ))}
          
          {isTyping && <ChatTypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <ChatInput 
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSendMessage={sendMessage}
        isDisabled={isAnalyzing}
      />
    </div>
  );
}

export default PicoChat;
