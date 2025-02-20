
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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

    // Send email using Brevo
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": Deno.env.get("SEND_API") ?? '',
      },
      body: JSON.stringify({
        sender: {
          name: "PicoCareer",
          email: "notification@picocareer.com"
        },
        to: [{
          email: mentorData.email,
          name: mentorData.full_name
        }],
        subject: "New Availability Request",
        htmlContent: `
          <h1>New Availability Request</h1>
          <p>Hello ${mentorData.full_name},</p>
          <p>${menteeData.full_name} has requested your availability for mentoring sessions.</p>
          <p>Please log in to your dashboard to review and respond to this request.</p>
          <p>Best regards,<br>The PicoCareer Team</p>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending email:', errorData);
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    console.log('Email sent successfully');

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
