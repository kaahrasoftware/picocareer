
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
  STRUCTURED_FORMAT_INSTRUCTION: Deno.env.get("STRUCTURED_FORMAT_INSTRUCTION") || "",
  RECOMMENDATION_MAX_CAREERS: parseInt(Deno.env.get("RECOMMENDATION_MAX_CAREERS") || "7"),
  RECOMMENDATION_FORMAT: Deno.env.get("RECOMMENDATION_FORMAT") || "structured"
};

// Debug logging for configuration
console.log("CONFIG:", {
  API_ENDPOINT,
  AI_RESPONSE_FORMAT: CONFIG.AI_RESPONSE_FORMAT,
  STRUCTURED_RESPONSE_VERSION: CONFIG.STRUCTURED_RESPONSE_VERSION,
  STRUCTURE_FORMAT_AVAILABLE: CONFIG.STRUCTURED_FORMAT_INSTRUCTION ? "Yes" : "No",
  RECOMMENDATION_MAX_CAREERS: CONFIG.RECOMMENDATION_MAX_CAREERS,
  RECOMMENDATION_FORMAT: CONFIG.RECOMMENDATION_FORMAT
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

// Function to match AI recommended careers with database careers
async function matchCareersWithDatabase(recommendedCareers) {
  try {
    if (!recommendedCareers || recommendedCareers.length === 0) {
      console.log("No careers to match with database");
      return [];
    }

    // Extract all career titles to match
    const careerTitles = recommendedCareers.map(career => 
      typeof career === 'string' ? career : career.title);
    
    console.log("Attempting to match these careers with database:", careerTitles);

    // Create the Supabase client for the edge function
    const supabaseClient = Deno.env.get("SUPABASE_URL") 
      ? new (await import("https://esm.sh/@supabase/supabase-js@2")).createClient(
          Deno.env.get("SUPABASE_URL") || "",
          Deno.env.get("SUPABASE_ANON_KEY") || ""
        )
      : null;

    if (!supabaseClient) {
      console.error("Failed to create Supabase client");
      return recommendedCareers;
    }

    // Fetch matching careers from database
    // First try exact matches
    let { data: matchedCareers, error } = await supabaseClient
      .from('careers')
      .select('*')
      .in('title', careerTitles)
      .eq('status', 'Approved')
      .limit(CONFIG.RECOMMENDATION_MAX_CAREERS);

    if (error) {
      console.error("Error querying careers table:", error);
      return recommendedCareers;
    }

    // If we didn't get enough matches, try fuzzy matching
    if (!matchedCareers || matchedCareers.length < careerTitles.length) {
      console.log("Insufficient exact matches, trying fuzzy matching");
      
      // Build a query with OR conditions for each title using ILIKE
      const fuzzyQuery = careerTitles
        .map(title => {
          // Check if we already have an exact match
          const alreadyMatched = matchedCareers?.some(
            career => career.title.toLowerCase() === title.toLowerCase()
          );
          
          // If already matched, skip this title
          if (alreadyMatched) return null;
          
          // Create a fuzzy match query
          const searchTerms = title.split(' ')
            .filter(term => term.length > 3) // Only use meaningful words
            .map(term => `title.ilike.%${term}%`);
          
          return searchTerms.length > 0 ? searchTerms.join(',') : null;
        })
        .filter(Boolean); // Remove null entries
      
      if (fuzzyQuery.length > 0) {
        const { data: fuzzyMatches, error: fuzzyError } = await supabaseClient
          .from('careers')
          .select('*')
          .or(fuzzyQuery.join(','))
          .eq('status', 'Approved')
          .not('id', 'in', (matchedCareers || []).map(c => c.id))
          .limit(CONFIG.RECOMMENDATION_MAX_CAREERS - (matchedCareers?.length || 0));
        
        if (fuzzyError) {
          console.error("Error in fuzzy matching:", fuzzyError);
        } else if (fuzzyMatches) {
          matchedCareers = [...(matchedCareers || []), ...fuzzyMatches];
          console.log(`Found ${fuzzyMatches.length} additional careers through fuzzy matching`);
        }
      }
    }

    // If we still don't have matches, just return the original recommendations
    if (!matchedCareers || matchedCareers.length === 0) {
      console.log("No matches found in database, returning original recommendations");
      return recommendedCareers;
    }

    console.log(`Found ${matchedCareers.length} matching careers in database`);

    // Map the original recommendations to include database information
    return recommendedCareers.map(recommendation => {
      // Extract title from recommendation (handle both string and object formats)
      const title = typeof recommendation === 'string' ? recommendation : recommendation.title;
      
      // Find matching database career
      const dbMatch = matchedCareers.find(career => 
        career.title.toLowerCase() === title.toLowerCase());
      
      // If no match, return original recommendation
      if (!dbMatch) {
        // Look for a partial match
        const partialMatch = matchedCareers.find(career => 
          career.title.toLowerCase().includes(title.toLowerCase()) || 
          title.toLowerCase().includes(career.title.toLowerCase()));
        
        if (!partialMatch) {
          return recommendation;
        }
        
        // Use partial match
        return enhanceRecommendation(recommendation, partialMatch);
      }
      
      // Enhance recommendation with database data
      return enhanceRecommendation(recommendation, dbMatch);
    });
  } catch (error) {
    console.error("Error matching careers with database:", error);
    return recommendedCareers;
  }
}

// Helper function to enhance a recommendation with database career data
function enhanceRecommendation(recommendation, dbCareer) {
  if (!dbCareer) return recommendation;
  
  if (typeof recommendation === 'string') {
    // Simple string format, return rich career object
    return {
      title: dbCareer.title,
      match_percentage: 90, // Default match percentage
      description: dbCareer.description || `Career in ${dbCareer.title}`,
      key_requirements: dbCareer.required_skills || [],
      education_paths: dbCareer.required_education || [],
      id: dbCareer.id
    };
  }
  
  // Object format, enhance with database data
  const match_percentage = recommendation.match || recommendation.match_percentage || 90;
  
  return {
    title: dbCareer.title,
    match_percentage: match_percentage,
    description: recommendation.description || dbCareer.description || `Career in ${dbCareer.title}`,
    key_requirements: dbCareer.required_skills || [],
    education_paths: dbCareer.required_education || [],
    id: dbCareer.id,
    industry: dbCareer.industry,
    salary_range: dbCareer.salary_range,
    growth_potential: dbCareer.growth_potential
  };
}

// Function to process raw AI responses into structured assessment results
async function processRecommendations(aiResponse) {
  try {
    // Try to parse the JSON from the AI response
    let parsedRecommendations = null;
    let structuredFormat = false;
    
    // Look for structured JSON in the response
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/```\n([\s\S]*?)\n```/) ||
                       aiResponse.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonContent = jsonMatch[1] || jsonMatch[0];
      try {
        parsedRecommendations = JSON.parse(jsonContent.trim());
        structuredFormat = true;
        console.log("Successfully parsed structured recommendations");
      } catch (e) {
        console.error("Error parsing JSON recommendations:", e);
      }
    }
    
    // If we couldn't parse structured JSON, try to extract career recommendations from text
    if (!parsedRecommendations) {
      console.log("Fallback to text parsing for recommendations");
      
      // Extract career recommendations from markdown/text format
      const careerMatches = [];
      
      // Look for numbered career listings
      const careerListings = aiResponse.match(/\d+\.\s+([^\n]+?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%|\s*\n)/g);
      
      if (careerListings) {
        careerListings.forEach(listing => {
          const titleMatch = listing.match(/\d+\.\s+(.*?)(?:\s*\((\d+)%\)|\s*-\s*(\d+)%|\s*$)/);
          if (titleMatch) {
            const title = titleMatch[1].trim();
            const matchPercentage = parseInt(titleMatch[2] || titleMatch[3] || '90', 10);
            
            // Extract description if available (look for text after the title)
            let description = "";
            const listingPos = aiResponse.indexOf(listing);
            if (listingPos >= 0) {
              const nextListingMatch = aiResponse.substring(listingPos + listing.length).match(/\d+\.\s+/);
              const nextListingPos = nextListingMatch 
                ? aiResponse.substring(listingPos + listing.length).indexOf(nextListingMatch[0]) 
                : -1;
              
              if (nextListingPos > 0) {
                description = aiResponse.substring(
                  listingPos + listing.length, 
                  listingPos + listing.length + nextListingPos
                ).trim();
              }
            }
            
            careerMatches.push({
              title,
              match_percentage: matchPercentage,
              description: description || `Career in ${title}`
            });
          }
        });
      }
      
      if (careerMatches.length > 0) {
        parsedRecommendations = {
          type: "assessment_result",
          content: {
            career_recommendations: careerMatches
          }
        };
      } else {
        // Last resort: split by lines and look for potential career titles
        const lines = aiResponse.split('\n');
        const potentialTitles = lines.filter(line => 
          line.trim().length > 0 && 
          line.trim().length < 50 &&
          !line.startsWith('#') &&
          !line.match(/^\d+\./) &&
          !line.includes(':')
        ).slice(0, 7); // Take at most 7 potential careers
        
        if (potentialTitles.length > 0) {
          parsedRecommendations = {
            type: "assessment_result",
            content: {
              career_recommendations: potentialTitles.map(title => ({
                title: title.trim(),
                match_percentage: 90,
                description: `Career in ${title.trim()}`
              }))
            }
          };
        }
      }
    }
    
    // If we still couldn't extract recommendations, return a default structure
    if (!parsedRecommendations) {
      console.log("Unable to extract career recommendations, using default");
      return {
        type: "assessment_result",
        content: {
          introduction: {
            title: "Your Career Assessment Results",
            summary: "Based on your responses, here are some potential career paths that might be a good fit."
          },
          career_recommendations: []
        }
      };
    }
    
    // For structured format, ensure we have the right structure
    if (structuredFormat) {
      if (parsedRecommendations.type === "recommendation" && parsedRecommendations.content) {
        // Extract careers from the content
        let careersToMatch = [];
        
        if (parsedRecommendations.content.career_recommendations) {
          careersToMatch = parsedRecommendations.content.career_recommendations;
        } else if (parsedRecommendations.content.careers) {
          careersToMatch = parsedRecommendations.content.careers;
        }
        
        // Match with database
        if (careersToMatch.length > 0) {
          const enhancedCareers = await matchCareersWithDatabase(careersToMatch);
          
          // Update the recommendations with database-enriched careers
          if (parsedRecommendations.content.career_recommendations) {
            parsedRecommendations.content.career_recommendations = enhancedCareers;
          } else if (parsedRecommendations.content.careers) {
            parsedRecommendations.content.careers = enhancedCareers;
          }
        }
        
        return parsedRecommendations;
      }
      
      // Check for assessment_result format
      if (parsedRecommendations.type === "assessment_result" && parsedRecommendations.content) {
        if (parsedRecommendations.content.career_recommendations) {
          const enhancedCareers = await matchCareersWithDatabase(
            parsedRecommendations.content.career_recommendations
          );
          parsedRecommendations.content.career_recommendations = enhancedCareers;
        }
        return parsedRecommendations;
      }
    } else {
      // For text-parsed recommendations
      const careerRecommendations = parsedRecommendations.content.career_recommendations;
      if (careerRecommendations && careerRecommendations.length > 0) {
        const enhancedCareers = await matchCareersWithDatabase(careerRecommendations);
        parsedRecommendations.content.career_recommendations = enhancedCareers;
      }
    }
    
    return parsedRecommendations;
  } catch (error) {
    console.error("Error processing recommendations:", error);
    return {
      type: "assessment_result",
      content: {
        introduction: {
          title: "Your Career Assessment Results",
          summary: "Based on your responses, here are some potential career paths that might be a good fit."
        },
        career_recommendations: []
      }
    };
  }
}

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

    // Handle recommendation requests - this is now a focused endpoint just for generating recommendations
    if (body.type === "recommendation") {
      if (!body.sessionId) {
        throw new Error("Session ID is required");
      }

      if (!body.instructions?.userResponses || !Array.isArray(body.instructions.userResponses)) {
        throw new Error("User responses are required");
      }

      // Simplified prompt for recommendation generation
      const systemPrompt = `
You are a career guidance AI assistant. Based on the user's responses to career assessment questions,
provide personalized career recommendations. 

Instructions:
1. Analyze the user's responses to identify their skills, interests, education level, and work preferences.
2. Recommend 5-7 specific careers that match their profile.
3. For each career, provide:
   - Job title
   - Match percentage (how well it fits their profile)
   - Brief description of why it's a good match
   - 2-3 key requirements or qualifications
4. Also include a brief analysis of their strongest skills or traits.
5. Format your response using this structure:

${CONFIG.RECOMMENDATION_FORMAT === "structured" ? `
{
  "type": "assessment_result",
  "content": {
    "introduction": {
      "title": "Your Career Assessment Results",
      "summary": "Based on your responses, here are personalized career recommendations that match your profile."
    },
    "career_recommendations": [
      {
        "title": "Career Title",
        "match_percentage": 95,
        "description": "Why this career matches their profile",
        "key_requirements": ["Requirement 1", "Requirement 2"]
      }
    ],
    "personality_insights": [
      {
        "trait": "Trait name",
        "strength_level": 4,
        "description": "Description of this trait"
      }
    ],
    "growth_areas": [
      {
        "skill": "Skill to develop",
        "importance": "high",
        "description": "Why this skill matters"
      }
    ],
    "closing": {
      "message": "Concluding message",
      "next_steps": ["Step 1", "Step 2", "Step 3"]
    }
  }
}
` : `
# Career Recommendations

## Top Career Matches

1. [Career Title] (95% Match)
   - [Brief description of why this career matches their profile]
   - Key requirements: [List 2-3 requirements]

2. [Career Title] (92% Match)
   - [Description]
   - Key requirements: [Requirements]

[Continue for all recommendations]

## Your Strengths

- [Strength 1]: [Brief explanation]
- [Strength 2]: [Brief explanation]
- [Strength 3]: [Brief explanation]

## Next Steps

[Brief advice on how to explore these careers further]
`}
`;

      // Create a focused message list with just the user's assessment responses
      const userResponses = body.instructions.userResponses.map((response: string, index: number) => ({
        role: "user",
        content: `Response ${index + 1}: ${response}`
      }));

      // Add a final instruction to generate recommendations
      userResponses.push({
        role: "user",
        content: "Please analyze my responses and provide career recommendations that match my profile."
      });

      // Prepare the messages array for the API request
      const messages = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...userResponses
      ];

      // Make the request to DeepSeek API with optimized parameters for recommendations
      const requestOptions = {
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.7,  // Slightly higher temperature for creative recommendations
        max_tokens: 1500,  // Increased token count for detailed recommendations
        top_p: 0.9,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      };

      // Debug logging
      console.log("Sending recommendation request to DeepSeek API");

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
        throw new Error(`DeepSeek API error: ${data.error?.message || "Unknown API error"}`);
      }

      // Extract the AI's response
      const aiResponse = data.choices && data.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error("No response content from DeepSeek API");
      }

      // Process recommendations to match with database
      const processedRecommendations = await processRecommendations(aiResponse);

      // Return the recommendation response
      return new Response(
        JSON.stringify({
          messageId: crypto.randomUUID(),
          message: aiResponse,
          structuredMessage: processedRecommendations,
          rawResponse: processedRecommendations,
          metadata: {
            isRecommendation: true,
            completionType: "career_recommendations"
          }
        }),
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
