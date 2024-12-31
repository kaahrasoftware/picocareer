import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received calendar webhook');
    
    const channelId = req.headers.get('X-Goog-Channel-ID');
    const resourceId = req.headers.get('X-Goog-Resource-ID');
    const state = req.headers.get('X-Goog-Resource-State');

    console.log({
      channelId,
      resourceId,
      state,
      headers: Object.fromEntries(req.headers.entries())
    });

    // Only process sync, update, or exists events
    if (!['sync', 'update', 'exists'].includes(state || '')) {
      console.log('Ignoring event with state:', state);
      return new Response(JSON.stringify({ message: 'Ignored event' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    const data = await req.json();
    console.log('Webhook data:', JSON.stringify(data, null, 2));

    // Handle different calendar event states
    const calendarEventId = data.id;
    let notificationType: string;
    let notificationTitle: string;
    let notificationMessage: string;
    let sessionStatus: string;

    switch (data.status) {
      case 'cancelled':
        notificationType = 'session_cancelled';
        notificationTitle = 'Session Cancelled';
        notificationMessage = 'Session has been cancelled via Google Calendar';
        sessionStatus = 'cancelled';
        break;
      case 'confirmed':
        notificationType = 'session_confirmed';
        notificationTitle = 'Session Confirmed';
        notificationMessage = 'Session has been confirmed in Google Calendar';
        sessionStatus = 'confirmed';
        break;
      case 'tentative':
        notificationType = 'session_updated';
        notificationTitle = 'Session Update';
        notificationMessage = 'Session details have been updated in Google Calendar';
        sessionStatus = 'scheduled';
        break;
      default:
        console.log('Unhandled calendar event status:', data.status);
        return new Response(JSON.stringify({ message: 'Unhandled event status' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Find the associated mentor session with attendee details
    const { data: session, error: sessionError } = await supabase
      .from('mentor_sessions')
      .select(`
        *,
        mentor:profiles!mentor_sessions_mentor_id_fkey(id, full_name, email),
        mentee:profiles!mentor_sessions_mentee_id_fkey(id, full_name, email)
      `)
      .eq('calendar_event_id', calendarEventId)
      .single();

    if (sessionError || !session) {
      console.error('Error finding session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log('Found session:', {
      id: session.id,
      mentor: session.mentor.full_name,
      mentee: session.mentee.full_name,
      status: session.status
    });

    // Check if this update has already been processed
    if (session.calendar_event_etag === data.etag) {
      console.log('Update already processed, skipping');
      return new Response(JSON.stringify({ message: 'Update already processed' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update the session status and metadata
    const updateData = {
      status: sessionStatus,
      notes: data.status === 'cancelled' ? 'Cancelled via Google Calendar' : `${notificationTitle} via Google Calendar`,
      calendar_event_etag: data.etag,
      last_calendar_sync: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('mentor_sessions')
      .update(updateData)
      .eq('id', session.id);

    if (updateError) {
      console.error('Error updating session:', updateError);
      throw updateError;
    }

    console.log('Updated session:', {
      id: session.id,
      status: sessionStatus,
      etag: data.etag
    });

    // Create notifications for both mentor and mentee
    const notifications = [
      {
        profile_id: session.mentor.id,
        title: notificationTitle,
        message: `Session with ${session.mentee.full_name} has been ${data.status}. ${notificationMessage}`,
        type: notificationType,
        action_url: '/profile?tab=calendar'
      },
      {
        profile_id: session.mentee.id,
        title: notificationTitle,
        message: `Session with ${session.mentor.full_name} has been ${data.status}. ${notificationMessage}`,
        type: notificationType,
        action_url: '/profile?tab=calendar'
      }
    ];

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('Error creating notifications:', notificationError);
      throw notificationError;
    }

    console.log('Created notifications for:', notifications.map(n => ({
      profile_id: n.profile_id,
      title: n.title
    })));

    // Send email notifications
    try {
      await supabase.functions.invoke('send-session-email', {
        body: { 
          sessionId: session.id,
          type: data.status === 'cancelled' ? 'cancellation' : 'update'
        }
      });
      console.log('Email notifications sent successfully');
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError);
      // Don't throw here, we still want to return success for the webhook
    }

    console.log('Successfully processed calendar event update');
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in calendar webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});