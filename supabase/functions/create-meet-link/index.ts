import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.9.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COMPANY_CALENDAR_EMAIL = Deno.env.get('GOOGLE_CALENDAR_EMAIL');
const SERVICE_ACCOUNT_EMAIL = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
const SERVICE_ACCOUNT_PRIVATE_KEY = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');

if (!COMPANY_CALENDAR_EMAIL || !SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_PRIVATE_KEY) {
  throw new Error('Missing required Google service account credentials');
}

async function getAccessToken() {
  try {
    console.log('Starting getAccessToken process...');
    
    const claims = {
      iss: SERVICE_ACCOUNT_EMAIL,
      scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
      aud: 'https://oauth2.googleapis.com/token',
      exp: getNumericDate(3600),
      iat: getNumericDate(0),
      sub: COMPANY_CALENDAR_EMAIL,
    };

    // Clean and prepare the private key
    let privateKeyContent = SERVICE_ACCOUNT_PRIVATE_KEY;
    
    // If the key doesn't contain the PEM markers, add them
    if (!privateKeyContent.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKeyContent = `-----BEGIN PRIVATE KEY-----\n${privateKeyContent}\n-----END PRIVATE KEY-----`;
    }
    
    // Remove any escaped newlines and replace with actual newlines
    privateKeyContent = privateKeyContent.replace(/\\n/g, '\n');

    // Extract the key content between the PEM markers
    const pemContent = privateKeyContent
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');

    try {
      // Decode the base64 key
      const binaryKey = Uint8Array.from(atob(pemContent), c => c.charCodeAt(0));
      
      console.log('Importing private key...');
      const privateKey = await crypto.subtle.importKey(
        "pkcs8",
        binaryKey,
        {
          name: "RSASSA-PKCS1-v1_5",
          hash: "SHA-256",
        },
        true,
        ["sign"]
      );

      console.log('Creating JWT...');
      const jwt = await create(
        { alg: "RS256", typ: "JWT" },
        claims,
        privateKey
      );

      console.log('Requesting access token...');
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Failed to get access token:', data);
        throw new Error(`Failed to get access token: ${JSON.stringify(data)}`);
      }

      console.log('Successfully obtained access token');
      return data.access_token;
    } catch (error) {
      console.error('Error processing private key:', error);
      throw new Error(`Error processing private key: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in getAccessToken:', error);
    throw error;
  }
}

serve(async (req: Request): Promise<Response> => {
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

    // Get session details with explicit column selection
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

    // Get access token using service account
    const accessToken = await getAccessToken();

    // Create Google Calendar event with Meet link
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
        { email: session.mentee.email },
      ],
      conferenceData: {
        createRequest: {
          requestId: sessionId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    console.log('Creating calendar event with Meet link...');
    const calendarResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!calendarResponse.ok) {
      const errorData = await calendarResponse.json();
      console.error('Failed to create calendar event:', errorData);
      throw new Error('Failed to create calendar event');
    }

    const calendarEvent = await calendarResponse.json();
    const meetLink = calendarEvent.conferenceData?.entryPoints?.[0]?.uri;

    if (!meetLink) {
      console.error('No Meet link in calendar event:', calendarEvent);
      throw new Error('Failed to generate Meet link');
    }

    console.log('Successfully created Meet link:', meetLink);

    // Update session with Meet link and calendar event ID
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