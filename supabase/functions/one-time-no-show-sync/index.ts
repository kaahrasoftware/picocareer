
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      throw new Error("Missing Authorization header");
    }

    // Setup Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the token
    const token = authorization.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid token");
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profileError || profile.user_type !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Find past sessions that should be marked as no-show
    // Sessions that are still 'scheduled' but the scheduled time + duration has passed
    const { data: pastSessions, error: sessionsError } = await supabase
      .from("mentor_sessions")
      .select(`
        id,
        scheduled_at,
        status,
        session_type:session_type_id(duration)
      `)
      .eq("status", "scheduled")
      .lt("scheduled_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Sessions at least 24 hours old

    if (sessionsError) {
      throw sessionsError;
    }

    // Filter sessions that are past their scheduled time + duration
    const sessionsToUpdate = pastSessions.filter((session) => {
      const scheduledTime = new Date(session.scheduled_at).getTime();
      const endTime = scheduledTime + (session.session_type?.duration || 60) * 60 * 1000;
      return endTime < Date.now();
    });

    if (sessionsToUpdate.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No sessions needed updating",
          count: 0 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    // Update sessions to no_show status
    const { error: updateError } = await supabase
      .from("mentor_sessions")
      .update({ status: "no_show" })
      .in("id", sessionsToUpdate.map((s) => s.id));

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        message: `Updated ${sessionsToUpdate.length} sessions to no-show status`,
        count: sessionsToUpdate.length 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
