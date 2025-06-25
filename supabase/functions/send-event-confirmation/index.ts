
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

interface EventConfirmationData {
  registrationId: string;
  eventId: string;
  email: string;
  fullName: string;
  eventTitle: string;
  eventDescription?: string;
  eventStartTime: string;
  eventEndTime: string;
  eventPlatform?: string;
  meetingLink?: string;
  organizedBy?: string;
  timezone?: string;
}

const generateEventConfirmationEmail = (data: EventConfirmationData): string => {
  const startDate = new Date(data.eventStartTime);
  const endDate = new Date(data.eventEndTime);
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calendar event details for ICS
  const calendarStartTime = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const calendarEndTime = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Confirmation - ${data.eventTitle}</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { padding: 10px !important; }
            .header h1 { font-size: 24px !important; }
            .event-card { padding: 16px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 20px; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div class="container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(1, 33, 105, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <div class="header" style="background: linear-gradient(135deg, #012169, #00A6D4); color: white; padding: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 8px;">🎉</div>
            <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">
              You're Registered!
            </h1>
            <p style="margin: 0; font-size: 16px; opacity: 0.9;">
              We're excited to see you at the event
            </p>
          </div>
          
          <!-- Welcome Message -->
          <div style="padding: 32px 24px 0;">
            <p style="margin-top: 0; color: #1e40af; font-size: 18px; font-weight: 600;">
              Hello ${data.fullName}! 👋
            </p>
            <p style="margin: 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for registering for our upcoming event. We're thrilled to have you join us for what promises to be an engaging and valuable experience.
            </p>
          </div>
          
          <!-- Event Details Card -->
          <div class="event-card" style="margin: 24px; padding: 24px; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 12px; border-left: 4px solid #012169;">
            <h2 style="margin-top: 0; margin-bottom: 16px; color: #012169; font-size: 20px; font-weight: 700;">
              📅 Event Details
            </h2>
            
            <div style="margin-bottom: 16px;">
              <h3 style="margin: 0 0 4px 0; color: #012169; font-size: 18px; font-weight: 600;">
                ${data.eventTitle}
              </h3>
              ${data.eventDescription ? `
                <p style="margin: 8px 0 0 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                  ${data.eventDescription}
                </p>
              ` : ''}
            </div>
            
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #00A6D4; font-size: 16px;">🗓️</span>
                <span style="color: #374151; font-weight: 500;">
                  ${formatDate(startDate)}
                </span>
              </div>
              
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #00A6D4; font-size: 16px;">⏰</span>
                <span style="color: #374151; font-weight: 500;">
                  ${formatTime(startDate)} - ${formatTime(endDate)} (${data.timezone || 'EST'})
                </span>
                <span style="color: #6b7280; font-size: 12px;">
                  (${duration} minutes)
                </span>
              </div>
              
              ${data.eventPlatform ? `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="color: #00A6D4; font-size: 16px;">💻</span>
                  <span style="color: #374151; font-weight: 500;">
                    Platform: ${data.eventPlatform}
                  </span>
                </div>
              ` : ''}
              
              ${data.organizedBy ? `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="color: #00A6D4; font-size: 16px;">👤</span>
                  <span style="color: #374151; font-weight: 500;">
                    Organized by: ${data.organizedBy}
                  </span>
                </div>
              ` : ''}
            </div>
          </div>
          
          <!-- Meeting Link Section -->
          ${data.meetingLink ? `
            <div style="margin: 24px; padding: 20px; background: linear-gradient(135deg, #bae6fd, #93c5fd); border-radius: 8px; text-align: center; border: 2px solid #00A6D4;">
              <h3 style="margin: 0 0 12px 0; color: #012169; font-size: 16px; font-weight: 600;">
                🔗 Join the Event
              </h3>
              <a href="${data.meetingLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #012169, #00A6D4); color: white; 
                        padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;
                        box-shadow: 0 4px 12px rgba(1, 33, 105, 0.3); transition: all 0.3s ease;">
                Join Event
              </a>
              <p style="margin: 12px 0 0 0; color: #1e40af; font-size: 12px;">
                Save this link - you'll need it to join the event
              </p>
            </div>
          ` : ''}
          
          <!-- Add to Calendar -->
          <div style="margin: 24px; padding: 20px; background: #f8fafc; border-radius: 8px; text-align: center; border: 1px solid #bae6fd;">
            <h3 style="margin: 0 0 12px 0; color: #012169; font-size: 16px; font-weight: 600;">
              📋 Add to Calendar
            </h3>
            <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px;">
              Don't forget! Add this event to your calendar so you don't miss it.
            </p>
            <a href="data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PicoCareer//Event Registration//EN
BEGIN:VEVENT
UID:${data.registrationId}@picocareer.com
DTSTAMP:${calendarStartTime}
DTSTART:${calendarStartTime}
DTEND:${calendarEndTime}
SUMMARY:${data.eventTitle}
DESCRIPTION:${data.eventDescription || 'Event registration confirmation'}
${data.meetingLink ? `LOCATION:${data.meetingLink}` : ''}
END:VEVENT
END:VCALENDAR"
               download="${data.eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}.ics"
               style="display: inline-block; background: linear-gradient(135deg, #00A6D4, #0284c7); color: white; 
                      padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500;
                      font-size: 14px; box-shadow: 0 2px 8px rgba(0, 166, 212, 0.3);">
              📅 Download Calendar Event
            </a>
          </div>
          
          <!-- What to Expect -->
          <div style="margin: 24px; padding: 20px; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 8px;">
            <h3 style="margin: 0 0 12px 0; color: #012169; font-size: 16px; font-weight: 600;">
              ✨ What to Expect
            </h3>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.6;">
              <li>Check your email for any event updates or reminders</li>
              <li>Join a few minutes early to test your connection</li>
              <li>Prepare any questions you'd like to ask</li>
              <li>Have a pen and paper ready for note-taking</li>
            </ul>
          </div>
          
          <!-- Contact Support -->
          <div style="padding: 24px; text-align: center; border-top: 1px solid #bae6fd;">
            <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 14px;">
              Questions about this event? Need to make changes to your registration?
            </p>
            <p style="margin: 0; color: #00A6D4; font-size: 14px; font-weight: 500;">
              Contact us at <a href="mailto:support@picocareer.com" style="color: #012169; text-decoration: none;">support@picocareer.com</a>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: linear-gradient(135deg, #012169, #00A6D4); color: white; padding: 24px; text-align: center;">
            <div style="margin-bottom: 16px;">
              <div style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">PicoCareer</div>
              <div style="font-size: 12px; opacity: 0.8;">Empowering Your Career Journey</div>
            </div>
            
            <div style="margin-bottom: 16px; font-size: 12px; opacity: 0.8;">
              <p style="margin: 0;">Thank you for choosing PicoCareer for your professional development.</p>
              <p style="margin: 4px 0 0 0;">We're committed to helping you achieve your career goals.</p>
            </div>
            
            <div style="font-size: 11px; opacity: 0.7; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 16px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} PicoCareer. All rights reserved.</p>
              <p style="margin: 4px 0 0 0;">This is an automated confirmation email for your event registration.</p>
            </div>
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const eventData: EventConfirmationData = await req.json();

    console.log('Sending event confirmation email to:', eventData.email);

    const emailResponse = await resend.emails.send({
      from: "PicoCareer Events <events@picocareer.com>",
      to: [eventData.email],
      subject: `🎉 You're registered for ${eventData.eventTitle}!`,
      html: generateEventConfirmationEmail(eventData),
    });

    console.log("Event confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: "Event confirmation email sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-event-confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send confirmation email" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
