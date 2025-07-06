
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { responses, detectedProfileType } = await req.json();

    if (!responses || !Array.isArray(responses)) {
      throw new Error('Invalid request body - responses array missing');
    }

    // Create profile-specific system prompts
    const getProfileSpecificPrompt = (profileType: string | null) => {
      const basePrompt = `You are a career guidance AI that provides personalized career recommendations based on assessment responses. Always respond with valid JSON.`;
      
      switch (profileType) {
        case 'middle_school':
          return `${basePrompt} You are helping a middle school student (ages 11-14) explore career possibilities. Focus on:
          - Broad career exploration and discovery
          - Connecting their interests to future possibilities
          - Simple, engaging career descriptions
          - Emphasis on subjects they enjoy in school
          - Age-appropriate language and concepts
          - Encouraging curiosity and exploration`;
          
        case 'high_school':
          return `${basePrompt} You are helping a high school student (ages 14-18) understand career paths. Focus on:
          - Clear education pathways and requirements
          - Entry-level opportunities and internships
          - Skills they can start developing now
          - College major connections where relevant
          - Realistic timelines for career entry
          - Balance between dreams and practical steps`;
          
        case 'college':
          return `${basePrompt} You are helping a college student explore careers related to their studies. Focus on:
          - How their major connects to specific careers
          - Internship and entry-level opportunities
          - Skills to develop during college
          - Graduate school considerations where relevant
          - Industry trends and job market insights
          - Building relevant experience while in school`;
          
        case 'career_professional':
          return `${basePrompt} You are helping a working professional with career advancement or transitions. Focus on:
          - Career advancement opportunities
          - Skill gaps and professional development
          - Industry transitions and transferable skills
          - Leadership and specialization paths
          - Market trends and emerging opportunities
          - Strategic career moves and growth`;
          
        default:
          return `${basePrompt} Provide comprehensive career guidance suitable for various life stages.`;
      }
    };

    const getUserPromptWithProfile = (responses: any[], profileType: string | null) => {
      const profileContext = profileType ? ` The user's profile type is: ${profileType.replace('_', ' ')}.` : '';
      return `Based on these assessment responses${profileContext}, provide 5 personalized career recommendations: ${JSON.stringify(responses)}`;
    };

    console.log('Generating content with profile type:', detectedProfileType);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `${getProfileSpecificPrompt(detectedProfileType)} Always respond with valid JSON in the following format:
{
  "recommendations": [
    {
      "title": "Job Title",
      "description": "Brief description of the role",
      "matchScore": 85,
      "reasoning": "Why this career matches the person's profile",
      "salaryRange": "$50,000 - $80,000",
      "growthOutlook": "Expected growth in this field",
      "timeToEntry": "Time needed to enter this field",
      "requiredSkills": ["skill1", "skill2"],
      "educationRequirements": ["requirement1", "requirement2"],
      "workEnvironment": "Description of typical work environment"
    }
  ]
}`
          },
          {
            role: 'user',
            content: getUserPromptWithProfile(responses, detectedProfileType)
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const openAIData = await response.json();
    const content = openAIData.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    console.log('Raw OpenAI response:', content);

    // Clean the response content by removing markdown code blocks
    const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();
    console.log('Cleaned content:', cleanContent);

    let aiRecommendations;
    try {
      const parsed = JSON.parse(cleanContent);
      
      // Validate the response structure
      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error('Invalid response structure - recommendations array missing');
      }

      aiRecommendations = parsed.recommendations;
      console.log('Successfully parsed AI recommendations:', aiRecommendations.length);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Content that failed to parse:', cleanContent);
      
      // Fallback recommendations based on profile type
      const getFallbackRecommendations = (profileType: string | null) => {
        switch (profileType) {
          case 'middle_school':
            return [
              {
                title: "Science Teacher",
                description: "Inspire young minds through science education and discovery.",
                matchScore: 75,
                reasoning: "Great for someone interested in science and helping others learn.",
                salaryRange: "$40,000 - $60,000",
                growthOutlook: "Steady demand for qualified teachers",
                timeToEntry: "4 years college + teaching certification",
                requiredSkills: ["Communication", "Science knowledge", "Patience"],
                educationRequirements: ["Bachelor's degree in Education or Science", "Teaching certification"],
                workEnvironment: "School classroom and laboratory settings"
              }
            ];
          case 'high_school':
            return [
              {
                title: "Software Developer",
                description: "Create applications and websites that solve real-world problems.",
                matchScore: 75,
                reasoning: "Technology skills are valuable and this field offers good growth potential.",
                salaryRange: "$60,000 - $100,000",
                growthOutlook: "Strong growth expected in technology sector",
                timeToEntry: "2-4 years (degree or bootcamp)",
                requiredSkills: ["Programming", "Problem-solving", "Logic"],
                educationRequirements: ["Computer Science degree or coding bootcamp"],
                workEnvironment: "Office or remote work environment"
              }
            ];
          case 'college':
            return [
              {
                title: "Business Analyst",
                description: "Bridge the gap between business needs and technology solutions.",
                matchScore: 75,
                reasoning: "Combines analytical skills with business understanding.",
                salaryRange: "$55,000 - $85,000",
                growthOutlook: "Growing demand across industries",
                timeToEntry: "Entry-level after graduation",
                requiredSkills: ["Analysis", "Communication", "Business acumen"],
                educationRequirements: ["Bachelor's degree in Business or related field"],
                workEnvironment: "Corporate office environment with cross-team collaboration"
              }
            ];
          case 'career_professional':
            return [
              {
                title: "Project Manager",
                description: "Lead teams and coordinate complex projects to successful completion.",
                matchScore: 75,
                reasoning: "Builds on existing professional experience and leadership skills.",
                salaryRange: "$70,000 - $120,000",
                growthOutlook: "Strong demand across industries",
                timeToEntry: "Can transition with current experience + certification",
                requiredSkills: ["Leadership", "Organization", "Communication"],
                educationRequirements: ["Professional experience", "PMP certification recommended"],
                workEnvironment: "Office environment with team leadership responsibilities"
              }
            ];
          default:
            return [
              {
                title: "Software Developer",
                description: "Create and maintain software applications and systems.",
                matchScore: 75,
                reasoning: "Based on your responses, this role offers good growth potential.",
                salaryRange: "$60,000 - $100,000",
                growthOutlook: "Strong growth expected in technology sector",
                timeToEntry: "2-4 years",
                requiredSkills: ["Programming", "Problem-solving"],
                educationRequirements: ["Bachelor's degree in Computer Science or related field"],
                workEnvironment: "Office or remote work environment"
              }
            ];
        }
      };
      
      aiRecommendations = getFallbackRecommendations(detectedProfileType);
    }

    return new Response(
      JSON.stringify({ recommendations: aiRecommendations }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in AI career assessment:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate career recommendations',
        recommendations: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
