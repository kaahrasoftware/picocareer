
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
    console.log("Starting sync-session-feedback-status function");
    
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Sync no-show feedback records with session status
    const { noShowSynced, noShowError } = await syncNoShowFeedback(supabaseClient);
    
    // 2. Find inconsistencies for monitoring purposes
    const { inconsistencies, inconsistencyError } = await checkInconsistencies(supabaseClient);
    
    // Log detailed results for monitoring
    console.log(`Sync results: Updated ${noShowSynced} sessions to no_show status`);
    if (inconsistencies && inconsistencies.length > 0) {
      console.log(`Found ${inconsistencies.length} inconsistent session statuses`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        noShowSynced,
        noShowError,
        inconsistenciesFound: inconsistencies.length,
        inconsistencyError,
        execution_time: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in sync-session-feedback-status function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        execution_time: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

// Sync no-show feedback with session status
async function syncNoShowFeedback(supabase) {
  try {
    console.log("Running syncNoShowFeedback...");
    
    // Find all feedback records with did_not_show_up = true
    const { data: noShowFeedback, error: feedbackError } = await supabase
      .from('session_feedback')
      .select('session_id')
      .eq('did_not_show_up', true);
      
    if (feedbackError) {
      console.error('Error fetching no-show feedback:', feedbackError);
      return { noShowSynced: 0, noShowError: feedbackError.message };
    }
    
    if (!noShowFeedback || noShowFeedback.length === 0) {
      console.log('No no-show feedback records found');
      return { noShowSynced: 0 };
    }
    
    const sessionIds = noShowFeedback.map(f => f.session_id);
    console.log(`Found ${sessionIds.length} sessions with no-show feedback`);
    
    // Get current status of these sessions
    const { data: currentSessions, error: queryError } = await supabase
      .from('mentor_sessions')
      .select('id, status')
      .in('id', sessionIds);
      
    if (queryError) {
      console.error('Error checking current session status:', queryError);
      return { noShowSynced: 0, noShowError: queryError.message };
    }
    
    // Count how many need updating
    const sessionsNeedingUpdate = currentSessions.filter(s => s.status !== 'no_show');
    console.log(`${sessionsNeedingUpdate.length} of ${currentSessions.length} sessions need status update`);
    
    if (sessionsNeedingUpdate.length === 0) {
      return { noShowSynced: 0 };
    }
    
    // Update these sessions to have no_show status if they're not already marked
    const { data, error: updateError } = await supabase
      .from('mentor_sessions')
      .update({ status: 'no_show' })
      .in('id', sessionIds)
      .neq('status', 'no_show');
      
    if (updateError) {
      console.error('Error updating session statuses:', updateError);
      return { noShowSynced: 0, noShowError: updateError.message };
    }
    
    console.log(`Synced ${sessionsNeedingUpdate.length} sessions to no_show status based on feedback`);
    return { noShowSynced: sessionsNeedingUpdate.length };
  } catch (error) {
    console.error('Error syncing no-show sessions:', error);
    return { noShowSynced: 0, noShowError: error.message };
  }
}

// Check for inconsistencies between feedback and session status
async function checkInconsistencies(supabase) {
  try {
    console.log("Running checkInconsistencies...");
    
    // Find sessions where feedback says no-show but status isn't no_show
    const { data: inconsistentSessions, error } = await supabase
      .from('session_feedback')
      .select(`
        id,
        session_id,
        did_not_show_up,
        sessions:mentor_sessions!inner(
          id,
          status,
          scheduled_at
        )
      `)
      .eq('did_not_show_up', true)
      .neq('sessions.status', 'no_show');
      
    if (error) {
      console.error('Error checking inconsistencies:', error);
      return { inconsistencies: [], inconsistencyError: error.message };
    }
    
    if (inconsistentSessions && inconsistentSessions.length > 0) {
      console.log(`Found ${inconsistentSessions.length} inconsistent session statuses:`);
      inconsistentSessions.forEach(session => {
        console.log(`  Session ${session.session_id} has no-show feedback but status is ${session.sessions.status}`);
      });
    } else {
      console.log('No inconsistencies found');
    }
    
    return { inconsistencies: inconsistentSessions || [] };
  } catch (error) {
    console.error('Error checking inconsistencies:', error);
    return { inconsistencies: [], inconsistencyError: error.message };
  }
}
