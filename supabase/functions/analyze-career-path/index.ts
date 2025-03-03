
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Define the request body type
interface RequestBody {
  messages: {
    role: "user" | "assistant";
    content: string;
  }[];
  profile_id: string;
  session_id: string;
}

// Define the response structure for the career recommendation
interface CareerRecommendation {
  title: string;
  score: number;
  reasoning: string;
}

interface PersonalityTrait {
  trait: string;
  description: string;
}

interface LearningStyle {
  style: string;
  description: string;
}

interface AnalysisResult {
  careers: CareerRecommendation[];
  personalityTraits: string[];
  learningStyles: string[];
}

serve(async (req) => {
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY") || "";

    if (!deepseekApiKey) {
      return new Response(
        JSON.stringify({ error: "DeepSeek API key not configured" }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the request body
    const { messages, profile_id, session_id } = await req.json() as RequestBody;

    console.log(`Analyzing session ${session_id} for profile ${profile_id}`);
    console.log(`Message count: ${messages.length}`);

    // Build the prompt for DeepSeek
    const systemPrompt = `
    You are a career guidance AI. Based on the user's responses to questions about their interests, skills, 
    and preferences, analyze their personality, learning style, and suggest career paths that would be a good fit.
    
    Your task is to:
    1. Identify the user's key personality traits relevant to career choices
    2. Determine their learning style and work preferences
    3. Suggest 3-5 career paths that align with their profile
    4. For each career suggestion, provide a score (1-100) indicating the match
    5. Give a brief reasoning for each career suggestion
    
    Format your analysis as a detailed text response first, then summarize in this format:
    
    CAREERS:
    - Career: [career title]
    - Score: [match percentage 1-100]
    - Reasoning: [brief explanation]
    
    PERSONALITY_TRAITS:
    - [trait1]
    - [trait2]
    
    LEARNING_STYLES:
    - [style1]
    - [style2]
    `;

    // Prepare the messages for the DeepSeek API
    const deepseekMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    console.log("Sending request to DeepSeek API");

    // Make the API call to DeepSeek
    const deepseekResponse = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: deepseekMessages,
          temperature: 0.7,
          max_tokens: 1500,
        }),
      }
    );

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error("DeepSeek API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze career path", details: errorText }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    const deepseekData = await deepseekResponse.json();
    const analysisText = deepseekData.choices[0].message.content;
    console.log("Received response from DeepSeek API");

    // Parse the analysis to extract structured data
    function parseAnalysis(text: string): { analysis: string; parsed: AnalysisResult | null } {
      try {
        const careers: CareerRecommendation[] = [];
        const personalityTraits: string[] = [];
        const learningStyles: string[] = [];

        // Regular expressions to extract data
        const careerRegex = /Career: (.*?)[\r\n]+\s*- Score: (\d+)[\r\n]+\s*- Reasoning: (.*?)(?=[\r\n]+\s*-|PERSONALITY_TRAITS:|$)/gs;
        const traitsRegex = /PERSONALITY_TRAITS:[\r\n]+((?:\s*- .*?[\r\n]+)+)/s;
        const stylesRegex = /LEARNING_STYLES:[\r\n]+((?:\s*- .*?[\r\n]+)+)/s;

        // Extract careers
        let match;
        while ((match = careerRegex.exec(text)) !== null) {
          careers.push({
            title: match[1].trim(),
            score: parseInt(match[2]),
            reasoning: match[3].trim()
          });
        }

        // Extract personality traits
        const traitsMatch = traitsRegex.exec(text);
        if (traitsMatch) {
          const traitsList = traitsMatch[1].trim();
          const traits = traitsList.split("\n").map(trait => 
            trait.replace(/^\s*-\s*/, "").trim()
          ).filter(Boolean);
          personalityTraits.push(...traits);
        }

        // Extract learning styles
        const stylesMatch = stylesRegex.exec(text);
        if (stylesMatch) {
          const stylesList = stylesMatch[1].trim();
          const styles = stylesList.split("\n").map(style => 
            style.replace(/^\s*-\s*/, "").trim()
          ).filter(Boolean);
          learningStyles.push(...styles);
        }

        return {
          analysis: text,
          parsed: careers.length > 0 ? {
            careers,
            personalityTraits,
            learningStyles
          } : null
        };
      } catch (error) {
        console.error("Error parsing analysis:", error);
        return { analysis: text, parsed: null };
      }
    }

    const { analysis, parsed } = parseAnalysis(analysisText);
    console.log("Parsed analysis:", JSON.stringify(parsed));

    // Store career recommendations in the database
    if (parsed && parsed.careers.length > 0) {
      const { error: storageError } = await supabase.from("career_chat_recommendations")
        .insert(
          parsed.careers.map(career => ({
            session_id,
            reasoning: career.reasoning,
            score: career.score,
            metadata: {
              career: career.title,
              personality_traits: parsed.personalityTraits,
              learning_styles: parsed.learningStyles
            }
          }))
        );

      if (storageError) {
        console.error("Error storing recommendations:", storageError);
      } else {
        console.log(`Stored ${parsed.careers.length} career recommendations`);
      }
    }

    // Return the results
    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        parsed
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
