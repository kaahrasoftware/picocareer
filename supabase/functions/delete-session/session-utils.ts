
/**
 * Deletes a session and handles related operations
 * 
 * @param supabase Supabase client instance
 * @param sessionId ID of the session to delete
 * @returns Result of the delete operation
 * @throws Error if session deletion fails
 */
export async function deleteSession(supabase, sessionId) {
  // Call the SQL function to delete the session
  const { data, error } = await supabase
    .rpc("delete_session", { p_session_id: sessionId });
  
  if (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
  
  console.log("Delete session response:", data);
  
  // Check if deletion was successful
  if (!data.success) {
    throw new Error(data.message || "Failed to delete session");
  }
  
  return data;
}
