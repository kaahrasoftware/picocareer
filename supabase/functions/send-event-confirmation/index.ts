
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailData {
  registrationId: string;
  eventId?: string;
  email?: string;
  fullName?: string;
  eventTitle?: string;
  eventDescription?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  eventPlatform?: string;
  meetingLink?: string;
  organizedBy?: string;
  timezone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailData = await req.json();
    const { registrationId } = emailData;

    console.log(`Fetching registration details for: ${registrationId}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If we don't have complete data, fetch it from the database
    let registrationData = emailData;
    
    if (!emailData.email || !emailData.eventTitle) {
      const { data: registration, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          event:events (
            title,
            description,
            start_time,
            end_time,
            platform,
            meeting_link,
            organized_by,
            timezone
          ),
          profile:profiles (
            email,
            full_name
          )
        `)
        .eq('id', registrationId)
        .single();

      if (error || !registration) {
        throw new Error('Registration not found');
      }

      registrationData = {
        registrationId,
        email: registration.email,
        fullName: `${registration.first_name} ${registration.last_name}`,
        eventTitle: registration.event?.title,
        eventDescription: registration.event?.description,
        eventStartTime: registration.event?.start_time,
        eventEndTime: registration.event?.end_time,
        eventPlatform: registration.event?.platform,
        meetingLink: registration.event?.meeting_link,
        organizedBy: registration.event?.organized_by,
        timezone: registration.event?.timezone || 'EST'
      };
    }

    console.log('Registration details:', JSON.stringify(registrationData, null, 2));

    // Format event times with timezone
    const formatDateTime = (dateTimeStr: string, timezone: string) => {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
        timeZone: timezone === 'EST' ? 'America/New_York' : timezone
      });
    };

    const eventStartFormatted = registrationData.eventStartTime 
      ? formatDateTime(registrationData.eventStartTime, registrationData.timezone || 'EST')
      : 'TBD';
    
    const eventEndFormatted = registrationData.eventEndTime 
      ? formatDateTime(registrationData.eventEndTime, registrationData.timezone || 'EST')
      : 'TBD';

    // Clean the event title for better display
    const originalTitle = registrationData.eventTitle || 'Event';
    console.log(`Original event title: "${originalTitle}"`);
    
    const cleanedTitle = originalTitle.replace(/[""]/g, '"');
    console.log(`Cleaned event title: "${cleanedTitle}"`);

    // Professional blue-themed email template with company logo
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Registration Confirmation</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: linear-gradient(135deg, #012169 0%, #00A6D4 100%);
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(1, 33, 105, 0.1);
            }
            .header {
                background: rgba(255, 255, 255, 0.95);
                padding: 30px;
                text-align: center;
                border-bottom: 3px solid #012169;
            }
            .logo {
                max-width: 200px;
                height: auto;
                margin-bottom: 20px;
            }
            .content {
                background: white;
                padding: 40px 30px;
            }
            .title {
                color: #012169;
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 10px;
                text-align: center;
            }
            .subtitle {
                color: #00A6D4;
                font-size: 18px;
                text-align: center;
                margin-bottom: 30px;
                font-weight: 500;
            }
            .event-details {
                background: linear-gradient(135deg, #f1f8ff 0%, #e6f3ff 100%);
                border-left: 4px solid #012169;
                padding: 25px;
                margin: 25px 0;
                border-radius: 8px;
            }
            .event-title {
                color: #012169;
                font-size: 22px;
                font-weight: 700;
                margin-bottom: 15px;
            }
            .detail-item {
                margin: 12px 0;
                display: flex;
                align-items: flex-start;
            }
            .detail-label {
                color: #012169;
                font-weight: 600;
                min-width: 120px;
                margin-right: 10px;
            }
            .detail-value {
                color: #374151;
                flex: 1;
            }
            .meeting-link {
                background: #012169;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                display: inline-block;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
                transition: background-color 0.3s ease;
            }
            .meeting-link:hover {
                background: #00A6D4;
                text-decoration: none;
                color: white;
            }
            .footer {
                background: linear-gradient(135deg, #012169 0%, #00A6D4 100%);
                color: white;
                padding: 30px;
                text-align: center;
                font-size: 14px;
            }
            .footer a {
                color: #e6f3ff;
                text-decoration: none;
            }
            .timezone-note {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
                font-size: 14px;
                text-align: center;
            }
            @media (max-width: 600px) {
                body {
                    padding: 10px;
                }
                .content {
                    padding: 25px 20px;
                }
                .title {
                    font-size: 24px;
                }
                .event-title {
                    font-size: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://wurdmlkfkzuivvwxjmxk.supabase.co/storage/v1/object/public/images/email-logos/66e432a2-6061-4f7f-ada7-69c35feecf41.png" alt="Company Logo" class="logo">
            </div>
            
            <div class="content">
                <h1 class="title">Registration Confirmed! 🎉</h1>
                <p class="subtitle">You're all set for the upcoming event</p>
                
                <p>Dear ${registrationData.fullName || 'Participant'},</p>
                
                <p>Thank you for registering! We're excited to confirm your participation in the following event:</p>
                
                <div class="event-details">
                    <div class="event-title">${cleanedTitle}</div>
                    
                    <div class="detail-item">
                        <span class="detail-label">📅 Start Time:</span>
                        <span class="detail-value">${eventStartFormatted}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">⏰ End Time:</span>
                        <span class="detail-value">${eventEndFormatted}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">💻 Platform:</span>
                        <span class="detail-value">${registrationData.eventPlatform || 'TBD'}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">🏢 Organized by:</span>
                        <span class="detail-value">${registrationData.organizedBy || 'Event Team'}</span>
                    </div>
                </div>

                <div class="timezone-note">
                    <strong>⏰ Timezone Information:</strong><br>
                    All times are displayed in ${registrationData.timezone || 'EST'}. Please make sure to convert to your local timezone if needed.
                </div>

                ${registrationData.meetingLink ? `
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${registrationData.meetingLink}" class="meeting-link">
                        🔗 Join Event
                    </a>
                </div>
                ` : ''}

                <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px;">
                    <h3 style="color: #012169; margin-bottom: 15px;">📋 What to Expect:</h3>
                    <div style="color: #374151; font-size: 14px;">
                        ${registrationData.eventDescription ? `
                            <p>${registrationData.eventDescription.substring(0, 300)}${registrationData.eventDescription.length > 300 ? '...' : ''}</p>
                        ` : `
                            <p>We'll send you more details about the event agenda and preparation materials closer to the event date.</p>
                        `}
                    </div>
                </div>

                <p style="margin-top: 30px;">If you have any questions or need to make changes to your registration, please don't hesitate to reach out to our team.</p>
                
                <p>Looking forward to seeing you at the event!</p>
                
                <p style="margin-top: 25px;">
                    <strong>Best regards,</strong><br>
                    <span style="color: #012169; font-weight: 600;">The ${registrationData.organizedBy || 'Event'} Team</span>
                </p>
            </div>
            
            <div class="footer">
                <p>This email was sent to confirm your event registration.</p>
                <p style="margin-top: 10px; font-size: 12px; opacity: 0.8;">
                    © 2025 ${registrationData.organizedBy || 'Event Team'}. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>`;

    const emailResponse = await resend.emails.send({
      from: `${registrationData.organizedBy || 'Event Team'} <events@picocareer.com>`,
      to: [registrationData.email!],
      subject: `✅ Registration Confirmed: ${cleanedTitle}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", JSON.stringify(emailResponse, null, 2));

    return new Response(
      JSON.stringify(emailResponse),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-event-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
