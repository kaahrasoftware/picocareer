
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
    const body = await req.json();
    console.log('Received request body:', body);

    // Remove dashes from IDs
    const mentorId = body.mentorId?.replace(/-/g, '');
    const menteeId = body.menteeId?.replace(/-/g, '');
    const requestId = body.requestId?.replace(/-/g, '');

    if (!mentorId || !menteeId || !requestId) {
      throw new Error('Missing required fields: mentorId, menteeId, or requestId');
    }

    console.log('Processing request with IDs:', { mentorId, menteeId, requestId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get mentor details
    const { data: mentorData, error: mentorError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', mentorId)
      .single();

    if (mentorError || !mentorData) {
      console.error('Error fetching mentor:', mentorError);
      throw new Error('Could not find mentor profile');
    }

    if (!mentorData.email) {
      throw new Error('Mentor email not found');
    }

    console.log('Found mentor:', mentorData);

    // Get mentee details
    const { data: menteeData, error: menteeError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', menteeId)
      .single();

    if (menteeError || !menteeData) {
      console.error('Error fetching mentee:', menteeError);
      throw new Error('Could not find mentee profile');
    }

    console.log('Found mentee:', menteeData);

    // Create notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        profile_id: mentorId,
        title: "New Availability Request",
        message: `${menteeData.full_name} has requested your availability for mentoring sessions.`,
        type: "availability_request",
        action_url: `/profile?tab=calendar`,
        category: "mentorship",
        read: false
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      throw notificationError;
    }

    console.log('Notification created successfully');

    // Verify SEND_API key is available
    const sendApiKey = Deno.env.get("SEND_API");
    if (!sendApiKey) {
      console.error('SEND_API key not found in environment variables');
      throw new Error('SEND_API key not configured');
    }

    console.log('Preparing to send email to:', mentorData.email);

    // Send email notification using Brevo (formerly Sendinblue)
    try {
      const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "api-key": sendApiKey,
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

      const emailResponseText = await emailResponse.text();
      console.log('Email API raw response:', emailResponseText);

      if (!emailResponse.ok) {
        console.error('Email API error response:', emailResponseText);
        throw new Error(`Email API error: ${emailResponse.statusText}`);
      }

      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      throw emailError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification and email sent successfully"
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
        status: error instanceof Error && error.message.includes('Missing required fields') ? 400 : 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
