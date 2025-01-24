import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

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
          platform
        )
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      throw new Error('Registration not found');
    }

    const event = registration.event;
    const startTime = new Date(event.start_time).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });
    const endTime = new Date(event.end_time).toLocaleString('en-US', {
      timeStyle: 'short'
    });

    // Create calendar invite
    const calendarEvent = {
      start: new Date(event.start_time).toISOString(),
      end: new Date(event.end_time).toISOString(),
      summary: event.title,
      description: `${event.description}\n\nMeeting Link: ${event.meeting_link || 'To be provided'}`,
      location: event.meeting_link || 'Online'
    };

    const icsContent = generateICS(calendarEvent);
    const icsAttachment = Buffer.from(icsContent).toString('base64');

    // Send email using Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "PicoCareer <info@picocareer.com>",
        to: [registration.email],
        subject: `Event Registration Confirmation: ${event.title}`,
        html: `
          <h2>Event Registration Confirmation</h2>
          <p>Thank you for registering for ${event.title}!</p>
          
          <h3>Event Details:</h3>
          <p><strong>Date and Time:</strong> ${startTime} - ${endTime}</p>
          <p><strong>Platform:</strong> ${event.platform}</p>
          ${event.meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${event.meeting_link}">${event.meeting_link}</a></p>` : ''}
          
          <h3>Description:</h3>
          <p>${event.description}</p>
          
          <p>A calendar invitation has been attached to this email. You can add it to your calendar to receive reminders.</p>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
        `,
        attachments: [
          {
            filename: 'event.ics',
            content: icsAttachment
          }
        ]
      }),
    });

    if (!emailRes.ok) {
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

function generateICS(event: { start: string; end: string; summary: string; description: string; location: string }) {
  const now = new Date().toISOString().replace(/[-:.]/g, '');
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PicoCareer//Event Calendar//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${now}-${Math.random().toString(36).substring(2, 15)}
DTSTAMP:${now}
DTSTART:${event.start.replace(/[-:.]/g, '')}
DTEND:${event.end.replace(/[-:.]/g, '')}
SUMMARY:${event.summary}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
}

serve(handler);