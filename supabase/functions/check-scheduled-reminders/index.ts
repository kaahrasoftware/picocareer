
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Get current time for comparison
    const now = new Date();
    
    // Find unsent reminders that are due (reminder_time <= now)
    const { data: dueReminders, error: remindersError } = await supabase
      .from('session_reminders')
      .select(`
        id,
        session_id,
        minutes_before,
        reminder_time
      `)
      .eq('sent', false)
      .lte('reminder_time', now.toISOString())
      .order('reminder_time');
    
    if (remindersError) {
      console.error("Error fetching due reminders:", remindersError);
      throw remindersError;
    }
    
    console.log(`Found ${dueReminders?.length || 0} reminders due for sending`);
    
    const results = [];
    
    // Process each due reminder
    for (const reminder of dueReminders || []) {
      try {
        // Call the send-session-reminder function to send the notification
        const sendResult = await supabase.functions.invoke('send-session-reminder', {
          body: {
            sessionId: reminder.session_id,
            minutesBefore: reminder.minutes_before,
            isAutomated: true
          }
        });
        
        // Mark the reminder as sent
        const { error: updateError } = await supabase
          .from('session_reminders')
          .update({ 
            sent: true,
            sent_at: new Date().toISOString()
          })
          .eq('id', reminder.id);
        
        if (updateError) {
          console.error(`Error updating reminder ${reminder.id}:`, updateError);
          results.push({
            reminderId: reminder.id,
            success: false,
            error: updateError.message
          });
        } else {
          console.log(`Successfully processed reminder ${reminder.id} for session ${reminder.session_id}`);
          results.push({
            reminderId: reminder.id,
            success: true
          });
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
        results.push({
          reminderId: reminder.id,
          success: false,
          error: error.message
        });
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: dueReminders?.length || 0,
        results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in check-scheduled-reminders:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
