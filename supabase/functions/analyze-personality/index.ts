
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all answer mappings
    const { data: mappings, error: mappingsError } = await supabaseClient
      .from('personality_test_answer_mappings')
      .select('*')

    if (mappingsError) throw mappingsError

    // Initialize scoring objects
    const careerScores: { [key: string]: number } = {}
    const majorScores: { [key: string]: number } = {}
    const traitScores: { [key: string]: Set<string> } = {}

    console.log('Processing responses:', responses)
    console.log('Found mappings:', mappings)

    // Process each response
    for (const [questionId, answer] of Object.entries(responses)) {
      const relevantMappings = mappings.filter(m => 
        m.question_id === questionId && 
        m.answer_value === String(answer)
      )

      console.log(`Processing question ${questionId} with answer ${answer}`)
      console.log('Relevant mappings:', relevantMappings)

      // Update scores based on mappings
      for (const mapping of relevantMappings) {
        switch (mapping.recommendation_type) {
          case 'career':
            careerScores[mapping.recommendation_id] = 
              (careerScores[mapping.recommendation_id] || 0) + mapping.weight
            break
          case 'major':
            majorScores[mapping.recommendation_id] = 
              (majorScores[mapping.recommendation_id] || 0) + mapping.weight
            break
          case 'trait':
            if (!traitScores[mapping.recommendation_id]) {
              traitScores[mapping.recommendation_id] = new Set()
            }
            traitScores[mapping.recommendation_id].add(answer as string)
            break
        }
      }
    }

    // Get career recommendations
    const { data: careerData, error: careerError } = await supabaseClient
      .from('careers')
      .select('id, title, description')
      .in('id', Object.keys(careerScores))

    if (careerError) throw careerError

    // Get major recommendations
    const { data: majorData, error: majorError } = await supabaseClient
      .from('majors')
      .select('id, title, description')
      .in('id', Object.keys(majorScores))

    if (majorError) throw majorError

    // Format career recommendations
    const careerRecommendations = careerData
      .map(career => ({
        title: career.title,
        reasoning: `Based on your responses, this career aligns with your interests and preferences with a score of ${careerScores[career.id]}.`,
        description: career.description
      }))
      .sort((a, b) => careerScores[b.id] - careerScores[a.id])
      .slice(0, 5)

    // Format major recommendations
    const majorRecommendations = majorData
      .map(major => ({
        title: major.title,
        reasoning: `This academic path matches your indicated preferences and aptitudes with a score of ${majorScores[major.id]}.`,
        description: major.description
      }))
      .sort((a, b) => majorScores[b.id] - majorScores[a.id])
      .slice(0, 5)

    // Format personality traits
    const personalityTraits = Object.entries(traitScores)
      .filter(([_, answers]) => answers.size >= 2) // Require at least 2 answers supporting a trait
      .map(([trait, _]) => trait)

    const results = {
      personality_traits: JSON.stringify(personalityTraits),
      career_matches: JSON.stringify(careerRecommendations),
      major_matches: JSON.stringify(majorRecommendations),
      skill_development: JSON.stringify([]) // This could be enhanced based on the recommendations
    }

    console.log('Storing results:', results)

    // Store results in database
    const { error: resultError } = await supabaseClient
      .from('personality_test_results')
      .insert({
        profile_id: profileId,
        ...results
      })

    if (resultError) throw resultError

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: {
          personalityTraits,
          careerRecommendations,
          majorRecommendations,
          skillDevelopment: []
        }
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
