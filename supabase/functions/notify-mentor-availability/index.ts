
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  mentorId: string;
  menteeId: string;
  requestId: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { mentorId, menteeId, requestId } = await req.json() as RequestBody;
    console.log('Processing notification request:', { mentorId, menteeId, requestId });

    // Get mentor and mentee details
    const { data: mentorData, error: mentorError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', mentorId)
      .single();

    if (mentorError) throw mentorError;

    const { data: menteeData, error: menteeError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', menteeId)
      .single();

    if (menteeError) throw menteeError;

    console.log('Found mentor and mentee:', { mentor: mentorData, mentee: menteeData });

    // Send email to mentor
    const emailResponse = await resend.emails.send({
      from: "PicoCareer <notification@picocareer.com>",
      to: [mentorData.email],
      subject: "New Availability Request",
      html: `
        <h1>New Availability Request</h1>
        <p>Hello ${mentorData.full_name},</p>
        <p>${menteeData.full_name} has requested your availability for mentoring sessions.</p>
        <p>Please log in to your dashboard to review and respond to this request.</p>
        <p>Best regards,<br>The PicoCareer Team</p>
      `,
    });

    console.log('Email sent:', emailResponse);

    return new Response(
      JSON.stringify({ message: "Notification sent successfully" }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error('Error in notify-mentor-availability:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
