
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    console.log("Starting check-scheduled-reminders function");
    
    // Get upcoming sessions in the next 24 hours
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const { data: upcomingSessions, error: sessionsError } = await supabase
      .from('mentor_sessions')
      .select(`
        id,
        scheduled_at,
        mentor_id,
        mentee_id,
        mentor:profiles!mentor_sessions_mentor_id_fkey(id, full_name, email),
        mentee:profiles!mentor_sessions_mentee_id_fkey(id, full_name, email),
        session_type:mentor_session_types!mentor_sessions_session_type_id_fkey(type, duration)
      `)
      .eq('status', 'scheduled')
      .gte('scheduled_at', now.toISOString())
      .lte('scheduled_at', twentyFourHoursLater.toISOString());

    if (sessionsError) {
      throw sessionsError;
    }

    console.log(`Found ${upcomingSessions?.length || 0} upcoming sessions in the next 24 hours`);
    
    if (!upcomingSessions || upcomingSessions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No upcoming sessions found for reminders",
          sessionCount: 0
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Process each session
    const processedSessions = [];
    
    for (const session of upcomingSessions) {
      // Get mentor's reminder settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("user_settings")
        .select("setting_value")
        .eq("profile_id", session.mentor_id)
        .eq("setting_type", "session_settings")
        .single();

      if (settingsError) {
        console.warn(`Could not fetch settings for mentor ${session.mentor_id}:`, settingsError);
        continue;
      }

      // Default reminder times (minutes before session)
      let reminderTimes = [30]; // Default 30 minutes
      
      if (settingsData?.setting_value) {
        try {
          const settings = JSON.parse(settingsData.setting_value);
          if (settings.reminderTimes && Array.isArray(settings.reminderTimes)) {
            reminderTimes = settings.reminderTimes;
          }
        } catch (e) {
          console.error("Error parsing mentor settings:", e);
        }
      }

      // Get already sent reminders for this session
      const { data: existingReminders, error: remindersError } = await supabase
        .from("session_reminders")
        .select("reminder_time, sent_at")
        .eq("session_id", session.id);

      if (remindersError) {
        console.warn(`Could not fetch existing reminders for session ${session.id}:`, remindersError);
        continue;
      }

      // Convert existing reminders to a Map for quick lookup
      const sentReminders = new Map();
      if (existingReminders) {
        existingReminders.forEach(reminder => {
          sentReminders.set(reminder.reminder_time, reminder.sent_at);
        });
      }

      const sessionTime = new Date(session.scheduled_at);
      let sessionReminded = false;

      // Check each reminder time
      for (const minutes of reminderTimes) {
        // Skip if this reminder was already sent
        if (sentReminders.has(minutes)) {
          continue;
        }

        // Calculate when this reminder should be sent
        const reminderTime = new Date(sessionTime.getTime() - minutes * 60 * 1000);
        
        // If it's time to send this reminder (now has passed the reminder time)
        if (now >= reminderTime) {
          console.log(`Sending ${minutes} minute reminder for session ${session.id}`);
          
          try {
            // Call the send-session-reminder function
            const { data: reminderResult, error: reminderError } = await supabase.functions.invoke('send-session-reminder', {
              body: { 
                sessionId: session.id,
                senderId: session.mentor_id,
                customMessage: `Your session is coming up in ${minutes === 1440 ? '24 hours' : `${minutes} minutes`}.`
              }
            });
            
            if (reminderError) {
              console.error(`Error sending reminder for session ${session.id}:`, reminderError);
              continue;
            }
            
            // Record that this reminder was sent
            const { error: recordError } = await supabase
              .from("session_reminders")
              .insert({
                session_id: session.id,
                reminder_time: minutes,
                sent_at: new Date().toISOString()
              });
            
            if (recordError) {
              console.error(`Error recording reminder for session ${session.id}:`, recordError);
            } else {
              sessionReminded = true;
              console.log(`Successfully sent ${minutes} minute reminder for session ${session.id}`);
            }
          } catch (error) {
            console.error(`Exception sending reminder for session ${session.id}:`, error);
          }
        }
      }
      
      if (sessionReminded) {
        processedSessions.push(session.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${upcomingSessions.length} sessions, sent reminders for ${processedSessions.length} sessions`,
        sessionCount: upcomingSessions.length,
        remindersSent: processedSessions.length,
        sessionsWithReminders: processedSessions
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error processing session reminders:", error);
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
