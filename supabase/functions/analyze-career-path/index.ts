
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initial system prompt that defines Pico's role and capabilities
const SYSTEM_PROMPT = `
You are Pico, an AI career counselor. Your role is to analyze user responses about their interests, skills, and preferences, 
and recommend suitable career paths. You should match their profile to potential careers based on:
1. Skills alignment
2. Interest areas
3. Personality traits
4. Work environment preferences
5. Educational background or aspirations

For each career recommendation, provide:
- Career title
- Brief description of why it's a good match
- Required skills and qualifications
- Potential growth opportunities
- Salary range information

Also identify personality traits and learning styles that match the user's responses.
`;

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { messages, personality, profile_id, session_id } = await req.json();
    
    // Validate request
    if (!messages || !messages.length) {
      return new Response(
        JSON.stringify({ error: "Missing required messages data" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Analyzing career path with DeepSeek API");
    console.log("Number of messages:", messages.length);

    // Call DeepSeek API for career analysis
    const analysisResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
          { 
            role: "user", 
            content: "Based on my responses, please provide: 1) Top 5 recommended careers with scores (1-100) and brief reasoning, 2) Key personality traits you've identified, 3) Learning styles that might work best for me." 
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error("DeepSeek API error:", errorText);
      throw new Error(`DeepSeek API error: ${errorText}`);
    }

    const analysisResult = await analysisResponse.json();
    console.log("Analysis complete");

    const analysisContent = analysisResult.choices[0].message.content;

    // Parse the analysis results - this is a simple parser and might need refinement
    const parsedResults = parseAnalysisResults(analysisContent);
    
    // If profile_id and session_id are provided, save the recommendations to the database
    if (profile_id && session_id) {
      await saveRecommendationsToDatabase(parsedResults.careers, session_id);
    }

    return new Response(
      JSON.stringify({
        analysis: analysisContent,
        parsed: parsedResults
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in analyze-career-path function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// Function to parse the analysis results from the DeepSeek API response
function parseAnalysisResults(content: string) {
  // Initialize results structure
  const results = {
    careers: [] as any[],
    personalityTraits: [] as string[],
    learningStyles: [] as string[]
  };

  try {
    // Extract career recommendations
    const careerSection = content.match(/Top 5 recommended careers[\s\S]*?(?=Key personality traits|$)/i);
    if (careerSection) {
      // Look for career entries with scores
      const careerRegex = /\d+\.\s+([\w\s&-]+)(?:\s*\(Score:\s*(\d+)\))?[^\n]*\n((?:(?!\d+\.).)*)/g;
      let match;
      
      while ((match = careerRegex.exec(careerSection[0])) !== null) {
        const careerTitle = match[1].trim();
        const score = match[2] ? parseInt(match[2]) : 85; // Default score if not found
        const reasoning = match[3].trim();
        
        results.careers.push({
          title: careerTitle,
          score: score,
          reasoning: reasoning
        });
      }
    }

    // Extract personality traits
    const personalitySection = content.match(/Key personality traits[\s\S]*?(?=Learning styles|$)/i);
    if (personalitySection) {
      const traitsText = personalitySection[0].replace(/Key personality traits[:\s]*/i, '').trim();
      const traits = traitsText.split(/\n|-/).map(trait => trait.trim()).filter(Boolean);
      results.personalityTraits = traits;
    }

    // Extract learning styles
    const learningSection = content.match(/Learning styles[\s\S]*/i);
    if (learningSection) {
      const stylesText = learningSection[0].replace(/Learning styles[:\s]*/i, '').trim();
      const styles = stylesText.split(/\n|-/).map(style => style.trim()).filter(Boolean);
      results.learningStyles = styles;
    }
  } catch (error) {
    console.error("Error parsing analysis results:", error);
  }

  return results;
}

// Function to save career recommendations to the database
async function saveRecommendationsToDatabase(careers: any[], session_id: string) {
  try {
    // First, find existing careers in our database that match the recommendations
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    for (const career of careers) {
      // Try to find a matching career
      const { data: existingCareers } = await supabase
        .from('careers')
        .select('id, title')
        .ilike('title', `%${career.title}%`)
        .limit(1);
      
      let career_id = null;
      
      if (existingCareers && existingCareers.length > 0) {
        // If found, use the existing career
        career_id = existingCareers[0].id;
      } else {
        // If not found, create a new career entry
        const { data: newCareer, error } = await supabase
          .from('careers')
          .insert({
            title: career.title,
            description: `Generated career path: ${career.reasoning}`,
            status: 'Approved',
            salary_range: 'Varies by location and experience',
            keywords: extractKeywords(career.title, career.reasoning),
            industry: guessIndustry(career.title, career.reasoning),
            required_skills: extractSkills(career.reasoning),
            work_environment: extractWorkEnvironment(career.reasoning),
            author_id: null // System-generated
          })
          .select('id')
          .single();
        
        if (error) {
          console.error("Error creating new career:", error);
          continue;
        }
        
        career_id = newCareer.id;
      }
      
      // Save the recommendation
      if (career_id) {
        await supabase
          .from('career_chat_recommendations')
          .insert({
            session_id: session_id,
            career_id: career_id,
            score: career.score,
            reasoning: career.reasoning,
            metadata: { 
              original_title: career.title,
              generated: existingCareers?.length === 0
            }
          });
      }
    }
  } catch (error) {
    console.error("Error saving recommendations to database:", error);
  }
}

// Helper function to create a Supabase client
function createClient(supabaseUrl: string, supabaseKey: string) {
  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        ilike: (column: string, value: string) => ({
          limit: (limit: number) => ({
            async then(onfulfilled: (value: { data: any[] }) => any) {
              try {
                const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}`, {
                  headers: {
                    "apikey": supabaseKey,
                    "Authorization": `Bearer ${supabaseKey}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                  }
                });
                
                if (!response.ok) throw new Error(`Supabase API error: ${response.statusText}`);
                
                const data = await response.json();
                // Filter results based on ilike
                const filteredData = data.filter((item: any) => 
                  new RegExp(value.replace(/%/g, '.*'), 'i').test(item[column.split(' ')[0]])
                ).slice(0, limit);
                
                return onfulfilled({ data: filteredData });
              } catch (error) {
                return onfulfilled({ data: [] });
              }
            }
          })
        }),
        limit: (limit: number) => ({
          async then(onfulfilled: (value: { data: any[] }) => any) {
            try {
              const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}&limit=${limit}`, {
                headers: {
                  "apikey": supabaseKey,
                  "Authorization": `Bearer ${supabaseKey}`,
                  "Content-Type": "application/json"
                }
              });
              
              if (!response.ok) throw new Error(`Supabase API error: ${response.statusText}`);
              
              const data = await response.json();
              return onfulfilled({ data });
            } catch (error) {
              return onfulfilled({ data: [] });
            }
          }
        })
      }),
      insert: (values: any) => ({
        select: (columns: string) => ({
          single: () => {
            return new Promise(async (resolve) => {
              try {
                const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
                  method: 'POST',
                  headers: {
                    "apikey": supabaseKey,
                    "Authorization": `Bearer ${supabaseKey}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                  },
                  body: JSON.stringify(values)
                });
                
                if (!response.ok) {
                  const errorText = await response.text();
                  resolve({ error: errorText });
                  return;
                }
                
                const data = await response.json();
                resolve({ data: data[0] });
              } catch (error) {
                resolve({ error });
              }
            });
          }
        }),
        async then(onfulfilled: (value: { data?: any, error?: any }) => any) {
          try {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
              method: 'POST',
              headers: {
                "apikey": supabaseKey,
                "Authorization": `Bearer ${supabaseKey}`,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
              },
              body: JSON.stringify(values)
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              return onfulfilled({ error: errorText });
            }
            
            const data = await response.json();
            return onfulfilled({ data });
          } catch (error) {
            return onfulfilled({ error });
          }
        }
      })
    })
  };
}

// Extract skills from reasoning text
function extractSkills(text: string): string[] {
  const commonSkills = [
    "communication", "problem solving", "critical thinking", "teamwork", 
    "creativity", "adaptability", "time management", "leadership", 
    "technical", "analytical", "interpersonal", "organization", 
    "research", "writing", "programming", "design", "management"
  ];
  
  const skills = commonSkills.filter(skill => 
    new RegExp(`\\b${skill}\\b`, 'i').test(text)
  );
  
  // Add at least 3 skills if we found fewer
  if (skills.length < 3) {
    const missing = 3 - skills.length;
    const additionalSkills = commonSkills.filter(skill => !skills.includes(skill)).slice(0, missing);
    skills.push(...additionalSkills);
  }
  
  return skills;
}

// Extract keywords from title and reasoning
function extractKeywords(title: string, reasoning: string): string[] {
  const combined = `${title} ${reasoning}`;
  const words = combined.split(/\s+/);
  const keywords = new Set<string>();
  
  // Extract potential keywords (nouns, proper nouns)
  words.forEach(word => {
    word = word.replace(/[^\w]/g, '');
    if (word.length > 4 && /^[A-Z]/.test(word)) {
      keywords.add(word.toLowerCase());
    }
  });
  
  // Add the career title as a keyword
  keywords.add(title.toLowerCase());
  
  return Array.from(keywords).slice(0, 5);
}

// Guess the industry based on career title and reasoning
function guessIndustry(title: string, reasoning: string): string {
  const industries = [
    "Technology", "Healthcare", "Education", "Finance", "Marketing",
    "Engineering", "Arts", "Science", "Government", "Manufacturing",
    "Media", "Entertainment", "Hospitality", "Legal", "Construction"
  ];
  
  const combined = `${title} ${reasoning}`.toLowerCase();
  
  for (const industry of industries) {
    if (combined.includes(industry.toLowerCase())) {
      return industry;
    }
  }
  
  // Default to a reasonable guess based on the career title
  if (title.match(/software|developer|programmer|web|app|tech|data|IT|computer/i)) return "Technology";
  if (title.match(/doctor|nurse|patient|health|medical|care|therapy/i)) return "Healthcare";
  if (title.match(/teach|education|school|instructor|professor|academic/i)) return "Education";
  if (title.match(/finance|bank|account|invest|money|budget|tax/i)) return "Finance";
  if (title.match(/market|advertis|brand|social media|content/i)) return "Marketing";
  if (title.match(/engineer|architect|design|build|construct/i)) return "Engineering";
  if (title.match(/art|design|creative|music|write|author|edit/i)) return "Arts";
  
  return "Other";
}

// Extract work environment from reasoning
function extractWorkEnvironment(reasoning: string): string {
  if (reasoning.match(/team|collaborate|group|work with others/i)) {
    return "Collaborative team environment";
  } else if (reasoning.match(/independent|autonomy|self-directed|on your own/i)) {
    return "Independent work environment";
  } else if (reasoning.match(/fast-paced|dynamic|changing|adapt/i)) {
    return "Fast-paced, dynamic environment";
  } else if (reasoning.match(/creative|innovative|design/i)) {
    return "Creative and innovative setting";
  } else if (reasoning.match(/structure|organized|systematic/i)) {
    return "Structured and organized environment";
  }
  
  return "Various work environments depending on the organization";
}
