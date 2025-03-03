
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface RequestBody {
  message: string;
  sessionId: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
}

// System prompt to guide the AI's behavior
const SYSTEM_PROMPT = `You are Pico, an AI career guide. Your purpose is to help users explore career options that match their interests, skills, and preferences. 
Ask thoughtful questions to understand the user better, then provide personalized career recommendations.

Guidelines:
- Be conversational and friendly but professional
- Ask questions to understand the user's interests, skills, education, and work preferences
- After collecting sufficient information, provide 2-3 personalized career recommendations with clear reasoning
- Each recommendation should include a job title, why it might be a good fit, and key skills needed
- Keep responses concise (max 3 paragraphs)
- Don't ask all questions at once; have a natural conversation`;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { message, sessionId, messages } = await req.json() as RequestBody;

    if (!message || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Message and sessionId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the message history for OpenAI, including system prompt
    const messageHistory = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messageHistory,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in career-chat-ai function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
