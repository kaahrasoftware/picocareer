
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

    // Get action details from request
    const { action, sessionId, status, reason } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    if (!action) {
      throw new Error("Action is required");
    }

    // Handle different actions
    switch (action) {
      case "updateStatus":
        if (!status) {
          throw new Error("Status is required for updateStatus action");
        }
        
        return await handleStatusUpdate(supabase, sessionId, status, reason);
        
      case "delete":
        return await handleDelete(supabase, sessionId);
        
      case "requestFeedback":
        return await handleRequestFeedback(supabase, sessionId);
        
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
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

// Update session status
async function handleStatusUpdate(supabase, sessionId, status, reason) {
  if (!["scheduled", "completed", "cancelled", "no_show"].includes(status)) {
    throw new Error("Invalid status value");
  }
  
  // Get session details first for notifications
  const { data: session, error: fetchError } = await supabase
    .from("mentor_sessions")
    .select(`
      id, 
      status,
      mentor_id,
      mentee_id,
      mentor:profiles!mentor_sessions_mentor_id_fkey(full_name, email),
      mentee:profiles!mentor_sessions_mentee_id_fkey(full_name, email)
    `)
    .eq("id", sessionId)
    .single();
    
  if (fetchError) {
    throw fetchError;
  }
  
  // Update the session
  const { error: updateError } = await supabase
    .from("mentor_sessions")
    .update({ 
      status,
      notes: reason ? `${session.notes || ""}\n\nStatus changed to ${status}${reason ? ": " + reason : ""} by admin.` : session.notes
    })
    .eq("id", sessionId);
  
  if (updateError) {
    throw updateError;
  }
  
  // Create notifications for both parties
  const statusMap = {
    completed: "completed",
    cancelled: "cancelled",
    no_show: "marked as no-show",
    scheduled: "rescheduled"
  };
  
  const notifications = [
    {
      profile_id: session.mentor_id,
      title: `Session ${statusMap[status]}`,
      message: `Your session with ${session.mentee.full_name} has been ${statusMap[status]} by an administrator${reason ? ": " + reason : ""}.`,
      type: "session_update",
      action_url: `/profile?tab=calendar`
    },
    {
      profile_id: session.mentee_id,
      title: `Session ${statusMap[status]}`,
      message: `Your session with ${session.mentor.full_name} has been ${statusMap[status]} by an administrator${reason ? ": " + reason : ""}.`,
      type: "session_update",
      action_url: `/profile?tab=calendar`
    }
  ];
  
  const { error: notificationError } = await supabase
    .from("notifications")
    .insert(notifications);
  
  if (notificationError) {
    console.error("Error creating notifications:", notificationError);
    // Don't throw, we still want to return success for the status update
  }
  
  // If status changed to completed, request feedback
  if (status === "completed") {
    await requestFeedback(supabase, session);
  }
  
  return new Response(
    JSON.stringify({ 
      message: `Session status updated to ${status}`,
      session: sessionId
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 
    }
  );
}

// Delete session
async function handleDelete(supabase, sessionId) {
  // Get session details first for notifications
  const { data: session, error: fetchError } = await supabase
    .from("mentor_sessions")
    .select(`
      id, 
      mentor_id,
      mentee_id,
      mentor:profiles!mentor_sessions_mentor_id_fkey(full_name, email),
      mentee:profiles!mentor_sessions_mentee_id_fkey(full_name, email)
    `)
    .eq("id", sessionId)
    .single();
    
  if (fetchError) {
    throw fetchError;
  }
  
  // Delete the session
  const { error: deleteError } = await supabase
    .from("mentor_sessions")
    .delete()
    .eq("id", sessionId);
  
  if (deleteError) {
    throw deleteError;
  }
  
  // Create notifications for both parties
  const notifications = [
    {
      profile_id: session.mentor_id,
      title: "Session deleted",
      message: `Your session with ${session.mentee.full_name} has been deleted by an administrator.`,
      type: "session_update",
      action_url: `/profile?tab=calendar`
    },
    {
      profile_id: session.mentee_id,
      title: "Session deleted",
      message: `Your session with ${session.mentor.full_name} has been deleted by an administrator.`,
      type: "session_update",
      action_url: `/profile?tab=calendar`
    }
  ];
  
  const { error: notificationError } = await supabase
    .from("notifications")
    .insert(notifications);
  
  if (notificationError) {
    console.error("Error creating notifications:", notificationError);
    // Don't throw, we still want to return success for the deletion
  }
  
  return new Response(
    JSON.stringify({ 
      message: "Session deleted successfully",
      session: sessionId
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 
    }
  );
}

// Request feedback
async function handleRequestFeedback(supabase, sessionId) {
  // Get session details
  const { data: session, error: fetchError } = await supabase
    .from("mentor_sessions")
    .select(`
      id, 
      mentor_id,
      mentee_id,
      mentor:profiles!mentor_sessions_mentor_id_fkey(full_name, email),
      mentee:profiles!mentor_sessions_mentee_id_fkey(full_name, email)
    `)
    .eq("id", sessionId)
    .single();
    
  if (fetchError) {
    throw fetchError;
  }
  
  await requestFeedback(supabase, session);
  
  return new Response(
    JSON.stringify({ 
      message: "Feedback request sent successfully",
      session: sessionId
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200 
    }
  );
}

// Helper function to request feedback
async function requestFeedback(supabase, session) {
  // Create notifications for both parties
  const notifications = [
    {
      profile_id: session.mentor_id,
      title: "Feedback requested",
      message: `Please provide feedback for your session with ${session.mentee.full_name}.`,
      type: "session_reminder",
      action_url: `/feedback/${session.id}?type=mentor_feedback`
    },
    {
      profile_id: session.mentee_id,
      title: "Feedback requested",
      message: `Please provide feedback for your session with ${session.mentor.full_name}.`,
      type: "session_reminder",
      action_url: `/feedback/${session.id}?type=mentee_feedback`
    }
  ];
  
  const { error: notificationError } = await supabase
    .from("notifications")
    .insert(notifications);
  
  if (notificationError) {
    console.error("Error creating feedback notifications:", notificationError);
    throw notificationError;
  }
  
  // Trigger email notifications by calling the send-session-email function
  try {
    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-session-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
      },
      body: JSON.stringify({
        sessionId: session.id,
        type: 'feedback_request'
      })
    });
  } catch (error) {
    console.error("Error sending feedback request email:", error);
    // Don't throw, we still want to return success even if email sending fails
  }
}
