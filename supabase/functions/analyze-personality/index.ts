
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { responses, profileId } = await req.json()

    // Create prompt for personality analysis
    const prompt = `
      Based on the following user responses to a personality test, analyze their traits, preferences, 
      and provide career and academic major recommendations.
      
      Test Responses:
      ${JSON.stringify(responses, null, 2)}

      Please provide a structured analysis with:
      1. Key personality traits and characteristics
      2. Recommended career paths with reasoning
      3. Recommended academic majors with reasoning
      4. Areas for skill development

      Format the response as a JSON object with these sections.
    `

    // Call DeepSeek API for analysis
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a career counseling expert specializing in personality analysis and career guidance." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    })

    const analysis = await deepseekResponse.json()

    // Parse the response to extract structured data
    const parsedAnalysis = JSON.parse(analysis.choices[0].message.content)

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
        personality_traits: parsedAnalysis.personalityTraits,
        career_matches: parsedAnalysis.careerRecommendations,
        major_matches: parsedAnalysis.majorRecommendations,
        raw_analysis: analysis.choices[0].message.content
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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
