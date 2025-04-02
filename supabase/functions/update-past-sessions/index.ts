
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find all scheduled sessions where:
    // 1. The scheduled time is in the past
    // 2. The status is still 'scheduled'
    // 3. They are not cancelled or marked as no_show
    const now = new Date().toISOString();
    
    const { data: pastSessions, error: queryError } = await supabaseClient
      .from('mentor_sessions')
      .select('id, scheduled_at, session_type_id, mentor:profiles!mentor_sessions_mentor_id_fkey(full_name), mentee:profiles!mentor_sessions_mentee_id_fkey(full_name)')
      .eq('status', 'scheduled')
      .lt('scheduled_at', now);

    if (queryError) {
      console.error('Error querying past sessions:', queryError);
      throw queryError;
    }

    console.log(`Found ${pastSessions?.length || 0} sessions to mark as completed`);

    // Filter sessions that have already ended (considering duration)
    const completedSessions = [];
    
    // Process each session
    for (const session of pastSessions || []) {
      try {
        // Get session type to determine duration
        const { data: sessionType } = await supabaseClient
          .from('mentor_session_types')
          .select('duration')
          .eq('id', session.session_type_id)
          .single();
          
        const duration = sessionType?.duration || 60; // Default to 60 minutes if not found
        const sessionEndTime = new Date(session.scheduled_at);
        sessionEndTime.setMinutes(sessionEndTime.getMinutes() + duration);
        
        // Only mark as completed if the session end time has passed
        if (new Date() > sessionEndTime) {
          completedSessions.push(session.id);
          
          // Create notifications for both mentor and mentee to remind about feedback
          const notifications = [
            {
              profile_id: session.mentor.id,
              title: 'Session Completed',
              message: `Your session with ${session.mentee.full_name} has been completed. Please provide feedback!`,
              type: 'session_completed',
              action_url: `/feedback/${session.id}?type=mentor_feedback`,
              category: 'mentorship'
            },
            {
              profile_id: session.mentee.id,
              title: 'Session Completed',
              message: `Your session with ${session.mentor.full_name} has been completed. Please provide feedback!`,
              type: 'session_completed',
              action_url: `/feedback/${session.id}?type=mentee_feedback`,
              category: 'mentorship'
            }
          ];
          
          // Insert notifications
          await supabaseClient
            .from('notifications')
            .insert(notifications);
        }
      } catch (error) {
        console.error(`Error processing session ${session.id}:`, error);
      }
    }

    // Update all completed sessions in one batch
    const { error: updateError } = await supabaseClient
      .from('mentor_sessions')
      .update({ status: 'completed' })
      .in('id', completedSessions);

    if (updateError) {
      console.error('Error updating session status:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${completedSessions.length} sessions to completed status`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in update-past-sessions function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
