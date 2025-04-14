
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  sessionId: string;
  type: 'confirmation' | 'cancellation' | 'update' | 'reminder';
  fromEmail?: string;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    // Fetch session details with explicit column selection
    const { data: session, error: sessionError } = await supabase
      .from('mentor_sessions')
      .select(`
        id,
        mentor_id,
        mentee_id,
        session_type_id,
        scheduled_at,
        notes,
        meeting_platform,
        meeting_link,
        calendar_event_id,
        mentor:profiles!mentor_sessions_mentor_id_fkey(id, full_name),
        mentee:profiles!mentor_sessions_mentee_id_fkey(id, full_name),
        session_type:mentor_session_types(type, duration)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    // Create confirmation notifications with meeting link
    const meetingLinkInfo = session.meeting_link 
      ? `\n<div style="margin-top: 10px;"><a href="${session.meeting_link}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">Join now</a></div>`
      : session.meeting_platform === 'google_meet' 
        ? '\nGoogle Meet link will be sent shortly.'
        : '';

    const notifications = [
      {
        profile_id: session.mentor_id,
        title: 'New Session Booked',
        message: `${session.mentee.full_name} has booked a ${session.session_type.type} session with you.${meetingLinkInfo}`,
        type: 'session_booked',
        action_url: '/profile?tab=calendar'
      },
      {
        profile_id: session.mentee_id,
        title: 'Session Confirmation',
        message: `Your ${session.session_type.type} session with ${session.mentor.full_name} has been booked.${meetingLinkInfo}`,
        type: 'session_booked',
        action_url: '/profile?tab=calendar'
      }
    ];

    // Insert confirmation notifications
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notificationError) {
      throw new Error('Failed to create notifications');
    }

    // Get mentor's reminder time settings
    const { data: mentorSettings, error: settingsError } = await supabase
      .from('user_settings')
      .select('setting_value')
      .eq('profile_id', session.mentor_id)
      .eq('setting_type', 'session_settings')
      .single();

    // Default reminder times if settings not found
    let reminderTimes = [30]; // Default reminder time in minutes
    
    if (!settingsError && mentorSettings?.setting_value) {
      try {
        const parsedSettings = JSON.parse(mentorSettings.setting_value);
        if (parsedSettings.reminderTimes && Array.isArray(parsedSettings.reminderTimes)) {
          reminderTimes = parsedSettings.reminderTimes;
        }
      } catch (e) {
        console.error('Error parsing mentor settings:', e);
      }
    }

    // Schedule reminders based on mentor settings
    const scheduledAt = new Date(session.scheduled_at);
    const sessionReminders = [];

    for (const minutes of reminderTimes) {
      const reminderTime = new Date(scheduledAt.getTime() - minutes * 60000);
      
      // Skip if reminder time is in the past
      if (reminderTime <= new Date()) continue;

      // Add to session_reminders table
      sessionReminders.push({
        session_id: session.id,
        minutes_before: minutes,
        reminder_time: reminderTime.toISOString()
      });
    }

    // Insert reminder records
    if (sessionReminders.length > 0) {
      const { error: remindersError } = await supabase
        .from('session_reminders')
        .insert(sessionReminders);

      if (remindersError) {
        console.error('Error scheduling reminders:', remindersError);
      }
    }

    // Send confirmation emails
    await fetch(`${SUPABASE_URL}/functions/v1/send-session-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        sessionId,
        type: 'confirmation'
      })
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in schedule-session-notifications function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);
