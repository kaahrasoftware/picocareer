import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to } = await req.json();

    if (!to) {
      throw new Error('Recipient email is required');
    }

    console.log('Sending password reset confirmation email to:', to);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY || '',
      },
      body: JSON.stringify({
        sender: {
          name: 'PicoCareer',
          email: 'noreply@picocareer.com'
        },
        replyTo: {
          name: 'PicoCareer Support',
          email: 'info@picocareer.com'
        },
        to: [{
          email: to,
        }],
        subject: 'Password Reset Successful - PicoCareer',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://picocareer.com/logo.png" alt="PicoCareer Logo" style="max-width: 200px; height: auto;">
            </div>
            <h1 style="color: #1f2937; text-align: center; margin-bottom: 20px;">Password Reset Successful</h1>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
              Your password has been successfully reset. You can now log in to your account with your new password.
            </p>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="https://picocareer.com/auth" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Log In to Your Account
              </a>
            </div>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
              If you did not request this password reset, please contact our support team immediately.
            </p>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; text-align: center; color: #6b7280;">
              <p style="margin: 0 0 10px 0;">Contact Us:</p>
              <p style="margin: 0 0 5px 0;">Email: info@picocareer.com</p>
              <p style="margin: 0;">Phone: +228 97 47 64 46</p>
            </div>
          </div>
        `,
        headers: {
          'X-Mailin-Tag': 'password-reset',
          'X-Mailin-Custom': 'password-reset:picocareer'
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }

    console.log('Password reset confirmation email sent successfully');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in password reset confirmation:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});