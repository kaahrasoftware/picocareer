
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

    // Initialize scoring objects
    const careerScores: { [key: string]: { score: number; reasons: Set<string> } } = {}
    const majorScores: { [key: string]: { score: number; reasons: Set<string> } } = {}
    const traitEvidence: { [key: string]: Set<string> } = {}

    // Process each response
    for (const [questionId, answer] of Object.entries(responses)) {
      const answerStr = String(answer)
      console.log(`Processing answer for question ${questionId}: ${answerStr}`)

      // Find relevant mappings for this question and answer
      const relevantMappings = mappings.filter(m => {
        const answerMatch = m.answer_value === answerStr
        console.log(`Comparing mapping answer "${m.answer_value}" with response "${answerStr}": ${answerMatch}`)
        return m.question_id === questionId && answerMatch
      })

      console.log(`Found ${relevantMappings.length} relevant mappings`)

      // Update scores based on mappings
      for (const mapping of relevantMappings) {
        if (!mapping.recommendation_id && mapping.recommendation_type !== 'trait') continue

        const reason = `Based on your response to question ${questionId}`
        
        switch (mapping.recommendation_type) {
          case 'career':
            if (!careerScores[mapping.recommendation_id]) {
              careerScores[mapping.recommendation_id] = { score: 0, reasons: new Set() }
            }
            careerScores[mapping.recommendation_id].score += mapping.weight
            careerScores[mapping.recommendation_id].reasons.add(reason)
            break

          case 'major':
            if (!majorScores[mapping.recommendation_id]) {
              majorScores[mapping.recommendation_id] = { score: 0, reasons: new Set() }
            }
            majorScores[mapping.recommendation_id].score += mapping.weight
            majorScores[mapping.recommendation_id].reasons.add(reason)
            break

          case 'trait':
            if (!traitEvidence[answerStr]) {
              traitEvidence[answerStr] = new Set()
            }
            traitEvidence[answerStr].add(reason)
            break
        }
      }
    }

    console.log('Final scores:', {
      careers: careerScores,
      majors: majorScores,
      traits: traitEvidence
    })

    // Get career details for recommendations
    const careerIds = Object.keys(careerScores)
    const { data: careers, error: careersError } = await supabaseClient
      .from('careers')
      .select('id, title, description')
      .in('id', careerIds)

    if (careersError) throw careersError

    // Get major details for recommendations
    const majorIds = Object.keys(majorScores)
    const { data: majors, error: majorsError } = await supabaseClient
      .from('majors')
      .select('id, title, description')
      .in('id', majorIds)

    if (majorsError) throw majorsError

    // Format career recommendations
    const careerRecommendations = careers
      .map(career => ({
        id: career.id,
        title: career.title,
        description: career.description,
        score: careerScores[career.id].score,
        reasoning: Array.from(careerScores[career.id].reasons).join('. ')
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    // Format major recommendations
    const majorRecommendations = majors
      .map(major => ({
        id: major.id,
        title: major.title,
        description: major.description,
        score: majorScores[major.id].score,
        reasoning: Array.from(majorScores[major.id].reasons).join('. ')
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

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

    const results = {
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

