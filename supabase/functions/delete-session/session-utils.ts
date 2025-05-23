
/**
 * Deletes a session and handles related operations
 * 
 * @param supabase Supabase client instance
 * @param sessionId ID of the session to delete
 * @returns Result of the delete operation
 * @throws Error if session deletion fails
 */
export async function deleteSession(supabase, sessionId) {
  try {
    // First check if the session exists
    const { data: sessionData, error: sessionError } = await supabase
      .from("mentor_sessions")
      .select("id, mentor_id, mentee_id")
      .eq("id", sessionId)
      .single();
    
    if (sessionError || !sessionData) {
      console.error("Session not found:", sessionError || "No data returned");
      throw new Error("Session not found");
    }
    
    console.log("Session fetched successfully:", sessionId);
    
    // First try using the RPC function approach
    try {
      const { data, error } = await supabase
        .rpc("delete_session", { p_session_id: sessionId });
      
      if (error) {
        // If we get a specific error about foreign key constraint with session_feedback
        if (error.code === "23503" && error.message.includes("session_feedback")) {
          console.log("RPC failed with session_feedback constraint, falling back to direct transaction approach");
          return await directDeleteSession(supabase, sessionId, sessionData);
        }
        
        // If we get some other foreign key constraint error
        if (error.code === "23503") {
          console.log("RPC failed with foreign key constraint, falling back to direct transaction approach");
          return await directDeleteSession(supabase, sessionId, sessionData);
        }
        
        // Otherwise, throw the error
        throw error;
      }
      
      console.log("RPC delete session succeeded:", data);
      return data;
    } 
    catch (rpcError) {
      console.log("RPC delete session failed, trying direct transaction approach:", rpcError.message);
      return await directDeleteSession(supabase, sessionId, sessionData);
    }
  } catch (error) {
    console.error("Error in deleteSession function:", error);
    throw error;
  }
}

/**
 * Direct transaction approach to delete a session
 * Used as a fallback when the RPC method fails
 * 
 * @param supabase Supabase client instance
 * @param sessionId ID of the session to delete
 * @param sessionData Session data including mentor and mentee IDs
 * @returns Result of the delete operation
 */
async function directDeleteSession(supabase, sessionId, sessionData) {
  console.log("Starting direct delete transaction for session:", sessionId);
  
  try {
    // Step 1: Get the detailed session data for notifications (if not provided)
    let sessionDetails = sessionData;
    if (!sessionData.mentor_id || !sessionData.mentee_id) {
      const { data, error } = await supabase
        .from("mentor_sessions")
        .select("mentor_id, mentee_id")
        .eq("id", sessionId)
        .single();
        
      if (error || !data) {
        throw new Error("Failed to fetch session details: " + (error?.message || "No data returned"));
      }
      
      sessionDetails = data;
    }
    
    // Step 2: Get mentor and mentee names for notifications
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", [sessionDetails.mentor_id, sessionDetails.mentee_id]);
      
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw new Error("Failed to fetch profile information: " + profilesError.message);
    }
    
    const mentorName = profiles.find(p => p.id === sessionDetails.mentor_id)?.full_name || "Mentor";
    const menteeName = profiles.find(p => p.id === sessionDetails.mentee_id)?.full_name || "Mentee";
    
    // Step 3: Begin transaction
    // First delete any session feedback associated with this session
    console.log("Checking for and removing any session feedback...");
    const { error: feedbackError } = await supabase
      .from("session_feedback")
      .delete()
      .eq("session_id", sessionId);
      
    if (feedbackError) {
      console.error("Error deleting session feedback:", feedbackError);
      throw new Error(`Failed to delete session feedback: ${feedbackError.message}`);
    }
    
    // Next clear any references in mentor_availability
    console.log("Clearing availability references...");
    const { error: clearError } = await supabase
      .from("mentor_availability")
      .update({ is_available: true, booked_session_id: null })
      .eq("booked_session_id", sessionId);
      
    if (clearError) {
      console.error("Error clearing availability references:", clearError);
      throw new Error(`Failed to clear availability references: ${clearError.message}`);
    }
    
    // Step 4: Delete the session
    console.log("Deleting session record...");
    const { error: deleteError } = await supabase
      .from("mentor_sessions")
      .delete()
      .eq("id", sessionId);
      
    if (deleteError) {
      console.error("Error deleting session record:", deleteError);
      throw new Error(`Failed to delete session: ${deleteError.message}`);
    }
    
    // Step 5: Create notifications for both users
    console.log("Creating notifications...");
    const notifications = [
      {
        profile_id: sessionDetails.mentor_id,
        title: "Session Deleted",
        message: `Your session with ${menteeName} has been deleted by an administrator.`,
        type: "session_update",
        action_url: "/profile?tab=calendar",
        category: "general"
      },
      {
        profile_id: sessionDetails.mentee_id,
        title: "Session Deleted",
        message: `Your session with ${mentorName} has been deleted by an administrator.`,
        type: "session_update",
        action_url: "/profile?tab=calendar",
        category: "general"
      }
    ];
    
    const { error: notifyError } = await supabase
      .from("notifications")
      .insert(notifications);
      
    if (notifyError) {
      // Log but don't fail if notifications couldn't be created
      console.error("Error creating notifications:", notifyError);
      // We continue since the session was deleted successfully
    }
    
    console.log("Direct delete transaction completed successfully for session:", sessionId);
    
    return {
      success: true,
      message: "Session deleted successfully via direct transaction",
      session_id: sessionId
    };
  } catch (error) {
    console.error("Error in directDeleteSession function:", error);
    throw error;
  }
}
