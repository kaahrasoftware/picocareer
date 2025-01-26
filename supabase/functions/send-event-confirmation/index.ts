import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { google } from "https://googleapis.deno.dev/v1/calendar:v3.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": 
    "authorization, x-client-info, apikey, content-type",
};

interface EventRegistration {
  id: string;
  event_id: string;
  email: string;
  first_name: string;
  last_name: string;
  event: {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    platform: string;
    meeting_link?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { registrationId } = await req.json();
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch registration details with event info
    const { data: registration, error: registrationError } = await supabase
      .from("event_registrations")
      .select(`
        id,
        event_id,
        email,
        first_name,
        last_name,
        event:events (
          title,
          description,
          start_time,
          end_time,
          platform,
          meeting_link
        )
      `)
      .eq("id", registrationId)
      .single();

    if (registrationError || !registration) {
      throw new Error("Failed to fetch registration details");
    }

    // Set up Google Calendar client
    const privateKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")
      ?.replace(/\\n/g, "\n")
      .replace(/^"(.*)"$/, "$1"); // Remove surrounding quotes if present

    if (!privateKey) {
      throw new Error("Google service account private key not found");
    }

    const calendar = google.calendar({
      version: "v3",
      auth: new google.auth.JWT(
        Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
        undefined,
        privateKey,
        ["https://www.googleapis.com/auth/calendar"],
        Deno.env.get("GOOGLE_CALENDAR_EMAIL")
      ),
    });

    // Create calendar event
    const event = {
      summary: registration.event.title,
      description: registration.event.description,
      start: {
        dateTime: registration.event.start_time,
        timeZone: "UTC",
      },
      end: {
        dateTime: registration.event.end_time,
        timeZone: "UTC",
      },
      attendees: [{ email: registration.email }],
      conferenceData: registration.event.meeting_link ? {
        entryPoints: [{
          entryPointType: "video",
          uri: registration.event.meeting_link,
        }],
      } : undefined,
    };

    const calendarResponse = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
    });

    if (!calendarResponse.data) {
      throw new Error("Failed to create calendar event");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Event confirmation sent successfully",
        calendarEventId: calendarResponse.data.id 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        } 
      }
    );

  } catch (error) {
    console.error("Error in send-event-confirmation:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
};

serve(handler);