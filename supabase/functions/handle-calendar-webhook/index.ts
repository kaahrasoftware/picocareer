import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { findSessionByCalendarEventId, updateSessionStatus } from "./session-utils.ts";
import { createNotifications, sendEmailNotifications } from "./notification-utils.ts";

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

    // Handle event deletion
    if (state === 'delete' || state === 'trash') {
      const data = await req.json();
      console.log('Calendar event deleted:', data);

      const session = await findSessionByCalendarEventId(data.id);
      if (!session) {
        return new Response(JSON.stringify({ message: 'Session not found' }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Update session status
      await updateSessionStatus(
        session.id, 
        'cancelled',
        'Cancelled: Calendar event was deleted'
      );

      // Create notifications
      await createNotifications(
        session,
        'Session Cancelled',
        'cancelled because the calendar event was deleted'
      );

      // Send email notifications
      await sendEmailNotifications(session.id, 'cancellation');

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle other calendar event states (sync, exists, update)
    if (['sync', 'exists', 'update'].includes(state || '')) {
      const data = await req.json();
      console.log('Calendar event data:', data);

      const session = await findSessionByCalendarEventId(data.id);
      if (!session) {
        return new Response(JSON.stringify({ message: 'Session not found' }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Update session status based on calendar event status
      let status: string;
      let notificationType: string;
      let notificationMessage: string;

      switch (data.status) {
        case 'cancelled':
          status = 'cancelled';
          notificationType = 'Session Cancelled';
          notificationMessage = 'cancelled via Google Calendar';
          break;
        case 'confirmed':
          status = 'confirmed';
          notificationType = 'Session Confirmed';
          notificationMessage = 'confirmed in Google Calendar';
          break;
        default:
          status = 'scheduled';
          notificationType = 'Session Updated';
          notificationMessage = 'updated in Google Calendar';
      }

      // Update session
      await updateSessionStatus(
        session.id,
        status,
        `${notificationType} via Google Calendar`
      );

      // Create notifications
      await createNotifications(session, notificationType, notificationMessage);

      // Send email notifications
      await sendEmailNotifications(
        session.id,
        status === 'cancelled' ? 'cancellation' : 'update'
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: 'Unhandled event state' }), {
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