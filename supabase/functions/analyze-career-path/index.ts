
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: Message[];
  profile_id: string;
  session_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Parse request
  let body: RequestBody;
  try {
    body = await req.json();
  } catch (error) {
    console.error("Error parsing request body:", error);
    return new Response(JSON.stringify({ error: "Invalid request body" }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Verify request has the necessary data
  if (!body?.messages || !body?.profile_id || !body?.session_id) {
    console.error("Missing required fields in request");
    return new Response(JSON.stringify({ error: "Missing required fields" }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Analyzing career path based on conversation history...");
    
    // Format messages for the DeepSeek API
    const userMessages = body.messages.filter(m => m.role === 'user').map(m => m.content);
    
    // Get profile information for context
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', body.profile_id)
      .single();
    
    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }

    // Construct the system message for the analysis
    const systemMessage = `
    You are an expert career advisor with deep knowledge of various professions, industries, and academic paths.
    Your task is to analyze the conversation with a user and determine:
    1. The top 3-5A career paths that match their interests, skills, and preferences
    2. Key personality traits revealed in their responses
    3. Their apparent learning style and work preferences
    
    For each career recommendation, provide:
    - The career title
    - A score from 0-100 indicating match strength
    - Reasoning for why this career fits them
    
    Format your analysis in a clear, structured response. 
    Also include a JSON object at the end with the following structure:
    {
      "careers": [
        {
          "title": "Career Title",
          "score": 85,
          "reasoning": "Explanation of why this career matches"
        }
      ],
      "personalityTraits": ["trait1", "trait2", "trait3"],
      "learningStyles": ["style1", "style2"]
    }
    `;

    // Combine the user messages into a context
    const userContext = userMessages.join("\n\n");
    
    // Add any available profile information
    const profileContext = profile ? 
      `User profile information: 
      - Name: ${profile.first_name} ${profile.last_name}
      - Fields of interest: ${profile.fields_of_interest ? profile.fields_of_interest.join(", ") : "Not specified"}
      - Skills: ${profile.skills ? profile.skills.join(", ") : "Not specified"}
      - Tools: ${profile.tools_used ? profile.tools_used.join(", ") : "Not specified"}
      - Education: ${profile.highest_degree || "Not specified"}
      - Experience: ${profile.years_of_experience || "Not specified"} years` 
      : "No profile information available";

    // Build the prompt for the career analysis
    const prompt = `
    ${systemMessage}
    
    ${profileContext}
    
    Here is the conversation with the user:
    ${userContext}
    
    Based on this information, please provide your career recommendations and analysis.
    `;

    console.log("Sending request to DeepSeek API...");
    
    // Simulate DeepSeek API call with a structured analysis
    // In a real implementation, you would call the actual API here
    const simulatedResponse = {
      analysis: `Based on our conversation, I've analyzed your preferences, interests, and skills. Here are my career recommendations for you:

1. **Data Scientist** (90% match)
   You've shown strong analytical skills and interest in working with data. Your preference for problem-solving and interest in mathematics make this a great fit. Data science combines technical skills with creative problem-solving in a field that's growing rapidly.

2. **UX/UI Designer** (85% match)
   Your interest in design, creativity, and understanding user needs suggests you might excel in UX/UI design. This career allows you to combine artistic abilities with analytical thinking, creating interfaces that are both functional and aesthetically pleasing.

3. **Environmental Consultant** (80% match)
   Your expressed concern for sustainability and interest in making an impact align well with environmental consulting. This role would allow you to help organizations reduce their environmental footprint while satisfying your desire for meaningful work.

4. **Project Manager** (75% match)
   Your organizational skills and preference for collaborative environments suggest project management could be a good fit. This role would leverage your communication skills and ability to coordinate multiple tasks and people.

**Key Personality Traits:**
- Analytical thinker
- Creative problem-solver
- Detail-oriented
- Socially conscious
- Collaborative

**Learning Style and Work Preferences:**
- Visual learner
- Prefers a mix of independent and team-based work
- Values work-life balance
- Thrives in environments with variety and new challenges
- Prefers structured work with some flexibility

I recommend exploring these career paths further by connecting with professionals in these fields or looking into relevant courses or certifications to build your skills in these areas.`,
      parsed: {
        careers: [
          {
            title: "Data Scientist",
            score: 90,
            reasoning: "Strong analytical skills and interest in working with data. Preference for problem-solving and interest in mathematics make this a great fit."
          },
          {
            title: "UX/UI Designer",
            score: 85,
            reasoning: "Interest in design, creativity, and understanding user needs suggests excellence in UX/UI design. Combines artistic abilities with analytical thinking."
          },
          {
            title: "Environmental Consultant",
            score: 80,
            reasoning: "Expressed concern for sustainability and interest in making an impact. Would help organizations reduce their environmental footprint."
          },
          {
            title: "Project Manager",
            score: 75,
            reasoning: "Organizational skills and preference for collaborative environments. Would leverage communication skills and ability to coordinate multiple tasks and people."
          }
        ],
        personalityTraits: [
          "Analytical thinker",
          "Creative problem-solver",
          "Detail-oriented",
          "Socially conscious",
          "Collaborative"
        ],
        learningStyles: [
          "Visual learner",
          "Mix of independent and team-based work",
          "Values work-life balance",
          "Thrives with variety and new challenges",
          "Prefers structured work with some flexibility"
        ]
      }
    };

    // Store the recommendations in the database
    if (simulatedResponse.parsed.careers) {
      console.log("Storing career recommendations...");
      
      // Get available careers from database that match the recommendations
      const careerTitles = simulatedResponse.parsed.careers.map(c => c.title);
      const { data: availableCareers, error: careersError } = await supabase
        .from('careers')
        .select('id, title')
        .in('title', careerTitles);
      
      if (careersError) {
        console.error("Error fetching available careers:", careersError);
      }
      
      // Create a map of career titles to IDs
      const careerMap = new Map();
      if (availableCareers) {
        availableCareers.forEach(career => {
          careerMap.set(career.title.toLowerCase(), career.id);
        });
      }
      
      // Save recommendations
      for (const career of simulatedResponse.parsed.careers) {
        // Try to find an exact match first
        let careerID = careerMap.get(career.title.toLowerCase());
        
        // If no exact match, try a more flexible match
        if (!careerID && availableCareers) {
          const similarCareer = availableCareers.find(
            c => c.title.toLowerCase().includes(career.title.toLowerCase()) || 
                career.title.toLowerCase().includes(c.title.toLowerCase())
          );
          if (similarCareer) careerID = similarCareer.id;
        }
        
        if (careerID) {
          const { error: recError } = await supabase
            .from('career_chat_recommendations')
            .insert({
              session_id: body.session_id,
              career_id: careerID,
              score: career.score,
              reasoning: career.reasoning,
              metadata: { analysisData: simulatedResponse.parsed }
            });
          
          if (recError) {
            console.error("Error storing recommendation:", recError);
          }
        } else {
          console.log(`No matching career found in database for: ${career.title}`);
        }
      }
    }

    return new Response(JSON.stringify(simulatedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in career path analysis:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
