import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export async function findSessionByCalendarEventId(calendarEventId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: session, error: sessionError } = await supabase
    .from('mentor_sessions')
    .select(`
      *,
      mentor:profiles!mentor_sessions_mentor_id_fkey(id, full_name, email),
      mentee:profiles!mentor_sessions_mentee_id_fkey(id, full_name, email)
    `)
    .eq('calendar_event_id', calendarEventId)
    .single();

  if (sessionError) {
    console.error('Error finding session:', sessionError);
    throw sessionError;
  }

  return session;
}

export async function updateSessionStatus(sessionId: string, status: string, note: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const updateData = {
    status,
    notes: note,
    calendar_event_etag: null,
    last_calendar_sync: new Date().toISOString()
  };

  const { error: updateError } = await supabase
    .from('mentor_sessions')
    .update(updateData)
    .eq('id', sessionId);

  if (updateError) {
    console.error('Error updating session:', updateError);
    throw updateError;
  }

  return updateData;
}