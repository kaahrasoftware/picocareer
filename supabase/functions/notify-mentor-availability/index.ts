
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let reqBody;
    try {
      reqBody = await req.text();
      console.log('Raw request body:', reqBody);
    } catch (error) {
      console.error('Error reading request body:', error);
      throw new Error('Failed to read request body');
    }

    let body;
    try {
      body = JSON.parse(reqBody);
      console.log('Parsed request body:', body);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new Error('Invalid JSON in request body');
    }

    if (!body?.mentorId || !body?.menteeId || !body?.requestId) {
      throw new Error('Missing required fields: mentorId, menteeId, or requestId');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get mentor details
    const { data: mentorData, error: mentorError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', body.mentorId)
      .single();

    if (mentorError || !mentorData?.email) {
      console.error('Error fetching mentor:', mentorError);
      throw new Error('Could not find mentor profile');
    }

    // Get mentee details
    const { data: menteeData, error: menteeError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', body.menteeId)
      .single();

    if (menteeError || !menteeData) {
      console.error('Error fetching mentee:', menteeError);
      throw new Error('Could not find mentee profile');
    }

    console.log('Found profiles:', { mentor: mentorData, mentee: menteeData });

    // Send email using Brevo
    const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
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

    const emailResponseData = await emailResponse.text();
    console.log('Email API response:', emailResponseData);

    let parsedEmailResponse;
    try {
      parsedEmailResponse = JSON.parse(emailResponseData);
    } catch (error) {
      console.error('Error parsing email response:', error);
      parsedEmailResponse = { raw: emailResponseData };
    }

    if (!emailResponse.ok) {
      throw new Error(`Email API error: ${emailResponse.statusText}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification sent successfully",
        data: parsedEmailResponse
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
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
