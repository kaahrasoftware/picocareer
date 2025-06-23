
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types for our scholarship data
interface ScholarshipData {
  title: string;
  description: string;
  amount: number;
  currency: string;
  deadline: string; // Changed from application_deadline
  eligibility_criteria: string[];
  application_url: string;
  provider_name: string;
  category: string[];
  academic_requirements?: any;
  application_open_date?: string;
  application_process?: string;
  award_frequency?: string;
  contact_email?: string;
  contact_phone?: string;
  tags: string[];
  status?: string;
  featured?: boolean;
  cover_image_url?: string;
  views_count?: number;
  author_id?: string;
  source_url?: string;
}

// Helper function to extract JSON from markdown code blocks
function extractJsonFromMarkdown(text: string): string {
  // Remove markdown code block syntax if present
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = text.match(codeBlockRegex);
  
  if (match) {
    return match[1].trim();
  }
  
  // If no code blocks found, return the original text trimmed
  return text.trim();
}

// AI-enhanced data extraction using OpenAI
async function enhanceScholarshipData(rawData: any): Promise<ScholarshipData | null> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.error('OpenAI API key not found');
    return null;
  }

  const prompt = `
Extract and standardize scholarship information from the following data. Return ONLY a valid JSON object with these exact fields, no markdown formatting:

{
  "title": "Clean scholarship title",
  "description": "Detailed description of the scholarship",
  "amount": 25000,
  "currency": "USD",
  "deadline": "2024-12-31",
  "eligibility_criteria": ["criterion 1", "criterion 2"],
  "application_url": "https://example.com/apply",
  "provider_name": "Organization name",
  "category": ["category1", "category2"],
  "academic_requirements": {
    "gpa_minimum": 3.0,
    "degree_level": "undergraduate"
  },
  "application_open_date": "2024-01-01",
  "application_process": "Description of how to apply",
  "award_frequency": "Annual",
  "contact_email": "contact@example.com",
  "contact_phone": "+1234567890",
  "tags": ["tag1", "tag2", "tag3"]
}

IMPORTANT: 
- Use "deadline" not "application_deadline"
- Return ONLY the JSON object
- No markdown formatting, explanations, or code blocks
- Ensure all dates are in YYYY-MM-DD format
- Amount should be a number (use 0 if not specified)

Raw data: ${JSON.stringify(rawData)}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a scholarship data extraction specialist. Extract and standardize scholarship information into valid JSON format. Always return only valid JSON without any markdown formatting or explanations.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    
    console.log('OpenAI raw response:', rawContent);
    
    // Extract JSON from potential markdown formatting
    const jsonContent = extractJsonFromMarkdown(rawContent);
    
    console.log('Extracted JSON content:', jsonContent);
    
    try {
      const extractedData = JSON.parse(jsonContent);
      return extractedData;
    } catch (parseError) {
      console.error('JSON parsing failed after extraction:', parseError);
      console.error('Content that failed to parse:', jsonContent);
      
      // Try one more fallback - look for JSON object pattern
      const jsonObjectMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        try {
          const fallbackData = JSON.parse(jsonObjectMatch[0]);
          console.log('Fallback parsing succeeded');
          return fallbackData;
        } catch (fallbackError) {
          console.error('Fallback parsing also failed:', fallbackError);
        }
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error enhancing scholarship data with AI:', error);
    return null;
  }
}

// Mock data for testing different sources
const mockScholarships = {
  'scholarships.com': [
    {
      title: "International Student Excellence Scholarship",
      description: "Full tuition scholarship for international students pursuing undergraduate degrees...",
      amount: "$25,000",
      deadline: "March 15, 2024",
      eligibility: "International students, minimum 3.5 GPA",
      provider: "Global Education Foundation",
      url: "https://example.com/scholarship1"
    }
  ],
  'fastweb': [
    {
      title: "Chevening Scholarships",
      description: "UK government's global scholarship programme, funded by the Foreign and Commonwealth Office...",
      amount: "Full funding",
      deadline: "November 2, 2024",
      eligibility: "Graduate students, leadership potential",
      provider: "UK Government",
      url: "https://example.com/chevening"
    }
  ],
  'government': [
    {
      title: "Fulbright Foreign Student Program",
      description: "Provides funding for graduate students, young professionals and artists...",
      amount: "Varies",
      deadline: "October 15, 2024",
      eligibility: "Graduate students, young professionals",
      provider: "Fulbright Commission",
      url: "https://example.com/fulbright"
    }
  ]
};

async function scrapeScholarshipsFromSource(source: string): Promise<any[]> {
  console.log(`Scraping from ${source}...`);
  
  // Return mock data for now
  return mockScholarships[source as keyof typeof mockScholarships] || [];
}

async function scrapeGovernmentScholarships(): Promise<ScholarshipData[]> {
  const scholarships: ScholarshipData[] = [];
  const rawScholarships = await scrapeScholarshipsFromSource('government');
  
  for (const raw of rawScholarships) {
    const enhanced = await enhanceScholarshipData(raw);
    if (enhanced) {
      scholarships.push(enhanced);
    }
  }
  
  return scholarships;
}

async function scrapeScholarshipsCom(): Promise<ScholarshipData[]> {
  const scholarships: ScholarshipData[] = [];
  const rawScholarships = await scrapeScholarshipsFromSource('scholarships.com');
  
  for (const raw of rawScholarships) {
    const enhanced = await enhanceScholarshipData(raw);
    if (enhanced) {
      scholarships.push(enhanced);
    }
  }
  
  return scholarships;
}

async function scrapeFastweb(): Promise<ScholarshipData[]> {
  const scholarships: ScholarshipData[] = [];
  const rawScholarships = await scrapeScholarshipsFromSource('fastweb');
  
  for (const raw of rawScholarships) {
    const enhanced = await enhanceScholarshipData(raw);
    if (enhanced) {
      scholarships.push(enhanced);
    }
  }
  
  return scholarships;
}

async function scrapeAllSources(sources: string[]): Promise<ScholarshipData[]> {
  const allScholarships: ScholarshipData[] = [];
  
  const promises = sources.map(source => {
    switch (source) {
      case 'scholarships.com':
        return scrapeScholarshipsCom();
      case 'fastweb':
        return scrapeFastweb();
      case 'government':
        return scrapeGovernmentScholarships();
      default:
        return Promise.resolve([]);
    }
  });
  
  const results = await Promise.all(promises);
  results.forEach(scholarships => allScholarships.push(...scholarships));
  
  return allScholarships;
}

function deduplicateScholarships(scholarships: ScholarshipData[]): ScholarshipData[] {
  const seen = new Set<string>();
  const unique: ScholarshipData[] = [];
  
  for (const scholarship of scholarships) {
    const key = `${scholarship.title}-${scholarship.provider_name}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(scholarship);
    }
  }
  
  return unique;
}

function validateScholarship(scholarship: ScholarshipData): boolean {
  return !!(
    scholarship.title &&
    scholarship.description &&
    scholarship.provider_name &&
    scholarship.deadline
  );
}

async function insertScholarshipsToDatabase(
  supabase: any,
  scholarships: ScholarshipData[],
  adminId: string
): Promise<{ inserted: number; errors: any[] }> {
  let insertedCount = 0;
  const errors: any[] = [];
  
  for (const scholarship of scholarships) {
    try {
      // Map the data to match database schema
      const scholarshipData = {
        title: scholarship.title,
        description: scholarship.description,
        amount: scholarship.amount || 0,
        currency: scholarship.currency || 'USD',
        deadline: scholarship.deadline, // Now using correct column name
        eligibility_criteria: scholarship.eligibility_criteria || [],
        application_url: scholarship.application_url || '',
        provider_name: scholarship.provider_name,
        category: scholarship.category || [],
        academic_requirements: scholarship.academic_requirements || {},
        application_open_date: scholarship.application_open_date || null,
        application_process: scholarship.application_process || '',
        award_frequency: scholarship.award_frequency || '',
        contact_information: {
          email: scholarship.contact_email || '',
          phone: scholarship.contact_phone || ''
        },
        tags: scholarship.tags || [],
        status: 'Approved',
        featured: false,
        cover_image_url: scholarship.cover_image_url || null,
        views_count: 0,
        bookmarks_count: 0,
        author_id: adminId
      };
      
      const { error } = await supabase
        .from('scholarships')
        .insert(scholarshipData);
      
      if (error) {
        console.error(`Error inserting scholarship "${scholarship.title}":`, error);
        errors.push({
          scholarship: scholarship.title,
          error: error.message
        });
      } else {
        insertedCount++;
        console.log(`Successfully inserted: ${scholarship.title}`);
      }
    } catch (error) {
      console.error(`Error processing scholarship "${scholarship.title}":`, error);
      errors.push({
        scholarship: scholarship.title,
        error: error.message
      });
    }
  }
  
  return { inserted: insertedCount, errors };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sources, dryRun } = await req.json();
    console.log('Scholarship scraping request received', { sources, dryRun });
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get admin user ID (you might want to pass this from the client)
    const adminId = '00000000-0000-0000-0000-000000000000'; // Default admin ID
    
    console.log('Starting scholarship scraping process...');
    
    // Scrape scholarships from all sources
    const rawScholarships = await scrapeAllSources(sources || ['scholarships.com', 'fastweb', 'government']);
    
    // Deduplicate and validate
    const uniqueScholarships = deduplicateScholarships(rawScholarships);
    const validScholarships = uniqueScholarships.filter(validateScholarship);
    
    console.log(`Scraped ${rawScholarships.length} scholarships, ${validScholarships.length} after deduplication and validation`);
    
    if (dryRun) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Preview: Found ${validScholarships.length} scholarships`,
          scraped_count: validScholarships.length,
          scholarships: validScholarships
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    // Insert to database
    const { inserted, errors } = await insertScholarshipsToDatabase(supabase, validScholarships, adminId);
    
    console.log(`Scraping completed: ${inserted} scholarships saved, ${errors.length} errors`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully scraped and saved ${inserted} scholarships`,
        scraped_count: validScholarships.length,
        inserted_count: inserted,
        error_count: errors.length,
        errors: errors
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error in scholarship scraping:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        scraped_count: 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
