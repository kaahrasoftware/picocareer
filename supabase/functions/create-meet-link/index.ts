import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getAccessToken } from "./auth-utils.ts";
import { createCalendarEvent } from "./calendar-utils.ts";

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

    // Fetch session details with related data
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

    console.log('Session details fetched:', session);

    try {
      const accessToken = await getAccessToken();
      console.log('Got Google Calendar access token');

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
          { email: session.mentor.email, responseStatus: 'accepted' },
          { email: session.mentee.email },
          { email: 'info@picocareer.com' } // Add company email for recordings
        ],
        conferenceData: {
          createRequest: {
            requestId: sessionId,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          }
        },
        guestsCanModify: false,
        guestsCanInviteOthers: false,
        guestsCanSeeOtherGuests: true,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 10 }
          ]
        }
      };

      console.log('Creating calendar event with Meet link...', JSON.stringify(event, null, 2));
      const calendarEvent = await createCalendarEvent(event, accessToken);
      
      if (!calendarEvent || !calendarEvent.conferenceData) {
        console.error('Calendar event created but no conference data:', calendarEvent);
        throw new Error('Failed to create Meet link');
      }

      const meetLink = calendarEvent.conferenceData?.entryPoints?.[0]?.uri;
      if (!meetLink) {
        console.error('No Meet link in calendar event:', calendarEvent);
        throw new Error('Failed to generate Meet link');
      }

      // Update session with Meet link and calendar event ID
      const { error: updateError } = await supabase
        .from('mentor_sessions')
        .update({
          meeting_link: meetLink,
          calendar_event_id: calendarEvent.id,
          calendar_event_etag: calendarEvent.etag
        })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error updating session with meet link:', updateError);
        throw new Error('Failed to update session with meet link');
      }

      console.log('Successfully created Meet link:', meetLink);

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
      console.error('Error in Google Calendar operations:', error);
      throw error;
    }

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