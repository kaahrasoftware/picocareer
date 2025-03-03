
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { CareerChatMessage, CareerAnalysisResult } from '@/types/database/analytics';

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

export function usePicoChat() {
  const [messages, setMessages] = useState<CareerChatMessage[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<CareerAnalysisResult | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  
  // Function to simulate response analysis
  const analyzeResponses = useCallback(async () => {
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
      
      // Create mock analysis results
      const mockResults: CareerAnalysisResult = {
        summary: "You have a blend of creative and analytical skills with an interest in technology and problem-solving.",
        personality_traits: ["Curious", "Logical", "Creative", "Detail-oriented"],
        skills: {
          technical: ["Problem solving", "Analysis", "Research"],
          soft: ["Communication", "Teamwork", "Adaptability"]
        },
        interests: ["Technology", "Design", "Data", "Innovation"],
        work_preferences: {
          environment: "Collaborative with some independence",
          teamwork: "Balanced team and individual work",
          pace: "Moderately fast-paced"
        },
        education_level: "Bachelor's degree or higher",
        careers: MOCK_RECOMMENDATIONS
      };
      
      setAnalysisResults(mockResults);
      
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
  }, []);
  
  // Function to send message and get response
  const sendMessage = useCallback(async (message: string) => {
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
  }, [questionIndex, analyzeResponses]);
  
  return {
    messages,
    isLoading,
    isTyping,
    isAnalyzing,
    inputMessage,
    setInputMessage,
    sendMessage,
    analysisResults,
  };
}
