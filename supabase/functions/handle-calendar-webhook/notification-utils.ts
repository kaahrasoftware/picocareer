
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export interface SessionParticipant {
  id: string;
  full_name: string;
  email: string;
}

export interface SessionDetails {
  id: string;
  mentor: SessionParticipant;
  mentee: SessionParticipant;
  status: string;
}

export async function createNotifications(session: SessionDetails, type: string, message: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  // Format the notification messages with HTML for better presentation
  const mentorHtmlMessage = formatSessionNotification(session.mentee.full_name, message, type);
  const menteeHtmlMessage = formatSessionNotification(session.mentor.full_name, message, type);
  
  const notifications = [
    {
      profile_id: session.mentor.id,
      title: type,
      message: mentorHtmlMessage,
      type: type,
      action_url: '/profile?tab=calendar'
    },
    {
      profile_id: session.mentee.id,
      title: type,
      message: menteeHtmlMessage,
      type: type,
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

  return notifications;
}

// Format notification with HTML for better presentation
function formatSessionNotification(participantName: string, message: string, type: string): string {
  // Extract date and time from message if possible
  let sessionDate = "";
  let sessionTime = "";
  
  const dateMatch = message.match(/on\s+([A-Za-z]+\s+\d+,?\s+\d{4})/) || 
                    message.match(/for\s+([A-Za-z]+\s+\d+,?\s+\d{4})/);
  
  const timeMatch = message.match(/at\s+(\d+:\d+\s*[APMapm]{2})/) || 
                    message.match(/(\d+:\d+\s*[APMapm]{2})/);
  
  if (dateMatch && dateMatch[1]) {
    sessionDate = dateMatch[1];
  }
  
  if (timeMatch && timeMatch[1]) {
    sessionTime = timeMatch[1];
  }
  
  if (type === 'session_booked' || type === 'session_reminder') {
    return `
      <h3>Session ${type === 'session_booked' ? 'Booked' : 'Reminder'}</h3>
      <p>Your session with <strong>${participantName}</strong> is scheduled:</p>
      <table>
        ${sessionDate ? `<tr><th>Date</th><td>${sessionDate}</td></tr>` : ''}
        ${sessionTime ? `<tr><th>Time</th><td>${sessionTime}</td></tr>` : ''}
      </table>
      <p>Click below to view details in your calendar.</p>
    `;
  } else if (type === 'session_cancelled') {
    return `
      <h3>Session Cancelled</h3>
      <p>Your session with <strong>${participantName}</strong> has been cancelled.</p>
      ${sessionDate || sessionTime ? `
        <p>The session was scheduled for:</p>
        <table>
          ${sessionDate ? `<tr><th>Date</th><td>${sessionDate}</td></tr>` : ''}
          ${sessionTime ? `<tr><th>Time</th><td>${sessionTime}</td></tr>` : ''}
        </table>
      ` : ''}
    `;
  }
  
  // Fallback to regular message
  return `<p>${message}</p>`;
}

export async function sendEmailNotifications(sessionId: string, type: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    await supabase.functions.invoke('send-session-email', {
      body: { 
        sessionId,
        type
      }
    });
    console.log('Email notifications sent successfully');
  } catch (error) {
    console.error('Error sending email notifications:', error);
    // Don't throw here, we still want to continue with other operations
  }
}
