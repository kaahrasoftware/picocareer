
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { sessionId, senderId, customMessage } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing session ID",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch session details
    const { data: session, error: sessionError } = await supabase
      .from('mentor_sessions')
      .select(`
        id,
        scheduled_at,
        mentor_id,
        mentee_id,
        mentor:profiles!mentor_sessions_mentor_id_fkey(id, full_name, email),
        mentee:profiles!mentor_sessions_mentee_id_fkey(id, full_name, email),
        session_type:mentor_session_types!mentor_sessions_session_type_id_fkey(type, duration),
        meeting_link,
        meeting_platform
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error("Error fetching session:", sessionError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Session not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create in-app notifications
    const sessionTime = new Date(session.scheduled_at);
    const mentorName = session.mentor.full_name;
    const menteeName = session.mentee.full_name;
    const sessionType = session.session_type.type;
    const formattedTime = sessionTime.toLocaleString('en-US', {
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Add meeting link info if available
    const meetingInfo = session.meeting_link 
      ? `\n\nJoin here: ${session.meeting_link}` 
      : session.meeting_platform 
        ? `\n\nPlatform: ${session.meeting_platform}` 
        : '';

    // Create notification messages with custom message included
    const mentorMessage = `Reminder: Your "${sessionType}" session with ${menteeName} is scheduled for ${formattedTime}. ${customMessage || ''}${meetingInfo}`;
    const menteeMessage = `Reminder: Your "${sessionType}" session with ${mentorName} is scheduled for ${formattedTime}. ${customMessage || ''}${meetingInfo}`;

    // Insert in-app notifications for both mentor and mentee
    const notifications = [
      {
        profile_id: session.mentor_id,
        title: "Session Reminder",
        message: mentorMessage,
        type: "session_reminder",
        category: "mentorship",
        action_url: `/profile?tab=calendar`
      },
      {
        profile_id: session.mentee_id,
        title: "Session Reminder",
        message: menteeMessage,
        type: "session_reminder",
        category: "mentorship",
        action_url: `/profile?tab=calendar`
      }
    ];

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (notificationError) {
      console.error("Error creating notifications:", notificationError);
    }

    // Send email reminders
    await supabase.functions.invoke('send-session-email', {
      body: { 
        sessionId,
        type: 'reminder',
        customMessage
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Reminders sent successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
