
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

interface ScholarshipData {
  title: string;
  description: string;
  amount: number;
  currency: string;
  application_deadline: string;
  eligibility_criteria: string[];
  application_url: string;
  provider_name: string;
  category: string[];
  application_open_date?: string;
  application_process?: string;
  award_frequency?: string;
  contact_email?: string;
  contact_phone?: string;
  featured?: boolean;
  cover_image_url?: string;
  tags?: string[];
  source_url?: string;
}

// AI-enhanced data extraction using OpenAI
async function enhanceScholarshipData(rawData: any): Promise<ScholarshipData | null> {
  if (!openAIApiKey) {
    console.error('OpenAI API key not found');
    return null;
  }

  const prompt = `
Extract and standardize scholarship information from the following data. Return a JSON object with these exact fields:

{
  "title": "Clean scholarship title",
  "description": "Detailed description (200-500 words)",
  "amount": "Numeric amount (use 0 if not specified)",
  "currency": "USD, EUR, GBP, etc. (default to USD if not specified)",
  "application_deadline": "YYYY-MM-DD format",
  "eligibility_criteria": ["criterion1", "criterion2"],
  "application_url": "Valid URL",
  "provider_name": "Organization/institution name",
  "category": ["scholarship_type", "field_of_study"],
  "application_open_date": "YYYY-MM-DD format (if available)",
  "application_process": "Brief description of application steps",
  "award_frequency": "Annual, One-time, Monthly, etc.",
  "contact_email": "email@domain.com (if available)",
  "contact_phone": "phone number (if available)",
  "tags": ["tag1", "tag2", "tag3"]
}

Focus especially on:
- Extracting eligibility criteria for international students
- Standardizing currency and amounts
- Identifying citizenship requirements
- Categorizing by field of study and scholarship type
- Ensuring all dates are in YYYY-MM-DD format

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
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a scholarship data extraction specialist. Extract and standardize scholarship information into the exact JSON format requested. Always return valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedData = JSON.parse(data.choices[0].message.content);

    return extractedData;
  } catch (error) {
    console.error('Error enhancing scholarship data with AI:', error);
    return null;
  }
}

// Scraper for Scholarships.com
async function scrapeScholarshipsCom(): Promise<ScholarshipData[]> {
  const scholarships: ScholarshipData[] = [];
  
  try {
    // Simulated scraping - in production, you'd make actual HTTP requests
    // This is a template structure for real implementation
    const mockData = [
      {
        title: "International Student Excellence Scholarship",
        rawDescription: "Full tuition scholarship for international students pursuing undergraduate degrees...",
        amount: "$25,000",
        deadline: "March 15, 2024",
        provider: "Global Education Foundation",
        url: "https://example.com/scholarship1"
      }
    ];

    for (const item of mockData) {
      const enhanced = await enhanceScholarshipData(item);
      if (enhanced) {
        scholarships.push({
          ...enhanced,
          source_url: item.url
        });
      }
    }
  } catch (error) {
    console.error('Error scraping Scholarships.com:', error);
  }

  return scholarships;
}

// Scraper for FastWeb
async function scrapeFastWeb(): Promise<ScholarshipData[]> {
  const scholarships: ScholarshipData[] = [];
  
  try {
    // Mock data for demonstration
    const mockData = [
      {
        title: "Fulbright Foreign Student Program",
        rawDescription: "Provides funding for graduate students, young professionals and artists...",
        amount: "Full funding",
        deadline: "October 15, 2024",
        provider: "Fulbright Commission",
        url: "https://example.com/fulbright"
      }
    ];

    for (const item of mockData) {
      const enhanced = await enhanceScholarshipData(item);
      if (enhanced) {
        scholarships.push({
          ...enhanced,
          source_url: item.url
        });
      }
    }
  } catch (error) {
    console.error('Error scraping FastWeb:', error);
  }

  return scholarships;
}

// Government scholarship scraper
async function scrapeGovernmentScholarships(): Promise<ScholarshipData[]> {
  const scholarships: ScholarshipData[] = [];
  
  try {
    // Mock data for government scholarships
    const mockData = [
      {
        title: "Chevening Scholarships",
        rawDescription: "UK government's global scholarship programme, funded by the Foreign and Commonwealth Office...",
        amount: "Full funding",
        deadline: "November 2, 2024",
        provider: "UK Government",
        url: "https://example.com/chevening"
      }
    ];

    for (const item of mockData) {
      const enhanced = await enhanceScholarshipData(item);
      if (enhanced) {
        scholarships.push({
          ...enhanced,
          source_url: item.url,
          featured: true // Government scholarships are often featured
        });
      }
    }
  } catch (error) {
    console.error('Error scraping government scholarships:', error);
  }

  return scholarships;
}

// Deduplication logic
function deduplicateScholarships(scholarships: ScholarshipData[]): ScholarshipData[] {
  const seen = new Set<string>();
  return scholarships.filter(scholarship => {
    const key = `${scholarship.title.toLowerCase()}-${scholarship.provider_name.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Validate scholarship data
function validateScholarshipData(scholarship: ScholarshipData): boolean {
  const required = ['title', 'description', 'provider_name', 'application_url'];
  return required.every(field => scholarship[field as keyof ScholarshipData]);
}

// Main scraping coordinator
async function scrapeAllSources(): Promise<ScholarshipData[]> {
  console.log('Starting scholarship scraping process...');
  
  const allScholarships: ScholarshipData[] = [];
  
  // Run all scrapers in parallel
  const [scholarshipsCom, fastWeb, government] = await Promise.all([
    scrapeScholarshipsCom(),
    scrapeFastWeb(),
    scrapeGovernmentScholarships()
  ]);
  
  allScholarships.push(...scholarshipsCom, ...fastWeb, ...government);
  
  // Deduplicate and validate
  const deduplicated = deduplicateScholarships(allScholarships);
  const validated = deduplicated.filter(validateScholarshipData);
  
  console.log(`Scraped ${allScholarships.length} scholarships, ${validated.length} after deduplication and validation`);
  
  return validated;
}

// Save scholarships to database
async function saveScholarships(scholarships: ScholarshipData[]): Promise<{ inserted: number; errors: any[] }> {
  const errors: any[] = [];
  let inserted = 0;
  
  for (const scholarship of scholarships) {
    try {
      // Check if scholarship already exists
      const { data: existing } = await supabase
        .from('scholarships')
        .select('id')
        .eq('title', scholarship.title)
        .eq('provider_name', scholarship.provider_name)
        .single();
      
      if (existing) {
        // Update existing scholarship
        const { error } = await supabase
          .from('scholarships')
          .update({
            ...scholarship,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (error) {
          errors.push({ scholarship: scholarship.title, error: error.message });
        } else {
          inserted++;
        }
      } else {
        // Insert new scholarship
        const { error } = await supabase
          .from('scholarships')
          .insert({
            ...scholarship,
            status: 'pending', // All scraped scholarships start as pending for review
            author_id: null, // System-generated
            views_count: 0,
            bookmarks_count: 0
          });
        
        if (error) {
          errors.push({ scholarship: scholarship.title, error: error.message });
        } else {
          inserted++;
        }
      }
    } catch (error) {
      errors.push({ scholarship: scholarship.title, error: error.message });
    }
  }
  
  return { inserted, errors };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sources, dryRun = false } = await req.json().catch(() => ({}));
    
    console.log('Scholarship scraping request received', { sources, dryRun });
    
    // Scrape scholarships from all sources
    const scholarships = await scrapeAllSources();
    
    if (dryRun) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Dry run completed',
        scraped_count: scholarships.length,
        scholarships: scholarships.slice(0, 5) // Return first 5 for preview
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Save to database
    const { inserted, errors } = await saveScholarships(scholarships);
    
    console.log(`Scraping completed: ${inserted} scholarships saved, ${errors.length} errors`);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Scholarship scraping completed`,
      scraped_count: scholarships.length,
      inserted_count: inserted,
      error_count: errors.length,
      errors: errors.slice(0, 10) // Return first 10 errors
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-scholarships function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
