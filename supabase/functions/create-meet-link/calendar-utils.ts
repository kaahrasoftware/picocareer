export async function createCalendarEvent(eventDetails: any, accessToken: string) {
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
          createRequest: {
            requestId: eventDetails.conferenceData.createRequest.requestId,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
            status: { statusCode: 'success' },
          },
          // Add recording settings
          entryPoints: [{
            entryPointType: 'video',
            uri: '',
            label: 'Meet Recording',
          }],
          conferenceSolution: {
            key: { type: 'hangoutsMeet' },
            name: 'Google Meet',
            iconUri: '',
          },
          parameters: {
            addOnParameters: {
              parameters: {
                'recording': {
                  'type': 'hangoutsMeet',
                  'recordingOptions': {
                    'enabled': true,
                    'initiatedBy': 'organizer',
                    'retentionPeriod': {
                      'count': 30,
                      'unit': 'days'
                    }
                  }
                }
              }
            }
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

  const data = await calendarResponse.json();
  console.log('Calendar event created successfully:', data);
  return data;
}