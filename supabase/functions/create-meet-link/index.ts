import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { sessionId } = await req.json()
    if (!sessionId) throw new Error('Session ID is required')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('mentor_sessions')
      .select(`
        *,
        mentor:mentor_id(id),
        mentee:mentee_id(id, email, full_name),
        session_type:session_type_id(duration, type)
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      throw new Error('Session not found')
    }

    // Get mentor's Google OAuth token
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_oauth_tokens')
      .select('*')
      .eq('user_id', session.mentor.id)
      .eq('provider', 'google')
      .single()

    if (tokenError || !tokenData) {
      throw new Error('Mentor has not connected their Google account')
    }

    // Check if token needs refresh
    if (new Date(tokenData.expires_at) <= new Date()) {
      console.log('Token expired, refreshing...')
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
          refresh_token: tokenData.refresh_token || '',
          grant_type: 'refresh_token',
        }),
      })

      const refreshData = await response.json()
      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      // Update token in database
      const { error: updateError } = await supabase
        .from('user_oauth_tokens')
        .update({
          access_token: refreshData.access_token,
          expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        })
        .eq('id', tokenData.id)

      if (updateError) {
        throw new Error('Failed to update token')
      }

      tokenData.access_token = refreshData.access_token
    }

    // Create Google Calendar event with Meet link
    const startTime = new Date(session.scheduled_at)
    const endTime = new Date(startTime.getTime() + session.session_type.duration * 60000)

    const event = {
      summary: `${session.session_type.type} Session with ${session.mentee.full_name}`,
      description: session.notes || 'No additional notes',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: [
        { email: session.mentee.email },
      ],
      conferenceData: {
        createRequest: {
          requestId: sessionId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    }

    const calendarResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    if (!calendarResponse.ok) {
      throw new Error('Failed to create calendar event')
    }

    const calendarEvent = await calendarResponse.json()
    const meetLink = calendarEvent.conferenceData?.entryPoints?.[0]?.uri

    if (!meetLink) {
      throw new Error('Failed to generate Meet link')
    }

    // Update session with Meet link and calendar event ID
    const { error: updateError } = await supabase
      .from('mentor_sessions')
      .update({
        meeting_platform: 'google_meet',
        meeting_link: meetLink,
        calendar_event_id: calendarEvent.id,
      })
      .eq('id', sessionId)

    if (updateError) {
      throw new Error('Failed to update session with Meet link')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        meetLink,
        calendarEventId: calendarEvent.id 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Error creating Meet link:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})