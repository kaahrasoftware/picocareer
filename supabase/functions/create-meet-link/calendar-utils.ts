export async function createCalendarEvent(eventDetails: any, accessToken: string) {
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

  const data = await calendarResponse.json();
  console.log('Calendar event created successfully:', data);
  return data;
}