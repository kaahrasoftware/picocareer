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
  
  const notifications = [
    {
      profile_id: session.mentor.id,
      title: type,
      message: `Session with ${session.mentee.full_name} has been ${message}`,
      type: 'session_cancelled',
      action_url: '/profile?tab=calendar'
    },
    {
      profile_id: session.mentee.id,
      title: type,
      message: `Session with ${session.mentor.full_name} has been ${message}`,
      type: 'session_cancelled',
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