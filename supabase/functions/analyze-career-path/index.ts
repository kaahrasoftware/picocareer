
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Load configuration
const config = await load({ envPath: "./config.toml" });
const deepseekApiKey = config.config?.DEEPSEEK_API_KEY || Deno.env.get("DEEPSEEK_API_KEY");
const projectId = config["project_id"] || Deno.env.get("PROJECT_ID");

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || `https://${projectId}.supabase.co`;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get all messages from a chat session
async function getSessionMessages(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from("career_chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching session messages:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getSessionMessages:", error);
    return [];
  }
}

// Helper function to create a recommendation message
async function createRecommendationMessage(
  sessionId: string,
  recommendation: any
) {
  try {
    let content = '';
    let metadata = {};
    
    // Convert to structured format if needed
    if (typeof recommendation === 'string') {
      content = recommendation;
    } else {
      content = "Here are your career recommendations.";
      metadata = {
        isRecommendation: true,
        careers: recommendation.careers || [],
        personalities: recommendation.personalities || [],
        mentors: recommendation.mentors || []
      };
    }
    
    const { data, error } = await supabase
      .from("career_chat_messages")
      .insert({
        session_id: sessionId,
        message_type: "recommendation",
        content,
        metadata,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating recommendation message:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in createRecommendationMessage:", error);
    return null;
  }
}

// Update session status to completed
async function updateSessionStatus(sessionId: string) {
  try {
    const { error } = await supabase
      .from("career_chat_sessions")
      .update({ status: "completed" })
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating session status:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateSessionStatus:", error);
    return false;
  }
}

// Function to generate career recommendations using DeepSeek API
async function generateCareerRecommendations(messages: any[]) {
  try {
    if (!deepseekApiKey) {
      throw new Error("DeepSeek API key not configured");
    }

    const userMessages = messages
      .filter(m => m.message_type === "user" || m.message_type === "bot")
      .map(m => ({
        role: m.message_type === "user" ? "user" : "assistant",
        content: m.content
      }));

    // Format our instructions for the AI
    const systemMessage = {
      role: "system",
      content: `You are a career guidance advisor. Based on the conversation history with the user, analyze their background, skills, preferences, and goals to provide personalized career recommendations.

Return your analysis in the following structured JSON format:
{
  "careers": [
    {
      "title": "Software Engineer",
      "match": 85,
      "description": "Perfect match for your technical skills and problem-solving abilities."
    },
    {
      "title": "Data Scientist",
      "match": 82,
      "description": "Great fit for your analytical mindset and mathematical background."
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
      "name": "Sarah Johnson",
      "expertise": "Software Engineering",
      "experience": "15 years",
      "match": 88
    }
  ]
}

Guidelines:
1. Provide 3-5 career recommendations with match percentages (1-100) based on how well they align with the user's profile.
2. Include 1-3 personality types that match the user.
3. Suggest 2-3 fictional mentors who could help guide the user in their top career paths.
4. Add brief descriptions for each career, personality type, and mentor.
5. Ensure your response is formatted exactly as the JSON structure shown above.`
    };

    const apiMessages = [systemMessage, ...userMessages];

    // Prepare the request to DeepSeek API
    const requestBody = {
      model: "deepseek-chat",
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
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
      
      // Attempt to parse the JSON response
      try {
        // If the response is a string that contains JSON
        if (typeof aiMessage === "string") {
          // Extract JSON from markdown code blocks if present
          const jsonMatch = aiMessage.match(/```json\n([\s\S]*?)\n```/) || 
                          aiMessage.match(/```\n([\s\S]*?)\n```/) ||
                          aiMessage.match(/\{[\s\S]*\}/);
                          
          if (jsonMatch) {
            aiMessage = jsonMatch[1] || jsonMatch[0];
          }
          
          // Parse the JSON string
          return JSON.parse(aiMessage);
        }
        
        // If already a JSON object
        return aiMessage;
      } catch (error) {
        console.error("Failed to parse recommendation as JSON:", error);
        return aiMessage; // Return the raw message if parsing fails
      }
    } else {
      throw new Error("No response choices returned from DeepSeek API");
    }
  } catch (error) {
    console.error("Error generating career recommendations:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const requestData = await req.json();
    const { sessionId } = requestData;
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Get all messages from the chat session
    const messages = await getSessionMessages(sessionId);
    
    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No messages found for this session" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Generate career recommendations
    const recommendations = await generateCareerRecommendations(messages);
    
    // Store the recommendation message in the database
    await createRecommendationMessage(sessionId, recommendations);
    
    // Update session status to completed
    await updateSessionStatus(sessionId);
    
    // Return the career recommendations
    return new Response(
      JSON.stringify(recommendations),
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
