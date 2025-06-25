
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  registrationId: string;
}

// Event-specific styling (red theme for events)
const eventStyles = {
  primary: '#ef4444',
  secondary: '#b91c1c',
  accent: '#dc2626'
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { registrationId }: EmailRequest = await req.json();

    console.log('Fetching registration details for:', registrationId);

    // Get registration details with event and profile information
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select(`
        *,
        event:events(
          title,
          description,
          start_time,
          end_time,
          platform,
          meeting_link,
          organized_by
        ),
        profile:profiles(
          full_name,
          email
        )
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      console.error('Error fetching registration:', regError);
      throw new Error('Registration not found');
    }

    console.log('Registration details:', registration);
    console.log('Original event title:', JSON.stringify(registration.event.title));

    const eventDate = new Date(registration.event.start_time).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const eventTime = new Date(registration.event.start_time).toLocaleString('en-US', {
      timeStyle: 'short'
    });

    const eventEndTime = new Date(registration.event.end_time).toLocaleString('en-US', {
      timeStyle: 'short'
    });

    // Enhanced cleaning for the event title - handle all problematic characters
    const cleanEventTitle = registration.event.title
      .replace(/\\n/g, ' ')      // Handle escaped newlines
      .replace(/\n/g, ' ')       // Handle literal newlines  
      .replace(/\\r/g, ' ')      // Handle escaped carriage returns
      .replace(/\r/g, ' ')       // Handle literal carriage returns
      .replace(/\\t/g, ' ')      // Handle escaped tabs
      .replace(/\t/g, ' ')       // Handle literal tabs
      .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
      .trim()                    // Remove leading/trailing whitespace
      .substring(0, 100);        // Limit length for email best practices

    console.log('Cleaned event title:', JSON.stringify(cleanEventTitle));

    const recipientName = registration.first_name || 'Valued Attendee';
    const siteUrl = 'https://picocareer.com';
    const unsubscribeUrl = `${siteUrl}/unsubscribe`;

    // Generate calendar link (Google Calendar)
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(cleanEventTitle)}&dates=${new Date(registration.event.start_time).toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(registration.event.end_time).toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(registration.event.description)}&location=${encodeURIComponent(registration.event.platform)}`;

    // Professional email template
    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Registration Confirmed</title>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f9fafb; 
                     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; 
                      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden;">
            
            <!-- Header with event theme -->
            <div style="
              background: linear-gradient(135deg, ${eventStyles.primary}, ${eventStyles.secondary});
              color: white;
              padding: 32px 24px;
              text-align: center;
            ">
              <div style="font-size: 48px; margin-bottom: 8px;">🗓️</div>
              <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">
                Registration Confirmed!
              </h1>
              <p style="margin: 0; font-size: 16px; opacity: 0.9;">
                You're all set for this exciting event
              </p>
            </div>
            
            <!-- Main content -->
            <div style="padding: 32px 24px;">
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                Hello ${recipientName},
              </p>
              
              <p style="margin: 0 0 32px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                Great news! Your registration for <strong>${cleanEventTitle}</strong> has been confirmed. 
                We're excited to have you join us for this event.
              </p>

              <!-- Event details card -->
              <div style="
                background-color: #f9fafb;
                border-left: 4px solid ${eventStyles.accent};
                border-radius: 8px;
                padding: 24px;
                margin-bottom: 32px;
              ">
                <h2 style="margin: 0 0 16px 0; color: ${eventStyles.primary}; font-size: 20px; font-weight: 600;">
                  📅 Event Details
                </h2>
                
                <div style="margin-bottom: 12px;">
                  <strong style="color: #374151;">Event:</strong>
                  <span style="color: #6b7280; margin-left: 8px;">${cleanEventTitle}</span>
                </div>
                
                <div style="margin-bottom: 12px;">
                  <strong style="color: #374151;">Date & Time:</strong>
                  <span style="color: #6b7280; margin-left: 8px;">${eventDate}</span>
                </div>
                
                <div style="margin-bottom: 12px;">
                  <strong style="color: #374151;">Duration:</strong>
                  <span style="color: #6b7280; margin-left: 8px;">${eventTime} - ${eventEndTime}</span>
                </div>
                
                <div style="margin-bottom: 12px;">
                  <strong style="color: #374151;">Platform:</strong>
                  <span style="color: #6b7280; margin-left: 8px;">${registration.event.platform}</span>
                </div>
                
                ${registration.event.organized_by ? `
                  <div style="margin-bottom: 12px;">
                    <strong style="color: #374151;">Organized by:</strong>
                    <span style="color: #6b7280; margin-left: 8px;">${registration.event.organized_by}</span>
                  </div>
                ` : ''}
              </div>

              <!-- Event description -->
              ${registration.event.description ? `
                <div style="margin-bottom: 32px;">
                  <h3 style="margin: 0 0 16px 0; color: ${eventStyles.primary}; font-size: 18px; font-weight: 600;">
                    About This Event
                  </h3>
                  <div style="color: #4b5563; font-size: 14px; line-height: 1.6; background-color: #f9fafb; padding: 16px; border-radius: 6px;">
                    ${registration.event.description.replace(/\n/g, '<br>')}
                  </div>
                </div>
              ` : ''}

              <!-- Call-to-action buttons -->
              <div style="text-align: center; margin-bottom: 32px;">
                ${registration.event.meeting_link ? `
                  <a 
                    href="${registration.event.meeting_link}" 
                    style="
                      display: inline-block;
                      background-color: ${eventStyles.accent};
                      color: white;
                      padding: 14px 28px;
                      text-decoration: none;
                      border-radius: 6px;
                      font-weight: 600;
                      font-size: 16px;
                      margin: 8px;
                      box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
                    "
                  >
                    🚀 Join Event
                  </a>
                ` : ''}
                
                <a 
                  href="${calendarUrl}" 
                  style="
                    display: inline-block;
                    background-color: white;
                    color: ${eventStyles.accent};
                    border: 2px solid ${eventStyles.accent};
                    padding: 12px 26px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 16px;
                    margin: 8px;
                  "
                >
                  📅 Add to Calendar
                </a>
              </div>

              <!-- Next steps -->
              <div style="
                background-color: #fef3c7;
                border: 1px solid #fbbf24;
                border-radius: 6px;
                padding: 16px;
                margin-bottom: 24px;
              ">
                <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 16px; font-weight: 600;">
                  📋 Next Steps
                </h4>
                <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px;">
                  <li style="margin-bottom: 4px;">Save the event date and time in your calendar</li>
                  ${registration.event.meeting_link ? '<li style="margin-bottom: 4px;">Use the "Join Event" button above when it\'s time</li>' : ''}
                  <li style="margin-bottom: 4px;">Prepare any questions you'd like to ask</li>
                  <li>Check your email for any updates about the event</li>
                </ul>
              </div>

              <p style="margin: 0 0 16px 0; color: #374151; font-size: 14px; line-height: 1.5;">
                We look forward to seeing you at the event! If you have any questions, feel free to contact us.
              </p>
              
              <p style="margin: 0; color: #374151; font-size: 14px; font-weight: 500;">
                Best regards,<br>
                The PicoCareer Team
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px;">
                Visit our website for more career opportunities and events
              </p>
              <a 
                href="${siteUrl}" 
                style="
                  display: inline-block;
                  background-color: ${eventStyles.accent};
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: 500;
                  font-size: 14px;
                "
              >
                Visit PicoCareer
              </a>
            </div>

            <!-- Legal footer -->
            <div style="padding: 24px; text-align: center; color: #6b7280; font-size: 12px;">
              <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} PicoCareer. All rights reserved.</p>
              <a 
                href="${unsubscribeUrl}" 
                style="color: #6b7280; text-decoration: underline;"
              >
                Unsubscribe from notifications
              </a>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "PicoCareer <info@picocareer.com>",
      to: [registration.email],
      subject: `🗓️ Event Confirmed: ${cleanEventTitle}`,
      html: emailContent,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in send-event-confirmation function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);
