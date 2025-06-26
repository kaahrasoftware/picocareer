
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

    const { eventTitle, eventDescription, eventStartTime, eventEndTime, eventPlatform, meetingLink, organizedBy, timezone = 'EST' } = emailData;
    
    const startDate = new Date(eventStartTime);
    const endDate = new Date(eventEndTime);
    
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

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Registration Confirmation</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1e3a8a;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            min-height: 100vh;
            padding: 20px;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(1, 33, 105, 0.15);
            overflow: hidden;
            border: 1px solid #bae6fd;
          }
          
          .header {
            background: linear-gradient(135deg, #012169 0%, #00A6D4 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: shimmer 3s ease-in-out infinite alternate;
          }
          
          @keyframes shimmer {
            from { transform: rotate(0deg); }
            to { transform: rotate(180deg); }
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .welcome-message {
            font-size: 18px;
            color: #1e3a8a;
            margin-bottom: 30px;
            text-align: center;
          }
          
          .event-card {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 2px solid #bae6fd;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            position: relative;
            overflow: hidden;
          }
          
          .event-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(135deg, #012169 0%, #00A6D4 100%);
          }
          
          .event-title {
            font-size: 24px;
            font-weight: 700;
            color: #012169;
            margin-bottom: 16px;
          }
          
          .event-description {
            color: #1e40af;
            margin-bottom: 24px;
            line-height: 1.7;
          }
          
          .event-details {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          
          .detail-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: white;
            border-radius: 8px;
            border: 1px solid #bae6fd;
          }
          
          .detail-icon {
            width: 20px;
            height: 20px;
            color: #00A6D4;
          }
          
          .detail-label {
            font-weight: 600;
            color: #012169;
            min-width: 80px;
          }
          
          .detail-value {
            color: #1e40af;
          }
          
          .meeting-link {
            background: linear-gradient(135deg, #012169 0%, #00A6D4 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 10px;
            text-align: center;
            margin: 30px 0;
            text-decoration: none;
            display: inline-block;
            width: 100%;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(1, 33, 105, 0.3);
          }
          
          .meeting-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(1, 33, 105, 0.4);
            text-decoration: none;
            color: white;
          }
          
          .important-info {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-left: 4px solid #00A6D4;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
          }
          
          .important-info h3 {
            color: #012169;
            font-size: 18px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .important-info ul {
            list-style: none;
            margin: 16px 0;
          }
          
          .important-info li {
            color: #1e40af;
            margin: 8px 0;
            padding-left: 20px;
            position: relative;
          }
          
          .important-info li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #00A6D4;
            font-weight: bold;
          }
          
          .footer {
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 30px;
            text-align: center;
            color: #64748b;
          }
          
          .footer p {
            margin: 8px 0;
          }
          
          .footer a {
            color: #00A6D4;
            text-decoration: none;
          }
          
          .footer a:hover {
            text-decoration: underline;
          }
          
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 12px;
            }
            
            .header, .content {
              padding: 30px 20px;
            }
            
            .event-card {
              padding: 20px;
            }
            
            .detail-row {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
            }
            
            .detail-label {
              min-width: auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Registration Confirmed!</h1>
            <p>You're all set for this exciting event</p>
          </div>
          
          <div class="content">
            <p class="welcome-message">
              Hi <strong>${emailData.fullName}</strong>,<br>
              Thank you for registering! We're excited to have you join us.
            </p>
            
            <div class="event-card">
              <h2 class="event-title">${eventTitle}</h2>
              <p class="event-description">${eventDescription}</p>
              
              <div class="event-details">
                <div class="detail-row">
                  <span class="detail-icon">📅</span>
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${formatDate(startDate)}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-icon">⏰</span>
                  <span class="detail-label">Time:</span>
                  <span class="detail-value">${formatTime(startDate)} - ${formatTime(endDate)} ${timezone}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-icon">💻</span>
                  <span class="detail-label">Platform:</span>
                  <span class="detail-value">${eventPlatform}</span>
                </div>
                
                ${organizedBy ? `
                <div class="detail-row">
                  <span class="detail-icon">👥</span>
                  <span class="detail-label">Host:</span>
                  <span class="detail-value">${organizedBy}</span>
                </div>
                ` : ''}
              </div>
              
              ${meetingLink ? `
              <a href="${meetingLink}" class="meeting-link">
                🚀 Join Event Now
              </a>
              ` : ''}
            </div>
            
            <div class="important-info">
              <h3>📋 Important Information</h3>
              <ul>
                <li>Please join the event 5-10 minutes early to ensure a smooth start</li>
                <li>Make sure you have a stable internet connection</li>
                <li>We recommend using headphones for better audio quality</li>
                <li>Have a pen and paper ready for notes</li>
                <li>If you have any questions, feel free to reach out to us</li>
              </ul>
            </div>
            
            <p style="text-align: center; color: #1e40af; font-size: 16px; margin-top: 30px;">
              We can't wait to see you there! 🌟
            </p>
          </div>
          
          <div class="footer">
            <p><strong>PicoCareer Team</strong></p>
            <p>Your partner in career development</p>
            <p>
              <a href="mailto:support@picocareer.com">support@picocareer.com</a> |
              <a href="https://picocareer.com">www.picocareer.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('Email HTML generated for:', emailData.email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        html: emailHtml,
        message: "Email template generated successfully" 
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
