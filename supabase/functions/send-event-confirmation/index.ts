import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationId } = await req.json();
    
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
    const formattedEndTime = endTime.toLocaleString('en-US', {
      timeStyle: 'short'
    });

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "PicoCareer <info@picocareer.com>",
      to: registration.email,
      subject: `Event Registration Confirmation: ${event.title}`,
      html: `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
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
          
          <p style="color: #666; font-size: 0.9em; margin-top: 30px;">
            Best regards,<br>
            The PicoCareer Team
          </p>
        </body>
        </html>
      `,
    });

    console.log('Email sent successfully:', emailResponse);

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

serve(handler);