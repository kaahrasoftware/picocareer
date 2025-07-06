
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

// Profile-specific configuration
const PROFILE_CONFIGS = {
  middle_school: {
    timeRange: "6-10+ years",
    focusAreas: ["exploration", "academic_interests", "basic_skills"],
    educationContext: "Currently in middle school, exploring interests",
    ageGroup: "11-14 years old",
    maxRecommendations: 5,
    careerFilters: {
      minEducation: ["high_school", "some_college", "bachelor", "advanced"],
      excludeAdvanced: true
    }
  },
  high_school: {
    timeRange: "4-8 years",
    focusAreas: ["college_prep", "career_exploration", "immediate_opportunities"],
    educationContext: "Currently in high school, planning for post-graduation",
    ageGroup: "14-18 years old",
    maxRecommendations: 5,
    careerFilters: {
      minEducation: ["high_school", "some_college", "bachelor"],
      includeTradeSchools: true
    }
  },
  college: {
    timeRange: "1-4 years",
    focusAreas: ["major_alignment", "internships", "skill_development"],
    educationContext: "Currently in college, preparing for career entry",
    ageGroup: "18-24 years old",
    maxRecommendations: 6,
    careerFilters: {
      minEducation: ["bachelor", "some_college"],
      emphasizeMajorAlignment: true
    }
  },
  career_professional: {
    timeRange: "0-3 years",
    focusAreas: ["career_transitions", "advancement", "skill_enhancement"],
    educationContext: "Working professional considering career changes",
    ageGroup: "22+ years old",
    maxRecommendations: 5,
    careerFilters: {
      emphasizeTransferableSkills: true,
      includeAdvancement: true
    }
  }
};

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

    const profileType = assessment.detected_profile_type;
    const profileConfig = PROFILE_CONFIGS[profileType as keyof typeof PROFILE_CONFIGS];

    if (!profileConfig) {
      throw new Error(`Unsupported profile type: ${profileType}`);
    }

    // Get questions for context
    const { data: questions, error: questionsError } = await supabase
      .from('assessment_questions')
      .select('*')
      .eq('is_active', true);

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
    }

    // Get careers filtered by profile type
    const { data: careers } = await supabase
      .from('careers')
      .select('id, title, description, industry, required_skills, required_education, salary_range, work_environment, job_outlook, academic_majors')
      .eq('status', 'Approved')
      .limit(100);

    // Filter careers based on profile type
    const filteredCareers = filterCareersByProfile(careers || [], profileType);

    // Process responses to create a user profile
    const userProfile = processResponses(responses, questions || [], profileType, profileConfig);
    
    // Generate career recommendations using OpenAI with profile-specific prompting
    const recommendations = await generateRecommendations(userProfile, filteredCareers, profileType, profileConfig);

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
        assessmentId,
        profileType 
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

function filterCareersByProfile(careers: any[], profileType: string | null): any[] {
  if (!profileType || !careers.length) return careers;

  const config = PROFILE_CONFIGS[profileType as keyof typeof PROFILE_CONFIGS];
  if (!config) return careers;

  return careers.filter(career => {
    // Filter based on education requirements
    if (config.careerFilters.excludeAdvanced && 
        career.required_education?.some((edu: string) => 
          edu.toLowerCase().includes('phd') || 
          edu.toLowerCase().includes('doctorate') ||
          edu.toLowerCase().includes('medical degree')
        )) {
      return false;
    }

    // For middle school, exclude careers requiring immediate work experience
    if (profileType === 'middle_school' && 
        career.description?.toLowerCase().includes('years of experience')) {
      return false;
    }

    // For high school, prioritize careers with clear entry paths
    if (profileType === 'high_school' && config.careerFilters.includeTradeSchools) {
      return true; // Include all for high school exploration
    }

    return true;
  });
}

function processResponses(
  responses: AssessmentResponse[], 
  questions: any[], 
  profileType: string | null,
  profileConfig: any
): string {
  const questionMap = new Map(questions.map(q => [q.id, q]));
  
  const processedResponses = responses.map(response => {
    const question = questionMap.get(response.questionId);
    const questionText = question ? question.title : `Question ${response.questionId}`;
    const answer = Array.isArray(response.answer) 
      ? response.answer.join(', ') 
      : response.answer.toString();
    return `${questionText}: ${answer}`;
  }).join('\n');
  
  const profileContext = `
Profile Type: ${profileType}
Education Context: ${profileConfig.educationContext}
Age Group: ${profileConfig.ageGroup}
Timeline to Career Entry: ${profileConfig.timeRange}
Focus Areas: ${profileConfig.focusAreas.join(', ')}

Assessment Responses:
${processedResponses}`;
  
  return profileContext;
}

async function generateRecommendations(
  userProfile: string, 
  existingCareers: any[],
  profileType: string | null,
  profileConfig: any
): Promise<CareerRecommendation[]> {
  const careerContext = existingCareers.slice(0, 30).map(career => 
    `${career.title}: ${career.description} (Industry: ${career.industry}, Education: ${career.required_education?.join(', ') || 'Varies'})`
  ).join('\n');

  // Profile-specific system prompt
  const systemPrompt = getSystemPromptForProfile(profileType, profileConfig);
  const userPrompt = getUserPromptForProfile(userProfile, careerContext, profileType, profileConfig);

  console.log(`Generating recommendations for profile type: ${profileType}`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    const recommendations = parsed.recommendations || [];
    
    // Post-process recommendations based on profile type
    return recommendations.map((rec: any) => postProcessRecommendation(rec, profileType, profileConfig));
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', content);
    return generateFallbackRecommendations(profileType, profileConfig);
  }
}

function getSystemPromptForProfile(profileType: string | null, profileConfig: any): string {
  const basePrompt = `You are a career counselor AI specializing in providing personalized career recommendations. Always return valid JSON in the specified format.`;
  
  const profileSpecificPrompts = {
    middle_school: `You are counseling middle school students (ages 11-14) who are exploring career possibilities for the first time. Focus on:
- Broad career exploration and discovery
- Connecting current interests to future possibilities
- Emphasizing the importance of education and skill development
- Using age-appropriate language and concepts
- Inspiring curiosity about different career paths
- Avoiding overwhelming complexity or immediate career pressure`,

    high_school: `You are counseling high school students (ages 14-18) who are making important decisions about their post-graduation path. Focus on:
- Connecting interests to college majors and career paths
- Including both 4-year college and alternative pathways (trade schools, community college)
- Practical next steps and immediate opportunities
- Skills they can start developing now
- Realistic timelines for career entry
- Both traditional and emerging career opportunities`,

    college: `You are counseling college students (ages 18-24) who are preparing to enter the workforce or considering career changes. Focus on:
- Aligning recommendations with their current or intended major
- Emphasizing internships, co-ops, and practical experience
- Entry-level positions and career progression paths
- Skills and experiences that make them competitive
- Networking and professional development opportunities
- Graduate school considerations where relevant`,

    career_professional: `You are counseling working professionals who are considering career transitions or advancement. Focus on:
- Leveraging transferable skills from current experience
- Career advancement and transition strategies
- Skills that can be developed while working
- Realistic transition timelines and steps
- Industry trends and growth opportunities
- Professional development and continuing education options`
  };

  return basePrompt + '\n\n' + (profileSpecificPrompts[profileType as keyof typeof profileSpecificPrompts] || profileSpecificPrompts.career_professional);
}

function getUserPromptForProfile(userProfile: string, careerContext: string, profileType: string | null, profileConfig: any): string {
  return `Based on the following user profile and available career options, generate ${profileConfig.maxRecommendations} personalized career recommendations.

${userProfile}

Available Career Options (for reference):
${careerContext}

IMPORTANT GUIDELINES FOR ${profileType?.toUpperCase().replace('_', ' ')} STUDENTS/PROFESSIONALS:
- Timeline to career entry: ${profileConfig.timeRange}
- Focus on: ${profileConfig.focusAreas.join(', ')}
- Consider their ${profileConfig.educationContext.toLowerCase()}

Please provide recommendations in the following JSON format:
{
  "recommendations": [
    {
      "title": "Career Title",
      "description": "Brief description tailored to their profile stage",
      "matchScore": 85,
      "reasoning": "Specific reasoning based on their responses and profile type",
      "salaryRange": "Appropriate salary range for their timeline",
      "growthOutlook": "Growth prospects relevant to their stage",
      "timeToEntry": "${profileConfig.timeRange}",
      "requiredSkills": ["skill1", "skill2"],
      "educationRequirements": ["Requirements appropriate to their stage"],
      "workEnvironment": "Work environment description"
    }
  ]
}

Ensure recommendations are:
1. Age and stage appropriate
2. Realistic for their timeline
3. Aligned with their interests and responses
4. Include specific next steps they can take
5. Match scores should reflect both interest alignment AND stage appropriateness (60-95 range)`;
}

function postProcessRecommendation(rec: any, profileType: string | null, profileConfig: any): CareerRecommendation {
  // Adjust time to entry based on profile type
  if (!rec.timeToEntry || rec.timeToEntry === '${profileConfig.timeRange}') {
    rec.timeToEntry = profileConfig.timeRange;
  }

  // Adjust salary ranges for younger profiles
  if (profileType === 'middle_school' || profileType === 'high_school') {
    if (rec.salaryRange && !rec.salaryRange.includes('entry-level')) {
      rec.salaryRange = `Entry-level: ${rec.salaryRange}`;
    }
  }

  // Ensure education requirements are appropriate
  if (profileType === 'middle_school' && rec.educationRequirements) {
    rec.educationRequirements = rec.educationRequirements.map((req: string) => 
      req.includes('PhD') || req.includes('doctorate') 
        ? req + ' (advanced degree - plan ahead!)' 
        : req
    );
  }

  return rec;
}

function findMatchingCareerId(title: string, careers: any[]): string | null {
  const match = careers.find(career => 
    career.title.toLowerCase().includes(title.toLowerCase()) ||
    title.toLowerCase().includes(career.title.toLowerCase())
  );
  return match?.id || null;
}

function generateFallbackRecommendations(profileType: string | null, profileConfig: any): CareerRecommendation[] {
  const fallbacksByProfile = {
    middle_school: [
      {
        title: "Software Developer",
        description: "Create apps, websites, and computer programs that solve problems and entertain people",
        matchScore: 75,
        reasoning: "Technology is growing rapidly and offers many creative opportunities to explore",
        salaryRange: "Entry-level: $50,000 - $80,000",
        growthOutlook: "Excellent - technology jobs are growing fast",
        timeToEntry: "6-8 years (after high school and college)",
        requiredSkills: ["Problem-solving", "Logical thinking", "Creativity", "Math"],
        educationRequirements: ["Strong math and science in high school", "Computer science degree or coding bootcamp"],
        workEnvironment: "Office or remote work with flexible schedules"
      },
      {
        title: "Healthcare Professional",
        description: "Help people stay healthy and recover from illness in various medical roles",
        matchScore: 70,
        reasoning: "Healthcare offers stable careers helping others with many specialization options",
        salaryRange: "Entry-level: $35,000 - $70,000 depending on role",
        growthOutlook: "Very strong - healthcare jobs are always in demand",
        timeToEntry: "4-10+ years depending on specialty",
        requiredSkills: ["Communication", "Empathy", "Science knowledge", "Attention to detail"],
        educationRequirements: ["Strong science courses", "Healthcare degree or certification"],
        workEnvironment: "Hospitals, clinics, or private practice settings"
      }
    ],
    high_school: [
      {
        title: "Digital Marketing Specialist",
        description: "Help businesses reach customers through social media, websites, and online advertising",
        matchScore: 78,
        reasoning: "Combines creativity with technology and offers immediate entry opportunities",
        salaryRange: "$35,000 - $55,000 starting",
        growthOutlook: "Strong growth as businesses move online",
        timeToEntry: "2-4 years with degree or certification",
        requiredSkills: ["Communication", "Creativity", "Technology skills", "Data analysis"],
        educationRequirements: ["Marketing degree or digital marketing certification"],
        workEnvironment: "Office or remote work with creative projects"
      },
      {
        title: "Skilled Trades Professional",
        description: "Work with your hands in electrical, plumbing, construction, or automotive trades",
        matchScore: 72,
        reasoning: "Offers good pay, job security, and immediate employment after training",
        salaryRange: "$40,000 - $70,000+ with experience",
        growthOutlook: "Strong - skilled trades are always needed",
        timeToEntry: "1-3 years through trade school or apprenticeship",
        requiredSkills: ["Manual dexterity", "Problem-solving", "Physical stamina", "Technical knowledge"],
        educationRequirements: ["Trade school certification or apprenticeship program"],
        workEnvironment: "Various job sites, workshops, or service calls"
      }
    ],
    college: [
      {
        title: "Data Analyst",
        description: "Analyze data to help businesses make better decisions and solve problems",
        matchScore: 80,
        reasoning: "High demand field that combines analytical skills with business impact",
        salaryRange: "$55,000 - $75,000 starting",
        growthOutlook: "Excellent - data-driven decisions are crucial for businesses",
        timeToEntry: "1-2 years with relevant degree",
        requiredSkills: ["Analytics", "Statistics", "SQL", "Communication"],
        educationRequirements: ["Bachelor's in business, statistics, or related field"],
        workEnvironment: "Office environment with computer-based work"
      },
      {
        title: "UX/UI Designer",
        description: "Design user-friendly websites and apps that people love to use",
        matchScore: 75,
        reasoning: "Combines creativity with technology in a rapidly growing field",
        salaryRange: "$50,000 - $70,000 starting",
        growthOutlook: "Strong growth with digital transformation",
        timeToEntry: "1-2 years with portfolio development",
        requiredSkills: ["Design thinking", "User research", "Prototyping", "Communication"],
        educationRequirements: ["Design degree or UX certification program"],
        workEnvironment: "Collaborative office or remote work environment"
      }
    ],
    career_professional: [
      {
        title: "Project Manager",
        description: "Lead teams and coordinate resources to complete projects on time and budget",
        matchScore: 78,
        reasoning: "Leverages leadership and organizational skills from previous experience",
        salaryRange: "$65,000 - $90,000 depending on industry",
        growthOutlook: "Strong - every industry needs project managers",
        timeToEntry: "6 months - 2 years with certification",
        requiredSkills: ["Leadership", "Communication", "Organization", "Problem-solving"],
        educationRequirements: ["PMP certification", "Relevant work experience"],
        workEnvironment: "Office environment leading cross-functional teams"
      },
      {
        title: "Business Analyst",
        description: "Bridge the gap between business needs and technology solutions",
        matchScore: 74,
        reasoning: "Uses analytical and communication skills to improve business processes",
        salaryRange: "$60,000 - $85,000 starting",
        growthOutlook: "Good - businesses need continuous improvement",
        timeToEntry: "1-2 years with relevant experience",
        requiredSkills: ["Analysis", "Communication", "Process improvement", "Technology"],
        educationRequirements: ["Business analysis certification", "Relevant experience"],
        workEnvironment: "Office environment working with various departments"
      }
    ]
  };

  const fallbacks = fallbacksByProfile[profileType as keyof typeof fallbacksByProfile] || fallbacksByProfile.career_professional;
  
  return fallbacks.map(rec => ({
    ...rec,
    timeToEntry: profileConfig.timeRange
  }));
}
