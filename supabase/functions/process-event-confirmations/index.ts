
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  registrationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { registrationId }: EmailRequest = await req.json();

    console.log('Processing email confirmation for registration:', registrationId);

    // Update email log status to processing
    await supabase
      .from('event_email_logs')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('registration_id', registrationId);

    // Call the existing send-event-confirmation function
    const { error: emailError } = await supabase.functions.invoke(
      'send-event-confirmation',
      {
        body: { registrationId }
      }
    );

    if (emailError) {
      console.error('Error sending confirmation email:', emailError);
      
      // Update email log with error
      await supabase
        .from('event_email_logs')
        .update({ 
          status: 'failed',
          error_message: emailError.message,
          updated_at: new Date().toISOString()
        })
        .eq('registration_id', registrationId);

      return new Response(
        JSON.stringify({ success: false, error: emailError.message }), 
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Update email log status to sent
    await supabase
      .from('event_email_logs')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('registration_id', registrationId);

    console.log('Email confirmation sent successfully for registration:', registrationId);

    return new Response(
      JSON.stringify({ success: true }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in process-event-confirmations function:", error);
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
