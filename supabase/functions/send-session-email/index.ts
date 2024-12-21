import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  sessionId: string;
  type: 'confirmation' | 'reminder';
  minutesUntilStart?: number;
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, type, minutesUntilStart } = await req.json() as EmailRequest;

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
      throw new Error('Session not found');
    }

    const recipients = [session.mentor.email, session.mentee.email];
    let subject, html;

    if (type === 'confirmation') {
      subject = `Session Booked: ${session.session_type.type} with ${session.mentor.full_name}`;
      html = `
        <h2>Session Confirmation</h2>
        <p>Your ${session.session_type.type} session has been booked!</p>
        <p><strong>Date:</strong> ${new Date(session.scheduled_at).toLocaleString()}</p>
        <p><strong>Duration:</strong> ${session.session_type.duration} minutes</p>
        <p><strong>Mentor:</strong> ${session.mentor.full_name}</p>
        <p><strong>Mentee:</strong> ${session.mentee.full_name}</p>
        ${session.notes ? `<p><strong>Notes:</strong> ${session.notes}</p>` : ''}
      `;
    } else {
      subject = `Reminder: Upcoming Session in ${minutesUntilStart} minutes`;
      html = `
        <h2>Session Reminder</h2>
        <p>Your session starts in ${minutesUntilStart} minutes!</p>
        <p><strong>Date:</strong> ${new Date(session.scheduled_at).toLocaleString()}</p>
        <p><strong>Duration:</strong> ${session.session_type.duration} minutes</p>
        <p><strong>Mentor:</strong> ${session.mentor.full_name}</p>
        <p><strong>Mentee:</strong> ${session.mentee.full_name}</p>
      `;
    }

    // Send email using Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "PicoCareer <sessions@picocareer.com>",
        to: recipients,
        subject,
        html,
      }),
    });

    if (!emailRes.ok) {
      throw new Error('Failed to send email');
    }

    return new Response(JSON.stringify({ success: true }), {
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