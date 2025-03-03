
// Required for all Deno Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Get DeepSeek API key from environment
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    
    console.log("Checking DeepSeek API key configuration...");
    if (!DEEPSEEK_API_KEY) {
      console.error("DeepSeek API key not configured in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "DeepSeek API key not configured. Please add it to the Supabase secrets." 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 // Using 200 to ensure the front-end gets the error message
        }
      );
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get request body
    const { message, sessionId, messages, instructions, type } = await req.json();
    
    // Handle config check endpoint
    if (type === 'config-check') {
      if (!DEEPSEEK_API_KEY) {
        console.error("DeepSeek API key not configured");
        return new Response(
          JSON.stringify({ 
            error: "DeepSeek API key not configured. Please add it to the Supabase secrets." 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 // Using 200 to ensure the front-end gets the error message
          }
        );
      }
      
      console.log("DeepSeek API key is properly configured");
      return new Response(
        JSON.stringify({ status: "ok", configured: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("DeepSeek API key is configured. Proceeding with request.");
    
    // Configure format based on environment variables
    const responseFormat = Deno.env.get("RESPONSE_FORMAT") || "structured_json";
    const questionMaxLength = parseInt(Deno.env.get("QUESTION_MAX_LENGTH") || "60");
    const optionsMaxCount = parseInt(Deno.env.get("OPTIONS_MAX_COUNT") || "4");
    const optionsMaxLength = parseInt(Deno.env.get("OPTIONS_MAX_LENGTH") || "30");
    const categories = Deno.env.get("CATEGORIES")?.split(",") || ["education", "skills", "workstyle", "goals"];
    const questionMinCountPerCategory = parseInt(Deno.env.get("QUESTION_MIN_COUNT_PER_CATEGORY") || "3");
    const enableCategoryTracking = Deno.env.get("CATEGORY_TRACKING") === "enabled";
    
    // Build system prompt
    const systemPrompt = `You are Career.AI, a helpful career advisor chatbot. Your goal is to help users explore various career paths based on their interests, skills, education, and work preferences.

Ask questions one at a time to understand the user's:
- Education background and interests
- Technical and soft skills
- Work style preferences
- Career goals and aspirations

Format your responses as follows:
${responseFormat === "structured_json" ? `
- Always respond in valid JSON format with a "type" field (either "question" or "recommendation")
- For questions, include "content" with "question", "category", "questionNumber", "totalInCategory", and "options" fields
- Keep questions under ${questionMaxLength} characters
- Provide ${optionsMaxCount} options, each under ${optionsMaxLength} characters
- For recommendations, include "content" with "summary", "careers", and "personalities" fields
` : `
- Ask clear, concise questions
- One question at a time
- Keep questions under ${questionMaxLength} characters
- Provide response examples when helpful
`}

${enableCategoryTracking ? `
Track your progress through these categories:
${categories.map(cat => `- ${cat}`).join('\n')}
Ask at least ${questionMinCountPerCategory} questions from each category.
` : ''}

Be conversational and encouraging. Help users discover career paths that match their unique combination of interests, skills, and preferences. Don't force the conversation into a rigid structure - let it flow naturally.`;

    // Build message payload for DeepSeek API
    const deepseekPayload = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content
        }))
      ],
      temperature: 0.7,
      stream: false
    };

    console.log("Sending request to DeepSeek API");
    
    try {
      // Call DeepSeek API
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify(deepseekPayload)
      });
      
      // Check for API errors
      if (!response.ok) {
        const errorData = await response.json();
        console.error("DeepSeek API error:", errorData);
        return new Response(
          JSON.stringify({ 
            error: `Error from AI service: ${errorData.error?.message || response.statusText}` 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 // Using 200 to ensure the front-end gets the error message
          }
        );
      }
      
      // Process successful response
      const data = await response.json();
      console.log("Got response from DeepSeek API");
      
      // Extract the message content
      const aiResponse = data.choices[0].message.content;
      
      // Try to parse as JSON if structured format is expected
      let formattedResponse = aiResponse;
      if (responseFormat === "structured_json") {
        try {
          // If it's already valid JSON, we'll just use it
          if (typeof aiResponse === 'object') {
            formattedResponse = aiResponse;
          } else {
            // Try to parse string as JSON
            formattedResponse = JSON.parse(aiResponse);
          }
        } catch (e) {
          console.warn("Failed to parse AI response as JSON:", e);
          // If parsing fails, wrap the text in a simple structure
          formattedResponse = {
            type: "question",
            content: {
              question: aiResponse,
              category: "general",
              questionNumber: 1,
              totalInCategory: 1,
              options: []
            }
          };
        }
      }
      
      return new Response(
        JSON.stringify({ 
          message: formattedResponse,
          messageId: data.id
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error calling DeepSeek API:", error);
      return new Response(
        JSON.stringify({ 
          error: `Failed to communicate with AI service: ${error.message}` 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 // Using 200 to ensure the front-end gets the error message
        }
      );
    }
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: `An unexpected error occurred: ${error.message}` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
