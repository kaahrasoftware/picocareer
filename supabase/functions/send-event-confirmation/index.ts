import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { registrationId }: EmailRequest = await req.json();

    console.log('Fetching registration details for:', registrationId);

    // Get registration details with event and profile information
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select(`
        *,
        event:events(
          title,
          description,
          start_time,
          end_time,
          platform,
          meeting_link,
          organized_by
        ),
        profile:profiles(
          full_name,
          email
        )
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      console.error('Error fetching registration:', regError);
      throw new Error('Registration not found');
    }

    console.log('Registration details:', registration);

    const eventDate = new Date(registration.event.start_time).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const emailContent = `
      <h2>Event Registration Confirmation</h2>
      <p>Thank you for registering for ${registration.event.title}!</p>
      
      <h3>Event Details:</h3>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p><strong>Platform:</strong> ${registration.event.platform}</p>
      ${registration.event.meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${registration.event.meeting_link}">${registration.event.meeting_link}</a></p>` : ''}
      ${registration.event.organized_by ? `<p><strong>Organized by:</strong> ${registration.event.organized_by}</p>` : ''}
      
      <h3>Event Description:</h3>
      <p>${registration.event.description}</p>
      
      <p>We look forward to seeing you at the event!</p>
      <p>Best regards,<br>The PicoCareer Team</p>
    `;

    const emailResponse = await resend.emails.send({
      from: "PicoCareer <info@picocareer.com>",
      to: [registration.email],
      subject: `Registration Confirmed: ${registration.event.title}`,
      html: emailContent,
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