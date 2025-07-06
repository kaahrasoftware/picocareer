
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { responses } = await req.json();
    console.log('Received assessment responses for analysis');

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create assessment context from responses
    const assessmentContext = responses.map((r: any) => 
      `Question: ${r.questionTitle}\nAnswer: ${JSON.stringify(r.answer)}`
    ).join('\n\n');

    const prompt = `Based on the following career assessment responses, provide 5 personalized career recommendations in valid JSON format:

${assessmentContext}

Respond with a JSON object in this exact format (no markdown formatting, no code blocks):
{
  "recommendations": [
    {
      "title": "Career Title",
      "description": "Brief description of the career",
      "matchScore": 85,
      "reasoning": "Why this career matches the person's profile",
      "salaryRange": "$50,000 - $80,000",
      "growthOutlook": "Job growth prospects",
      "timeToEntry": "4-6 years",
      "requiredSkills": ["skill1", "skill2", "skill3"],
      "educationRequirements": ["Bachelor's degree in relevant field"],
      "workEnvironment": "Description of typical work environment"
    }
  ]
}`;

    console.log('Sending request to OpenAI...');
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a career counselor AI. Analyze assessment responses and provide career recommendations in valid JSON format. Do not wrap your response in markdown code blocks or any other formatting - return only the raw JSON object.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const content = openAIData.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    console.log('Raw OpenAI response:', content);

    // Clean the response content of any markdown formatting
    const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();
    console.log('Cleaned content:', cleanContent);

    let parsed;
    try {
      parsed = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', cleanContent);
      throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
    }

    // Validate the structure
    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      console.error('Invalid response structure:', parsed);
      throw new Error('Invalid response structure - missing recommendations array');
    }

    // Validate each recommendation has required fields
    const validRecommendations = parsed.recommendations.filter((rec: any) => {
      const hasRequiredFields = rec.title && rec.description && rec.matchScore && 
                               rec.reasoning && rec.salaryRange && rec.requiredSkills;
      if (!hasRequiredFields) {
        console.warn('Skipping recommendation with missing fields:', rec);
      }
      return hasRequiredFields;
    });

    if (validRecommendations.length === 0) {
      throw new Error('No valid recommendations found in response');
    }

    console.log(`Successfully parsed ${validRecommendations.length} career recommendations`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations: validRecommendations 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Career assessment error:', error);
    
    // Provide fallback recommendations only when there's an actual error
    const fallbackRecommendations = [
      {
        title: "Business Analyst",
        description: "Analyze business processes and recommend improvements",
        matchScore: 75,
        reasoning: "Based on your responses, you show analytical thinking and problem-solving abilities",
        salaryRange: "$60,000 - $90,000",
        growthOutlook: "Strong growth expected in data-driven business roles",
        timeToEntry: "2-4 years",
        requiredSkills: ["analytical thinking", "communication", "problem solving", "data analysis"],
        educationRequirements: ["Bachelor's degree preferred"],
        workEnvironment: "Office setting with cross-functional collaboration"
      },
      {
        title: "Project Coordinator",
        description: "Coordinate project activities and ensure timely completion",
        matchScore: 70,
        reasoning: "Your responses indicate good organizational and communication skills",
        salaryRange: "$45,000 - $70,000",
        growthOutlook: "Steady demand across industries",
        timeToEntry: "1-3 years",
        requiredSkills: ["organization", "communication", "time management", "teamwork"],
        educationRequirements: ["High school diploma minimum, Bachelor's preferred"],
        workEnvironment: "Office environment with team collaboration"
      }
    ];

    return new Response(
      JSON.stringify({ 
        success: true, 
        recommendations: fallbackRecommendations,
        fallback: true,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
