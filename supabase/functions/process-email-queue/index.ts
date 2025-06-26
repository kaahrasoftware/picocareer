
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Processing email queue');

    // Get queued emails older than 1 minute
    const { data: queuedEmails, error: fetchError } = await supabase
      .from('event_email_logs')
      .select('*')
      .eq('status', 'queued')
      .lt('created_at', new Date(Date.now() - 60000).toISOString()) // 1 minute ago
      .limit(10); // Process 10 at a time

    if (fetchError) {
      console.error('Error fetching queued emails:', fetchError);
      return new Response(
        JSON.stringify({ error: fetchError.message }), 
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    if (!queuedEmails || queuedEmails.length === 0) {
      console.log('No queued emails to process');
      return new Response(
        JSON.stringify({ message: 'No queued emails to process', processed: 0 }), 
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    let processedCount = 0;
    let failedCount = 0;

    // Process each queued email
    for (const emailLog of queuedEmails) {
      try {
        console.log('Processing email for registration:', emailLog.registration_id);

        // Call the process-event-confirmations function
        const { error: processError } = await supabase.functions.invoke(
          'process-event-confirmations',
          {
            body: { registrationId: emailLog.registration_id }
          }
        );

        if (processError) {
          console.error('Error processing email:', processError);
          failedCount++;
        } else {
          processedCount++;
        }
      } catch (error) {
        console.error('Error processing individual email:', error);
        failedCount++;
      }
    }

    console.log(`Email queue processing complete. Processed: ${processedCount}, Failed: ${failedCount}`);

    return new Response(
      JSON.stringify({ 
        message: 'Email queue processed',
        processed: processedCount,
        failed: failedCount,
        total: queuedEmails.length
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in process-email-queue function:", error);
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
