
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the request body
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    console.log(`Analyzing career path for session: ${sessionId}`);

    // 1. Fetch all messages for this session
    const { data: messages, error: messagesError } = await supabase
      .from('career_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw new Error(`Error fetching messages: ${messagesError.message}`);
    }

    if (!messages || messages.length === 0) {
      throw new Error('No messages found for analysis');
    }

    // 2. Extract user responses
    const userMessages = messages.filter(msg => msg.message_type === 'user');
    
    if (userMessages.length < 3) {
      throw new Error('Not enough user messages for meaningful analysis');
    }

    // 3. Format the messages for analysis
    const userResponses = userMessages.map(msg => msg.content).join('\n\n');
    
    console.log('User responses collected');

    // 4. In a real implementation, we would analyze the responses with AI
    // For now, we'll return mock career recommendations
    
    // Mock analysis results
    const mockAnalysis = {
      summary: "Based on the user's responses, they show strengths in problem-solving, creativity, and communication. They value work-life balance and prefer collaborative environments with flexibility.",
      recommendations: [
        {
          title: "Software Developer",
          score: 95,
          reasoning: "Based on interest in problem-solving and logical thinking, software development could be an excellent fit. This career offers flexibility, good compensation, and opportunities for remote work, which aligns with work-life balance preferences."
        },
        {
          title: "Data Scientist",
          score: 88,
          reasoning: "Analytical skills and interest in finding patterns would make someone successful in data science. This growing field combines statistics, programming, and domain expertise to extract insights from data."
        },
        {
          title: "UX/UI Designer",
          score: 82,
          reasoning: "Creative tendencies and interest in how people interact with technology suggest enjoyment in UX/UI design. This field allows combination of creative and analytical thinking to create intuitive digital experiences."
        }
      ]
    };

    console.log('Analysis completed');

    // 5. Store the recommendations in the database
    const recommendationPromises = mockAnalysis.recommendations.map(rec => {
      return supabase
        .from('career_chat_recommendations')
        .insert({
          session_id: sessionId,
          career_title: rec.title,
          score: rec.score,
          reasoning: rec.reasoning,
          created_at: new Date().toISOString()
        });
    });

    await Promise.all(recommendationPromises);
    
    console.log('Recommendations saved to database');

    // 6. Return the analysis results
    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: mockAnalysis 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in analyze-career-path function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
