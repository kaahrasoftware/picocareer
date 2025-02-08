
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'
import { processAnswers } from './scoring.ts'
import { calculateDimensionScores, getPersonalityType } from './dimension-scoring.ts'
import { getRecommendations } from './recommendations.ts'
import type { TestResults } from './types.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { responses, profileId } = await req.json()

    if (!responses || !profileId) {
      throw new Error('Missing required parameters: responses or profileId')
    }

    console.log('Analyzing responses:', responses)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Calculate dimension scores
    const dimensionScores = await calculateDimensionScores(responses, supabaseClient)
    const personalityType = getPersonalityType(dimensionScores)

    // Store dimension scores
    const { error: dimensionError } = await supabaseClient
      .from('personality_dimension_scores')
      .insert({
        profile_id: profileId,
        ...dimensionScores
      })

    if (dimensionError) throw dimensionError

    // Get all answer mappings
    const { data: mappings, error: mappingsError } = await supabaseClient
      .from('personality_test_answer_mappings')
      .select('*')

    if (mappingsError) throw mappingsError

    // Process answers for career and major recommendations
    const { careerScores, majorScores, traitEvidence } = processAnswers(responses, mappings)

    // Get recommendations
    const { careerRecommendations, majorRecommendations } = await getRecommendations(
      supabaseClient,
      Object.keys(careerScores),
      Object.keys(majorScores),
      careerScores,
      majorScores
    )

    // Format personality traits
    const personalityTraits = [
      personalityType,
      ...Object.entries(traitEvidence)
        .filter(([_, evidence]) => evidence.size >= 2)
        .map(([trait, _]) => trait)
    ]

    // Default skill development suggestions based on personality type
    const skillDevelopment = getSkillSuggestions(personalityType)

    const results: TestResults = {
      personality_traits: JSON.stringify(personalityTraits),
      career_matches: JSON.stringify(careerRecommendations),
      major_matches: JSON.stringify(majorRecommendations),
      skill_development: JSON.stringify(skillDevelopment)
    }

    // Store results
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
          skillDevelopment,
          personalityType,
          dimensionScores
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

function getSkillSuggestions(personalityType: string): string[] {
  const baseSkills = [
    "Critical thinking and problem-solving",
    "Communication and interpersonal skills",
    "Technical proficiency",
    "Leadership and teamwork",
    "Time management and organization"
  ];

  const typeSpecificSkills: { [key: string]: string[] } = {
    'ISTJ': ["Attention to detail", "Process improvement", "Data analysis"],
    'ISFJ': ["Active listening", "Project coordination", "Support and mentoring"],
    'INFJ': ["Strategic planning", "Writing and communication", "Counseling"],
    'INTJ': ["Systems thinking", "Research and analysis", "Strategic planning"],
    'ISTP': ["Technical troubleshooting", "Crisis management", "Practical problem-solving"],
    'ISFP': ["Creative expression", "Artistic design", "Empathetic communication"],
    'INFP': ["Creative writing", "Counseling", "Personal development"],
    'INTP': ["Theoretical analysis", "Research methodology", "System design"],
    'ESTP': ["Negotiation", "Risk management", "Crisis response"],
    'ESFP': ["Public speaking", "Customer service", "Team motivation"],
    'ENFP': ["Innovation", "Team building", "Creative problem-solving"],
    'ENTP': ["Strategic innovation", "Debate and persuasion", "Systems analysis"],
    'ESTJ': ["Project management", "Team leadership", "Operational efficiency"],
    'ESFJ': ["Group facilitation", "Community building", "Support coordination"],
    'ENFJ': ["Leadership development", "Team coaching", "Change management"],
    'ENTJ': ["Strategic leadership", "Executive decision making", "Organizational development"]
  };

  return [...baseSkills, ...(typeSpecificSkills[personalityType] || [])];
}
