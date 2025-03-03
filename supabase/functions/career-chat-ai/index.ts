
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { config } from "https://deno.land/std@0.168.0/dotenv/mod.ts";

// Load config values
const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY") || "";
const API_ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

// Get config values
const CONFIG = {
  AI_RESPONSE_FORMAT: Deno.env.get("AI_RESPONSE_FORMAT") || "structured",
  STRUCTURED_RESPONSE_VERSION: Deno.env.get("STRUCTURED_RESPONSE_VERSION") || "3",
  QUESTION_MAX_LENGTH: parseInt(Deno.env.get("QUESTION_MAX_LENGTH") || "60"),
  OPTIONS_MAX_COUNT: parseInt(Deno.env.get("OPTIONS_MAX_COUNT") || "8"),
  OPTIONS_MAX_LENGTH: parseInt(Deno.env.get("OPTIONS_MAX_LENGTH") || "40"),
  CATEGORY_TRACKING: Deno.env.get("CATEGORY_TRACKING") || "enabled",
  STRUCTURED_FORMAT_INSTRUCTION: Deno.env.get("STRUCTURED_FORMAT_INSTRUCTION") || ""
};

// Debug logging for configuration
console.log("CONFIG:", {
  API_ENDPOINT,
  AI_RESPONSE_FORMAT: CONFIG.AI_RESPONSE_FORMAT,
  STRUCTURED_RESPONSE_VERSION: CONFIG.STRUCTURED_RESPONSE_VERSION,
  STRUCTURE_FORMAT_AVAILABLE: CONFIG.STRUCTURED_FORMAT_INSTRUCTION ? "Yes" : "No"
});

// System prompt with dynamic format instructions
const getSystemPrompt = () => {
  const basePrompt = `
You are Pico, a friendly career guidance assistant. You help users explore career options by asking specific, relevant questions about their education, skills, interests, and work preferences. Your guidance should lead users to discover careers that might be a good match for them.

Guidelines:
1. Ask ONE focused question at a time, and provide 3-8 clear options for users to choose from.
2. Make each option specific and concise (under 40 characters).
3. Progress through these categories in order: education, skills, workstyle, goals.
4. Ask 3-4 questions per category before moving to the next.
5. After gathering sufficient information (12-15 questions), provide career recommendations.
6. For career recommendations, include match percentages, reasoning, and personality insights.
7. Be conversational and encouraging without being overly enthusiastic.
`;

  // If structured format instruction is available, append it
  if (CONFIG.STRUCTURED_FORMAT_INSTRUCTION) {
    return `${basePrompt}\n\n${CONFIG.STRUCTURED_FORMAT_INSTRUCTION}`;
  }
  
  return basePrompt;
};

// Handler for the API requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const body = await req.json();
    
    // Debug logging
    console.log("Request type:", body.type);

    // Handle config check requests
    if (body.type === "config-check") {
      if (!DEEPSEEK_API_KEY) {
        return new Response(
          JSON.stringify({ error: "DeepSeek API key not configured" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ status: "ok", config: CONFIG }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required fields
    if (!body.message) {
      throw new Error("Message is required");
    }

    // Set up the conversation history from the request or start fresh
    const messages = [
      {
        role: "system",
        content: getSystemPrompt(),
      },
    ];

    // Add previous messages if provided
    if (body.messages && Array.isArray(body.messages)) {
      body.messages.forEach((msg) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    } else {
      // If no history, add a starter message
      messages.push({
        role: "user",
        content: body.message,
      });
    }

    // Prepare the request to DeepSeek API
    const requestOptions = {
      model: "deepseek-chat",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    };

    // Debug logging for API request
    console.log("Sending request to DeepSeek API:", API_ENDPOINT);
    console.log("Using model:", requestOptions.model);

    // Make the request to DeepSeek API
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(requestOptions),
    });

    // Parse the response
    const data = await response.json();

    // Debug logging
    console.log("DeepSeek API response status:", response.status);

    // Handle API errors
    if (!response.ok) {
      console.error("DeepSeek API error:", data);
      let errorMessage = data.error?.message || "Unknown API error";
      
      // Check for specific error types
      if (data.error?.code === "model_not_found") {
        errorMessage = `Model not found: ${requestOptions.model}`;
      } else if (data.error?.type === "invalid_request_error") {
        errorMessage = `Invalid request: ${data.error.message}`;
      } else if (response.status === 401) {
        errorMessage = "Authentication error with DeepSeek API. Please check your API key.";
      }
      
      throw new Error(`DeepSeek API error: ${errorMessage}`);
    }

    // Extract the AI's response
    const aiResponse = data.choices && data.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No response content from DeepSeek API");
    }

    // Process the structured response
    let structuredMessage = null;
    let rawResponse = null;
    
    try {
      // Try to parse JSON from the response
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                        aiResponse.match(/```\n([\s\S]*?)\n```/) ||
                        aiResponse.match(/\{[\s\S]*\}/);
                        
      if (jsonMatch) {
        const jsonContent = jsonMatch[1] || jsonMatch[0];
        rawResponse = JSON.parse(jsonContent.trim());
        structuredMessage = rawResponse;
        
        console.log("Successfully parsed structured response:", structuredMessage.type);
      } else {
        console.log("Could not extract JSON from response, using text fallback");
      }
    } catch (e) {
      console.warn("Error parsing structured response:", e.message);
      console.log("Original response:", aiResponse);
    }

    // Process the response for metadata
    let metadata = {};
    let messageType = "bot";
    
    if (structuredMessage) {
      // Handle structured format
      if (structuredMessage.type === "recommendation") {
        messageType = "recommendation";
      }
      
      // Add progress tracking info
      if (structuredMessage.metadata?.progress) {
        metadata = {
          ...metadata,
          category: structuredMessage.metadata.progress.category,
          questionNumber: structuredMessage.metadata.progress.current,
          totalInCategory: structuredMessage.metadata.progress.total,
          progress: structuredMessage.metadata.progress.overall,
        };
      }
      
      // Add options if present
      if (structuredMessage.content?.options) {
        metadata = {
          ...metadata,
          hasOptions: true,
          suggestions: structuredMessage.content.options.map(opt => opt.text)
        };
      }
    } else {
      // Legacy format - extract from text
      const questionMatch = aiResponse.match(/\*\*Question (\d+)\/(\d+) \(([^)]+)\):/);
      const isRecommendation = aiResponse.includes("Career Recommendations") || 
                               aiResponse.includes("Career Matches");
                               
      if (isRecommendation) {
        messageType = "recommendation";
        metadata = { ...metadata, isRecommendation: true };
      } else if (questionMatch) {
        // Extract question info
        const questionNumber = parseInt(questionMatch[1]);
        const totalQuestions = parseInt(questionMatch[2]);
        const category = questionMatch[3].toLowerCase();
        
        metadata = {
          ...metadata,
          category,
          questionNumber,
          totalInCategory: totalQuestions,
          progress: Math.min(Math.round((questionNumber / totalQuestions) * 100), 100),
        };
        
        // Extract suggestions
        const suggestions = extractSuggestions(aiResponse);
        if (suggestions.length > 0) {
          metadata = {
            ...metadata,
            hasOptions: true,
            suggestions,
          };
        }
      }
    }

    // Generate unique ID for the message
    const messageId = crypto.randomUUID();

    // Return the formatted response
    return new Response(
      JSON.stringify({
        messageId,
        message: aiResponse,
        structuredMessage,
        rawResponse,
        metadata,
        messageType
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in edge function:", error);
    
    return new Response(
      JSON.stringify({
        messageId: crypto.randomUUID(),
        message: "I'm sorry, I encountered an error. Please try again.",
        error: error.message,
        metadata: { error: true }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Extract suggestions from text response (legacy format)
function extractSuggestions(text) {
  try {
    // Look for numbered options or bullet points
    const optionsRegex = /(?:\d+\.\s|\*\s)(.*?)(?=\n\d+\.\s|\n\*\s|$)/gs;
    const matches = [...text.matchAll(optionsRegex)];
    
    if (matches.length > 0) {
      return matches.map(match => match[1].trim());
    }
    
    // If no matches, check for options in a different format
    const optionsSection = text.match(/Options:\s*([\s\S]*?)(?:\n\n|$)/);
    if (optionsSection) {
      const lines = optionsSection[1].split('\n').map(line => line.trim());
      return lines.filter(line => line.length > 0);
    }
    
    // Fallback to simple yes/no options
    return ["Yes", "No", "Tell me more"];
  } catch (e) {
    console.warn("Error extracting suggestions:", e);
    return ["Yes", "No", "Maybe"];
  }
}
