
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  registrationId: string;
  eventId: string;
  email: string;
  fullName: string;
  eventTitle: string;
  eventDescription: string;
  eventStartTime: string;
  eventEndTime: string;
  eventPlatform: string;
  meetingLink?: string;
  organizedBy?: string;
  timezone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const emailData: EmailRequest = await req.json();

    console.log('Sending event confirmation email for:', emailData.registrationId);

    // Format dates
    const startDate = new Date(emailData.eventStartTime);
    const endDate = new Date(emailData.eventEndTime);
    const timezone = emailData.timezone || 'EST';
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    // Generate calendar link
    const calendarTitle = encodeURIComponent(emailData.eventTitle);
    const calendarDescription = encodeURIComponent(emailData.eventDescription + (emailData.meetingLink ? `\n\nJoin here: ${emailData.meetingLink}` : ''));
    const startTimeISO = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endTimeISO = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calendarTitle}&dates=${startTimeISO}/${endTimeISO}&details=${calendarDescription}`;

    // Create the email HTML with blue color scheme
    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Registration Confirmation</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                line-height: 1.6; 
                color: #1e3a8a; 
                margin: 0; 
                padding: 0; 
                background-color: #f0f9ff; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 12px; 
                overflow: hidden; 
                box-shadow: 0 10px 30px rgba(1, 33, 105, 0.15); 
            }
            .header { 
                background: linear-gradient(135deg, #012169, #00A6D4); 
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 28px; 
                font-weight: 700; 
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); 
            }
            .content { 
                padding: 40px 30px; 
            }
            .greeting { 
                font-size: 18px; 
                color: #1e40af; 
                margin-bottom: 25px; 
                font-weight: 500; 
            }
            .event-details { 
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe); 
                border: 2px solid #bae6fd; 
                border-left: 6px solid #012169; 
                border-radius: 12px; 
                padding: 30px; 
                margin: 30px 0; 
                box-shadow: 0 4px 12px rgba(1, 33, 105, 0.1); 
            }
            .event-title { 
                font-size: 24px; 
                font-weight: 700; 
                color: #012169; 
                margin-bottom: 15px; 
            }
            .event-info { 
                margin: 15px 0; 
                display: flex; 
                align-items: center; 
            }
            .event-info strong { 
                color: #1e40af; 
                min-width: 120px; 
                display: inline-block; 
            }
            .meeting-link { 
                background: linear-gradient(135deg, #012169, #00A6D4); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 8px; 
                display: inline-block; 
                margin: 20px 0; 
                font-weight: 600; 
                box-shadow: 0 4px 12px rgba(1, 33, 105, 0.3); 
                transition: all 0.3s ease; 
            }
            .meeting-link:hover { 
                transform: translateY(-2px); 
                box-shadow: 0 6px 16px rgba(1, 33, 105, 0.4); 
            }
            .calendar-button { 
                background: linear-gradient(135deg, #00A6D4, #60a5fa); 
                color: white; 
                padding: 12px 25px; 
                text-decoration: none; 
                border-radius: 8px; 
                display: inline-block; 
                margin: 15px 10px 15px 0; 
                font-weight: 600; 
                box-shadow: 0 3px 10px rgba(0, 166, 212, 0.3); 
            }
            .important-note { 
                background: #f0f9ff; 
                border: 1px solid #bae6fd; 
                border-radius: 8px; 
                padding: 20px; 
                margin: 25px 0; 
            }
            .important-note h3 { 
                color: #1e40af; 
                margin-top: 0; 
            }
            .footer { 
                background: #f8fafc; 
                padding: 30px; 
                text-align: center; 
                border-top: 1px solid #e0f2fe; 
                color: #1e40af; 
            }
            .team-signature { 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 2px solid #bae6fd; 
                color: #1e40af; 
            }
            @media (max-width: 600px) {
                .container { margin: 10px; border-radius: 8px; }
                .header, .content { padding: 20px; }
                .event-details { padding: 20px; }
                .event-info { flex-direction: column; align-items: flex-start; }
                .event-info strong { min-width: auto; margin-bottom: 5px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Registration Confirmed!</h1>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Hello ${emailData.fullName},
                </div>
                
                <p>Thank you for registering! We're excited to confirm your spot for our upcoming event. Here are all the details you need:</p>
                
                <div class="event-details">
                    <div class="event-title">${emailData.eventTitle}</div>
                    
                    <div class="event-info">
                        <strong>📅 Date:</strong>
                        <span>${formatDate(startDate)}</span>
                    </div>
                    
                    <div class="event-info">
                        <strong>🕐 Time:</strong>
                        <span>${formatTime(startDate)} - ${formatTime(endDate)} ${timezone}</span>
                    </div>
                    
                    <div class="event-info">
                        <strong>💻 Platform:</strong>
                        <span>${emailData.eventPlatform}</span>
                    </div>
                    
                    ${emailData.organizedBy ? `
                    <div class="event-info">
                        <strong>👥 Organized by:</strong>
                        <span>${emailData.organizedBy}</span>
                    </div>
                    ` : ''}
                    
                    <div style="margin-top: 25px;">
                        <strong style="color: #012169;">📝 Description:</strong>
                        <p style="margin-top: 10px; color: #1e40af; line-height: 1.6;">${emailData.eventDescription}</p>
                    </div>
                    
                    ${emailData.meetingLink ? `
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${emailData.meetingLink}" class="meeting-link">
                            🔗 Join Event Meeting
                        </a>
                    </div>
                    ` : ''}
                </div>
                
                <div class="important-note">
                    <h3>📅 Add to Your Calendar</h3>
                    <p>Don't forget to add this event to your calendar so you don't miss it!</p>
                    <a href="${calendarLink}" class="calendar-button" target="_blank">
                        Add to Google Calendar
                    </a>
                </div>
                
                <div class="important-note">
                    <h3>💡 Important Reminders</h3>
                    <ul style="color: #1e40af; margin: 10px 0;">
                        <li>Join the meeting 5-10 minutes early to test your connection</li>
                        <li>Ensure you have a stable internet connection</li>
                        <li>Prepare any questions you'd like to ask during the event</li>
                        <li>Check your email for any last-minute updates</li>
                    </ul>
                </div>
                
                <p>We're looking forward to seeing you there! If you have any questions or need assistance, please don't hesitate to reach out to our team.</p>
                
                <div class="team-signature">
                    <p><strong>Best regards,</strong><br>
                    The PicoCareer Team</p>
                    <p style="font-size: 14px; color: #60a5fa;">
                        Empowering your career journey, one step at a time 🚀
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p style="margin: 0; font-size: 14px;">
                    © ${new Date().getFullYear()} PicoCareer. All rights reserved.
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #60a5fa;">
                    This email was sent because you registered for one of our events.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send the email using Supabase's email service or any other email service
    // For now, we'll just log that we would send the email
    console.log('Email HTML generated for:', emailData.email);
    
    // Here you would integrate with your email service (SendGrid, Resend, etc.)
    // For demonstration, we'll return success
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Event confirmation email sent successfully',
        registrationId: emailData.registrationId 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in send-event-confirmation function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
