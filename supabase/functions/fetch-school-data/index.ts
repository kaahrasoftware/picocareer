
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
You are a comprehensive school data researcher. Please provide detailed information about "${schoolName}" in JSON format with the following exact structure. If any information is not available, use null for the field:

{
  "name": "Full official school name",
  "type": "High School|College|University|Other",
  "country": "Country name",
  "state": "State/Province (if applicable)",
  "city": "City name",
  "location": "Complete address or location description",
  "website": "Official website URL",
  "email": "Official contact email",
  "phone": "Official phone number",
  "established_year": "Year established (number)",
  "student_population": "Total student count (number)",
  "acceptance_rate": "Acceptance rate as decimal (e.g., 0.65 for 65%)",
  "student_faculty_ratio": "Ratio like '15:1'",
  "tuition_in_state": "Annual in-state tuition (number)",
  "tuition_out_of_state": "Annual out-of-state tuition (number)",
  "tuition_international": "Annual international tuition (number)",
  "room_and_board": "Annual room and board cost (number)",
  "application_fee": "Application fee amount (number)",
  "application_deadline": "Application deadline description",
  "sat_range_low": "Minimum SAT score (number)",
  "sat_range_high": "Maximum SAT score (number)",
  "act_range_low": "Minimum ACT score (number)",
  "act_range_high": "Maximum ACT score (number)",
  "gpa_average": "Average GPA of admitted students (decimal)",
  "cover_image_url": "URL to a high-quality campus or school image",
  "logo_url": "URL to the official school logo",
  "undergraduate_application_url": "Undergraduate application URL",
  "graduate_application_url": "Graduate application URL",
  "admissions_page_url": "Admissions information page URL",
  "international_students_url": "International students page URL",
  "financial_aid_url": "Financial aid page URL",
  "virtual_tour_url": "Virtual tour URL",
  "ranking": "School ranking description",
  "programs_offered": ["Array of programs offered"],
  "notable_programs": ["Array of notable/flagship programs"],
  "graduation_rate": "Graduation rate as decimal (e.g., 0.85 for 85%)",
  "employment_rate": "Employment rate as decimal (e.g., 0.92 for 92%)",
  "average_salary_after_graduation": "Average starting salary (number)"
}

Please research and provide accurate, current information. For URLs, provide real, working URLs when possible. For images, suggest realistic image URLs that would be appropriate for the school. Return ONLY the JSON object without any markdown formatting or code blocks.
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
          { role: 'system', content: 'You are a comprehensive school data researcher. Always respond with valid JSON only, without any markdown formatting or code blocks.' },
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
