
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { google } from "npm:googleapis@128.0.0";

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
        action_url: `/profile?tab=mentor`,
        category: "mentorship",
        read: false
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      throw notificationError;
    }

    console.log('Notification created successfully');

    // Set up Google OAuth2 client with service account credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
        private_key: Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
    });

    // Create Gmail API client
    const gmail = google.gmail({ version: 'v1', auth });

    // Prepare email content with improved styling
    const emailContent = [
      'From: PicoCareer <info@picocareer.com>',
      `To: ${mentorData.email}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      'Subject: New Mentoring Session Request',
      '',
      `<!DOCTYPE html>
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
              <h1>New Mentoring Session Request</h1>
            </div>
            <div class="content">
              <p>Dear ${mentorData.full_name},</p>
              
              <p>We hope this email finds you well. You have received a new mentoring session request from <strong>${menteeData.full_name}</strong>.</p>
              
              <p>To review this request and manage your availability:</p>
              
              <center>
                <a href="https://picocareer.com/profile?tab=mentor" class="button">
                  Review Request
                </a>
              </center>
              
              <p>Your dedication to mentoring makes a significant impact on our community. Thank you for being an invaluable part of the PicoCareer platform.</p>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br>The PicoCareer Team</p>
            </div>
            <div class="footer">
              <p>© 2024 PicoCareer. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>`
    ].join('\n');

    // Convert email content to base64 using TextEncoder
    const encoder = new TextEncoder();
    const emailBytes = encoder.encode(emailContent);
    const emailBase64 = btoa(String.fromCharCode(...emailBytes));

    try {
      console.log('Sending email to:', mentorData.email);
      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: emailBase64
        }
      });
      console.log('Email sent successfully:', response.data);
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
