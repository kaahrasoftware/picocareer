
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
    formattedMessages.unshift({
      role: "system",
      content: "You are a helpful career advisor named Pico. Your goal is to help users explore career paths that match their skills, interests, and goals. Be friendly, encouraging, and supportive. Ask thoughtful questions to understand the user better. Provide practical advice tailored to their situation."
    });

    console.log('Sending request to DeepSeek with messages:', JSON.stringify(formattedMessages.slice(0, 3)) + '...');

    // Call DeepSeek API (using their chat completion API)
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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

    // Store the message in the database
    const { data: storedMessage, error } = await supabase
      .from('career_chat_messages')
      .insert({
        session_id: sessionId,
        message_type: 'bot',
        content: aiResponse,
        metadata: {}
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
