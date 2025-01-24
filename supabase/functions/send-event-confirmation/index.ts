import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  registrationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationId } = await req.json() as EmailRequest;
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get registration details with event information
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select(`
        *,
        event:events (
          title,
          description,
          start_time,
          end_time,
          meeting_link,
          platform,
          organized_by
        )
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      throw new Error('Registration not found');
    }

    const event = registration.event;
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);

    // Format dates for email
    const formattedStartTime = startTime.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });
    const formattedEndTime = new Date(event.end_time).toLocaleString('en-US', {
      timeStyle: 'short'
    });

    // Create calendar event using Google Calendar API
    const calendarId = Deno.env.get('GOOGLE_CALENDAR_EMAIL');
    const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const privateKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')?.replace(/\\n/g, '\n');

    if (!calendarId || !serviceAccountEmail || !privateKey) {
      throw new Error('Missing Google Calendar configuration');
    }

    // Create JWT for Google API authentication
    const jwt = await createJWT(serviceAccountEmail, privateKey, [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.send'
    ]);

    // Create Google Calendar event
    const calendarEvent = {
      summary: event.title,
      description: `${event.description}\n\nMeeting Link: ${event.meeting_link || 'To be provided'}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC'
      },
      attendees: [{ email: registration.email }],
      conferenceData: event.meeting_link ? {
        createRequest: {
          requestId: registration.id,
          conferenceSolutionKey: { type: "hangoutsMeet" }
        }
      } : undefined
    };

    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarEvent)
      }
    );

    if (!calendarResponse.ok) {
      throw new Error('Failed to create calendar event');
    }

    const calData = await calendarResponse.json();

    // Create email content
    const emailContent = `
Content-Type: text/html; charset="UTF-8"
MIME-Version: 1.0
From: PicoCareer <info@picocareer.com>
To: ${registration.email}
Subject: Event Registration Confirmation: ${event.title}
Content-Transfer-Encoding: 7bit

<html>
<body>
  <h2>Event Registration Confirmation</h2>
  <p>Thank you for registering for ${event.title}!</p>
  
  <h3>Event Details:</h3>
  <p><strong>Date and Time:</strong> ${formattedStartTime} - ${formattedEndTime}</p>
  <p><strong>Platform:</strong> ${event.platform}</p>
  ${event.meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${event.meeting_link}">${event.meeting_link}</a></p>` : ''}
  ${event.organized_by ? `<p><strong>Organized by:</strong> ${event.organized_by}</p>` : ''}
  
  <h3>Description:</h3>
  <p>${event.description}</p>
  
  <p>A calendar invitation has been sent to your email. You can add it to your calendar to receive reminders.</p>
  
  <p>If you have any questions, please don't hesitate to contact us.</p>
</body>
</html>`;

    // Encode the email content
    const encodedEmail = btoa(emailContent).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // Send email using Gmail API
    const gmailResponse = await fetch(
      'https://www.googleapis.com/gmail/v1/users/info@picocareer.com/messages/send',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedEmail
        })
      }
    );

    if (!gmailResponse.ok) {
      throw new Error('Failed to send email');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in send-event-confirmation function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

// Helper function to create JWT token for Google API authentication
async function createJWT(serviceAccountEmail: string, privateKey: string, scopes: string[]) {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: serviceAccountEmail,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header));
  const claimB64 = btoa(JSON.stringify(claim));
  const message = `${headerB64}.${claimB64}`;

  // Create signing key
  const keyData = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(privateKey),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );

  // Sign the message
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    keyData,
    encoder.encode(message)
  );

  // Convert signature to base64
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

  // Get access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${message}.${signatureB64}`
    })
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to get access token');
  }

  const { access_token } = await tokenResponse.json();
  return access_token;
}

serve(handler);