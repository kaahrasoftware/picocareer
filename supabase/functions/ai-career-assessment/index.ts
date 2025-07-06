
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssessmentResponse {
  questionId: string;
  answer: string | string[] | number;
}

interface CareerRecommendation {
  title: string;
  description: string;
  matchScore: number;
  reasoning: string;
  salaryRange?: string;
  growthOutlook?: string;
  timeToEntry?: string;
  requiredSkills?: string[];
  educationRequirements?: string[];
  workEnvironment?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { assessmentId, responses } = await req.json() as {
      assessmentId: string;
      responses: AssessmentResponse[];
    };

    console.log('Processing assessment:', assessmentId);

    // Get the assessment to verify ownership and get profile type
    const { data: assessment, error: assessmentError } = await supabase
      .from('career_assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      throw new Error('Assessment not found');
    }

    // Get questions for context
    const { data: questions, error: questionsError } = await supabase
      .from('assessment_questions')
      .select('*')
      .eq('is_active', true);

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
    }

    // Get existing careers data for better recommendations
    const { data: careers } = await supabase
      .from('careers')
      .select('id, title, description, industry, required_skills, required_education, salary_range, work_environment, job_outlook')
      .eq('status', 'Approved')
      .limit(50);

    // Process responses to create a user profile
    const userProfile = processResponses(responses, questions || [], assessment.detected_profile_type);
    
    // Generate career recommendations using OpenAI
    const recommendations = await generateRecommendations(userProfile, careers || [], assessment.detected_profile_type);

    // Save recommendations to database
    const recommendationInserts = recommendations.map(rec => ({
      assessment_id: assessmentId,
      career_id: findMatchingCareerId(rec.title, careers || []),
      title: rec.title,
      description: rec.description,
      match_score: rec.matchScore,
      reasoning: rec.reasoning,
      salary_range: rec.salaryRange,
      growth_outlook: rec.growthOutlook,
      time_to_entry: rec.timeToEntry,
      required_skills: rec.requiredSkills,
      education_requirements: rec.educationRequirements,
      work_environment: rec.workEnvironment
    }));

    const { error: insertError } = await supabase
      .from('career_recommendations')
      .insert(recommendationInserts);

    if (insertError) {
      console.error('Error inserting recommendations:', insertError);
      throw insertError;
    }

    // Update assessment status to completed
    const { error: updateError } = await supabase
      .from('career_assessments')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', assessmentId);

    if (updateError) {
      console.error('Error updating assessment:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations,
        assessmentId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-career-assessment function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred processing the assessment' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function processResponses(responses: AssessmentResponse[], questions: any[], profileType: string | null): string {
  const questionMap = new Map(questions.map(q => [q.id, q]));
  
  const profile = responses.map(response => {
    const question = questionMap.get(response.questionId);
    const questionText = question ? question.title : `Question ${response.questionId}`;
    const answer = Array.isArray(response.answer) 
      ? response.answer.join(', ') 
      : response.answer.toString();
    return `${questionText}: ${answer}`;
  }).join('\n');
  
  const profileContext = profileType ? `\nDetected Profile Type: ${profileType}` : '';
  
  return profile + profileContext;
}

async function generateRecommendations(
  userProfile: string, 
  existingCareers: any[],
  profileType: string | null
): Promise<CareerRecommendation[]> {
  const careerContext = existingCareers.slice(0, 20).map(career => 
    `${career.title}: ${career.description} (Industry: ${career.industry})`
  ).join('\n');

  const profileContext = profileType ? `\nUser Profile Type: ${profileType}` : '';

  const prompt = `
Based on the following user assessment responses, generate 5 personalized career recommendations. 
Consider the user's interests, skills, work preferences, career goals, and profile type.

User Profile:
${userProfile}${profileContext}

Available Career Options (for reference):
${careerContext}

Please provide recommendations in the following JSON format:
{
  "recommendations": [
    {
      "title": "Career Title",
      "description": "Brief description of the career",
      "matchScore": 85,
      "reasoning": "Why this career matches the user's profile",
      "salaryRange": "$50,000 - $80,000",
      "growthOutlook": "Strong growth expected",
      "timeToEntry": "2-4 years",
      "requiredSkills": ["skill1", "skill2"],
      "educationRequirements": ["Bachelor's degree"],
      "workEnvironment": "Office-based with remote options"
    }
  ]
}

Ensure match scores are realistic (60-95 range) and reasoning is specific to the user's responses.
Focus on careers that align with their stated interests, preferred work environment, skill level, and profile type.
${profileType ? `Tailor recommendations specifically for a ${profileType.replace('_', ' ')} student/professional.` : ''}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a career counselor AI that provides personalized career recommendations based on assessment responses. Always return valid JSON.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    return parsed.recommendations || [];
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', content);
    // Return fallback recommendations
    return generateFallbackRecommendations(profileType);
  }
}

function findMatchingCareerId(title: string, careers: any[]): string | null {
  const match = careers.find(career => 
    career.title.toLowerCase().includes(title.toLowerCase()) ||
    title.toLowerCase().includes(career.title.toLowerCase())
  );
  return match?.id || null;
}

function generateFallbackRecommendations(profileType: string | null): CareerRecommendation[] {
  const baseRecommendations = [
    {
      title: "Software Developer",
      description: "Design and develop software applications and systems",
      matchScore: 75,
      reasoning: "Based on your assessment responses, this career aligns with your interests and skills",
      salaryRange: "$70,000 - $120,000",
      growthOutlook: "Excellent growth prospects",
      timeToEntry: "2-3 years",
      requiredSkills: ["Programming", "Problem-solving", "Analytical thinking"],
      educationRequirements: ["Bachelor's degree in Computer Science or related field"],
      workEnvironment: "Office or remote work environment"
    },
    {
      title: "Marketing Manager",
      description: "Plan and execute marketing strategies to promote products or services",
      matchScore: 70,
      reasoning: "Your responses indicate strong communication skills and business interest",
      salaryRange: "$60,000 - $100,000",
      growthOutlook: "Good growth opportunities",
      timeToEntry: "3-5 years",
      requiredSkills: ["Communication", "Creativity", "Strategic thinking"],
      educationRequirements: ["Bachelor's degree in Marketing or Business"],
      workEnvironment: "Office-based with travel opportunities"
    }
  ];

  // Adjust recommendations based on profile type
  if (profileType === 'middle_school' || profileType === 'high_school') {
    baseRecommendations.forEach(rec => {
      rec.reasoning += ` This career path offers good opportunities for students to explore and develop relevant skills.`;
      rec.timeToEntry = profileType === 'middle_school' ? "6-8 years" : "4-6 years";
    });
  }

  return baseRecommendations;
}
