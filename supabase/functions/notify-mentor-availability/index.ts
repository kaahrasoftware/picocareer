
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
    // Validate request body
    const body = await req.json();
    if (!body?.mentorId || !body?.menteeId || !body?.requestId) {
      throw new Error('Missing required fields in request body');
    }

    const { mentorId, menteeId, requestId } = body as RequestBody;
    console.log('Processing notification request:', { mentorId, menteeId, requestId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get mentor and mentee details
    const { data: mentorData, error: mentorError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', mentorId)
      .single();

    if (mentorError || !mentorData) {
      console.error('Error getting mentor data:', mentorError);
      throw new Error('Could not find mentor profile');
    }

    const { data: menteeData, error: menteeError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', menteeId)
      .single();

    if (menteeError || !menteeData) {
      console.error('Error getting mentee data:', menteeError);
      throw new Error('Could not find mentee profile');
    }

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

    const responseData = await response.json();
    console.log('Email API response:', responseData);

    if (!response.ok) {
      console.error('Error sending email:', responseData);
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    console.log('Email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Notification sent successfully" 
      }),
      { 
        status: 200,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error('Error in notify-mentor-availability:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error'
      }),
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
