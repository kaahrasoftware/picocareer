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
      body: JSON.stringify({
        ...eventDetails,
        conferenceData: {
          ...eventDetails.conferenceData,
          createRequest: {
            ...eventDetails.conferenceData.createRequest,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
            status: { statusCode: 'success' }
          }
        }
      }),
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