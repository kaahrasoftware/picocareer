
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@2.0.0";

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

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    try {
      console.log('Attempting to send email to:', mentorData.email);
      const emailResponse = await resend.emails.send({
        from: 'PicoCareer <info@picocareer.com>',
        to: [mentorData.email],
        subject: 'New Availability Request',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                .container {
                  font-family: Arial, sans-serif;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  color: #333;
                }
                .header {
                  background-color: #002366;
                  color: white;
                  padding: 20px;
                  text-align: center;
                  border-radius: 5px 5px 0 0;
                }
                .content {
                  background-color: #f9f9f9;
                  padding: 20px;
                  border-radius: 0 0 5px 5px;
                  line-height: 1.6;
                }
                .button {
                  display: inline-block;
                  background-color: #0EA5E9;
                  color: white;
                  padding: 12px 25px;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 20px 0;
                }
                .footer {
                  margin-top: 20px;
                  text-align: center;
                  color: #666;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>New Availability Request</h1>
                </div>
                <div class="content">
                  <p>Dear ${mentorData.full_name},</p>
                  
                  <p>We hope this email finds you well. You have received a new mentoring session request from <strong>${menteeData.full_name}</strong>.</p>
                  
                  <p>To manage your availability and respond to this request, please login to your PicoCareer account:</p>
                  
                  <center>
                    <a href="https://picocareer.com/auth" class="button" style="color: white;">
                      Login to PicoCareer
                    </a>
                  </center>
                  
                  <p>After logging in, you'll be able to set your availability and manage mentoring session requests from your calendar.</p>
                  
                  <p>Your dedication to mentoring makes a significant impact on our community. Thank you for being an invaluable part of the PicoCareer platform.</p>
                  
                  <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                  
                  <p>Best regards,<br>The PicoCareer Team</p>
                </div>
                <div class="footer">
                  <p>© 2024 PicoCareer. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      });

      console.log('Email sent successfully:', emailResponse);
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
