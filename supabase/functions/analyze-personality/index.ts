
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from 'https://esm.sh/openai@4.28.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { responses, profileId } = await req.json()

    // Validate required inputs
    if (!responses || !profileId) {
      throw new Error('Missing required parameters: responses or profileId')
    }

    // Create prompt for personality analysis
    const prompt = `
      Based on the following user responses to a personality test, analyze their traits, preferences, 
      and provide career and academic major recommendations.
      
      Test Responses:
      ${JSON.stringify(responses, null, 2)}

      Please provide a structured analysis with:
      1. Key personality traits and characteristics (provide as a list of strings)
      2. Recommended career paths (provide as a list of objects with title and reasoning fields)
      3. Recommended academic majors (provide as a list of objects with title and reasoning fields)
      4. Areas for skill development (include these within the JSON structure)

      Format the response as a JSON object with these exact fields:
      {
        "personalityTraits": string[],
        "careerRecommendations": Array<{ title: string, reasoning: string }>,
        "majorRecommendations": Array<{ title: string, reasoning: string }>,
        "skillDevelopment": string[]
      }
    `

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured')
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    let analysis;
    let retries = 3;
    let backoff = 1000;

    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Making OpenAI API call attempt ${i + 1}/${retries}`);
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini", // Changed to use the correct model name
          messages: [
            { role: "system", content: "You are a career counseling expert specializing in personality analysis and career guidance. Always return responses in valid JSON format." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
        });

        analysis = completion.choices[0].message;
        break;
      } catch (error) {
        console.error(`Attempt ${i + 1}/${retries} failed:`, error);
        if (error.status === 429) { // Rate limit error
          console.log(`Rate limited, attempt ${i + 1}/${retries}. Waiting ${backoff}ms before retry...`);
          await delay(backoff);
          backoff *= 2; // Exponential backoff
          continue;
        }
        if (i === retries - 1) {
          throw new Error(`Failed after ${retries} attempts: ${error.message}`);
        }
        await delay(backoff);
        backoff *= 2;
      }
    }

    if (!analysis?.content) {
      throw new Error('Invalid response from OpenAI API')
    }

    // Parse the response to extract structured data
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysis.content)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      throw new Error('Failed to parse analysis results')
    }

    // Validate the parsed data structure
    if (!parsedAnalysis.personalityTraits || !parsedAnalysis.careerRecommendations || 
        !parsedAnalysis.majorRecommendations || !parsedAnalysis.skillDevelopment) {
      throw new Error('Invalid analysis structure from AI')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store results in database
    const { error: resultError } = await supabaseClient
      .from('personality_test_results')
      .insert({
        profile_id: profileId,
        personality_traits: JSON.stringify(parsedAnalysis.personalityTraits),
        career_matches: JSON.stringify(parsedAnalysis.careerRecommendations),
        major_matches: JSON.stringify(parsedAnalysis.majorRecommendations),
        skill_development: JSON.stringify(parsedAnalysis.skillDevelopment),
        raw_analysis: analysis.content
      })

    if (resultError) throw resultError

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: parsedAnalysis
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in analyze-personality function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
