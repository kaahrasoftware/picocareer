import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find completed sessions without feedback that ended in the last hour
    const { data: sessions, error: sessionsError } = await supabaseClient
      .from('mentor_sessions')
      .select(`
        id,
        mentor:profiles!mentor_sessions_mentor_id_fkey(id, full_name),
        mentee:profiles!mentor_sessions_mentee_id_fkey(id, full_name)
      `)
      .eq('status', 'completed')
      .gt('scheduled_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .lt('scheduled_at', new Date().toISOString())
      .not('id', 'in', (
        supabaseClient
          .from('session_feedback')
          .select('session_id')
      ));

    if (sessionsError) throw sessionsError;

    // Send notifications for each session
    const notifications = [];
    for (const session of sessions) {
      // Notification for mentor
      notifications.push({
        profile_id: session.mentor.id,
        title: 'Session Feedback Request',
        message: `Please provide feedback for your session with ${session.mentee.full_name}`,
        type: 'session_reminder',
        action_url: `/feedback/${session.id}?type=mentor_feedback`,
        category: 'mentorship'
      });

      // Notification for mentee
      notifications.push({
        profile_id: session.mentee.id,
        title: 'Session Feedback Request',
        message: `Please provide feedback for your session with ${session.mentor.full_name}`,
        type: 'session_reminder',
        action_url: `/feedback/${session.id}?type=mentee_feedback`,
        category: 'mentorship'
      });
    }

    if (notifications.length > 0) {
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;
    }

    return new Response(
      JSON.stringify({ success: true, count: notifications.length }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});