
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

  // Check if request is from an authorized admin
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
    );
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify this is an admin user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();
      
    if (profileError || profile?.user_type !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Run the migration
    const results = {
      noShows: 0,
      errors: []
    };

    // 1. Find all feedback records with did_not_show_up = true
    const { data: noShowFeedback, error: feedbackError } = await supabaseClient
      .from('session_feedback')
      .select('session_id, created_at')
      .eq('did_not_show_up', true);
      
    if (feedbackError) {
      throw feedbackError;
    }
    
    console.log(`Found ${noShowFeedback?.length || 0} no-show feedback records`);
    
    if (noShowFeedback && noShowFeedback.length > 0) {
      const sessionIds = noShowFeedback.map(f => f.session_id);
      
      // Update all these sessions to have no_show status
      const { data, error: updateError } = await supabaseClient
        .from('mentor_sessions')
        .update({ status: 'no_show' })
        .in('id', sessionIds);
        
      if (updateError) {
        results.errors.push(updateError.message);
      } else {
        results.noShows = sessionIds.length;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Migration complete. Updated ${results.noShows} sessions to no_show status.`,
        errors: results.errors
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in one-time-no-show-sync function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
