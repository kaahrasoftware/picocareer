
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
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
    const { registrationId, email, fullName, eventTitle, eventDescription, 
            eventStartTime, eventEndTime, eventPlatform, meetingLink, organizedBy }: EmailRequest = await req.json();

    console.log('Fetching registration details for:', registrationId);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch registration details if not provided
    let registrationEmail = email;
    let registrationName = fullName;
    let eventDetails = {
      title: eventTitle,
      description: eventDescription,
      start_time: eventStartTime,
      end_time: eventEndTime,
      platform: eventPlatform,
      meeting_link: meetingLink,
      organized_by: organizedBy
    };

    if (!email || !eventTitle) {
      const { data: registration, error: regError } = await supabase
        .from('event_registrations')
        .select(`
          *,
          event:events (
            id,
            title,
            description,
            start_time,
            end_time,
            platform,
            meeting_link,
            organized_by
          )
        `)
        .eq('id', registrationId)
        .single();

      if (regError || !registration) {
        console.error('Registration not found:', regError);
        return new Response(
          JSON.stringify({ success: false, error: 'Registration not found' }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }

      registrationEmail = registration.email;
      registrationName = `${registration.first_name} ${registration.last_name}`;
      eventDetails = registration.event;
    }

    // Extract first name for personalization
    const firstName = registrationName?.split(' ')[0] || 'there';

    // Clean event title for subject
    const cleanEventTitle = eventDetails.title?.replace(/[^\w\s-]/g, '') || 'Event';

    // Format event times
    const startTime = eventDetails.start_time ? new Date(eventDetails.start_time) : null;
    const endTime = eventDetails.end_time ? new Date(eventDetails.end_time) : null;
    
    const formatTime = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    };

    // Generate Google Calendar link
    const generateCalendarLink = () => {
      if (!startTime || !endTime) return null;
      
      const formatCalendarDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: eventDetails.title || 'Event',
        dates: `${formatCalendarDate(startTime)}/${formatCalendarDate(endTime)}`,
        details: eventDetails.description || '',
        location: eventDetails.meeting_link || ''
      });

      return `https://calendar.google.com/calendar/render?${params.toString()}`;
    };

    const calendarLink = generateCalendarLink();

    // Enhanced professional email template with red theme
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Confirmation - ${eventDetails.title}</title>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
            
            <!-- Professional Header -->
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 40px 32px; text-align: center;">
              <div style="font-size: 56px; margin-bottom: 12px;">🗓️</div>
              <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Event Confirmation</h1>
              <p style="margin: 0; font-size: 18px; opacity: 0.9;">You're all set for your upcoming event!</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 32px;">
              <!-- Personalized Greeting -->
              <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin-top: 0; font-weight: 500;">
                Hello ${firstName},
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                Thank you for registering! We're excited to confirm your registration for the following event:
              </p>
              
              <!-- Event Details Card -->
              <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); border-radius: 12px; padding: 32px; margin: 32px 0; border: 2px solid #fecaca; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);">
                <h2 style="margin-top: 0; margin-bottom: 20px; color: #7f1d1d; font-size: 24px; font-weight: 700; line-height: 1.3;">
                  ${eventDetails.title}
                </h2>
                
                ${eventDetails.description ? `
                  <p style="color: #991b1b; font-size: 15px; line-height: 1.6; margin-bottom: 24px; background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #ef4444;">
                    ${eventDetails.description.substring(0, 250)}${eventDetails.description.length > 250 ? '...' : ''}
                  </p>
                ` : ''}
                
                <div style="margin: 24px 0;">
                  ${startTime ? `
                    <div style="margin: 12px 0; color: #7f1d1d; font-size: 15px; display: flex; align-items: center;">
                      <span style="font-weight: 600; min-width: 140px; display: inline-block;">📅 Date & Time:</span>
                      <span style="font-weight: 500;">${formatTime(startTime)}</span>
                    </div>
                  ` : ''}
                  
                  ${eventDetails.platform ? `
                    <div style="margin: 12px 0; color: #7f1d1d; font-size: 15px; display: flex; align-items: center;">
                      <span style="font-weight: 600; min-width: 140px; display: inline-block;">💻 Platform:</span>
                      <span style="font-weight: 500;">${eventDetails.platform}</span>
                    </div>
                  ` : ''}
                  
                  ${eventDetails.organized_by ? `
                    <div style="margin: 12px 0; color: #7f1d1d; font-size: 15px; display: flex; align-items: center;">
                      <span style="font-weight: 600; min-width: 140px; display: inline-block;">🏢 Organized by:</span>
                      <span style="font-weight: 500;">${eventDetails.organized_by}</span>
                    </div>
                  ` : ''}
                </div>
                
                <!-- Action Buttons -->
                <div style="margin-top: 32px; display: flex; gap: 16px; flex-wrap: wrap;">
                  ${eventDetails.meeting_link ? `
                    <a href="${eventDetails.meeting_link}" 
                       style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 14px 28px; 
                              text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; 
                              box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3); transition: all 0.2s;">
                      🚀 Join Event
                    </a>
                  ` : ''}
                  
                  ${calendarLink ? `
                    <a href="${calendarLink}" 
                       style="display: inline-block; background: white; color: #ef4444; padding: 14px 28px; 
                              text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;
                              border: 2px solid #ef4444; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);">
                      📅 Add to Calendar
                    </a>
                  ` : ''}
                </div>
              </div>
              
              <!-- Next Steps Section -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 32px 0; border-left: 4px solid #ef4444;">
                <h3 style="margin-top: 0; margin-bottom: 16px; color: #1f2937; font-size: 18px; font-weight: 600;">
                  📋 Next Steps
                </h3>
                <ul style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Save the event date and time in your calendar</li>
                  <li style="margin-bottom: 8px;">Test your internet connection and platform access beforehand</li>
                  <li style="margin-bottom: 8px;">Prepare any questions you'd like to ask during the event</li>
                  <li style="margin-bottom: 0;">Join the event 5 minutes early to ensure smooth participation</li>
                </ul>
              </div>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                We look forward to seeing you there! If you have any questions or need assistance, please don't hesitate to reach out to our support team.
              </p>
              
              <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin-bottom: 0; font-weight: 500;">
                Best regards,<br>
                <strong style="color: #ef4444;">The ${eventDetails.organized_by || 'PicoCareer'} Team</strong>
              </p>
            </div>
            
            <!-- Enhanced Footer -->
            <div style="background: linear-gradient(135deg, #f9fafb, #f3f4f6); padding: 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <div style="margin-bottom: 24px;">
                <a href="https://picocareer.com" style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 0 8px;">
                  Visit PicoCareer
                </a>
                <a href="https://picocareer.com/contact" style="display: inline-block; background: white; color: #ef4444; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; border: 2px solid #ef4444; margin: 0 8px;">
                  Contact Support
                </a>
              </div>
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                © ${new Date().getFullYear()} ${eventDetails.organized_by || 'PicoCareer'}. All rights reserved.<br>
                Professional development platform for career growth and networking.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend with enhanced subject
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PicoCareer Events <events@picocareer.com>',
        to: [registrationEmail],
        subject: `🗓️ Event Confirmation: ${cleanEventTitle}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Email sending failed:', emailResult);
      return new Response(
        JSON.stringify({ success: false, error: emailResult.message || 'Failed to send email' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log('Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("Error in send-event-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
};

serve(handler);
