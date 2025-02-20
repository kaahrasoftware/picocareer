
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  mentorId: string;
  menteeId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get mentee and mentor details
    const { mentorId, menteeId } = await req.json() as RequestBody

    // Fetch mentor and mentee profiles
    const { data: mentorData, error: mentorError } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', mentorId)
      .single()

    if (mentorError) throw mentorError

    const { data: menteeData, error: menteeError } = await supabaseClient
      .from('profiles')
      .select('full_name')
      .eq('id', menteeId)
      .single()

    if (menteeError) throw menteeError

    // Create notification for mentor
    const { error: notifyError } = await supabaseClient
      .from('notifications')
      .insert({
        profile_id: mentorId,
        title: 'New Availability Request',
        message: `${menteeData.full_name} has requested your availability for mentoring sessions.`,
        type: 'availability_request',
        category: 'general'
      })

    if (notifyError) throw notifyError

    return new Response(
      JSON.stringify({ message: 'Notification sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in notify-mentor-availability:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
