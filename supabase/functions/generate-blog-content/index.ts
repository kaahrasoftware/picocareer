import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title } = await req.json();

    const systemPrompt = `You are a professional blog content generator. Given a blog title, create a well-structured blog post with the following sections:
    1. Introduction (2-3 paragraphs)
    2. Main Content (3-4 sections with subheadings)
    3. Key Takeaways (3-5 bullet points)
    4. Conclusion (1-2 paragraphs)
    
    Use HTML tags for structure (<h2>, <p>, <ul>, etc). Make the content informative, engaging, and around 1000-1500 words.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a blog post for the title: "${title}"` }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating blog content:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});