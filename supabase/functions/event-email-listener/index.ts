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
    
    console.log('Starting event email listener...');

    // Listen for PostgreSQL notifications
    const channel = supabase
      .channel('event_confirmation_email')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'event_email_logs'
      }, async (payload) => {
        console.log('Received notification:', payload);
        
        if (payload.eventType === 'INSERT' && payload.new?.status === 'queued') {
          const registrationId = payload.new.registration_id;
          
          console.log('Processing queued email for registration:', registrationId);
          
          // Call the process-event-confirmations function
          try {
            const { error } = await supabase.functions.invoke('process-event-confirmations', {
              body: { registrationId }
            });
            
            if (error) {
              console.error('Error processing email confirmation:', error);
            } else {
              console.log('Email confirmation processed successfully');
            }
          } catch (error) {
            console.error('Failed to process email confirmation:', error);
          }
        }
      })
      .subscribe();

    // Keep the function alive
    let isRunning = true;
    while (isRunning) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(
      JSON.stringify({ message: 'Event email listener started' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in event-email-listener:", error);
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
