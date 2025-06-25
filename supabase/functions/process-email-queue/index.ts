
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
    
    console.log('Starting email queue processing...');

    // Get all queued email logs
    const { data: queuedEmails, error: fetchError } = await supabase
      .from('event_email_logs')
      .select(`
        id,
        registration_id,
        email,
        status,
        created_at
      `)
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(50); // Process in batches

    if (fetchError) {
      console.error('Error fetching queued emails:', fetchError);
      throw fetchError;
    }

    if (!queuedEmails || queuedEmails.length === 0) {
      console.log('No queued emails found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No emails in queue',
          processed: 0 
        }), 
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${queuedEmails.length} queued emails to process`);

    let processedCount = 0;
    let errorCount = 0;

    // Process each queued email
    for (const emailLog of queuedEmails) {
      try {
        console.log(`Processing email for registration: ${emailLog.registration_id}`);

        // Update status to processing
        await supabase
          .from('event_email_logs')
          .update({ 
            status: 'processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', emailLog.id);

        // Call the process-event-confirmations function
        const { error: processError } = await supabase.functions.invoke(
          'process-event-confirmations',
          {
            body: { registrationId: emailLog.registration_id }
          }
        );

        if (processError) {
          console.error(`Error processing email for registration ${emailLog.registration_id}:`, processError);
          
          // Update status to failed
          await supabase
            .from('event_email_logs')
            .update({ 
              status: 'failed',
              error_message: processError.message,
              updated_at: new Date().toISOString()
            })
            .eq('id', emailLog.id);
            
          errorCount++;
        } else {
          console.log(`Successfully processed email for registration: ${emailLog.registration_id}`);
          processedCount++;
        }

        // Add small delay between processing to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error: any) {
        console.error(`Error processing email log ${emailLog.id}:`, error);
        
        // Update status to failed
        await supabase
          .from('event_email_logs')
          .update({ 
            status: 'failed',
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', emailLog.id);
          
        errorCount++;
      }
    }

    console.log(`Email queue processing completed. Processed: ${processedCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Email queue processing completed`,
        processed: processedCount,
        errors: errorCount,
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
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to process email queue'
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
