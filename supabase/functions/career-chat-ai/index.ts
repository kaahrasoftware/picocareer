
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get DeepSeek API key from environment variable
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')
    
    if (!DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'DeepSeek API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Parse request body
    const requestData = await req.json()
    
    // Handle configuration check
    if (requestData.type === 'config-check') {
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const { message, sessionId, messages } = requestData
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Prepare messages for the AI
    const systemMessage: AIChatMessage = {
      role: 'system',
      content: 
`You are a helpful career advisor named Pico. You must:
- Ask only ONE question at a time
- Wait for the user's response before asking the next question
- Include 2-4 suggested answer options when appropriate
- Use previous answers to personalize following questions
- Focus on understanding the user's:
  * Skills and interests
  * Educational background
  * Career goals
  * Work preferences

Always structure your response as a single question with suggestions when appropriate. If including suggestions, format them as a JSON array in the "suggestions" field of the metadata.
For example, your metadata might look like: 
{ "hasOptions": true, "suggestions": ["Option 1", "Option 2", "Option 3"] }`
    }
    
    // Prepare the messages array with the system message first
    const aiMessages: AIChatMessage[] = [systemMessage]
    
    // Add conversation history if available
    if (messages && Array.isArray(messages)) {
      aiMessages.push(...messages)
    }
    
    // Make request to DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: aiMessages,
        temperature: 0.7,
        max_tokens: 800
      })
    })
    
    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.text()
      console.error('DeepSeek API error:', errorData)
      throw new Error(`DeepSeek API error: ${deepseekResponse.status} ${errorData}`)
    }
    
    const deepseekData = await deepseekResponse.json()
    const aiResponseContent = deepseekData.choices[0].message.content
    
    // Extract suggestions from the response if any
    let metadata = {}
    
    // Look for suggestion patterns in the response
    if (aiResponseContent.includes('Option 1') || 
        aiResponseContent.includes('1.') || 
        aiResponseContent.includes('Suggestion')) {
      
      // Try to extract suggestions using pattern matching
      const suggestionLines = aiResponseContent
        .split('\n')
        .filter(line => 
          line.includes('Option ') || 
          /^\d+\./.test(line.trim()) || 
          line.includes('Suggestion')
        )
        .map(line => line.replace(/^(Option \d+:|Suggestion \d+:|\d+\.|[•\-*]\s+)/i, '').trim())
        .filter(line => line.length > 0)
      
      if (suggestionLines.length > 0) {
        metadata = {
          hasOptions: true,
          suggestions: suggestionLines
        }
      }
    }
    
    // Add the AI response to the database
    const { data: messageData, error: messageError } = await supabase
      .from('career_chat_messages')
      .insert({
        session_id: sessionId,
        message_type: 'bot',
        content: aiResponseContent,
        metadata
      })
      .select()
      .single()
    
    if (messageError) {
      console.error('Error storing AI response:', messageError)
      throw new Error('Failed to store AI response')
    }
    
    return new Response(
      JSON.stringify({
        message: aiResponseContent,
        messageId: messageData.id,
        metadata
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in career-chat-ai function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
