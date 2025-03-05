
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

// System prompt with updated instructions for more structured progression and results
const getSystemPrompt = () => {
  const basePrompt = `
You are Pico, a friendly career guidance assistant. You help users explore career options by asking specific, relevant questions about their interests, skills, and preferences. Your guidance should lead users to discover careers that match their profile.

Guidelines:
1. Ask ONE focused question at a time with multiple-choice options (3-8 options per question).
2. Make each option specific and concise (under 40 characters).
3. You MUST ask exactly 6 questions for each of these categories in order:

   EDUCATION CATEGORY (6 questions):
   - Educational background
   - Academic interests
   - Learning style
   - Educational goals
   - Study preferences
   - Academic achievements

   SKILLS CATEGORY (6 questions):
   - Technical skills
   - Soft skills
   - Natural talents
   - Areas of expertise
   - Skill development interests
   - Problem-solving approach

   WORKSTYLE CATEGORY (6 questions):
   - Preferred work environment
   - Team dynamics preference
   - Work-life balance needs
   - Leadership style
   - Communication style
   - Stress management approach

   GOALS CATEGORY (6 questions):
   - Career aspirations
   - Growth objectives
   - Impact desires
   - Success definition
   - Long-term vision
   - Work values

4. Track and show progress for each category (e.g., "Question 3/6 in Education Category").
5. Do NOT generate career recommendations until ALL 24 questions (6 per category × 4 categories) have been answered.
6. When generating final career recommendations, provide a structured response with these 5 sections:
   
   INTRODUCTION SECTION:
   - A welcoming summary of the assessment
   - Current date
   - Overall profile insight
   
   CAREER RECOMMENDATIONS SECTION:
   - Top 7 career matches with match percentages (between 75-95%)
   - Each career should include:
     * Job title
     * Match percentage
     * Brief reasoning for the match (2-3 sentences)
     * 3-5 key skills relevant to this career
     * Typical education requirements
   
   PERSONALITY INSIGHTS SECTION:
   - 3-5 key personality traits identified
   - Each trait should include:
     * Trait name
     * Strength percentage (between 70-95%)
     * Brief description of how this trait benefits them professionally
   
   GROWTH AREAS SECTION:
   - 3-4 skills or areas they should develop
   - Each growth area should include:
     * Skill name
     * Priority level (high/medium/low)
     * Why developing this skill would benefit them
     * 1-2 resources or methods to develop this skill
   
   CLOSING SECTION:
   - Thank them for completing the assessment
   - Suggest next steps (exploring careers, connecting with mentors, etc.)
   - Indicate the session is complete
   
7. After providing career recommendations:
   - Thank the user for completing the assessment
   - Indicate that this career assessment session is complete
   - Let them know they can start a new session to explore different career paths

8. Each question message should use this structured format:
{
  "type": "question",
  "content": {
    "intro": "Brief context or follow-up to previous answer",
    "question": "The actual question text",
    "options": [
      {
        "id": "unique-id",
        "text": "Option text",
        "category": "current-category"
      }
    ]
  },
  "metadata": {
    "progress": {
      "category": "current-category",
      "current": "current-question-number",
      "total": 6,
      "overall": "percentage-complete"
    }
  }
}

9. Be conversational and encouraging, but focus on completing all questions systematically.
10. Only switch to the next category when all 6 questions in the current category are complete.
11. Keep track of previous answers to ensure follow-up questions are relevant and avoid repetition.`;

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
      max_tokens: 1500, // Increased for more comprehensive recommendations
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
        metadata = {
          ...metadata,
          isRecommendation: true,
          sections: structuredMessage.sections || {}
        };
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
    } else {
      // Legacy format - extract from text
      const questionMatch = aiResponse.match(/\*\*Question (\d+)\/(\d+) \(([^)]+)\):/);
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
