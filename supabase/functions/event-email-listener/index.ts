import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Starting event email listener service');
    
    // Set up real-time listener for database notifications
    const channel = supabase.channel('event_confirmations');
    
    // Listen for PostgreSQL notifications
    channel.on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'event_registrations' 
      }, 
      async (payload) => {
        console.log('New event registration detected:', payload.new.id);
        
        try {
          // Call the process-event-confirmations function
          const { error } = await supabase.functions.invoke(
            'process-event-confirmations',
            {
              body: { registrationId: payload.new.id }
            }
          );
          
          if (error) {
            console.error('Error processing email confirmation:', error);
          } else {
            console.log('Email confirmation processed successfully for:', payload.new.id);
          }
        } catch (error) {
          console.error('Error in email processing:', error);
        }
      }
    );

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log('Subscription status:', status);
    });

    // Keep the function alive to listen for events
    return new Response(
      JSON.stringify({ 
        message: 'Event email listener started',
        status: 'listening'
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in event-email-listener function:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
