
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
      .select("id")
      .eq("id", sessionId)
      .single();
    
    if (sessionError || !sessionData) {
      console.error("Session not found:", sessionError || "No data returned");
      throw new Error("Session not found");
    }
    
    console.log("Session fetched successfully:", sessionId);
    
    // Call the SQL function to delete the session
    const { data, error } = await supabase
      .rpc("delete_session", { p_session_id: sessionId });
    
    if (error) {
      console.error("Error deleting session:", error);
      
      // Special handling for foreign key constraint violations
      if (error.code === "23503" && error.message.includes("mentor_availability")) {
        // Attempt to clear the reference in mentor_availability
        console.log("Attempting to clear availability references...");
        const { error: clearError } = await supabase
          .from("mentor_availability")
          .update({ is_available: true, booked_session_id: null })
          .eq("booked_session_id", sessionId);
          
        if (clearError) {
          console.error("Error clearing availability references:", clearError);
          throw new Error(`Failed to clear availability references: ${clearError.message}`);
        }
        
        // Try the delete again
        console.log("Retrying session deletion...");
        const { data: retryData, error: retryError } = await supabase
          .rpc("delete_session", { p_session_id: sessionId });
          
        if (retryError) {
          console.error("Error in retry delete:", retryError);
          throw retryError;
        }
        
        return retryData;
      }
      
      throw error;
    }
    
    console.log("Delete session response:", data);
    
    // Check if deletion was successful
    if (!data.success) {
      throw new Error(data.message || "Failed to delete session");
    }
    
    return data;
  } catch (error) {
    console.error("Error in deleteSession function:", error);
    throw error;
  }
}
