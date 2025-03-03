
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Constants for the prompt
const SYSTEM_PROMPT = `
You are Pico, a helpful career advisor. Follow these strict guidelines:

1. Ask questions in this SPECIFIC order:
   - Educational background/interests (3-4 questions)
   - Skills and technical knowledge (3-4 questions)
   - Work style preferences (3-4 questions) 
   - Career goals and aspirations (2-3 questions)

2. For EACH question:
   - Ask only ONE specific question at a time
   - Keep questions focused and direct (max 15-20 words)
   - Provide 2-4 brief answer options (max 5 words each)
   - Reference previous answers to personalize following questions
   - NEVER ask multiple questions in one message

3. Question examples:
   - "What's your highest level of education?" [Options: "High school", "Bachelor's degree", "Master's degree", "Other"]
   - "Which skill are you strongest in?" [Options: "Communication", "Technical", "Creative", "Analytical"]
   - "Do you prefer working alone or in teams?" [Options: "Alone", "Small teams", "Large teams"]
   - "What's your top career priority?" [Options: "Salary", "Work-life balance", "Growth", "Impact"]

4. Format each response with metadata:
   {
     "category": "education|skills|workstyle|goals",
     "questionNumber": X,
     "totalInCategory": Y,
     "hasOptions": true,
     "suggestions": ["Option 1", "Option 2", "Option 3"]
   }

5. After collecting 12-15 total responses:
   - Provide career recommendations with match percentages
   - Include personality analysis
   - Suggest relevant mentors
   - Format the recommendation clearly with sections
`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Categories for tracking question progress
const CATEGORIES = ['education', 'skills', 'workstyle', 'goals'];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request
    const { message, messages, sessionId, instructions, type } = await req.json();

    // Check if this is a config check request
    if (type === 'config-check') {
      // Just return success to confirm the edge function is working
      return new Response(
        JSON.stringify({ status: 'ok' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get an API key for DeepSeek API
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!deepseekApiKey) {
      return new Response(
        JSON.stringify({ error: 'DeepSeek API key not configured.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine current category and question based on message history
    let currentCategory = 'education';
    let questionNumber = 1;
    
    // Count previous questions by category
    const categoryCounts = {
      education: 0,
      skills: 0,
      workstyle: 0,
      goals: 0
    };
    
    // Analyze message history to set the correct category and question number
    if (messages && messages.length > 0) {
      for (const msg of messages) {
        if (msg.role === 'assistant' && msg.metadata && msg.metadata.category) {
          currentCategory = msg.metadata.category;
          categoryCounts[currentCategory]++;
        }
      }
      
      // If we've finished with education (3+ questions), move to skills
      if (categoryCounts.education >= 3 && currentCategory === 'education') {
        currentCategory = 'skills';
      }
      
      // If we've finished with skills (3+ questions), move to workstyle
      if (categoryCounts.skills >= 3 && currentCategory === 'skills') {
        currentCategory = 'workstyle';
      }
      
      // If we've finished with workstyle (3+ questions), move to goals
      if (categoryCounts.workstyle >= 3 && currentCategory === 'workstyle') {
        currentCategory = 'goals';
      }
      
      // Set the question number within the current category
      questionNumber = categoryCounts[currentCategory] + 1;
    }
    
    // Prepare the prompt with additional instructions
    let promptAddition = "";
    
    if (instructions) {
      if (instructions.specificQuestions) {
        promptAddition += "\nAsk very specific, focused questions. Limit each question to a single concept.";
      }
      
      if (instructions.conciseOptions) {
        promptAddition += "\nProvide extremely concise answer options (max 3-5 words each).";
      }
    }
    
    // Construct the prompt with category guidance
    let prompt = `${SYSTEM_PROMPT}${promptAddition}\n\nYou are currently asking questions about the user's ${currentCategory}. This is question #${questionNumber} in this category.\n\n`;
    
    // Add instruction for the first message if there are no previous messages
    if (!messages || messages.length <= 1) {
      prompt += "Start with a friendly introduction and ask about their educational background as the first question.";
    }
    
    // Add special instruction if we're about to transition to recommendations
    if (currentCategory === 'goals' && questionNumber >= 3) {
      prompt += "\nAfter this question, provide career recommendations based on all the user's answers.";
    }
    
    // Call the DeepSeek API
    const apiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: prompt },
          ...messages,
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${JSON.stringify(errorData)}`);
    }

    const data = await apiResponse.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from DeepSeek API');
    }

    // Extract the response text
    const responseContent = data.choices[0].message.content;
    
    // Parse the message and extract metadata
    let metadata = {};
    try {
      // Check if the message contains a JSON structure with metadata
      const metadataMatch = responseContent.match(/\{[\s\S]*?\}/);
      if (metadataMatch) {
        const metadataJson = metadataMatch[0];
        const parsedMetadata = JSON.parse(metadataJson);
        
        // Extract the metadata fields
        metadata = {
          category: parsedMetadata.category || currentCategory,
          questionNumber: parsedMetadata.questionNumber || questionNumber,
          totalInCategory: parsedMetadata.totalInCategory || 4,
          hasOptions: true,
          suggestions: parsedMetadata.suggestions || []
        };
        
        // If this looks like a recommendation, mark it as such
        if (responseContent.toLowerCase().includes('career recommendation') || 
            responseContent.toLowerCase().includes('career matches')) {
          metadata.isRecommendation = true;
          metadata.category = 'complete';
        }
      } else {
        // Default metadata if none found
        metadata = {
          category: currentCategory,
          questionNumber: questionNumber,
          totalInCategory: 4,
          hasOptions: true,
          suggestions: extractSuggestions(responseContent)
        };
      }
    } catch (e) {
      console.error('Error parsing metadata:', e);
      // Fallback metadata
      metadata = {
        category: currentCategory,
        questionNumber: questionNumber,
        totalInCategory: 4,
        hasOptions: true,
        suggestions: extractSuggestions(responseContent)
      };
    }
    
    // Clean the message by removing the JSON metadata block
    let cleanedMessage = responseContent.replace(/\{[\s\S]*?\}/, '').trim();
    
    // Extract a clean question from the message
    let questionText = cleanedMessage;
    
    // If we have suggestions, split the message to separate question from options
    if (metadata.suggestions && metadata.suggestions.length > 0) {
      // Try to find where the question ends and options begin
      const optionsIndex = findOptionsIndex(cleanedMessage, metadata.suggestions);
      if (optionsIndex > 0) {
        questionText = cleanedMessage.substring(0, optionsIndex).trim();
      }
    }
    
    // Generate a message ID
    const messageId = crypto.randomUUID();

    // Return the response
    return new Response(
      JSON.stringify({
        message: questionText,
        messageId,
        metadata
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in career-chat-ai function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to extract suggestions from response text
function extractSuggestions(text) {
  // Look for bulleted/numbered options
  const optionsRegex = /(?:^|\n)(?:[-*•]|\d+\.)\s*([^\n]+)/g;
  const matches = [...text.matchAll(optionsRegex)];
  
  if (matches.length >= 2) {
    return matches.map(match => match[1].trim());
  }
  
  // Try looking for options in brackets or quotes
  const bracketOptionsRegex = /\[([^\]]+)\]|\(([^)]+)\)|"([^"]+)"|'([^']+)'/g;
  const bracketMatches = [...text.matchAll(bracketOptionsRegex)];
  
  if (bracketMatches.length >= 2) {
    return bracketMatches.map(match => {
      // Get the first non-undefined group
      for (let i = 1; i < match.length; i++) {
        if (match[i]) return match[i].trim();
      }
      return "";
    });
  }
  
  // Fallback to default options
  return ["Yes", "No", "Maybe", "Not sure"];
}

// Helper function to find where the options begin in the message
function findOptionsIndex(text, options) {
  // Try to find the first option in the text
  if (!options || options.length === 0) return -1;
  
  // Look for common option patterns
  const patterns = [
    '- ',
    '* ',
    '• ',
    '1. ',
    'Options:',
    'Choose from:'
  ];
  
  for (const pattern of patterns) {
    const index = text.indexOf(pattern);
    if (index > 0) return index;
  }
  
  // Try to find the actual option text
  for (const option of options) {
    const index = text.indexOf(option);
    if (index > 0) return index;
  }
  
  return -1;
}
