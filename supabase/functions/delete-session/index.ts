
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyAdminAccess } from "./auth-utils.ts";
import { deleteSession } from "./session-utils.ts";

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
    const token = authorization.replace("Bearer ", "");

    // Verify the user has admin access
    const userId = await verifyAdminAccess(supabase, token);
    console.log("Admin verification successful for user:", userId);

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

    // Process the session deletion
    const result = await deleteSession(supabase, sessionId);
    
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
