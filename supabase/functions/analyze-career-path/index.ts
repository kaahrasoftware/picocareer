
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all user messages from the session
    const { data: messages, error: messagesError } = await supabase
      .from('career_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw new Error(`Error fetching messages: ${messagesError.message}`);
    }

    // Extract user responses and key information
    const userMessages = messages.filter(msg => msg.message_type === 'user');
    const botMessages = messages.filter(msg => msg.message_type === 'bot');
    
    // This would normally be a more complex analysis based on the conversation
    // For now, we'll use a simplified approach to match careers
    
    // Extract keywords from user responses
    const userContent = userMessages.map(msg => msg.content).join(' ').toLowerCase();
    
    // Get all careers from the database
    const { data: careers, error: careersError } = await supabase
      .from('careers')
      .select('*')
      .eq('complete_career', true)
      .limit(100);

    if (careersError) {
      throw new Error(`Error fetching careers: ${careersError.message}`);
    }

    // Simple matching algorithm based on keywords
    const scoredCareers = careers.map(career => {
      let score = 0;
      const maxScore = 100;
      
      // Check for keyword matches in the career title and description
      const careerKeywords = [
        ...(career.keywords || []),
        ...(career.required_skills || []),
        ...(career.transferable_skills || []),
      ];
      
      // Score based on keyword matches
      careerKeywords.forEach(keyword => {
        if (userContent.includes(keyword.toLowerCase())) {
          score += 10;
        }
      });
      
      // Limit the score to maxScore
      score = Math.min(score, maxScore);
      
      // Ensure minimum score of 60% for demonstration purposes
      score = Math.max(score, 60);
      
      return {
        id: career.id,
        title: career.title,
        score: score,
        reasoning: generateReasoning(career, score),
      };
    });
    
    // Sort careers by score (descending)
    const topCareers = scoredCareers
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Get top 3 careers
    
    // Store recommendation results in the database
    for (const career of topCareers) {
      await supabase
        .from('career_chat_recommendations')
        .insert({
          session_id: sessionId,
          career_id: career.id,
          score: career.score,
          reasoning: career.reasoning,
        });
    }

    return new Response(
      JSON.stringify({
        careers: topCareers,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-career-path:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to generate reasoning text based on career and score
function generateReasoning(career: any, score: number): string {
  const reasoningIntro = [
    "Based on your responses,",
    "From what you've shared,",
    "Your profile suggests that",
  ][Math.floor(Math.random() * 3)];
  
  let reasoningText = `${reasoningIntro} ${career.title} appears to be a good match. `;
  
  // Add description
  if (career.description) {
    reasoningText += `${career.description.split('.')[0]}. `;
  }
  
  // Add skills if available
  if (career.required_skills && career.required_skills.length > 0) {
    const skills = career.required_skills.slice(0, 3);
    reasoningText += `This role typically requires skills like ${skills.join(', ')}. `;
  }
  
  // Add salary information if available
  if (career.salary_range) {
    reasoningText += `Professionals in this field typically earn ${career.salary_range}. `;
  }
  
  return reasoningText;
}
