
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'
import { processAnswers } from './scoring.ts'
import { getRecommendations } from './recommendations.ts'
import type { TestResults } from './types.ts'

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

    console.log('Analyzing responses:', responses)

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

    // Process answers and calculate scores
    const { careerScores, majorScores, traitEvidence } = processAnswers(responses, mappings)

    console.log('Final scores:', {
      careers: careerScores,
      majors: majorScores,
      traits: traitEvidence
    })

    // Get recommendations
    const { careerRecommendations, majorRecommendations } = await getRecommendations(
      supabaseClient,
      Object.keys(careerScores),
      Object.keys(majorScores),
      careerScores,
      majorScores
    )

    // Format personality traits (require at least 2 supporting answers)
    const personalityTraits = Object.entries(traitEvidence)
      .filter(([_, evidence]) => evidence.size >= 2)
      .map(([trait, _]) => trait)

    // Default skill development suggestions
    const skillDevelopment = [
      "Critical thinking and problem-solving",
      "Communication and interpersonal skills",
      "Technical proficiency",
      "Leadership and teamwork",
      "Time management and organization"
    ]

    const results: TestResults = {
      personality_traits: JSON.stringify(personalityTraits),
      career_matches: JSON.stringify(careerRecommendations),
      major_matches: JSON.stringify(majorRecommendations),
      skill_development: JSON.stringify(skillDevelopment)
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
          skillDevelopment
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

