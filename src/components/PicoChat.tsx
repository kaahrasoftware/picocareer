
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Brain } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CareerChatMessage } from '@/types/database/analytics';
import { toast } from 'sonner';

// Initial messages for the chat
const INITIAL_MESSAGES: CareerChatMessage[] = [
  {
    id: 'welcome',
    session_id: 'demo-session',
    message_type: 'bot',
    content: "Hi there! 👋 I'm Pico, your AI career guide. I'll help you discover career paths that match your interests, skills, and preferences. Let's have a conversation to explore what might be right for you!",
    metadata: {},
    created_at: new Date().toISOString(),
  },
  {
    id: 'intro-question',
    session_id: 'demo-session',
    message_type: 'bot',
    content: "To start, could you tell me a bit about yourself? What subjects or activities do you enjoy the most?",
    metadata: {},
    created_at: new Date().toISOString(),
  }
];

// Predefined questions for the chat flow
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

// Mock career recommendations
const MOCK_RECOMMENDATIONS = [
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

export function PicoChat() {
  const [messages, setMessages] = useState<CareerChatMessage[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Focus the input field when the component loads
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);
  
  // Handle sending messages with Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  // Function to simulate response analysis
  const analyzeResponses = async () => {
    setIsAnalyzing(true);
    
    try {
      // Add a system message announcing results
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        session_id: 'demo-session',
        message_type: 'system',
        content: "Based on our conversation, I've analyzed your preferences and have some career recommendations for you!",
        metadata: {},
        created_at: new Date().toISOString()
      }]);
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add analysis summary
      setMessages(prev => [...prev, {
        id: `analysis-${Date.now()}`,
        session_id: 'demo-session',
        message_type: 'bot',
        content: "I've analyzed your responses and identified your strengths in problem-solving, creativity, and communication. You seem to value work-life balance and prefer collaborative environments with some flexibility. Here are some career paths that might be a good fit for you:",
        metadata: { isAnalysis: true },
        created_at: new Date().toISOString()
      }]);
      
      // Add recommendations
      for (const career of MOCK_RECOMMENDATIONS) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setMessages(prev => [...prev, {
          id: `recommendation-${Date.now()}-${career.title}`,
          session_id: 'demo-session',
          message_type: 'recommendation',
          content: career.reasoning,
          metadata: {
            career: career.title,
            score: career.score
          },
          created_at: new Date().toISOString()
        }]);
      }
      
      // Final follow-up message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessages(prev => [...prev, {
        id: `followup-${Date.now()}`,
        session_id: 'demo-session',
        message_type: 'bot',
        content: "Would you like to explore any of these career options in more detail? Or would you like to take a more specific assessment to refine these recommendations?",
        metadata: {},
        created_at: new Date().toISOString()
      }]);
      
    } catch (error) {
      console.error("Error during analysis:", error);
      toast("Sorry, there was a problem analyzing your responses. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Function to send message and get response
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      session_id: 'demo-session',
      message_type: 'user',
      content: message.trim(),
      metadata: {},
      created_at: new Date().toISOString()
    }]);
    
    setInputMessage('');
    setIsTyping(true);
    
    // Simulate response delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // If we've gone through all the questions, analyze the responses
    if (questionIndex >= QUESTION_FLOW.length) {
      await analyzeResponses();
    } else {
      // Add bot response with next question
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        session_id: 'demo-session',
        message_type: 'bot',
        content: QUESTION_FLOW[questionIndex],
        metadata: { questionIndex },
        created_at: new Date().toISOString()
      }]);
      
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
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10 bg-primary text-white flex items-center justify-center">
            <span className="text-lg font-semibold">P</span>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">Pico</h2>
            <p className="text-sm text-muted-foreground">AI Career Guide</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isAnalyzing && (
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 animate-pulse text-primary" />
              <span className="text-sm text-muted-foreground">Analyzing responses...</span>
            </div>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={message.id || index} message={message} />
          ))}
          
          {isTyping && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 bg-primary text-white flex items-center justify-center">
                <span className="text-sm font-semibold">P</span>
              </Avatar>
              <div className="flex-1 bg-muted rounded-lg p-3 text-sm">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAnalyzing}
            className="min-h-[60px] resize-none"
          />
          <Button 
            size="icon" 
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isAnalyzing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ChatMessageProps {
  message: CareerChatMessage;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.message_type === 'user';
  const isSystem = message.message_type === 'system';
  const isRecommendation = message.message_type === 'recommendation';
  
  if (isSystem) {
    return (
      <div className="flex justify-center my-6">
        <div className="bg-muted px-4 py-2 rounded-full text-sm text-center">
          {message.content}
        </div>
      </div>
    );
  }
  
  if (isRecommendation) {
    return (
      <div className="mb-6">
        <div className="mb-2 flex justify-center">
          <Badge variant="outline" className="text-sm">
            Career Recommendation
          </Badge>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted p-3 border-b flex justify-between items-center">
            <h3 className="font-semibold">{message.metadata?.career}</h3>
            <Badge>{message.metadata?.score}% Match</Badge>
          </div>
          <div className="p-4">
            <p className="text-sm">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className={`h-8 w-8 ${isUser ? 'bg-secondary' : 'bg-primary'} text-white flex items-center justify-center`}>
        <span className="text-sm font-semibold">{isUser ? 'U' : 'P'}</span>
      </Avatar>
      <div className={`flex-1 rounded-lg p-3 text-sm ${isUser ? 'bg-secondary/10' : 'bg-muted'}`}>
        {message.content.split('\n').map((paragraph, i) => (
          <p key={i} className={i > 0 ? 'mt-2' : ''}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

export default PicoChat;
