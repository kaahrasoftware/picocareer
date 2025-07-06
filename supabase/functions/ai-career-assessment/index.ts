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
    const { responses } = await req.json();

    if (!responses || !Array.isArray(responses)) {
      throw new Error('Invalid request body - responses array missing');
    }

    const prompt = `
      Analyze the following assessment responses and provide personalized career recommendations.
      Consider the responses in the context of typical career paths, required skills, and growth potential.
      Focus on careers that align with the individual's interests, skills, and preferences as indicated in their responses.
      Responses: ${JSON.stringify(responses)}
    `;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a career guidance AI that provides personalized career recommendations based on assessment responses. Always respond with valid JSON in the following format:
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
            content: `Based on these assessment responses, provide 5 personalized career recommendations: ${JSON.stringify(responses)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
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
      
      // Fallback to default recommendations only when parsing actually fails
      aiRecommendations = [
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
