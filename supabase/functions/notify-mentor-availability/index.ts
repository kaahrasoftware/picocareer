
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Get request body
    const requestBody = await req.json()
    if (!requestBody?.mentorId || !requestBody?.menteeId) {
      throw new Error('Missing required fields: mentorId and menteeId')
    }

    const { mentorId, menteeId } = requestBody

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials')
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // Fetch mentee profile
    const { data: menteeData, error: menteeError } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', menteeId)
      .single()

    if (menteeError || !menteeData) {
      throw new Error(`Error fetching mentee: ${menteeError?.message || 'Mentee not found'}`)
    }

    // Create notification
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        profile_id: mentorId,
        title: 'New Availability Request',
        message: `${menteeData.full_name} has requested your availability for mentoring sessions.`,
        type: 'availability_request',
        category: 'general'
      })

    if (notificationError) {
      throw new Error(`Error creating notification: ${notificationError.message}`)
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    // Log the error
    console.error('Error in notify-mentor-availability:', error)

    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
