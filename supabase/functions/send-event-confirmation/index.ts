
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  registrationId?: string;
  eventId?: string;
  email: string;
  fullName: string;
  eventTitle?: string;
  eventDescription?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  eventPlatform?: string;
  meetingLink?: string;
  organizedBy?: string;
  timezone?: string;
}

const generateEmailHTML = (data: EmailRequest): string => {
  const eventDate = data.eventStartTime ? new Date(data.eventStartTime).toLocaleDateString() : 'TBD';
  const eventTime = data.eventStartTime ? new Date(data.eventStartTime).toLocaleTimeString() : 'TBD';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Confirmation - ${data.eventTitle}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .event-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-item { margin: 10px 0; }
            .detail-label { font-weight: bold; color: #7E69AB; }
            .meeting-link { background: #9b87f5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Event Registration Confirmed! 🎉</h1>
            </div>
            
            <div class="content">
                <p>Hi ${data.fullName},</p>
                
                <p>Thank you for registering for our event! We're excited to have you join us.</p>
                
                <div class="event-details">
                    <h3>Event Details</h3>
                    <div class="detail-item">
                        <span class="detail-label">Event:</span> ${data.eventTitle || 'Event'}
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date:</span> ${eventDate}
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Time:</span> ${eventTime} ${data.timezone || 'EST'}
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Platform:</span> ${data.eventPlatform || 'Online'}
                    </div>
                    ${data.organizedBy ? `<div class="detail-item"><span class="detail-label">Organized by:</span> ${data.organizedBy}</div>` : ''}
                </div>
                
                ${data.eventDescription ? `<p><strong>About this event:</strong><br>${data.eventDescription}</p>` : ''}
                
                ${data.meetingLink ? `<div style="text-align: center;"><a href="${data.meetingLink}" class="meeting-link">Join Event</a></div>` : ''}
                
                <p>We'll send you a reminder before the event starts. If you have any questions, feel free to reach out to us.</p>
                
                <p>Looking forward to seeing you there!</p>
                
                <p>Best regards,<br>The PicoCareer Team</p>
            </div>
            
            <div class="footer">
                <p>© 2024 PicoCareer. All rights reserved.</p>
                <p>This email was sent to ${data.email}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Sending event confirmation email');
    
    const emailData: EmailRequest = await req.json();
    console.log('Email data received:', { ...emailData, email: emailData.email });

    if (!emailData.email) {
      throw new Error('Email address is required');
    }

    // Generate email HTML
    const emailHTML = generateEmailHTML(emailData);
    console.log('Email HTML generated for:', emailData.email);

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "PicoCareer <noreply@picocareer.com>",
      to: [emailData.email],
      subject: `Event Confirmation - ${emailData.eventTitle || 'Your Event'}`,
      html: emailHTML,
      replyTo: "support@picocareer.com"
    });

    console.log('Resend API response:', emailResponse);

    if (emailResponse.error) {
      throw new Error(`Resend API error: ${emailResponse.error.message}`);
    }

    console.log('Email sent successfully to:', emailData.email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: emailResponse.data?.id,
        message: 'Email sent successfully' 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in send-event-confirmation function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to send email'
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
