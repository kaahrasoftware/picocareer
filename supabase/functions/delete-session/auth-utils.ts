
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Verifies that a user has admin access
 * 
 * @param supabase Supabase client instance
 * @param token JWT token from request
 * @returns User ID if verification successful
 * @throws Error if user is not authorized
 */
export async function verifyAdminAccess(supabase: SupabaseClient, token: string): Promise<string> {
  try {
    // Verify the token and get the user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Token verification failed:", authError);
      throw new Error("Unauthorized: Invalid token");
    }
    
    console.log("User authenticated:", user.id);
    
    // Check if user is an admin
    console.log("Checking admin status for user:", user.id);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();
      
    if (profileError || !profile) {
      console.error("Failed to get user profile:", profileError);
      throw new Error("Unauthorized: Could not verify admin status");
    }
    
    if (profile.user_type !== 'admin') {
      console.error("User is not an admin:", user.id);
      throw new Error("Unauthorized: Admin permissions required");
    }
    
    console.log("Admin status verified");
    
    return user.id;
  } catch (error) {
    console.error("Error in verifyAdminAccess:", error.message);
    throw error;
  }
}
