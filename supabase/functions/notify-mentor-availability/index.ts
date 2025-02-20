
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
        message: `${menteeData.full_name} would like to book a mentoring session with you but noticed you don't have any available time slots.`,
        type: "availability_request",
        action_url: `/profile?tab=mentor`,
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
        subject: 'New Session Request - Action Required',
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
                  <h1>New Session Request</h1>
                </div>
                <div class="content">
                  <p>Dear ${mentorData.full_name},</p>
                  
                  <p><strong>${menteeData.full_name}</strong> would like to book a mentoring session with you but noticed that you don't currently have any available time slots.</p>
                  
                  <p>To accommodate this request, please:</p>
                  <ol>
                    <li>Log in to your PicoCareer account</li>
                    <li>Go to your Profile</li>
                    <li>Click on the "Mentor" tab</li>
                    <li>Add your availability in the calendar section</li>
                  </ol>
                  
                  <center>
                    <a href="https://picocareer.com/auth" class="button" style="color: white;">
                      Login to Add Availability
                    </a>
                  </center>
                  
                  <p>Once you've added your availability, the mentee will be able to book a session at a time that works for both of you.</p>
                  
                  <p>Thank you for being an active mentor in our community. Your expertise and guidance make a real difference!</p>
                  
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
