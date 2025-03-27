
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Create Supabase client with service role for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Parse request body
    const { 
      profileId, 
      startDateTime, 
      endDateTime, 
      isAvailable, 
      recurring, 
      dayOfWeek, 
      timezoneOffset,
      referenceTimezone,
      dstAware,
      lastDstCheck
    } = await req.json();

    if (!profileId || !startDateTime || !endDateTime) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters: profileId, startDateTime, or endDateTime" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Get request authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 401 
        }
      );
    }

    // Verify the requesting user is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials", details: authError }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 401 
        }
      );
    }

    // Verify the user is an admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.user_type !== 'admin') {
      return new Response(
        JSON.stringify({ error: "Not authorized. Admin access required." }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 403 
        }
      );
    }

    // Insert the mentor availability using admin privileges
    const { data, error } = await supabaseClient
      .from('mentor_availability')
      .insert({
        profile_id: profileId,
        start_date_time: startDateTime,
        end_date_time: endDateTime,
        is_available: isAvailable !== undefined ? isAvailable : true,
        recurring: recurring !== undefined ? recurring : false,
        day_of_week: recurring ? dayOfWeek : null,
        timezone_offset: timezoneOffset,
        reference_timezone: referenceTimezone || 'UTC',
        dst_aware: dstAware !== undefined ? dstAware : true,
        last_dst_check: lastDstCheck || new Date().toISOString()
      });

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create availability", details: error }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        message: "Availability created successfully",
        data
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
