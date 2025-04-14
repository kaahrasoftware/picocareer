
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
    const { sessionId, senderId, customMessage, minutesBefore, isAutomated } = await req.json();

    // Require either sessionId (for automated reminders) or both sessionId and senderId (for manual reminders)
    if (!sessionId || (!isAutomated && !senderId)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required parameters",
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
        session_type:mentor_session_types!mentor_sessions_session_type_id_fkey(type, duration)
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

    // If not automated, verify sender is the mentor
    if (!isAutomated && session.mentor_id !== senderId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Only the mentor can send session reminders",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create in-app notification for mentee
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

    // Create message with appropriate wording based on whether it's automated or manual
    let reminderText = "";
    if (isAutomated && minutesBefore) {
      if (minutesBefore === 1440) {
        reminderText = `Reminder: You have a "${sessionType}" session with ${mentorName} scheduled for tomorrow at ${formattedTime}.`;
      } else {
        reminderText = `Reminder: You have a "${sessionType}" session with ${mentorName} scheduled in ${minutesBefore} minutes.`;
      }
    } else {
      reminderText = `Reminder: You have a "${sessionType}" session with ${mentorName} scheduled for ${formattedTime}.`;
    }

    const notificationMessage = customMessage 
      ? `${reminderText} ${customMessage}` 
      : reminderText;

    // Insert in-app notification
    const notification = {
      profile_id: session.mentee_id,
      title: "Session Reminder",
      message: notificationMessage,
      type: "session_reminder",
      category: "mentorship",
      action_url: `/profile?tab=calendar`
    };

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(notification);

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    // Send email reminder
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
        message: "Reminder sent successfully",
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
