
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Categories for the career exploration questionnaire
const categories = [
  'education',
  'skills',
  'workstyle',
  'goals',
  'environment'
];

// Configure how many questions per category
const questionsPerCategory = 3;
const totalQuestions = categories.length * questionsPerCategory;

// DeepSeek API configuration - FIXED ENDPOINT FROM .ai TO .com
const DEEPSEEK_API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
// Update to current model name (from deepseek-chat-v1-33b to deepseek-chat)
const DEEPSEEK_MODEL = 'deepseek-chat';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Get the DeepSeek API key from environment variables
  const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
  if (!DEEPSEEK_API_KEY) {
    console.error('DeepSeek API key not found in environment variables');
    return new Response(
      JSON.stringify({ error: 'DeepSeek API key not configured' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    const { type, message, sessionId, messages, instructions } = await req.json();

    // Handle configuration check requests
    if (type === 'config-check') {
      console.log('Running DeepSeek API configuration check');
      
      try {
        // Validate API key with a minimal request - try basic echo for validation
        try {
          console.log(`Sending validation request to DeepSeek API at: ${DEEPSEEK_API_ENDPOINT}`);
          const validationResponse = await fetch(DEEPSEEK_API_ENDPOINT, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: DEEPSEEK_MODEL,
              messages: [
                { role: 'user', content: 'Echo test' }
              ],
              max_tokens: 10
            }),
          });
          
          if (!validationResponse.ok) {
            const errorData = await validationResponse.json();
            console.error('DeepSeek API validation failed:', errorData);
            throw new Error(JSON.stringify(errorData));
          }
          
          const validationResult = await validationResponse.json();
          console.log('DeepSeek API validation successful:', validationResult);
          
          return new Response(
            JSON.stringify({ success: true, message: 'DeepSeek API configured correctly' }),
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
              endpoint: DEEPSEEK_API_ENDPOINT, // Include the endpoint for debugging
              model: DEEPSEEK_MODEL // Include the model name for debugging
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error('Error during API configuration check:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to validate DeepSeek API configuration',
            details: error.message
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // If this is not a configuration check, process as a normal message
    if (!message || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters (message or sessionId)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Format the conversation history for the API
    let formattedMessages = [];
    
    if (messages && Array.isArray(messages)) {
      formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    } else {
      // If no message history provided, start with a default system message
      formattedMessages = [
        {
          role: 'system',
          content: `You are Pico, a career guidance AI that helps users explore career options through an interactive conversation. 
          Ask specific, targeted questions to understand the user's educational background, skills, work preferences, and career goals.
          Be conversational, personable, and encouraging.
          Provide personalized guidance based on the user's responses.`
        }
      ];
    }

    // Add structured response format instruction if requested
    if (instructions && instructions.useStructuredFormat) {
      // Get the format instruction from config
      const formatInstruction = Deno.env.get('STRUCTURED_FORMAT_INSTRUCTION') || '';
      
      if (formatInstruction) {
        // Add or update the system message with format instructions
        if (formattedMessages[0]?.role === 'system') {
          formattedMessages[0].content += '\n\n' + formatInstruction;
        } else {
          formattedMessages.unshift({
            role: 'system',
            content: formatInstruction
          });
        }
      }
    }

    console.log(`Making API request to DeepSeek with ${formattedMessages.length} messages`);
    console.log(`Using DeepSeek API endpoint: ${DEEPSEEK_API_ENDPOINT}`);
    console.log(`Using DeepSeek model: ${DEEPSEEK_MODEL}`);
    
    // Make the API call to DeepSeek
    try {
      const response = await fetch(DEEPSEEK_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        let errorMessage = `DeepSeek API returned status ${response.status}`;
        let errorData = null;
        
        try {
          errorData = await response.json();
          console.error('DeepSeek API error:', errorData);
          
          if (errorData.error) {
            errorMessage = `DeepSeek API error: ${JSON.stringify(errorData.error)}`;
            
            // Check specifically for model not found errors
            if (errorData.error.message?.includes('Model Not Exist')) {
              errorMessage = `The model "${DEEPSEEK_MODEL}" does not exist. Please check the available models and update the configuration.`;
            }
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        
        return new Response(
          JSON.stringify({ 
            error: errorMessage,
            status: response.status,
            endpoint: DEEPSEEK_API_ENDPOINT, // Include endpoint for debugging
            model: DEEPSEEK_MODEL // Include model for debugging
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await response.json();
      console.log('DeepSeek API response received');

      // Extract the content from the assistant's message
      const content = result.choices[0].message?.content || '';

      // For structured response format, try to parse the JSON
      let structuredMessage = null;
      let rawResponse = null;
      
      if (instructions && instructions.useStructuredFormat) {
        try {
          // Look for JSON in the response - it might be embedded in a markdown code block
          const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                          content.match(/(\{[\s\S]*?\})/);
          
          if (jsonMatch && jsonMatch[1]) {
            const jsonContent = jsonMatch[1].trim();
            rawResponse = JSON.parse(jsonContent);
            structuredMessage = rawResponse;
            
            console.log('Parsed structured message:', structuredMessage.type);
          } else {
            console.log('Could not find JSON in the response');
          }
        } catch (parseError) {
          console.error('Error parsing structured message:', parseError);
        }
      }

      // Use the category from the parsed message if available
      let category = null;
      let isRecommendation = false;
      
      if (structuredMessage) {
        if (structuredMessage.metadata?.progress?.category) {
          category = structuredMessage.metadata.progress.category;
        }
        
        if (structuredMessage.type === 'recommendation') {
          isRecommendation = true;
        }
      }

      // Generate suggestions based on the conversation context
      let suggestions = [];
      
      if (structuredMessage?.content?.options && Array.isArray(structuredMessage.content.options)) {
        suggestions = structuredMessage.content.options.map(option => option.text || option.id || '');
      }

      // Return the processed result
      return new Response(
        JSON.stringify({
          messageId: crypto.randomUUID(),
          message: content,
          category,
          structuredMessage,
          rawResponse,
          metadata: {
            isRecommendation,
            suggestions
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error('Error making request to DeepSeek API:', apiError.message);
      console.error('Error stack:', apiError.stack);
      
      // Enhance error message to include endpoint information
      const errorDetails = `Failed to communicate with DeepSeek API at ${DEEPSEEK_API_ENDPOINT} using model ${DEEPSEEK_MODEL}: ${apiError.message}`;
      
      return new Response(
        JSON.stringify({ 
          error: errorDetails,
          details: apiError.stack,
          endpoint: DEEPSEEK_API_ENDPOINT,
          model: DEEPSEEK_MODEL
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
