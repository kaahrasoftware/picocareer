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

async function getAccessToken() {
  try {
    const claims = {
      iss: SERVICE_ACCOUNT_EMAIL,
      scope: 'https://www.googleapis.com/auth/calendar',
      aud: 'https://oauth2.googleapis.com/token',
      exp: getNumericDate(3600),
      iat: getNumericDate(0),
      sub: COMPANY_CALENDAR_EMAIL,
    };

    let privateKeyContent = SERVICE_ACCOUNT_PRIVATE_KEY;
    if (!privateKeyContent.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKeyContent = `-----BEGIN PRIVATE KEY-----\n${privateKeyContent}\n-----END PRIVATE KEY-----`;
    }
    privateKeyContent = privateKeyContent.replace(/\\n/g, '\n');

    const pemContent = privateKeyContent
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');

    const binaryKey = Uint8Array.from(atob(pemContent), c => c.charCodeAt(0));
    
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

    const jwt = await create(
      { alg: "RS256", typ: "JWT" },
      claims,
      privateKey
    );

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
      throw new Error(`Failed to get access token: ${JSON.stringify(data)}`);
    }

    return data.access_token;
  } catch (error) {
    console.error('Error in getAccessToken:', error);
    throw error;
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error('Session ID is required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('mentor_sessions')
      .select('calendar_event_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session?.calendar_event_id) {
      throw new Error('Session not found or no calendar event');
    }

    // Get access token and cancel the Google Calendar event
    const accessToken = await getAccessToken();
    
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${session.calendar_event_id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!calendarResponse.ok) {
      throw new Error('Failed to cancel calendar event');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error cancelling meet link:', error);
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