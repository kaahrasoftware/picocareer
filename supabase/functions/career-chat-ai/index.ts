
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration variables from config.toml
const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
const AI_RESPONSE_FORMAT = Deno.env.get('AI_RESPONSE_FORMAT') || 'structured';
const STRUCTURED_FORMAT_INSTRUCTION = Deno.env.get('STRUCTURED_FORMAT_INSTRUCTION') || '';
const STRUCTURED_RESPONSE_VERSION = Deno.env.get('STRUCTURED_RESPONSE_VERSION') || '3';
const QUESTION_MAX_LENGTH = parseInt(Deno.env.get('QUESTION_MAX_LENGTH') || '60');
const OPTIONS_MAX_COUNT = parseInt(Deno.env.get('OPTIONS_MAX_COUNT') || '8');
const OPTIONS_MAX_LENGTH = parseInt(Deno.env.get('OPTIONS_MAX_LENGTH') || '40');
const CATEGORY_TRACKING = Deno.env.get('CATEGORY_TRACKING') || 'enabled';

// Define category data and question progression
const categories = ['education', 'skills', 'workstyle', 'goals'];
const questionsPerCategory = 3;
const totalQuestions = categories.length * questionsPerCategory;

// DeepSeek API configuration - FIXED ENDPOINT FROM .ai TO .com
const DEEPSEEK_API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat-v1-33b';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Configuration check mode
    if (req.method === 'POST') {
      const requestData = await req.json();
      
      if (requestData.type === 'config-check') {
        console.log('Performing config check for DeepSeek API');
        
        // Check if DeepSeek API key is configured
        if (!DEEPSEEK_API_KEY) {
          console.error('DeepSeek API key not configured');
          return new Response(
            JSON.stringify({ error: 'DeepSeek API key not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`DEEPSEEK_API_KEY found, length: ${DEEPSEEK_API_KEY.length}, prefix: ${DEEPSEEK_API_KEY.substring(0, 5)}...`);
        
        // Validate API key with a minimal request - try basic echo for validation
        try {
          console.log(`Sending validation request to DeepSeek API at: ${DEEPSEEK_API_ENDPOINT}`);
          const validationResponse = await fetch(DEEPSEEK_API_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
              model: DEEPSEEK_MODEL,
              messages: [
                { role: 'system', content: 'Return only "ok" as your response.' },
                { role: 'user', content: 'Verify API connection' }
              ],
              max_tokens: 10,
              temperature: 0.1
            })
          });
          
          console.log(`DeepSeek API validation response status: ${validationResponse.status}`);
          
          if (!validationResponse.ok) {
            const errorText = await validationResponse.text();
            console.error('DeepSeek API validation failed:', errorText);
            
            let errorMessage = `DeepSeek API key validation failed: ${validationResponse.status}`;
            try {
              // Try to parse error as JSON for more details
              const errorJson = JSON.parse(errorText);
              if (errorJson.error && errorJson.error.message) {
                errorMessage = errorJson.error.message;
              }
              console.error('Parsed error details:', JSON.stringify(errorJson));
            } catch (e) {
              console.error('Failed to parse error response as JSON:', errorText);
            }
            
            return new Response(
              JSON.stringify({ 
                error: errorMessage, 
                details: errorText,
                status: validationResponse.status
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          const validationResult = await validationResponse.json();
          console.log('DeepSeek API validation successful, response:', JSON.stringify(validationResult));
          
          return new Response(
            JSON.stringify({ 
              status: 'ok', 
              configured: true,
              api_version: validationResult.model || DEEPSEEK_MODEL 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (validationError) {
          console.error('DeepSeek API validation error:', validationError.message);
          console.error('Error stack:', validationError.stack);
          
          // Check if the error is related to a domain issue (common with api.deepseek.ai vs api.deepseek.com)
          const errorMessage = validationError.message;
          const isDomainError = errorMessage && (
            errorMessage.includes('error sending request for url') || 
            errorMessage.includes('network error') || 
            errorMessage.includes('failed to fetch')
          );
          
          return new Response(
            JSON.stringify({ 
              error: isDomainError ? 
                'Error connecting to DeepSeek API. Please verify the API endpoint and network connectivity.' : 
                'DeepSeek API validation error', 
              details: validationError.message,
              stack: validationError.stack,
              endpoint: DEEPSEEK_API_ENDPOINT // Include the endpoint for debugging
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Regular API request handling
    const { message, sessionId, messages, instructions = {} } = await req.json();
    
    if (!DEEPSEEK_API_KEY) {
      console.error('DeepSeek API Key not configured');
      return new Response(
        JSON.stringify({ error: 'DeepSeek API Key not configured. Please add it to your environment variables.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format the conversation history for DeepSeek
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Calculate question number based on user message count
    const userMessageCount = formattedMessages.filter(m => m.role === 'user').length;
    
    // Add system prompt with appropriate instructions
    let systemPrompt = "You are Pico, a friendly, knowledgeable career advisor AI. Your goal is to help users explore career options based on their education, skills, work preferences, and goals.";
    
    // Add structured format instructions if enabled
    if (AI_RESPONSE_FORMAT === 'structured' && instructions.useStructuredFormat) {
      systemPrompt += `\n\n${STRUCTURED_FORMAT_INSTRUCTION}`;
      
      // Add category tracking instructions
      if (CATEGORY_TRACKING === 'enabled') {
        const currentCategory = categories[Math.min(Math.floor((userMessageCount - 1) / questionsPerCategory), categories.length - 1)];
        const questionInCategory = ((userMessageCount - 1) % questionsPerCategory) + 1;
        const overallProgress = Math.min(Math.round((userMessageCount / totalQuestions) * 100), 100);
        
        systemPrompt += `\n\nCurrent question category: ${currentCategory}`;
        systemPrompt += `\nQuestion ${questionInCategory} of ${questionsPerCategory} in this category`;
        systemPrompt += `\nOverall progress: ${overallProgress}%`;
        
        // Add specific questions based on category
        if (userMessageCount <= totalQuestions) {
          systemPrompt += `\n\nAsk a specific question about the user's ${currentCategory}. Keep your question concise (max ${QUESTION_MAX_LENGTH} chars).`;
          systemPrompt += `\nProvide ${OPTIONS_MAX_COUNT} or fewer response options, each ${OPTIONS_MAX_LENGTH} chars or less.`;
          systemPrompt += `\nMake sure to set type: "question" in your JSON response.`;
          systemPrompt += `\nIn the metadata of your response, include:`;
          systemPrompt += `\n- progress.category: "${currentCategory}"`;
          systemPrompt += `\n- progress.current: ${questionInCategory}`;
          systemPrompt += `\n- progress.total: ${questionsPerCategory}`;
          systemPrompt += `\n- progress.overall: ${overallProgress}`;
        } else {
          systemPrompt += `\n\nThe user has answered enough questions. If appropriate, you should now generate a career recommendation.`;
          systemPrompt += `\nFor recommendations, use type: "recommendation" in your JSON response.`;
        }
      }
    }

    // Detect recommendation request
    const isRecommendationRequest = message.toLowerCase().includes('recommend') || 
                                   message.toLowerCase().includes('suggest') ||
                                   message.toLowerCase().includes('career matches') ||
                                   message.toLowerCase().includes('find career');

    if (isRecommendationRequest) {
      systemPrompt += `\n\nThe user is requesting career recommendations. Provide personalized career suggestions based on their responses.`;
      systemPrompt += `\nUse type: "recommendation" in your JSON response.`;
    }

    // Add short specific questions instruction for better UX
    if (instructions.specificQuestions) {
      systemPrompt += `\n\nAsk specific, focused questions that can be answered briefly.`;
    }

    // Add concise options instruction for better UX
    if (instructions.conciseOptions) {
      systemPrompt += `\n\nWhen providing options, make them concise, clear and distinct.`;
    }

    console.log(`Making API request to DeepSeek with ${formattedMessages.length} messages`);
    console.log(`Using DeepSeek API endpoint: ${DEEPSEEK_API_ENDPOINT}`);
    
    // Make the API call to DeepSeek
    try {
      const response = await fetch(DEEPSEEK_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...formattedMessages
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error:', errorText);
        let errorMessage = `DeepSeek API error: ${response.status}`;
        
        try {
          // Try to parse error as JSON for more details
          const errorJson = JSON.parse(errorText);
          if (errorJson.error && errorJson.error.message) {
            errorMessage = errorJson.error.message;
          }
        } catch (e) {
          // If parsing fails, use the raw error text
          errorMessage = errorText;
        }
        
        return new Response(
          JSON.stringify({ 
            error: errorMessage,
            status: response.status,
            endpoint: DEEPSEEK_API_ENDPOINT // Include endpoint for debugging
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await response.json();
      console.log('DeepSeek API response successful');
      
      const aiResponse = result.choices?.[0]?.message?.content || '';
      
      // Check if response is in expected JSON format
      let structuredMessage = null;
      let rawResponse = null;
      
      try {
        if (aiResponse.includes('{') && aiResponse.includes('}')) {
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            rawResponse = JSON.parse(jsonMatch[0]);
            structuredMessage = rawResponse;
            console.log('Successfully parsed structured message from response');
          }
        }
      } catch (e) {
        console.error('Failed to parse JSON from response:', e);
      }

      // Generate metadata based on response
      const metadata = {
        structuredFormat: AI_RESPONSE_FORMAT === 'structured',
        structuredVersion: STRUCTURED_RESPONSE_VERSION
      };

      // Add category tracking data
      if (CATEGORY_TRACKING === 'enabled' && !structuredMessage) {
        const currentCategory = categories[Math.min(Math.floor((userMessageCount - 1) / questionsPerCategory), categories.length - 1)];
        const questionInCategory = ((userMessageCount - 1) % questionsPerCategory) + 1;
        const overallProgress = Math.min(Math.round((userMessageCount / totalQuestions) * 100), 100);
        
        Object.assign(metadata, {
          category: currentCategory,
          questionNumber: questionInCategory,
          totalInCategory: questionsPerCategory,
          progress: overallProgress
        });
      }

      // Generate a clean text message from structured format if needed
      let cleanTextMessage = aiResponse;
      if (structuredMessage) {
        if (structuredMessage.type === 'question') {
          cleanTextMessage = structuredMessage.content.intro 
            ? `${structuredMessage.content.intro}\n\n**Question ${structuredMessage.metadata?.progress?.current || 1}/${structuredMessage.metadata?.progress?.total || 10} (${structuredMessage.metadata?.progress?.category || 'general'}):** ${structuredMessage.content.question}`
            : `**Question ${structuredMessage.metadata?.progress?.current || 1}/${structuredMessage.metadata?.progress?.total || 10} (${structuredMessage.metadata?.progress?.category || 'general'}):** ${structuredMessage.content.question}`;
        } else if (structuredMessage.type === 'recommendation') {
          cleanTextMessage = 'Here are your personalized career recommendations based on your responses:';
          
          if (structuredMessage.sections?.careers) {
            cleanTextMessage += '\n\n**Career Recommendations:**\n';
            structuredMessage.sections.careers.forEach((career, i) => {
              cleanTextMessage += `${i+1}. ${career.title} (${career.match}%)\n${career.reasoning}\n\n`;
            });
          }
          
          if (structuredMessage.sections?.personality) {
            cleanTextMessage += '**Personality Assessment:**\n';
            structuredMessage.sections.personality.forEach((trait, i) => {
              cleanTextMessage += `${i+1}. ${trait.title} (${trait.match}%)\n${trait.description}\n\n`;
            });
          }
          
          if (structuredMessage.sections?.mentors) {
            cleanTextMessage += '**Mentor Suggestions:**\n';
            structuredMessage.sections.mentors.forEach((mentor, i) => {
              cleanTextMessage += `${i+1}. ${mentor.name}\n${mentor.experience} - ${mentor.skills}\n\n`;
            });
          }
        } else {
          cleanTextMessage = structuredMessage.content?.intro || structuredMessage.content?.question || aiResponse;
        }
      }
      
      console.log('Sending final response', {
        responseType: structuredMessage?.type || 'text',
        messageLength: cleanTextMessage.length,
        hasMetadata: !!metadata,
        progress: metadata.progress || 0
      });
      
      return new Response(
        JSON.stringify({
          message: cleanTextMessage,
          messageId: `ai-${Date.now()}`,
          structuredMessage,
          rawResponse,
          metadata
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error('Error making request to DeepSeek API:', apiError.message);
      console.error('Error stack:', apiError.stack);
      
      // Enhance error message to include endpoint information
      const errorDetails = `Failed to communicate with DeepSeek API at ${DEEPSEEK_API_ENDPOINT}: ${apiError.message}`;
      
      return new Response(
        JSON.stringify({ 
          error: errorDetails,
          details: apiError.stack,
          endpoint: DEEPSEEK_API_ENDPOINT
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: `Error processing request: ${error.message}`, 
        details: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
