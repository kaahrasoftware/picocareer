
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

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

// Streamlined system prompt for faster responses
const getSystemPrompt = () => {
  const basePrompt = `
You are Pico, a career guidance assistant. Ask users about their interests, skills, and preferences to recommend careers. Be concise and specific.

Guidelines:
1. Ask ONE focused question at a time with 3-5 multiple-choice options (never more).
2. Make each option specific and under 30 characters.
3. Follow this category sequence strictly:

   EDUCATION (6 questions): background, interests, learning style, goals, preferences, achievements
   SKILLS (6 questions): technical skills, soft skills, talents, expertise, interests, problem-solving
   WORKSTYLE (6 questions): environment, team dynamics, work-life balance, leadership, communication, stress management
   GOALS (6 questions): aspirations, growth, impact, success definition, vision, values

4. Track progress as "Question X/6 in Category" and overall progress percentage.
5. Provide 5-7 career matches only after completing all 24 questions.
6. Use this exact format for all responses:
\`\`\`json
{
  "type": "question|conversation|recommendation|session_end",
  "content": {
    "intro": "Brief context",
    "question": "Your question here?",
    "options": [
      {"id": "option1", "text": "First option"},
      {"id": "option2", "text": "Second option"},
      {"id": "option3", "text": "Third option"}
    ]
  },
  "metadata": {
    "progress": {
      "category": "education|skills|workstyle|goals",
      "current": 1,
      "total": 6,
      "overall": 25
    },
    "options": {
      "type": "single|multiple",
      "layout": "buttons|cards|chips"
    }
  }
}
\`\`\`

7. For session end, use this exact format:
\`\`\`json
{
  "type": "session_end",
  "content": {
    "message": "Thank you for completing your career assessment! I've analyzed your responses and provided career recommendations above. This session is now complete. You can start a new session anytime to explore different career paths or retake the assessment.",
    "suggestions": [
      "Start a new career assessment",
      "Explore these career paths in detail",
      "Save these recommendations"
    ]
  },
  "metadata": {
    "isSessionEnd": true,
    "completionType": "career_recommendations"
  }
}
\`\`\``;

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

    // Set up the conversation history
    const messages = [
      {
        role: "system",
        content: getSystemPrompt(),
      },
    ];

    // Add previous messages if provided - LIMIT TO LAST 10 MESSAGES FOR SPEED
    if (body.messages && Array.isArray(body.messages)) {
      // Only keep the most recent messages to reduce context size
      const recentMessages = body.messages.slice(-10);
      recentMessages.forEach((msg) => {
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

    // Prepare the request to DeepSeek API with optimized parameters
    const requestOptions = {
      model: "deepseek-chat",
      messages: messages,
      temperature: 0.5, // Lower temperature for more deterministic responses
      max_tokens: 800,  // Increased token count for better structured responses
      top_p: 0.9,       // More focused sampling
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    };

    // Debug logging for API request
    console.log("Sending request to DeepSeek API");

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
      // Try an alternative parsing approach for malformed JSON
      try {
        // Clean up common JSON formatting errors
        const cleanedJson = aiResponse
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
          
        // Attempt to parse again
        rawResponse = JSON.parse(cleanedJson);
        structuredMessage = rawResponse;
        console.log("Successfully parsed cleaned structured response");
      } catch (cleanError) {
        console.warn("Failed to parse even with cleanup:", cleanError.message);
      }
    }

    // Process the response for metadata
    let metadata = {};
    let messageType = "bot";
    
    if (structuredMessage) {
      // Handle structured format
      if (structuredMessage.type === "recommendation") {
        messageType = "recommendation";
      } else if (structuredMessage.type === "session_end") {
        messageType = "session_end";
        metadata = {
          ...metadata,
          isSessionEnd: true,
          completionType: structuredMessage.metadata?.completionType || "career_recommendations"
        };
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
      
      // Keep the whole structured message for reference
      metadata.structuredMessage = structuredMessage;
    } else {
      // Fallback to basic text processing if structured format fails
      const isRecommendation = aiResponse.includes("Career Recommendations") || 
                              aiResponse.includes("Career Matches");
      const isSessionEnd = aiResponse.includes("session is now complete") ||
                          aiResponse.includes("assessment is complete");
                            
      if (isRecommendation) {
        messageType = "recommendation";
        metadata = { ...metadata, isRecommendation: true };
      } else if (isSessionEnd) {
        messageType = "session_end";
        metadata = { 
          ...metadata, 
          isSessionEnd: true,
          completionType: "career_recommendations"
        };
      }
      
      // Try to extract options or suggestions from the text
      const optionsMatch = aiResponse.match(/(\d+\.\s+.*?)(?=\d+\.|$)/gs);
      if (optionsMatch) {
        const suggestions = optionsMatch.map(o => o.trim().replace(/^\d+\.\s+/, ''));
        metadata = {
          ...metadata,
          hasOptions: true,
          suggestions
        };
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
