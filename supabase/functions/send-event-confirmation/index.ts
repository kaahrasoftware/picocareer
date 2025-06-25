
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

    console.log('Registration details:', {
      registrationId,
      email: registrationEmail,
      fullName: registrationName,
      eventTitle: eventDetails.title,
      eventStartTime: eventDetails.start_time,
      eventEndTime: eventDetails.end_time,
      eventPlatform: eventDetails.platform,
      meetingLink: eventDetails.meeting_link,
      organizedBy: eventDetails.organized_by
    });

    // Clean event title for subject
    const cleanEventTitle = eventDetails.title?.replace(/[^\w\s-]/g, '') || 'Event';
    console.log('Original event title:', eventDetails.title);
    console.log('Cleaned event title:', cleanEventTitle);

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

    // Generate simple red-themed email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Confirmation</title>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 32px 24px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 8px;">🎉</div>
              <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">Event Confirmation</h1>
              <p style="margin: 0; font-size: 16px; opacity: 0.8;">You're all set for the event!</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px 24px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-top: 0;">
                Hello ${registrationName},
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.5;">
                Thank you for registering! We're excited to confirm your registration for the following event:
              </p>
              
              <!-- Event Details Card -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0; border-left: 4px solid #ef4444;">
                <h2 style="margin-top: 0; margin-bottom: 16px; color: #1f2937; font-size: 20px; font-weight: 600;">
                  ${eventDetails.title}
                </h2>
                
                ${eventDetails.description ? `
                  <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 16px;">
                    ${eventDetails.description.substring(0, 200)}${eventDetails.description.length > 200 ? '...' : ''}
                  </p>
                ` : ''}
                
                <div style="margin: 16px 0;">
                  ${startTime ? `
                    <p style="margin: 8px 0; color: #374151; font-size: 14px;">
                      <strong>📅 Date & Time:</strong> ${formatTime(startTime)}
                    </p>
                  ` : ''}
                  
                  ${eventDetails.platform ? `
                    <p style="margin: 8px 0; color: #374151; font-size: 14px;">
                      <strong>💻 Platform:</strong> ${eventDetails.platform}
                    </p>
                  ` : ''}
                  
                  ${eventDetails.organized_by ? `
                    <p style="margin: 8px 0; color: #374151; font-size: 14px;">
                      <strong>🏢 Organized by:</strong> ${eventDetails.organized_by}
                    </p>
                  ` : ''}
                </div>
                
                ${eventDetails.meeting_link ? `
                  <div style="margin-top: 20px;">
                    <a href="${eventDetails.meeting_link}" 
                       style="display: inline-block; background-color: #ef4444; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
                      Join Event
                    </a>
                  </div>
                ` : ''}
              </div>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.5;">
                We look forward to seeing you there! If you have any questions, please don't hesitate to reach out.
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 0;">
                Best regards,<br>
                <strong>The ${eventDetails.organized_by || 'Event'} Team</strong>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                © ${new Date().getFullYear()} ${eventDetails.organized_by || 'Event Platform'}. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PicoCareer Events <events@picocareer.com>',
        to: [registrationEmail],
        subject: `Event Confirmation: ${cleanEventTitle}`,
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
