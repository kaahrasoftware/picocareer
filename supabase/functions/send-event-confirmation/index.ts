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

    // Get registration details with event information
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select(`
        *,
        event:events(
          title,
          start_time,
          platform,
          meeting_link
        )
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      console.error('Error fetching registration:', regError);
      throw new Error('Registration not found');
    }

    console.log('Registration details:', registration);

    const emailContent = `
      <h2>Event Registration Confirmation</h2>
      <p>Thank you for registering for ${registration.event.title}!</p>
      <p>The event will start at ${registration.event.start_time}</p>
      ${registration.event.meeting_link ? `<p>Meeting Link: <a href="${registration.event.meeting_link}">${registration.event.meeting_link}</a></p>` : ''}
      
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