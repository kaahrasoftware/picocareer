
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
`You are a helpful career advisor named Pico. Follow these strict guidelines:

1. Ask questions in this specific order:
   - Educational background/interests (3-4 questions about):
     * Current education level
     * Field of study
     * Academic interests
     * Learning preferences
   
   - Skills and technical knowledge (3-4 questions about):
     * Technical skills
     * Tools & technologies
     * Soft skills
     * Areas of expertise
   
   - Work style preferences (3-4 questions about):
     * Preferred work environment
     * Team collaboration style
     * Work-life balance
     * Stress tolerance
   
   - Career goals and aspirations (2-3 questions about):
     * Short-term goals
     * Long-term aspirations
     * Salary expectations

2. For each question:
   - Ask only ONE question at a time
   - Include 2-4 suggested answer options when appropriate
   - Reference previous answers to personalize following questions
   - Track the number of questions asked in each category

3. After collecting responses (12-15 questions total):
   Provide a comprehensive analysis with:

   a) Career Recommendations (5-7 matches from careers table):
      * Job title
      * Match percentage (0-100%)
      * Why it matches their profile
      * Required skills alignment
      * Education requirements
      * Work environment fit
      * Growth potential
      * Salary range (if available)

   b) Personality Assessment (top 3 types from personality_types table):
      * Personality type title
      * Match percentage (0-100%)
      * Key traits alignment
      * Strengths relevant to chosen careers
      * Areas for growth

   c) Mentor Suggestions (top 5 from profiles table where user_type = 'mentor'):
      * Mentor name
      * Years of experience
      * Relevant skills matching recommended careers
      * Current position
      * Areas of expertise
      * Location (if available)
      * Total mentoring sessions completed

Always include suggestions when appropriate, and format them as a JSON array in the "suggestions" field of the metadata.
For example, your metadata might look like: 
{ "hasOptions": true, "suggestions": ["Option 1", "Option 2", "Option 3"] }`
    }
    
    // Prepare the messages array with the system message first
    const aiMessages: AIChatMessage[] = [systemMessage]
    
    // Add conversation history if available
    if (messages && Array.isArray(messages)) {
      aiMessages.push(...messages)
    }
    
    console.log('Making request to DeepSeek API with messages:', JSON.stringify(aiMessages, null, 2))
    
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
        max_tokens: 900
      })
    })
    
    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.text()
      console.error('DeepSeek API error:', errorData)
      throw new Error(`DeepSeek API error: ${deepseekResponse.status} ${errorData}`)
    }
    
    const deepseekData = await deepseekResponse.json()
    const aiResponseContent = deepseekData.choices[0].message.content
    console.log('DeepSeek API response:', aiResponseContent)
    
    // Extract recommendations if present
    let isRecommendation = aiResponseContent.includes('Career Recommendations') || 
                           aiResponseContent.includes('Personality Assessment') ||
                           aiResponseContent.includes('Mentor Suggestions')
    
    // Extract suggestions from the response if not a recommendation
    let metadata = {}
    
    if (!isRecommendation) {
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
    } else {
      // This is a recommendation response, add a different metadata flag
      metadata = {
        isRecommendation: true,
        analysisComplete: true
      }
    }
    
    // Calculate what category we're in based on content pattern matching
    if (!isRecommendation) {
      const lowerContent = aiResponseContent.toLowerCase();
      if (lowerContent.includes('education') || lowerContent.includes('academic') || 
          lowerContent.includes('study') || lowerContent.includes('learning')) {
        metadata = { ...metadata, category: 'education' };
      } else if (lowerContent.includes('skill') || lowerContent.includes('technical') || 
                lowerContent.includes('tools') || lowerContent.includes('expertise')) {
        metadata = { ...metadata, category: 'skills' };
      } else if (lowerContent.includes('work style') || lowerContent.includes('environment') || 
                lowerContent.includes('collaboration') || lowerContent.includes('stress') || 
                lowerContent.includes('balance')) {
        metadata = { ...metadata, category: 'workstyle' };
      } else if (lowerContent.includes('goal') || lowerContent.includes('aspiration') || 
                lowerContent.includes('salary') || lowerContent.includes('future')) {
        metadata = { ...metadata, category: 'goals' };
      }
    }
    
    // Add the AI response to the database
    const { data: messageData, error: messageError } = await supabase
      .from('career_chat_messages')
      .insert({
        session_id: sessionId,
        message_type: isRecommendation ? 'recommendation' : 'bot',
        content: aiResponseContent,
        metadata
      })
      .select()
      .single()
    
    if (messageError) {
      console.error('Error storing AI response:', messageError)
      throw new Error('Failed to store AI response')
    }
    
    // When a recommendation is made, fetch and store actual career recommendations
    if (isRecommendation) {
      try {
        // Extract career titles from the AI response
        const careerMatches = extractCareerMatches(aiResponseContent);
        
        // Store each career recommendation in the database
        for (const career of careerMatches) {
          await supabase
            .from('career_chat_recommendations')
            .insert({
              session_id: sessionId,
              score: career.score,
              reasoning: career.reasoning,
              metadata: { career_title: career.title } 
            });
        }
      } catch (error) {
        console.error('Error storing career recommendations:', error);
        // Continue anyway, this should not block the main flow
      }
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

// Utility function to extract career matches from the AI response
function extractCareerMatches(text: string) {
  const matches: Array<{ title: string, score: number, reasoning: string }> = [];
  
  // Simple pattern matching to find career recommendations
  const careerSection = text.split('Career Recommendations')[1]?.split('Personality Assessment')[0] || '';
  
  if (careerSection) {
    // Look for patterns like "1. Software Developer (85%)" or "1. Software Developer - 85%"
    const careerMatches = careerSection.match(/\d+\.\s+(.*?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%)/g) || [];
    
    careerMatches.forEach((match, index) => {
      // Extract title and score
      const titleMatch = match.match(/\d+\.\s+(.*?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%)/);
      if (titleMatch) {
        const title = titleMatch[1].trim();
        const score = parseInt(titleMatch[2] || titleMatch[3] || '0', 10);
        
        // Try to find reasoning - look for text after the career until the next numbered item
        let reasoning = '';
        const startPos = careerSection.indexOf(match) + match.length;
        const nextNumberPos = careerSection.substring(startPos).search(/\d+\.\s+/);
        
        if (nextNumberPos > 0) {
          reasoning = careerSection.substring(startPos, startPos + nextNumberPos).trim();
        } else if (index === careerMatches.length - 1) {
          // For the last item, take all remaining text
          reasoning = careerSection.substring(startPos).trim();
        }
        
        matches.push({
          title,
          score,
          reasoning: reasoning || `Good match based on your skills and preferences.`
        });
      }
    });
  }
  
  return matches;
}
