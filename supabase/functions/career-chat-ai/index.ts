
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DeepSeekChat } from "npm:deepseek-chat";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

// Load configuration from config.toml
const config = {
  responseFormat: Deno.env.get("AI_RESPONSE_FORMAT") || "standard",
  structuredVersion: Deno.env.get("STRUCTURED_RESPONSE_VERSION") || "1",
  questionMaxLength: parseInt(Deno.env.get("QUESTION_MAX_LENGTH") || "60"),
  optionsMaxCount: parseInt(Deno.env.get("OPTIONS_MAX_COUNT") || "8"),
  optionsMaxLength: parseInt(Deno.env.get("OPTIONS_MAX_LENGTH") || "40"),
  categoryTracking: Deno.env.get("CATEGORY_TRACKING") || "enabled",
  formatInstruction: Deno.env.get("STRUCTURED_FORMAT_INSTRUCTION") || "",
};

// Track categories and question counts
const CATEGORIES = ['education', 'skills', 'workstyle', 'goals', 'environment'];
const QUESTIONS_PER_CATEGORY = 10; // Support up to 10 questions per category

// Core AI system prompt
const SYSTEM_PROMPT = `
You are Pico, a career advisor AI that helps users discover career paths that match their interests, skills, and preferences.

IMPORTANT: Ask questions in this specific order, with up to ${QUESTIONS_PER_CATEGORY} questions per category:
1. Career Goals and interests (exploring what the user wants)
2. Work Environment preferences (understanding where they want to work)
3. Skills assessment (what they're good at)
4. Educational background/interests (what they've learned)
5. Work style preferences (how they like to work)

For EACH question:
- Ask only ONE specific question at a time
- Keep questions focused and direct
- Provide ${config.optionsMaxCount} answer options (maximum ${config.optionsMaxLength} characters each)
- Reference previous answers to personalize questions
- NEVER ask multiple questions in one message

Example questions:

CAREER GOALS:
- "What interests you most about your future career?"
  Options: ["Making good money", "Having work-life balance", "Learning new things", "Helping others", "Being creative", "Working with technology", "Leading others", "Building things"]

WORK ENVIRONMENT:
- "Where would you prefer to work?"
  Options: ["Modern office building", "Creative studio space", "Outdoors in nature", "Laboratory or research facility", "School or university", "Hospital or clinic", "Workshop or maker space", "Home office"]

SKILLS:
- "What skills are you naturally good at?"
  Options: ["Math and calculations", "Writing and communication", "Art and creativity", "Technology and computers", "Sports and physical activities", "Leadership and organization", "Problem-solving", "Working with others"]

EDUCATION:
- "How do you prefer to study?"
  Options: ["In a quiet place alone", "With background music", "In a group setting", "With a study partner", "Using online resources", "Through practical exercises", "Making visual notes", "Teaching others"]

WORK STYLE:
- "How do you prefer to complete tasks?"
  Options: ["One at a time", "Multiple tasks at once", "Following a strict schedule", "With flexible deadlines", "In collaboration with others", "Independently", "Under pressure", "With detailed planning"]

After collecting all responses, provide career recommendations with match percentages and personality analysis.

IMPORTANT: Always respond in the structured JSON format as specified.
`;

// Function to extract suggestions from a bot response
const extractSuggestions = (content: string): string[] | null => {
  try {
    // Try to extract options using various patterns
    // Pattern 1: Markdown list format
    let pattern = /options:\s*(?:\n\s*)?(\[.*?\])/is;
    let match = content.match(pattern);

    if (match && match[1]) {
      try {
        const options = JSON.parse(match[1].replace(/'/g, '"'));
        if (Array.isArray(options) && options.length > 0) {
          return options.map(opt => typeof opt === 'string' ? opt : JSON.stringify(opt)).slice(0, config.optionsMaxCount);
        }
      } catch (e) {
        console.error("Error parsing options list:", e);
      }
    }

    // Pattern 2: Numbered/bullet list format
    pattern = /Options:(?:\s*\n\s*(?:[\d\-\*\.]+\s*|)\"([^\"]+)\")/gi;
    const options: string[] = [];
    let listMatch;
    
    while ((listMatch = pattern.exec(content)) !== null) {
      options.push(listMatch[1]);
      if (options.length >= config.optionsMaxCount) break;
    }
    
    if (options.length > 0) {
      return options;
    }

    // Pattern 3: Text with quotes pattern
    pattern = /Options:.*?(?:include|are)?\s*["']([^"']+)["']/gi;
    const textOptions: string[] = [];
    
    while ((listMatch = pattern.exec(content)) !== null) {
      textOptions.push(listMatch[1]);
      if (textOptions.length >= config.optionsMaxCount) break;
    }
    
    if (textOptions.length > 0) {
      return textOptions;
    }

    // Fallback pattern - look for anything that resembles a list after "Options:"
    pattern = /Options:(.*?)(?:\n\n|\n\w+:|\n$|$)/is;
    match = content.match(pattern);
    
    if (match && match[1]) {
      const optionText = match[1].trim();
      // Try to split by bullets, numbers, or commas
      const fallbackOptions = optionText
        .split(/(?:\n\s*[\-\*\d\.]+\s*|\s*,\s*|\n\s*\-\s*)/)
        .map(o => o.trim())
        .filter(o => o.length > 0 && o.length <= config.optionsMaxLength);
      
      if (fallbackOptions.length > 0) {
        return fallbackOptions.slice(0, config.optionsMaxCount);
      }
    }

    // Use general fallback options related to careers rather than yes/no
    return [
      "Technical work", 
      "Creative fields", 
      "Helping others", 
      "Business careers",
      "Scientific research",
      "Something else"
    ];
  } catch (error) {
    console.error("Error extracting suggestions:", error);
    // Fallback to career-related options instead of yes/no
    return [
      "Technical work", 
      "Creative fields", 
      "Helping others", 
      "Business careers",
      "Scientific research",
      "Something else"
    ];
  }
};

// Function to extract structured format from AI response
const parseStructuredResponse = (text: string) => {
  try {
    // Try to find JSON pattern in the response
    const jsonPattern = /```json\s*([\s\S]*?)\s*```/;
    const jsonMatch = text.match(jsonPattern);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Error parsing JSON from markdown block:", e);
      }
    }
    
    // Alternative: find a JSON block without markdown
    const jsonPattern2 = /\{[\s\S]*"type"[\s\S]*\}/;
    const jsonMatch2 = text.match(jsonPattern2);
    
    if (jsonMatch2 && jsonMatch2[0]) {
      try {
        return JSON.parse(jsonMatch2[0]);
      } catch (e) {
        console.error("Error parsing JSON without markdown:", e);
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error parsing structured response:", error);
    return null;
  }
};

// Function to track question progress and determine categories
const trackQuestionProgress = (messages: any[]) => {
  // Initialize counts and current category
  const categoryCounts: Record<string, number> = {
    education: 0,
    skills: 0,
    workstyle: 0,
    goals: 0,
    environment: 0
  };
  
  let currentCategory = 'goals'; // Start with goals category
  let totalQuestions = 0;
  let categoryQuestions = 0;
  
  // Count questions by category
  for (const msg of messages) {
    if (msg.role === 'assistant' && msg.metadata && msg.metadata.category) {
      const category = msg.metadata.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      totalQuestions++;
      currentCategory = category;
    }
  }
  
  // Calculate how many questions we've asked in the current category
  categoryQuestions = categoryCounts[currentCategory] || 0;
  
  // Determine if we should move to the next category
  if (categoryQuestions >= QUESTIONS_PER_CATEGORY) {
    // Move to the next category
    const currentIndex = CATEGORIES.indexOf(currentCategory);
    if (currentIndex !== -1 && currentIndex < CATEGORIES.length - 1) {
      currentCategory = CATEGORIES[currentIndex + 1];
    }
  }
  
  // If we haven't asked any questions in goals yet, start there
  if (totalQuestions === 0) {
    currentCategory = 'goals';
  }
  // If goals has at least 3 questions but we've never asked about environment, switch to environment
  else if (categoryCounts.goals >= 3 && !categoryCounts.environment) {
    currentCategory = 'environment';
  }
  // If environment has at least 3 questions but we've never asked about skills, switch to skills
  else if (categoryCounts.environment >= 3 && !categoryCounts.skills) {
    currentCategory = 'skills';
  }
  // If skills has at least 3 questions but we've never asked about education, switch to education
  else if (categoryCounts.skills >= 3 && !categoryCounts.education) {
    currentCategory = 'education';
  }
  // If education has at least 3 questions but we've never asked about workstyle, switch to workstyle
  else if (categoryCounts.education >= 3 && !categoryCounts.workstyle) {
    currentCategory = 'workstyle';
  }
  
  // Calculate question number within the current category
  const questionNumber = categoryCounts[currentCategory] + 1;
  
  // Calculate overall progress percentage (assuming 5 categories with 6 questions each = 30 total)
  const maxQuestions = CATEGORIES.length * QUESTIONS_PER_CATEGORY;
  const overallProgress = Math.min(Math.round((totalQuestions / maxQuestions) * 100), 100);
  
  return {
    category: currentCategory,
    questionNumber,
    totalInCategory: QUESTIONS_PER_CATEGORY,
    progress: overallProgress,
    questionCounts: categoryCounts,
    totalQuestions
  };
};

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { message, messages = [], sessionId, instructions = {} } = await req.json();

    // Check if this is a configuration check request
    if (message === undefined && instructions.type === 'config-check') {
      if (!DEEPSEEK_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'DeepSeek API key not configured' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ status: 'ok' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate DeepSeek API key
    if (!DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'DeepSeek API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize AI client
    const deepseek = new DeepSeekChat({
      apiKey: DEEPSEEK_API_KEY,
    });

    // Add system message
    const systemMessage = {
      role: "system",
      content: SYSTEM_PROMPT + (config.formatInstruction ? "\n\n" + config.formatInstruction : ""),
    };

    // Track question progress
    const progressInfo = trackQuestionProgress(messages);

    // Add metadata to the AI context
    const aiMessages = [
      systemMessage,
      ...messages,
      // Add guidance for the next question's category
      {
        role: "system",
        content: `Next question should be in the '${progressInfo.category}' category (question ${progressInfo.questionNumber}/${progressInfo.totalInCategory}). Make sure to provide at least ${config.optionsMaxCount} answer options for the user.`
      }
    ];

    // Get response from DeepSeek
    const completion = await deepseek.chat(aiMessages);
    const botResponse = completion.choices[0].message.content;

    console.log("Bot response:", botResponse);

    // Extract suggestions for UI
    const suggestions = extractSuggestions(botResponse);
    console.log("Extracted suggestions:", suggestions);

    // Parse structured response if available
    const structuredResponse = parseStructuredResponse(botResponse);
    console.log("Parsed structured response:", structuredResponse);

    // Create metadata for the response
    const metadata: any = {
      category: progressInfo.category,
      questionNumber: progressInfo.questionNumber,
      totalInCategory: progressInfo.totalInCategory,
      progress: progressInfo.progress,
      hasOptions: !!suggestions,
    };

    // If we have suggestions, add them to metadata
    if (suggestions && suggestions.length > 0) {
      metadata.suggestions = suggestions;
    }

    // Add structured response to metadata if available
    if (structuredResponse) {
      // Generate structured message in the new format
      const structuredMessage = {
        type: structuredResponse.type || "question",
        content: {
          intro: structuredResponse.content?.intro || "",
          question: structuredResponse.content?.question || botResponse,
          options: structuredResponse.content?.options || 
                  suggestions?.map(text => ({
                    id: text.toLowerCase().replace(/\s+/g, '-'),
                    text: text
                  })) || []
        },
        metadata: {
          progress: {
            category: progressInfo.category,
            current: progressInfo.questionNumber,
            total: progressInfo.totalInCategory,
            overall: progressInfo.progress
          },
          options: {
            type: "single",
            layout: "cards"
          }
        }
      };

      metadata.structuredMessage = structuredMessage;
      metadata.rawResponse = structuredResponse;
    }

    // Generate a message ID
    const messageId = crypto.randomUUID();

    // Return the AI response
    return new Response(
      JSON.stringify({
        message: botResponse,
        messageId,
        metadata,
        structuredMessage: metadata.structuredMessage,
        sessionId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process request' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
