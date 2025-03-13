
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { formatInTimeZone } from "npm:date-fns-tz";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  sessionId: string;
  type: 'confirmation' | 'cancellation' | 'update';
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { sessionId, type } = await req.json() as EmailRequest;
    console.log('Processing email request:', { sessionId, type });

    // Fetch session details with mentor and mentee information
    const { data: session, error: sessionError } = await supabase
      .from('mentor_sessions')
      .select(`
        *,
        mentor:profiles!mentor_id(*),
        mentee:profiles!mentee_id(*),
        session_type:mentor_session_types(*)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('Error fetching session:', sessionError);
      throw new Error('Session not found');
    }

    // Get mentor's timezone setting
    const { data: mentorSettings } = await supabase
      .from('user_settings')
      .select('setting_value')
      .eq('profile_id', session.mentor.id)
      .eq('setting_type', 'timezone')
      .single();

    // Get mentee's timezone setting
    const { data: menteeSettings } = await supabase
      .from('user_settings')
      .select('setting_value')
      .eq('profile_id', session.mentee.id)
      .eq('setting_type', 'timezone')
      .single();

    const mentorTimezone = mentorSettings?.setting_value || 'UTC';
    const menteeTimezone = menteeSettings?.setting_value || 'UTC';
    const scheduledDate = new Date(session.scheduled_at);

    const mentorTime = formatInTimeZone(scheduledDate, mentorTimezone, 'PPP p');
    const menteeTime = formatInTimeZone(scheduledDate, menteeTimezone, 'PPP p');

    let subject: string;
    let content: string;

    // Brand colors
    const primaryColor = '#0EA5E9'; // Cyan blue
    const secondaryColor = '#002366'; // Navy blue
    const lightGray = '#f8f9fa';
    const darkGray = '#4b5563';
    const borderColor = '#e5e7eb';

    // Common styles
    const baseStyles = `
      body { 
        font-family: 'Arial', sans-serif; 
        line-height: 1.6; 
        color: #374151; 
        margin: 0; 
        padding: 0; 
        background-color: #f9fafb; 
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: ${secondaryColor};
        color: white;
        padding: 24px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      .content {
        padding: 24px;
      }
      .session-time {
        background-color: ${lightGray};
        border-radius: 6px;
        padding: 16px;
        margin: 16px 0;
        border-left: 4px solid ${primaryColor};
      }
      .session-time h3 {
        margin-top: 0;
        color: ${secondaryColor};
        font-size: 16px;
      }
      .session-time p {
        margin: 8px 0;
        font-size: 14px;
      }
      .session-details {
        margin: 24px 0;
      }
      .detail-row {
        display: flex;
        margin-bottom: 12px;
        border-bottom: 1px solid ${borderColor};
        padding-bottom: 8px;
      }
      .detail-label {
        width: 120px;
        font-weight: 600;
        color: ${darkGray};
        font-size: 14px;
      }
      .detail-value {
        flex: 1;
        font-size: 14px;
      }
      .meeting-link {
        background-color: ${lightGray};
        border-radius: 6px;
        padding: 16px;
        margin: 16px 0;
        text-align: center;
      }
      .meeting-link a {
        display: inline-block;
        background-color: ${primaryColor};
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        text-decoration: none;
        font-weight: 600;
      }
      .footer {
        background-color: ${lightGray};
        padding: 16px;
        text-align: center;
        font-size: 12px;
        color: ${darkGray};
        border-top: 1px solid ${borderColor};
      }
      .actions {
        margin-top: 24px;
        text-align: center;
      }
      .actions a {
        display: inline-block;
        margin: 0 8px;
        padding: 8px 16px;
        background-color: white;
        border: 1px solid ${borderColor};
        border-radius: 4px;
        color: ${darkGray};
        text-decoration: none;
        font-size: 14px;
      }
    `;

    switch (type) {
      case 'confirmation':
        subject = `Session Booked: ${session.session_type.type} with ${session.mentor.full_name}`;
        content = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>${baseStyles}</style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Your Session is Confirmed!</h1>
              </div>
              <div class="content">
                <p>Hello ${session.mentee.full_name},</p>
                <p>Your ${session.session_type.type} session with ${session.mentor.full_name} has been successfully booked. We're excited for you to connect!</p>
                
                <div class="session-time">
                  <h3>📅 Session Time</h3>
                  <p><strong>Your time (${menteeTimezone}):</strong> ${menteeTime}</p>
                  <p><strong>Mentor's time (${mentorTimezone}):</strong> ${mentorTime}</p>
                  <p><strong>Duration:</strong> ${session.session_type.duration} minutes</p>
                </div>
                
                <div class="session-details">
                  <h3>Session Details</h3>
                  <div class="detail-row">
                    <div class="detail-label">Session Type:</div>
                    <div class="detail-value">${session.session_type.type}</div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-label">Mentor:</div>
                    <div class="detail-value">${session.mentor.full_name}</div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-label">Mentee:</div>
                    <div class="detail-value">${session.mentee.full_name}</div>
                  </div>
                  ${session.notes ? `
                  <div class="detail-row">
                    <div class="detail-label">Session Notes:</div>
                    <div class="detail-value">${session.notes}</div>
                  </div>
                  ` : ''}
                </div>
                
                ${session.meeting_link ? `
                <div class="meeting-link">
                  <h3>Join the Meeting</h3>
                  <p>Click the button below at the scheduled time to join your session:</p>
                  <a href="${session.meeting_link}" target="_blank">Join Session</a>
                </div>
                ` : ''}
                
                <div class="actions">
                  <p>Need to make changes?</p>
                  <a href="https://picocareer.com/profile/calendar" target="_blank">View Calendar</a>
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} PicoCareer. All rights reserved.</p>
                <p>If you have any questions, please contact us at info@picocareer.com</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'cancellation':
        subject = `Session Cancelled: ${session.session_type.type}`;
        content = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>${baseStyles}</style>
          </head>
          <body>
            <div class="container">
              <div class="header" style="background-color: #ef4444;">
                <h1>Session Cancellation Notice</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>We're writing to inform you that the following session has been cancelled:</p>
                
                <div class="session-time">
                  <h3>📅 Cancelled Session Details</h3>
                  <p><strong>Date:</strong> ${menteeTime}</p>
                  <p><strong>Duration:</strong> ${session.session_type.duration} minutes</p>
                  <p><strong>Session Type:</strong> ${session.session_type.type}</p>
                </div>
                
                <div class="session-details">
                  <div class="detail-row">
                    <div class="detail-label">Mentor:</div>
                    <div class="detail-value">${session.mentor.full_name}</div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-label">Mentee:</div>
                    <div class="detail-value">${session.mentee.full_name}</div>
                  </div>
                  ${session.notes ? `
                  <div class="detail-row">
                    <div class="detail-label">Cancellation Note:</div>
                    <div class="detail-value">${session.notes}</div>
                  </div>
                  ` : ''}
                </div>
                
                <div class="actions">
                  <p>Would you like to reschedule?</p>
                  <a href="https://picocareer.com/mentor/${session.mentor.id}" target="_blank">Book New Session</a>
                  <a href="https://picocareer.com/profile/calendar" target="_blank">View Calendar</a>
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} PicoCareer. All rights reserved.</p>
                <p>If you have any questions, please contact us at info@picocareer.com</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case 'update':
        subject = `Session Updated: ${session.session_type.type}`;
        content = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>${baseStyles}</style>
          </head>
          <body>
            <div class="container">
              <div class="header" style="background-color: #f59e0b;">
                <h1>Session Update Notice</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>We're writing to inform you that your session has been updated with the following details:</p>
                
                <div class="session-time">
                  <h3>📅 Updated Session Time</h3>
                  <p><strong>Your time (${menteeTimezone}):</strong> ${menteeTime}</p>
                  <p><strong>Mentor's time (${mentorTimezone}):</strong> ${mentorTime}</p>
                  <p><strong>Duration:</strong> ${session.session_type.duration} minutes</p>
                </div>
                
                <div class="session-details">
                  <h3>Session Details</h3>
                  <div class="detail-row">
                    <div class="detail-label">Session Type:</div>
                    <div class="detail-value">${session.session_type.type}</div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-label">Mentor:</div>
                    <div class="detail-value">${session.mentor.full_name}</div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-label">Mentee:</div>
                    <div class="detail-value">${session.mentee.full_name}</div>
                  </div>
                  ${session.notes ? `
                  <div class="detail-row">
                    <div class="detail-label">Session Notes:</div>
                    <div class="detail-value">${session.notes}</div>
                  </div>
                  ` : ''}
                </div>
                
                ${session.meeting_link ? `
                <div class="meeting-link">
                  <h3>Join the Meeting</h3>
                  <p>Click the button below at the scheduled time to join your session:</p>
                  <a href="${session.meeting_link}" target="_blank">Join Session</a>
                </div>
                ` : ''}
                
                <div class="actions">
                  <p>Need to make further changes?</p>
                  <a href="https://picocareer.com/profile/calendar" target="_blank">View Calendar</a>
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} PicoCareer. All rights reserved.</p>
                <p>If you have any questions, please contact us at info@picocareer.com</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;
    }

    const emailPayload = {
      from: "PicoCareer <info@picocareer.com>",
      to: [session.mentor.email, session.mentee.email],
      subject,
      html: content,
    };

    console.log('Sending email with payload:', emailPayload);

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const emailResText = await emailRes.text();
    console.log('Resend API response:', {
      status: emailRes.status,
      statusText: emailRes.statusText,
      body: emailResText
    });

    if (!emailRes.ok) {
      throw new Error(`Resend API error: ${emailResText}`);
    }

    const emailData = JSON.parse(emailResText);
    console.log('Email sent successfully:', emailData);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Email sent successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in send-session-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);
