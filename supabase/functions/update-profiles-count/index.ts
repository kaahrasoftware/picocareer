
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Update profiles_count in careers table
    const { data: careerCounts, error: countError } = await supabaseClient.rpc(
      'update_career_profiles_count'
    );

    if (countError) {
      console.error('Error updating career profiles count:', countError);
      throw countError;
    }

    // Update profiles_count in majors table
    const { data: majorCounts, error: majorError } = await supabaseClient.rpc(
      'update_major_profiles_count'
    );

    if (majorError) {
      console.error('Error updating major profiles count:', majorError);
      throw majorError;
    }

    // Also mark past sessions as completed
    const { error: sessionError } = await supabaseClient
      .functions
      .invoke('update-past-sessions');

    if (sessionError) {
      console.error('Error invoking update-past-sessions:', sessionError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Updated profiles count and session statuses",
        careerCounts,
        majorCounts
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in update-profiles-count function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
