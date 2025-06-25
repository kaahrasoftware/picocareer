
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { format } from "https://deno.land/x/date_fns@v2.22.1/index.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { registrationId, eventId, email, fullName } = await req.json()
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError) {
      throw new Error(`Failed to fetch event: ${eventError.message}`)
    }

    // Format event date and time with timezone
    const eventDate = format(new Date(event.start_time), 'EEEE, MMMM do, yyyy')
    const eventTime = format(new Date(event.start_time), 'h:mm a')
    const eventEndTime = format(new Date(event.end_time), 'h:mm a')
    const eventTimezone = event.timezone || 'EST'
    const timeDisplay = `${eventTime} - ${eventEndTime} ${eventTimezone}`

    // Blue-themed event styling
    const eventStyles = {
      primary: '#012169',      // Dark blue
      secondary: '#00A6D4',    // Light blue  
      accent: '#0077BE',       // Medium blue
      background: 'linear-gradient(135deg, #012169 0%, #0077BE 50%, #00A6D4 100%)',
      lightBackground: '#f0f8ff'
    }

    // Construct the email HTML with blue theme and company logo
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Confirmation - ${event.title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(1, 33, 105, 0.1);
        }
        .header {
            background: ${eventStyles.background};
            padding: 30px;
            text-align: center;
            color: white;
        }
        .logo {
            margin-bottom: 20px;
        }
        .logo img {
            height: 60px;
            width: auto;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0;
            font-size: 18px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: ${eventStyles.primary};
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #555;
        }
        .event-card {
            background: ${eventStyles.lightBackground};
            border: 2px solid ${eventStyles.secondary};
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
        }
        .event-title {
            font-size: 24px;
            font-weight: 700;
            color: ${eventStyles.primary};
            margin-bottom: 20px;
        }
        .event-details {
            display: grid;
            gap: 15px;
        }
        .detail-item {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 16px;
        }
        .detail-icon {
            width: 20px;
            height: 20px;
            background: ${eventStyles.accent};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            flex-shrink: 0;
        }
        .detail-text {
            color: #333;
        }
        .detail-label {
            font-weight: 600;
            color: ${eventStyles.primary};
        }
        .cta-section {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            margin: 10px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        .btn-primary {
            background: ${eventStyles.primary};
            color: white;
        }
        .btn-primary:hover {
            background: ${eventStyles.accent};
            transform: translateY(-2px);
        }
        .btn-secondary {
            background: white;
            color: ${eventStyles.primary};
            border: 2px solid ${eventStyles.primary};
        }
        .btn-secondary:hover {
            background: ${eventStyles.primary};
            color: white;
        }
        .next-steps {
            background: #f8f9fa;
            border-left: 4px solid ${eventStyles.secondary};
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }
        .next-steps h3 {
            color: ${eventStyles.primary};
            margin: 0 0 15px;
        }
        .next-steps ul {
            margin: 0;
            padding-left: 20px;
        }
        .next-steps li {
            margin-bottom: 8px;
            color: #555;
        }
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
        }
        .footer a {
            color: ${eventStyles.primary};
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .btn {
                display: block;
                margin: 10px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <img src="https://wurdmlkfkzuivvwxjmxk.supabase.co/storage/v1/object/public/images/email-logos/66e432a2-6061-4f7f-ada7-69c35feecf41.png" alt="PicoCareer Logo" style="height: 60px; width: auto;">
            </div>
            <h1>🎉 You're Registered!</h1>
            <p>Your spot is confirmed</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hi ${fullName},
            </div>
            
            <div class="message">
                Great news! Your registration for <strong>${event.title}</strong> has been confirmed. We're excited to have you join us for this valuable learning experience.
            </div>
            
            <div class="event-card">
                <div class="event-title">${event.title}</div>
                <div class="event-details">
                    <div class="detail-item">
                        <div class="detail-icon">📅</div>
                        <div class="detail-text">
                            <span class="detail-label">Date:</span> ${eventDate}
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-icon">🕐</div>
                        <div class="detail-text">
                            <span class="detail-label">Time:</span> ${timeDisplay}
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-icon">🌐</div>
                        <div class="detail-text">
                            <span class="detail-label">Platform:</span> ${event.platform}
                        </div>
                    </div>
                    ${event.facilitator ? `
                    <div class="detail-item">
                        <div class="detail-icon">👨‍🏫</div>
                        <div class="detail-text">
                            <span class="detail-label">Facilitator:</span> ${event.facilitator}
                        </div>
                    </div>
                    ` : ''}
                    ${event.organized_by ? `
                    <div class="detail-item">
                        <div class="detail-icon">🏢</div>
                        <div class="detail-text">
                            <span class="detail-label">Organized by:</span> ${event.organized_by}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="cta-section">
                ${event.meeting_link ? `
                <a href="${event.meeting_link}" class="btn btn-primary">
                    🚀 Join Event
                </a>
                ` : ''}
                <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${format(new Date(event.start_time), 'yyyyMMdd\'T\'HHmmss')}/${format(new Date(event.end_time), 'yyyyMMdd\'T\'HHmmss')}" class="btn btn-secondary">
                    📅 Add to Calendar
                </a>
            </div>
            
            <div class="next-steps">
                <h3>Next Steps</h3>
                <ul>
                    <li>Mark your calendar for ${eventDate} at ${timeDisplay}</li>
                    <li>Ensure you have a stable internet connection</li>
                    <li>Join the event 5 minutes early for the best experience</li>
                    <li>Prepare any questions you'd like to ask during the session</li>
                    ${event.meeting_link ? '<li>Use the "Join Event" button above when it\'s time</li>' : ''}
                </ul>
            </div>
            
            <div class="message">
                If you have any questions or need to make changes to your registration, please don't hesitate to reach out to our support team.
            </div>
        </div>
        
        <div class="footer">
            <p><strong>PicoCareer</strong></p>
            <p>Empowering your career journey, one step at a time</p>
            <p>
                <a href="mailto:support@picocareer.com">support@picocareer.com</a> | 
                <a href="https://picocareer.com">picocareer.com</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This email was sent because you registered for an event on PicoCareer.
            </p>
        </div>
    </div>
</body>
</html>
    `

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PicoCareer Events <events@picocareer.com>',
        to: [email],
        subject: `✅ Registration Confirmed: ${event.title}`,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      throw new Error(`Failed to send email: ${errorText}`)
    }

    const emailResult = await emailResponse.json()

    // Update email log
    await supabase
      .from('event_email_logs')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('registration_id', registrationId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResult.id,
        message: 'Confirmation email sent successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending confirmation email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send confirmation email' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
