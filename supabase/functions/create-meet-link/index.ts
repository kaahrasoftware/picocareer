import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getAccessToken } from "./auth-utils.ts";
import { createCalendarEvent, setupWebhook } from "./calendar-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error('Session ID is required');

    console.log('Creating Meet link for session:', sessionId);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch session details with mentor and mentee information
    const { data: session, error: sessionError } = await supabase
      .from('mentor_sessions')
      .select(`
        id,
        scheduled_at,
        notes,
        mentor:mentor_id(id, email, full_name),
        mentee:mentee_id(id, email, full_name),
        session_type:session_type_id(duration, type)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('Session not found:', sessionError);
      throw new Error('Session not found');
    }

    console.log('Session details fetched:', {
      mentorEmail: session.mentor.email,
      menteeEmail: session.mentee.email,
      scheduledAt: session.scheduled_at
    });

    const accessToken = await getAccessToken();
    console.log('Google Calendar access token obtained');

    const startTime = new Date(session.scheduled_at);
    const endTime = new Date(startTime.getTime() + session.session_type.duration * 60000);

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
        { email: session.mentor.email },
        { email: session.mentee.email }
      ],
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
          status: { statusCode: 'success' }
        }
      },
      guestsCanModify: false,
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: true,
      reminders: {
        useDefault: true
      }
    };

    console.log('Creating calendar event with Meet link...');
    const calendarEvent = await createCalendarEvent(event, accessToken);
    
    if (!calendarEvent.conferenceData?.entryPoints?.[0]?.uri) {
      console.error('Calendar event created but no Meet link found:', calendarEvent);
      throw new Error('Failed to generate Meet link');
    }

    const meetLink = calendarEvent.conferenceData.entryPoints[0].uri;
    console.log('Successfully created Meet link:', meetLink);

    // Update the session with the Meet link
    const { error: updateError } = await supabase
      .from('mentor_sessions')
      .update({
        meeting_link: meetLink,
        calendar_event_id: calendarEvent.id,
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Failed to update session with Meet link:', updateError);
      throw new Error('Failed to update session with Meet link');
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
    );

  } catch (error) {
    console.error('Error creating Meet link:', error);
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
    );
  }
});