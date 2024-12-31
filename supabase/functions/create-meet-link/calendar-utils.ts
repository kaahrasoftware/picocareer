import { getAccessToken } from "./auth-utils.ts";

export async function createCalendarEvent(eventDetails: any, accessToken: string) {
  console.log('Creating calendar event with details:', {
    summary: eventDetails.summary,
    startTime: eventDetails.start.dateTime,
    endTime: eventDetails.end.dateTime,
    attendees: eventDetails.attendees
  });

  const calendarResponse = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventDetails),
    }
  );

  if (!calendarResponse.ok) {
    const errorData = await calendarResponse.json();
    console.error('Failed to create calendar event:', errorData);
    throw new Error(`Failed to create calendar event: ${JSON.stringify(errorData)}`);
  }

  const eventData = await calendarResponse.json();
  console.log('Calendar event created successfully:', eventData);
  return eventData;
}

export async function setupWebhook(calendarId: string) {
  const accessToken = await getAccessToken();
  
  const webhookResponse = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/watch`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        type: 'web_hook',
        address: `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-calendar-webhook`,
        params: {
          ttl: '604800', // 7 days in seconds
        },
        events: ['cancelled', 'confirmed', 'updated', 'deleted']
      }),
    }
  );

  if (!webhookResponse.ok) {
    console.error('Failed to set up calendar webhook:', await webhookResponse.text());
    throw new Error('Failed to set up calendar webhook');
  }

  return await webhookResponse.json();
}