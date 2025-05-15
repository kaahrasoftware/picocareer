
/**
 * Verifies that a user has admin access
 * 
 * @param supabase Supabase client instance
 * @param token JWT authentication token
 * @returns User ID if admin access is verified
 * @throws Error if authentication fails or user is not an admin
 */
export async function verifyAdminAccess(supabase, token) {
  console.log("Verifying token");
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  if (userError || !user) {
    console.error("Invalid token:", userError);
    throw new Error("Invalid authentication token");
  }
  
  console.log("User authenticated:", user.id);

  // Check if user is admin
  console.log("Checking admin status for user:", user.id);
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    throw new Error("Error fetching user profile");
  }
  
  if (profile.user_type !== "admin") {
    console.error("Unauthorized: User is not an admin. User type:", profile.user_type);
    throw new Error("Unauthorized: Admin access required");
  }
  
  return user.id;
}
