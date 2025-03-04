
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
  STRUCTURED_FORMAT_INSTRUCTION: Deno.env.get("STRUCTURED_FORMAT_INSTRUCTION") || "",
  // Cache configuration
  ENABLE_RESPONSE_CACHE: Deno.env.get("ENABLE_RESPONSE_CACHE") === "true",
  CACHE_EXPIRY_SECONDS: parseInt(Deno.env.get("CACHE_EXPIRY_SECONDS") || "3600"),
  MAX_HISTORY_MESSAGES: parseInt(Deno.env.get("MAX_HISTORY_MESSAGES") || "6")
};

// Debug logging for configuration
console.log("CONFIG:", {
  API_ENDPOINT,
  AI_RESPONSE_FORMAT: CONFIG.AI_RESPONSE_FORMAT,
  STRUCTURED_RESPONSE_VERSION: CONFIG.STRUCTURED_RESPONSE_VERSION,
  STRUCTURE_FORMAT_AVAILABLE: CONFIG.STRUCTURED_FORMAT_INSTRUCTION ? "Yes" : "No",
  ENABLE_RESPONSE_CACHE: CONFIG.ENABLE_RESPONSE_CACHE,
  MAX_HISTORY_MESSAGES: CONFIG.MAX_HISTORY_MESSAGES
});

// Simple in-memory cache with expiry
// In production, you would use a more robust cache solution like Redis
interface CacheEntry {
  timestamp: number;
  data: any;
}

const responseCache = new Map<string, CacheEntry>();

// Generate a cache key based on user's question and context
function generateCacheKey(message: string, category: string | null, questionNumber: number | null): string {
  // For initial questions in each category, we can be more aggressive with caching
  if (questionNumber === 1 && category) {
    return `${category}_first_question`;
  }
  
  // For other questions, use a combination of category, question number, and simplified message
  const simplifiedMessage = message.toLowerCase().trim().replace(/[^\w\s]/g, '');
  return `${category || 'uncategorized'}_${questionNumber || 0}_${simplifiedMessage.substring(0, 50)}`;
}

// Check if cache entry is valid (not expired)
function isCacheValid(entry: CacheEntry): boolean {
  const now = Date.now();
  return (now - entry.timestamp) < CONFIG.CACHE_EXPIRY_SECONDS * 1000;
}

// Clear expired cache entries periodically
function cleanupCache(): void {
  const now = Date.now();
  for (const [key, entry] of responseCache.entries()) {
    if ((now - entry.timestamp) >= CONFIG.CACHE_EXPIRY_SECONDS * 1000) {
      responseCache.delete(key);
    }
  }
}

// System prompt with updated instructions for more structured progression
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
6. When generating final career recommendations, provide:
   - Top 5-7 career matches with match percentages
   - Detailed reasoning based on answers from all categories
   - Personality insights and strengths
   - Suggested growth areas

7. After providing career recommendations:
   - Thank the user for completing the assessment
   - Indicate that this career assessment session is complete
   - Let them know they can start a new session to explore different career paths
   - Use this exact structure for the final message:
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

// Predefined templates for first questions in each category - used for faster initial responses
const categoryTemplates = {
  "education": {
    "type": "question",
    "content": {
      "intro": "Let's start with understanding your educational background.",
      "question": "What is your highest level of education?",
      "options": [
        { "id": "edu-1", "text": "High School", "category": "education" },
        { "id": "edu-2", "text": "Some College", "category": "education" },
        { "id": "edu-3", "text": "Associate's Degree", "category": "education" },
        { "id": "edu-4", "text": "Bachelor's Degree", "category": "education" },
        { "id": "edu-5", "text": "Master's Degree", "category": "education" },
        { "id": "edu-6", "text": "Doctorate/PhD", "category": "education" },
        { "id": "edu-7", "text": "Self-taught/No formal education", "category": "education" }
      ]
    },
    "metadata": {
      "progress": {
        "category": "education",
        "current": 1,
        "total": 6,
        "overall": 4
      },
      "options": {
        "type": "single",
        "layout": "cards"
      }
    }
  },
  "skills": {
    "type": "question",
    "content": {
      "intro": "Great! Now let's talk about your skills and abilities.",
      "question": "Which technical skills are you strongest in?",
      "options": [
        { "id": "skill-1", "text": "Programming/Coding", "category": "skills" },
        { "id": "skill-2", "text": "Data Analysis", "category": "skills" },
        { "id": "skill-3", "text": "Design/Creative", "category": "skills" },
        { "id": "skill-4", "text": "Writing/Communication", "category": "skills" },
        { "id": "skill-5", "text": "Project Management", "category": "skills" },
        { "id": "skill-6", "text": "Research", "category": "skills" },
        { "id": "skill-7", "text": "Mathematical/Analytical", "category": "skills" },
        { "id": "skill-8", "text": "I'm still developing my skills", "category": "skills" }
      ]
    },
    "metadata": {
      "progress": {
        "category": "skills",
        "current": 1,
        "total": 6,
        "overall": 29
      },
      "options": {
        "type": "single",
        "layout": "cards"
      }
    }
  },
  "workstyle": {
    "type": "question",
    "content": {
      "intro": "Let's understand your work preferences better.",
      "question": "What type of work environment do you prefer?",
      "options": [
        { "id": "work-1", "text": "Corporate office", "category": "workstyle" },
        { "id": "work-2", "text": "Remote/Work from home", "category": "workstyle" },
        { "id": "work-3", "text": "Hybrid (mix of office and remote)", "category": "workstyle" },
        { "id": "work-4", "text": "Outdoor/Field work", "category": "workstyle" },
        { "id": "work-5", "text": "Creative studio", "category": "workstyle" },
        { "id": "work-6", "text": "Startup environment", "category": "workstyle" },
        { "id": "work-7", "text": "Varied locations", "category": "workstyle" }
      ]
    },
    "metadata": {
      "progress": {
        "category": "workstyle",
        "current": 1,
        "total": 6,
        "overall": 54
      },
      "options": {
        "type": "single",
        "layout": "cards"
      }
    }
  },
  "goals": {
    "type": "question",
    "content": {
      "intro": "Finally, let's talk about your career goals and aspirations.",
      "question": "What's most important to you in your career?",
      "options": [
        { "id": "goal-1", "text": "Financial security/High income", "category": "goals" },
        { "id": "goal-2", "text": "Work-life balance", "category": "goals" },
        { "id": "goal-3", "text": "Making a difference/Social impact", "category": "goals" },
        { "id": "goal-4", "text": "Career advancement/Growth", "category": "goals" },
        { "id": "goal-5", "text": "Creative expression", "category": "goals" },
        { "id": "goal-6", "text": "Intellectual challenge", "category": "goals" },
        { "id": "goal-7", "text": "Independence/Autonomy", "category": "goals" },
        { "id": "goal-8", "text": "Recognition/Status", "category": "goals" }
      ]
    },
    "metadata": {
      "progress": {
        "category": "goals",
        "current": 1,
        "total": 6,
        "overall": 79
      },
      "options": {
        "type": "single",
        "layout": "cards"
      }
    }
  }
};

// Handler for the API requests
serve(async (req) => {
  // Clean up expired cache entries
  cleanupCache();

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

    // Extract current category and question number from previous messages
    let currentCategory: string | null = null;
    let currentQuestionNumber: number | null = null;
    let isCachedResponse = false;

    if (body.messages && Array.isArray(body.messages) && body.messages.length > 0) {
      // Look for category and question number in the most recent bot message
      for (let i = body.messages.length - 1; i >= 0; i--) {
        const msg = body.messages[i];
        if (msg.role === "assistant" && msg.metadata) {
          if (msg.metadata.structuredMessage?.metadata?.progress) {
            currentCategory = msg.metadata.structuredMessage.metadata.progress.category;
            currentQuestionNumber = msg.metadata.structuredMessage.metadata.progress.current;
          } else if (msg.metadata.category) {
            currentCategory = msg.metadata.category;
            currentQuestionNumber = msg.metadata.questionNumber;
          }
          
          if (currentCategory) break;
        }
      }
    }

    // Check cache for this specific question/context
    const cacheKey = generateCacheKey(body.message, currentCategory, currentQuestionNumber);
    
    if (CONFIG.ENABLE_RESPONSE_CACHE) {
      const cachedResponse = responseCache.get(cacheKey);
      
      if (cachedResponse && isCacheValid(cachedResponse)) {
        console.log(`Cache hit for key: ${cacheKey}`);
        isCachedResponse = true;
        
        // Add cache information to the response
        const responseWithCacheInfo = {
          ...cachedResponse.data,
          fromCache: true
        };
        
        return new Response(
          JSON.stringify(responseWithCacheInfo),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check if this is the first question in a new category and use template if available
    let useTemplateResponse = false;
    let templateResponse = null;
    
    if (currentQuestionNumber === 6 && currentCategory) {
      // We're at the end of one category, so the next will be the first of a new category
      const nextCategory = 
        currentCategory === "education" ? "skills" :
        currentCategory === "skills" ? "workstyle" :
        currentCategory === "workstyle" ? "goals" : null;
        
      if (nextCategory && categoryTemplates[nextCategory]) {
        console.log(`Using template for first question in ${nextCategory} category`);
        useTemplateResponse = true;
        templateResponse = categoryTemplates[nextCategory];
      }
    } else if (!currentCategory && categoryTemplates["education"]) {
      // Very first question of the session
      console.log("Using template for first question in education category");
      useTemplateResponse = true;
      templateResponse = categoryTemplates["education"];
    }

    if (useTemplateResponse && templateResponse) {
      const messageId = crypto.randomUUID();
      const responseData = {
        messageId,
        message: JSON.stringify(templateResponse),
        structuredMessage: templateResponse,
        metadata: {
          category: templateResponse.metadata.progress.category,
          questionNumber: templateResponse.metadata.progress.current,
          totalInCategory: templateResponse.metadata.progress.total,
          progress: templateResponse.metadata.progress.overall,
          hasOptions: true,
          suggestions: templateResponse.content.options.map(opt => opt.text),
          fromTemplate: true
        },
        messageType: "bot"
      };
      
      // Store in cache
      if (CONFIG.ENABLE_RESPONSE_CACHE) {
        responseCache.set(cacheKey, {
          timestamp: Date.now(),
          data: responseData
        });
      }
      
      return new Response(
        JSON.stringify(responseData),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Set up the conversation history from the request or start fresh
    const messages = [
      {
        role: "system",
        content: getSystemPrompt(),
      },
    ];

    // Add previous messages if provided, but limit to the most recent N messages
    if (body.messages && Array.isArray(body.messages)) {
      const recentMessages = body.messages.slice(-CONFIG.MAX_HISTORY_MESSAGES);
      
      // Always include user's current message
      const userMessage = body.messages.find(msg => 
        msg.role === "user" && msg.content === body.message
      );
      
      if (userMessage && !recentMessages.includes(userMessage)) {
        recentMessages.push(userMessage);
      }
      
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

    // Prepare the response data
    const responseData = {
      messageId,
      message: aiResponse,
      structuredMessage,
      rawResponse,
      metadata,
      messageType
    };
    
    // Store in cache if enabled
    if (CONFIG.ENABLE_RESPONSE_CACHE) {
      responseCache.set(cacheKey, {
        timestamp: Date.now(),
        data: responseData
      });
    }

    // Return the formatted response
    return new Response(
      JSON.stringify(responseData),
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
