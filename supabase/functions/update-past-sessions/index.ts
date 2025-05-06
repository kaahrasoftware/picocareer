
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
    // 3. They are not cancelled or marked as no_show already
    const now = new Date().toISOString();
    
    const { data: pastSessions, error: queryError } = await supabaseClient
      .from('mentor_sessions')
      .select('id, scheduled_at, session_type_id, mentor:profiles!mentor_sessions_mentor_id_fkey(id, full_name), mentee:profiles!mentor_sessions_mentee_id_fkey(id, full_name)')
      .eq('status', 'scheduled')  // Only get sessions still marked as scheduled
      .lt('scheduled_at', now);

    if (queryError) {
      console.error('Error querying past sessions:', queryError);
      throw queryError;
    }

    console.log(`Found ${pastSessions?.length || 0} sessions to check for completion status`);

    // Process each session
    const completedSessions = [];
    const sessionsToCheck = [];
    
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
          // First check if there's a no-show feedback for this session
          const { data: feedback } = await supabaseClient
            .from('session_feedback')
            .select('id, did_not_show_up')
            .eq('session_id', session.id)
            .eq('did_not_show_up', true)
            .maybeSingle();
            
          if (feedback && feedback.did_not_show_up) {
            // Update this session as no_show
            await supabaseClient
              .from('mentor_sessions')
              .update({ status: 'no_show' })
              .eq('id', session.id);
              
            console.log(`Session ${session.id} marked as no_show based on feedback`);
          } else {
            // No no-show feedback, mark as completed
            completedSessions.push(session.id);
            sessionsToCheck.push(session);
          }
          
          // Create notifications for both mentor and mentee to remind about feedback
          // (We'll still create notifications even for no_show sessions, as feedback is still valuable)
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
    if (completedSessions.length > 0) {
      const { error: updateError } = await supabaseClient
        .from('mentor_sessions')
        .update({ status: 'completed' })
        .in('id', completedSessions);

      if (updateError) {
        console.error('Error updating session status:', updateError);
        throw updateError;
      }
    }

    // Now create a sync function to update all sessions with no-show feedback
    // This handles the case where feedback was submitted before this fix was implemented
    const syncResults = await syncNoShowSessions(supabaseClient);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${completedSessions.length} sessions to completed status`,
        noShowSynced: syncResults.synced,
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

// Helper function to sync no-show sessions with feedback
async function syncNoShowSessions(supabase) {
  try {
    // Find all feedback records with did_not_show_up = true
    const { data: noShowFeedback, error: feedbackError } = await supabase
      .from('session_feedback')
      .select('session_id')
      .eq('did_not_show_up', true);
      
    if (feedbackError) {
      console.error('Error fetching no-show feedback:', feedbackError);
      return { synced: 0, error: feedbackError.message };
    }
    
    if (!noShowFeedback || noShowFeedback.length === 0) {
      console.log('No no-show feedback records found');
      return { synced: 0 };
    }
    
    const sessionIds = noShowFeedback.map(f => f.session_id);
    
    // Update these sessions to have no_show status
    // Only update if they're not already no_show to avoid redundant updates
    const { data, error: updateError } = await supabase
      .from('mentor_sessions')
      .update({ status: 'no_show' })
      .in('id', sessionIds)
      .neq('status', 'no_show');
      
    if (updateError) {
      console.error('Error updating session statuses:', updateError);
      return { synced: 0, error: updateError.message };
    }
    
    console.log(`Synced ${sessionIds.length} sessions to no_show status based on feedback`);
    return { synced: sessionIds.length };
  } catch (error) {
    console.error('Error syncing no-show sessions:', error);
    return { synced: 0, error: error.message };
  }
}
