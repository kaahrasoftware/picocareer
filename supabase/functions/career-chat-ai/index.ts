
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Load configuration
const config = await load({ envPath: "./config.toml" });
const projectId = config["project_id"] || Deno.env.get("PROJECT_ID");
const deepseekApiKey = config.config?.DEEPSEEK_API_KEY || Deno.env.get("DEEPSEEK_API_KEY");
const responseFormat = config.config?.RESPONSE_FORMAT || "default";
const questionMaxLength = parseInt(config.config?.QUESTION_MAX_LENGTH || "60");
const optionsMaxCount = parseInt(config.config?.OPTIONS_MAX_COUNT || "4");
const optionsMaxLength = parseInt(config.config?.OPTIONS_MAX_LENGTH || "30");
const categoryTracking = config.config?.CATEGORY_TRACKING || "disabled";
const categories = config.config?.CATEGORIES ? config.config.CATEGORIES.split(",") : ["education", "skills", "workstyle", "goals"];

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || `https://${projectId}.supabase.co`;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to create a consistent chat session message
async function createSessionMessage(
  sessionId: string,
  messageType: "user" | "bot" | "system",
  content: string,
  metadata: any = {}
) {
  try {
    const { data, error } = await supabase
      .from("career_chat_messages")
      .insert({
        session_id: sessionId,
        message_type: messageType,
        content,
        metadata,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating session message:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in createSessionMessage:", error);
    return null;
  }
}

// Function to generate a response using DeepSeek API
async function generateAIResponse(messages: any[], instructions: any = {}) {
  try {
    if (!deepseekApiKey) {
      throw new Error("DeepSeek API key not configured");
    }

    // Format our instructions for the AI
    const systemMessage = {
      role: "system",
      content: `You are a career guidance advisor AI. Your goal is to help users explore career options and provide recommendations.
Follow these guidelines:

1. Ask focused questions about the user's education, skills, work style preferences, and career goals.
2. Keep responses concise and structured.
3. When asking a question, always provide 2-4 options for the user to choose from.
4. Track which category you're asking about (education, skills, workstyle, or goals).
5. Present options in a clear, easy-to-select format.
6. Collect enough information before making career recommendations (at least 10-15 questions).
7. When ready to provide recommendations, format your response with clear career matches, personality insights, and relevant advice.

${responseFormat === "structured_json" 
  ? `IMPORTANT: Format your responses in structured JSON format as follows:

For questions:
{
  "type": "question",
  "content": {
    "question": "What is your highest level of education?",
    "category": "education",
    "questionNumber": 1,
    "totalInCategory": 4,
    "options": [
      {
        "id": "high_school",
        "label": "High School Diploma",
        "description": "Secondary education completed"
      },
      {
        "id": "bachelors",
        "label": "Bachelor's Degree",
        "description": "4-year undergraduate degree"
      },
      {
        "id": "masters",
        "label": "Master's Degree",
        "description": "Graduate level education"
      },
      {
        "id": "doctorate",
        "label": "Doctorate/PhD",
        "description": "Advanced research degree"
      }
    ]
  }
}

For recommendations:
{
  "type": "recommendation",
  "content": {
    "careers": [
      {
        "title": "Software Engineer",
        "match": 85,
        "description": "Perfect match for your technical skills and problem-solving abilities."
      }
    ],
    "personalities": [
      {
        "type": "Analytical Problem Solver",
        "match": 90,
        "traits": ["Detail-oriented", "Logical", "Systematic"],
        "description": "You approach problems methodically and enjoy finding solutions."
      }
    ],
    "mentors": [
      {
        "name": "John Doe",
        "expertise": "Software Engineering",
        "experience": "10 years",
        "match": 88
      }
    ]
  }
}`
  : "Keep your responses concise and structured."
}`;
    };

    const apiMessages = [systemMessage, ...messages];

    // Prepare the request to DeepSeek API
    const requestBody = {
      model: "deepseek-chat",
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 0.95,
      stop: null,
    };

    // Call DeepSeek API
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", errorText);
      throw new Error(`DeepSeek API returned status ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log("DeepSeek API response:", JSON.stringify(responseData));

    if (responseData.choices && responseData.choices.length > 0) {
      let aiMessage = responseData.choices[0].message.content;
      
      // Process structured JSON if needed
      if (instructions.structuredFormat || responseFormat === "structured_json") {
        try {
          // Check if the response is already a JSON object
          if (typeof aiMessage === "string") {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = aiMessage.match(/```json\n([\s\S]*?)\n```/) || 
                            aiMessage.match(/```\n([\s\S]*?)\n```/) ||
                            aiMessage.match(/\{[\s\S]*\}/);
                            
            if (jsonMatch) {
              aiMessage = jsonMatch[1] || jsonMatch[0];
            }
            
            // Try to parse the message as JSON
            aiMessage = JSON.parse(aiMessage);
          }
        } catch (error) {
          console.warn("Failed to parse AI response as JSON:", error);
          // Continue with the string response if parsing fails
        }
      }
      
      return aiMessage;
    } else {
      throw new Error("No response choices returned from DeepSeek API");
    }
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Parse the request body
    const requestData = await req.json();
    
    // Handle configuration check requests
    if (requestData.type === "config-check") {
      if (!deepseekApiKey) {
        return new Response(
          JSON.stringify({ error: "DeepSeek API key not configured" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      return new Response(
        JSON.stringify({ status: "ok", configured: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { message, sessionId, messages, instructions = {} } = requestData;
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Generate AI response
    const aiResponse = await generateAIResponse(messages || [], instructions);
    
    // If storing in DB is requested
    let messageId = null;
    if (requestData.storeInDb) {
      // Create the message in the database
      const metadata = typeof aiResponse === "object" 
        ? { 
            type: aiResponse.type,
            ...(aiResponse.type === "question" ? {
              category: aiResponse.content?.category,
              questionNumber: aiResponse.content?.questionNumber,
              totalInCategory: aiResponse.content?.totalInCategory,
              hasOptions: true,
              suggestions: aiResponse.content?.options?.map((opt: any) => opt.label),
              optionsData: aiResponse.content?.options,
            } : {}),
            ...(aiResponse.type === "recommendation" ? {
              isRecommendation: true,
              careers: aiResponse.content?.careers,
              personalities: aiResponse.content?.personalities,
              mentors: aiResponse.content?.mentors,
            } : {})
          }
        : {};
      
      const content = typeof aiResponse === "object"
        ? (aiResponse.type === "question" ? aiResponse.content?.question : JSON.stringify(aiResponse))
        : aiResponse;
      
      const storedMessage = await createSessionMessage(
        sessionId,
        "bot",
        content,
        metadata
      );
      
      if (storedMessage) {
        messageId = storedMessage.id;
      }
    }
    
    // Return the response
    return new Response(
      JSON.stringify({
        message: aiResponse,
        messageId,
        sessionId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred processing your request" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
