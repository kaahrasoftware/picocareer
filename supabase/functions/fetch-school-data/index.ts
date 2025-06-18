
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to clean and extract JSON from OpenAI response
function extractJsonFromResponse(response: string): string {
  console.log('Raw AI Response:', response);
  
  // Remove leading/trailing whitespace
  let cleaned = response.trim();
  
  // Check if response is wrapped in markdown code blocks
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*\n([\s\S]*?)\n\s*```/);
  if (jsonBlockMatch) {
    cleaned = jsonBlockMatch[1].trim();
    console.log('Extracted JSON from code block:', cleaned);
  }
  
  // Additional cleanup for any remaining backticks or markdown
  cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  
  return cleaned;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { schoolName, schoolId } = await req.json();

    if (!schoolName || !schoolId) {
      throw new Error('School name and ID are required');
    }

    console.log(`Fetching AI data for school: ${schoolName}`);

    const prompt = `
You are a comprehensive school data researcher. Please provide detailed information about "${schoolName}" in JSON format with the following exact structure. Use Carnegie Mellon University as a reference for data format and accuracy. If any information is not available, use null for the field:

{
  "name": "Full official school name",
  "type": "Public University|Private University|Community College|Technical School|Liberal Arts College|Research University|Online University|For-Profit College|Military Academy|Art School|Music School|Business School|Medical School|Law School|Other",
  "country": "United States",
  "state": "Full state name with abbreviation (e.g., 'Pennsylvania - PA')",
  "location": "Complete address or location description",
  "website": "Official website URL",
  "acceptance_rate": "Acceptance rate as decimal (e.g., 0.17 for 17%)",
  "student_population": "Total student count (number)",
  "student_faculty_ratio": "Ratio like '10:1'",
  "ranking": "School ranking description with source",
  "tuition_fees": {
    "undergraduate": {
      "in_state": "Annual in-state undergraduate tuition (number or null)",
      "out_of_state": "Annual out-of-state undergraduate tuition (number or null)",
      "international": "Annual international undergraduate tuition (number or null)"
    },
    "graduate": {
      "in_state": "Annual in-state graduate tuition (number or null)",
      "out_of_state": "Annual out-of-state graduate tuition (number or null)",
      "international": "Annual international graduate tuition (number or null)"
    }
  },
  "cover_image_url": "URL to a high-quality campus or school image",
  "logo_url": "URL to the official school logo",
  "undergraduate_application_url": "Undergraduate application URL",
  "graduate_application_url": "Graduate application URL",
  "admissions_page_url": "Admissions information page URL",
  "international_students_url": "International students page URL",
  "financial_aid_url": "Financial aid page URL",
  "virtual_tour_url": "Virtual tour URL",
  "undergrad_programs_link": "Link to undergraduate programs page",
  "grad_programs_link": "Link to graduate programs page"
}

Please research and provide accurate, current information based on Carnegie Mellon University's data format. For URLs, provide real, working URLs when possible. For images, suggest realistic image URLs that would be appropriate for the school. For the state field, use the format "Full State Name - Abbreviation" (e.g., "Pennsylvania - PA"). For the type field, use one of the exact enum values listed above. Return ONLY the JSON object without any markdown formatting or code blocks.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a comprehensive school data researcher. Always respond with valid JSON only, without any markdown formatting or code blocks. Use Carnegie Mellon University as your reference format for accuracy and completeness.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Clean and extract JSON from the response
    const cleanedResponse = extractJsonFromResponse(aiResponse);

    // Parse the cleaned JSON
    let schoolData;
    try {
      schoolData = JSON.parse(cleanedResponse);
      console.log('Successfully parsed school data:', schoolData);
    } catch (parseError) {
      console.error('Failed to parse cleaned response:', parseError);
      console.error('Cleaned response was:', cleanedResponse);
      throw new Error(`Invalid JSON format from AI: ${parseError.message}`);
    }

    // Validate that we have a valid object
    if (!schoolData || typeof schoolData !== 'object') {
      throw new Error('AI response is not a valid object');
    }

    // Get current school data for comparison
    const { data: currentSchool, error: fetchError } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch current school data: ${fetchError.message}`);
    }

    return new Response(JSON.stringify({ 
      aiData: schoolData,
      currentData: currentSchool,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-school-data function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
