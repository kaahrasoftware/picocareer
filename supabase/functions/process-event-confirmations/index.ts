
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { registrationId }: EmailRequest = await req.json();

    console.log('Processing email confirmation for registration:', registrationId);

    // Fetch complete registration details with event information
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select(`
        *,
        event:events (
          id,
          title,
          description,
          start_time,
          end_time,
          platform,
          meeting_link,
          organized_by,
          timezone
        ),
        profile:profiles (
          email,
          full_name
        )
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      console.error('Registration not found:', regError);
      
      // Update email log with error
      await supabase
        .from('event_email_logs')
        .update({ 
          status: 'failed',
          error_message: 'Registration not found',
          updated_at: new Date().toISOString()
        })
        .eq('registration_id', registrationId);

      return new Response(
        JSON.stringify({ success: false, error: 'Registration not found' }), 
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // Update email log status to processing
    await supabase
      .from('event_email_logs')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('registration_id', registrationId);

    // Call the send-event-confirmation function with complete data
    const { error: emailError } = await supabase.functions.invoke(
      'send-event-confirmation',
      {
        body: { 
          registrationId,
          eventId: registration.event?.id,
          email: registration.email,
          fullName: `${registration.first_name} ${registration.last_name}`,
          eventTitle: registration.event?.title,
          eventDescription: registration.event?.description,
          eventStartTime: registration.event?.start_time,
          eventEndTime: registration.event?.end_time,
          eventPlatform: registration.event?.platform,
          meetingLink: registration.event?.meeting_link,
          organizedBy: registration.event?.organized_by,
          timezone: registration.event?.timezone || 'EST'
        }
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
    
    // Try to update email log with error if we have the registrationId
    try {
      const body = await req.clone().json();
      if (body.registrationId) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('event_email_logs')
          .update({ 
            status: 'failed',
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('registration_id', body.registrationId);
      }
    } catch (updateError) {
      console.error('Error updating email log:', updateError);
    }

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
