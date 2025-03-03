
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
    const requestData = await req.json();

    // Handle config check requests
    if (requestData.type === 'config-check') {
      // Get DeepSeek API key from environment variable
      const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
      if (!deepSeekApiKey) {
        return new Response(
          JSON.stringify({ error: 'DeepSeek API key not configured' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ configured: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get DeepSeek API key from environment variable for regular requests
    const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepSeekApiKey) {
      console.error('DeepSeek API key not found');
      throw new Error('DeepSeek API key not found');
    }

    // Get data from request
    const { message, sessionId, messages } = requestData;

    // Create formatted message history for DeepSeek API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add system message at the beginning with career advisor instructions
    // Updated to provide more specific guidance for the interactive format
    formattedMessages.unshift({
      role: "system",
      content: `You are a helpful career advisor named Pico. Your goal is to help users explore career paths that match their skills, interests, and goals. 

INTERACTION RULES:
1. Ask ONLY ONE question at a time and wait for the user's response
2. For each question, provide 2-4 suggested answer options for the user to choose from
3. Use previous answers to personalize and inform your following questions
4. Be friendly, encouraging, and supportive
5. Focus on understanding the user's:
   - Skills, strengths and interests
   - Educational background or aspirations
   - Career values and preferences
   - Work environment preferences
   - Long-term goals

RESPONSE FORMAT:
Always structure your response in the following format:
1. A brief acknowledgment of the user's previous answer (except for first message)
2. One clear, focused question
3. A numbered list of 2-4 suggested answer options preceded by "Suggested options:"
4. End with "Feel free to choose one of these options or provide your own answer."

CONVERSATION PROGRESSION:
- Start by introducing yourself and asking about their interests
- Progress through skills, education, values, and preferences
- Build on their answers to deepen the conversation
- After 5-7 questions, start synthesizing what you've learned and suggest potential career paths`
    });

    console.log('Sending request to DeepSeek with messages:', JSON.stringify(formattedMessages.slice(0, 3)) + '...');

    // Call DeepSeek API (using their chat completion API)
    // Note: Updated to use the correct .ai domain
    const response = await fetch('https://api.deepseek.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepSeekApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('DeepSeek response:', JSON.stringify(data));

    // Extract the response text
    const aiResponse = data.choices[0].message.content;

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract suggestions if available in the AI response
    let content = aiResponse;
    let metadata = {};
    
    // Simple heuristic to find suggested options in the response
    const suggestedOptionsMatch = aiResponse.match(/Suggested options:([\s\S]*?)(?:Feel free to choose|$)/i);
    if (suggestedOptionsMatch) {
      const optionsText = suggestedOptionsMatch[1].trim();
      // Extract numbered options (1. Option A, 2. Option B, etc.)
      const options = optionsText.split(/\d+\.\s+/)
        .filter(Boolean)
        .map(option => option.trim());
      
      if (options.length > 0) {
        metadata = { 
          suggestions: options,
          hasOptions: true
        };
      }
    }

    // Store the message in the database
    const { data: storedMessage, error } = await supabase
      .from('career_chat_messages')
      .insert({
        session_id: sessionId,
        message_type: 'bot',
        content: content,
        metadata: metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing message:', error);
    }

    // Return the AI response and the stored message data
    return new Response(
      JSON.stringify({
        response: aiResponse,
        message: storedMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
