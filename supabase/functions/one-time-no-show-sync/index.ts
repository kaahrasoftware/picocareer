
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

    // Calculate cutoff time (sessions that ended at least 15 minutes ago)
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - 15);
    
    // Find scheduled sessions that have passed their time
    const { data: pastSessions, error: sessionsError } = await supabase
      .from("mentor_sessions")
      .select(`
        id, 
        scheduled_at,
        mentor_id,
        mentee_id,
        session_type_id,
        mentor:profiles!mentor_sessions_mentor_id_fkey(full_name, email),
        mentee:profiles!mentor_sessions_mentee_id_fkey(full_name, email),
        session_type:mentor_session_types!mentor_sessions_session_type_id_fkey(duration)
      `)
      .eq("status", "scheduled")
      .lt("scheduled_at", cutoffTime.toISOString());
    
    if (sessionsError) {
      throw sessionsError;
    }
    
    if (!pastSessions || pastSessions.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No past scheduled sessions found to update" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }
    
    // Filter sessions that have actually ended (considering duration)
    const sessionsToUpdate = pastSessions.filter(session => {
      const endTime = new Date(session.scheduled_at);
      endTime.setMinutes(endTime.getMinutes() + (session.session_type?.duration || 60));
      return endTime < cutoffTime;
    });

    if (sessionsToUpdate.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No sessions found that have ended their scheduled duration" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }
    
    // Update sessions to no_show status
    const sessionIds = sessionsToUpdate.map(s => s.id);
    
    const { error: updateError } = await supabase
      .from("mentor_sessions")
      .update({ 
        status: "no_show",
        notes: (session) => `${session.notes || ''}\n\nAutomatically marked as no-show by system.`
      })
      .in("id", sessionIds);
    
    if (updateError) {
      throw updateError;
    }
    
    // Create notifications for both parties for each session
    const notifications = sessionsToUpdate.flatMap(session => [
      // Notification for mentor
      {
        profile_id: session.mentor_id,
        title: "Session marked as no-show",
        message: `Your session with ${session.mentee.full_name} scheduled for ${new Date(session.scheduled_at).toLocaleString()} has been automatically marked as no-show.`,
        type: "session_update",
        action_url: `/profile?tab=calendar`
      },
      // Notification for mentee
      {
        profile_id: session.mentee_id,
        title: "Session marked as no-show",
        message: `Your session with ${session.mentor.full_name} scheduled for ${new Date(session.scheduled_at).toLocaleString()} has been automatically marked as no-show.`,
        type: "session_update",
        action_url: `/profile?tab=calendar`
      }
    ]);
    
    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert(notifications);
      
      if (notificationError) {
        console.error("Error creating notifications:", notificationError);
        // Don't throw, we still want to return success for the update
      }
    }
    
    return new Response(
      JSON.stringify({ 
        message: `Updated ${sessionIds.length} past sessions to no-show status`
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
