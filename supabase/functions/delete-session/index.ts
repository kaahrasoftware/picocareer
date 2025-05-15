
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  console.log("Delete session request received");
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Get authorization header
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      console.error("Missing Authorization header");
      throw new Error("Missing Authorization header");
    }

    console.log("Authorization header received");

    // Setup Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      throw new Error("Server configuration error");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the token
    const token = authorization.replace("Bearer ", "");
    console.log("Verifying token");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

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
    console.log("Admin status verified");

    // Get session ID from request
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      throw new Error("Invalid request format");
    }
    
    const { sessionId } = requestBody;

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    console.log("Request details:", { sessionId });

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
    
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unknown error occurred",
        stack: Deno.env.get("NODE_ENV") === 'development' ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error.message.includes("Unauthorized") ? 403 : 500
      }
    );
  }
});
