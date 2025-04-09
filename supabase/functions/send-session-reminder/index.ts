
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  sessionId: string;
  senderId: string;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, senderId } = await req.json() as ReminderRequest;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    if (!senderId) {
      throw new Error('Sender ID is required');
    }

    // Fetch session details with explicit column selection
    const { data: session, error: sessionError } = await supabase
      .from('mentor_sessions')
      .select(`
        id,
        mentor_id,
        mentee_id,
        session_type_id,
        scheduled_at,
        notes,
        meeting_platform,
        meeting_link,
        calendar_event_id,
        mentor:profiles!mentor_sessions_mentor_id_fkey(id, full_name),
        mentee:profiles!mentor_sessions_mentee_id_fkey(id, full_name),
        session_type:mentor_session_types(type, duration)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    // Verify that the sender is the mentor
    if (session.mentor_id !== senderId) {
      throw new Error('Only mentors can send session reminders');
    }

    // Format session date for display
    const sessionDate = new Date(session.scheduled_at);
    const formattedDate = sessionDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const formattedTime = sessionDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Create meeting link information
    const meetingLinkInfo = session.meeting_link 
      ? `\n<div style="margin-top: 10px;"><a href="${session.meeting_link}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">Join now</a></div>`
      : session.meeting_platform === 'google_meet' 
        ? '\nA Google Meet link will be sent before the session.'
        : '';

    // Create in-app notification
    const notification = {
      profile_id: session.mentee_id,
      title: 'Session Reminder',
      message: `Your ${session.session_type.type} session with ${session.mentor.full_name} is scheduled for ${formattedDate} at ${formattedTime}.${meetingLinkInfo ? ' Click to join.' : ''}`,
      type: 'session_reminder',
      action_url: '/profile?tab=calendar',
      category: 'session'
    };

    // Insert notification
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notification);

    if (notificationError) {
      throw new Error('Failed to create notification');
    }

    // Send email reminder
    await fetch(`${SUPABASE_URL}/functions/v1/send-session-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        sessionId,
        type: 'reminder',
        fromEmail: 'info@picocareer.com'
      })
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-session-reminder function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);
