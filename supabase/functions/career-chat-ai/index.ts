import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Constants for the prompt
const SYSTEM_PROMPT = `
You are Pico, a helpful career advisor. You MUST follow these strict guidelines:

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

3. ALWAYS format your response as follows:
   {
     "type": "question",
     "metadata": {
       "category": "education|skills|workstyle|goals",
       "questionNumber": X,
       "totalInCategory": Y,
       "options": ["Option 1", "Option 2", "Option 3"]
     },
     "content": "Your actual question text here"
   }

4. After collecting 12-15 total responses, provide career recommendations in this format:
   {
     "type": "recommendation",
     "sections": {
       "careers": [
         {"title": "Career Title", "match": 85, "reasoning": "Why this matches"},
         {"title": "Another Career", "match": 75, "reasoning": "Explanation"}
       ],
       "personality": [
         {"title": "Personality Trait", "match": 90, "description": "Description"},
         {"title": "Another Trait", "match": 85, "description": "Details"}
       ],
       "mentors": [
         {"name": "Mentor Name", "experience": "5 years", "skills": "Skills overview"},
         {"name": "Another Mentor", "experience": "10 years", "skills": "Specialties"}
       ]
     }
   }

5. ALWAYS include the JSON structure in your response. This is MANDATORY.
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
      console.error('Missing DeepSeek API key');
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
    const totalQuestionsAsked = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
    if ((currentCategory === 'goals' && questionNumber >= 3) || totalQuestionsAsked >= 12) {
      prompt += "\nAfter this question, provide career recommendations based on all the user's answers in the specified JSON format.";
    }
    
    console.log('Calling DeepSeek API with prompt...', { 
      currentCategory, 
      questionNumber, 
      totalQuestionsAsked,
      apiKeyPresent: !!deepseekApiKey
    });
    
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
    console.log('DeepSeek API response received', { 
      choices: !!data.choices,
      hasMessage: !!(data.choices?.[0]?.message),
      responseLength: data.choices?.[0]?.message?.content?.length
    });
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from DeepSeek API');
    }

    // Extract the response text
    const responseContent = data.choices[0].message.content;
    
    // Try to extract JSON from the response
    let parsedResponse;
    let responseType = 'unknown';
    let metadata = {};
    let cleanedMessage = responseContent;
    
    try {
      // Look for JSON pattern in the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        parsedResponse = JSON.parse(jsonString);
        
        // Determine the type of response
        if (parsedResponse.type === 'question') {
          responseType = 'question';
          metadata = {
            category: parsedResponse.metadata?.category || currentCategory,
            questionNumber: parsedResponse.metadata?.questionNumber || questionNumber,
            totalInCategory: parsedResponse.metadata?.totalInCategory || 4,
            hasOptions: true,
            suggestions: parsedResponse.metadata?.options || []
          };
          
          // Use the content as the cleaned message
          cleanedMessage = parsedResponse.content || responseContent.replace(jsonString, '').trim();
        }
        else if (parsedResponse.type === 'recommendation') {
          responseType = 'recommendation';
          metadata = {
            isRecommendation: true,
            category: 'complete'
          };
          
          // For recommendations, keep the JSON as part of the response
          // but also extract main content if needed for display
          cleanedMessage = formatRecommendation(parsedResponse);
        }
      } else {
        // Fallback for non-JSON responses
        console.log('No JSON structure found in response, using default formatting');
        metadata = {
          category: currentCategory,
          questionNumber: questionNumber,
          totalInCategory: 4,
          hasOptions: true,
          suggestions: extractSuggestions(responseContent)
        };
      }
    } catch (e) {
      console.error('Error parsing response JSON:', e);
      // Fallback metadata when parsing fails
      metadata = {
        category: currentCategory,
        questionNumber: questionNumber,
        totalInCategory: 4,
        hasOptions: true,
        suggestions: extractSuggestions(responseContent)
      };
    }
    
    // Track overall progress
    const totalCategories = CATEGORIES.length;
    const categoriesCompleted = CATEGORIES.findIndex(cat => cat === currentCategory);
    const progressInCurrentCategory = questionNumber / 4; // assuming 4 questions per category
    
    // Calculate overall progress (0-100)
    const overallProgress = Math.min(
      Math.round(((categoriesCompleted + progressInCurrentCategory) / totalCategories) * 100),
      100
    );
    
    // Add progress to metadata
    metadata.progress = overallProgress;
    
    // Generate a message ID
    const messageId = crypto.randomUUID();

    console.log('Sending final response', { 
      responseType, 
      messageLength: cleanedMessage.length,
      hasMetadata: Object.keys(metadata).length > 0,
      progress: metadata.progress
    });

    // Return the response
    return new Response(
      JSON.stringify({
        message: cleanedMessage,
        messageId,
        metadata,
        rawResponse: responseType === 'recommendation' ? parsedResponse : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in career-chat-ai function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred', details: error.stack }),
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

// Format recommendation for display
function formatRecommendation(recommendation) {
  if (!recommendation.sections) {
    return JSON.stringify(recommendation, null, 2);
  }
  
  let formattedText = "# Career Recommendations\n\n";
  
  // Add careers section
  if (recommendation.sections.careers && recommendation.sections.careers.length > 0) {
    formattedText += "## Career Matches\n\n";
    recommendation.sections.careers.forEach((career, index) => {
      formattedText += `${index + 1}. ${career.title} (${career.match}%)\n`;
      if (career.reasoning) {
        formattedText += `   ${career.reasoning}\n\n`;
      }
    });
  }
  
  // Add personality section
  if (recommendation.sections.personality && recommendation.sections.personality.length > 0) {
    formattedText += "\n## Personality Assessment\n\n";
    recommendation.sections.personality.forEach((trait, index) => {
      formattedText += `${index + 1}. ${trait.title} (${trait.match}%)\n`;
      if (trait.description) {
        formattedText += `   ${trait.description}\n\n`;
      }
    });
  }
  
  // Add mentors section
  if (recommendation.sections.mentors && recommendation.sections.mentors.length > 0) {
    formattedText += "\n## Mentor Recommendations\n\n";
    recommendation.sections.mentors.forEach((mentor, index) => {
      formattedText += `${index + 1}. ${mentor.name} (${mentor.experience})\n`;
      if (mentor.skills) {
        formattedText += `   ${mentor.skills}\n\n`;
      }
    });
  }
  
  return formattedText;
}
