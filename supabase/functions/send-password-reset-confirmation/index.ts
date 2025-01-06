import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to }: EmailRequest = await req.json();
    console.log("Sending password reset confirmation email to:", to);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "PicoCareer <no-reply@picocareer.com>",
        to: [to],
        subject: "Password Reset Successful - PicoCareer",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #1f2937; margin-bottom: 10px;">Password Reset Successful</h1>
              <div style="width: 100%; height: 2px; background-color: #e5e7eb; margin: 20px 0;"></div>
            </div>
            
            <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 16px;">
                Your password has been successfully reset. You can now sign in to your account using your new password.
              </p>
              
              <div style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; margin: 20px 0;">
                <p style="color: #dc2626; margin: 0; font-weight: 500;">
                  🔐 Security Notice: If you did not initiate this password change, please contact our support team immediately.
                </p>
              </div>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 24px;">
                For your security, we recommend:
              </p>
              <ul style="color: #4b5563; font-size: 16px; line-height: 24px;">
                <li>Using unique passwords for different accounts</li>
                <li>Enabling two-factor authentication when possible</li>
                <li>Never sharing your password with others</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">
                Best regards,<br>
                The PicoCareer Team
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 12px;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-password-reset-confirmation:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send confirmation email" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);