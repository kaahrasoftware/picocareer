
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

/**
 * This function handles session operations:
 * - Rescheduling: Update session time and associated availability slots
 * - Cancellation: Cancel session and release availability slot
 */
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { action, sessionId, newTime, userId, reason } = await req.json();

    if (!sessionId || !userId || !action) {
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

    // Fetch session details and check permissions
    const { data: session, error: sessionError } = await supabase
      .from('mentor_sessions')
      .select(`
        id,
        scheduled_at,
        mentor_id,
        mentee_id,
        status,
        session_type_id,
        meeting_platform,
        meeting_link,
        mentee_phone_number,
        mentee_telegram_username,
        availability_slot_id,
        booked_session_id: mentor_availability!inner(booked_session_id)
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

    // Check if user is allowed to modify this session
    if (session.mentor_id !== userId && session.mentee_id !== userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "You don't have permission to modify this session",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check session settings for mentor
    const { data: settingsData } = await supabase
      .from("user_settings")
      .select("setting_value")
      .eq("profile_id", session.mentor_id)
      .eq("setting_type", "session_settings")
      .single();

    let settings = defaultSessionSettings;
    if (settingsData?.setting_value) {
      try {
        settings = JSON.parse(settingsData.setting_value);
      } catch (e) {
        console.error("Error parsing mentor settings:", e);
      }
    }

    // Check session status - can only modify scheduled sessions
    if (session.status !== "scheduled") {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Cannot ${action} a session that is ${session.status}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle RESCHEDULE action
    if (action === "reschedule") {
      if (!newTime) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "New time is required for rescheduling",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check if rescheduling is allowed
      if (session.mentee_id === userId && !settings.allowRescheduling) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Rescheduling is not allowed by the mentor",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check time limit for rescheduling
      const currentTime = new Date();
      const sessionTime = new Date(session.scheduled_at);
      const hoursDifference = (sessionTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

      if (session.mentee_id === userId && hoursDifference < settings.rescheduleTimeLimit) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `You can only reschedule sessions at least ${settings.rescheduleTimeLimit} hours before the scheduled time`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Execute rescheduling logic
      const result = await rescheduleSession(supabase, session, newTime);
      return new Response(
        JSON.stringify(result),
        {
          status: result.success ? 200 : 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle CANCEL action
    if (action === "cancel") {
      // Check if cancellation is allowed
      if (session.mentee_id === userId && !settings.allowCancellation) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Cancellation is not allowed by the mentor",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check time limit for cancellation
      const currentTime = new Date();
      const sessionTime = new Date(session.scheduled_at);
      const hoursDifference = (sessionTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

      if (session.mentee_id === userId && hoursDifference < settings.cancellationTimeLimit) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `You can only cancel sessions at least ${settings.cancellationTimeLimit} hours before the scheduled time`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Execute cancellation logic
      const result = await cancelSession(supabase, session, reason || "Cancelled by user");
      return new Response(
        JSON.stringify(result),
        {
          status: result.success ? 200 : 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
      );
    }

    // If we reached here, the action is not supported
    return new Response(
      JSON.stringify({
        success: false,
        error: `Unsupported action: ${action}`,
      }),
      {
        status: 400,
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

// Default session settings
const defaultSessionSettings = {
  allowRescheduling: true,
  rescheduleTimeLimit: 24,
  allowCancellation: true,
  cancellationTimeLimit: 24,
  autoAcceptBookings: false,
  bufferBetweenSessions: 15,
  defaultSessionDuration: 30,
  reminderTime: 30,
  defaultMeetingPlatform: 'Google Meet',
  customMeetingPlatform: '',
};

/**
 * Reschedule a session to a new time
 */
async function rescheduleSession(supabase, session, newTime) {
  try {
    // Begin database transaction
    const { data: result, error } = await supabase.rpc(
      "reschedule_session",
      {
        p_session_id: session.id,
        p_new_time: newTime
      }
    );

    if (error) {
      console.error("Error rescheduling session:", error);
      return { success: false, error: error.message };
    }

    // Create notifications for the change
    await createNotifications(
      supabase,
      [session.mentor_id, session.mentee_id],
      "Session Rescheduled",
      `Your session has been rescheduled to ${new Date(newTime).toLocaleString()}`,
      "session_update",
      `/profile?tab=calendar`
    );

    // Send email about rescheduling
    await sendReschedulingEmail(supabase, session.id);

    return { success: true, result };
  } catch (error) {
    console.error("Error in rescheduleSession:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancel a session and release the availability slot
 */
async function cancelSession(supabase, session, reason) {
  try {
    // Begin database transaction
    const { data: result, error } = await supabase.rpc(
      "cancel_session",
      {
        p_session_id: session.id,
        p_reason: reason
      }
    );

    if (error) {
      console.error("Error cancelling session:", error);
      return { success: false, error: error.message };
    }

    // Create notifications for the cancellation
    await createNotifications(
      supabase,
      [session.mentor_id, session.mentee_id],
      "Session Cancelled",
      `Your session scheduled for ${new Date(session.scheduled_at).toLocaleString()} has been cancelled. Reason: ${reason}`,
      "session_cancelled",
      `/profile?tab=calendar`
    );

    // Send email about cancellation
    await sendCancellationEmail(supabase, session.id, reason);

    return { success: true, result };
  } catch (error) {
    console.error("Error in cancelSession:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create in-app notifications for users
 */
async function createNotifications(
  supabase,
  userIds,
  title,
  message,
  type,
  actionUrl
) {
  try {
    const notifications = userIds.map(userId => ({
      profile_id: userId,
      title,
      message,
      type,
      action_url: actionUrl,
      category: "mentorship"
    }));

    const { error } = await supabase.from("notifications").insert(notifications);

    if (error) {
      console.error("Error creating notifications:", error);
    }
  } catch (error) {
    console.error("Error in createNotifications:", error);
  }
}

/**
 * Trigger email sending for rescheduled sessions
 */
async function sendReschedulingEmail(supabase, sessionId) {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-session-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({
        sessionId,
        type: 'reschedule'
      })
    });
  } catch (error) {
    console.error("Error sending reschedule email:", error);
  }
}

/**
 * Trigger email sending for cancelled sessions
 */
async function sendCancellationEmail(supabase, sessionId, reason) {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-session-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({
        sessionId,
        type: 'cancellation',
        reason
      })
    });
  } catch (error) {
    console.error("Error sending cancellation email:", error);
  }
}
