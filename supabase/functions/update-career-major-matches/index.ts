import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client using service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting career-major matches update...')

    // Update timestamps to trigger the matching function
    const { error: careersError } = await supabaseClient
      .from('careers')
      .update({ updated_at: new Date().toISOString() })
      .eq('status', 'Approved')

    if (careersError) throw careersError

    const { error: majorsError } = await supabaseClient
      .from('majors')
      .update({ updated_at: new Date().toISOString() })
      .eq('status', 'Approved')

    if (majorsError) throw majorsError

    console.log('Career-major matches update completed successfully')

    return new Response(
      JSON.stringify({ message: 'Career-major matches updated successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error updating career-major matches:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})