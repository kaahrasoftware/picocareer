
import { useState } from 'react';
import { CareerChatMessage } from '@/types/database/analytics';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useCareerAnalysis(sessionId: string, addMessage: (message: Omit<CareerChatMessage, 'id'>) => Promise<CareerChatMessage | null>) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Function to analyze responses and generate career recommendations
  const analyzeResponses = async () => {
    if (!sessionId) return;
    
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

  return {
    isAnalyzing,
    analyzeResponses
  };
}
