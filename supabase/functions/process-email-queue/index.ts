
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Starting email queue processing...');

    // Get all queued emails older than 2 minutes (in case immediate processing failed)
    const { data: queuedEmails, error: fetchError } = await supabase
      .from('event_email_logs')
      .select('registration_id, email, created_at')
      .eq('status', 'queued')
      .lt('created_at', new Date(Date.now() - 2 * 60 * 1000).toISOString())
      .limit(50);

    if (fetchError) {
      console.error('Error fetching queued emails:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${queuedEmails?.length || 0} queued emails to process`);

    let processed = 0;
    let errors = 0;

    if (queuedEmails && queuedEmails.length > 0) {
      for (const emailLog of queuedEmails) {
        try {
          console.log('Processing email for registration:', emailLog.registration_id);
          
          const { error: processError } = await supabase.functions.invoke('process-event-confirmations', {
            body: { registrationId: emailLog.registration_id }
          });

          if (processError) {
            console.error(`Error processing email for ${emailLog.registration_id}:`, processError);
            errors++;
          } else {
            console.log('Successfully processed email for registration:', emailLog.registration_id);
            processed++;
          }
        } catch (error) {
          console.error(`Failed to process email for ${emailLog.registration_id}:`, error);
          errors++;
        }

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Email queue processing completed. Processed: ${processed}, Errors: ${errors}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        processed,
        errors,
        totalFound: queuedEmails?.length || 0
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in process-email-queue:", error);
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
