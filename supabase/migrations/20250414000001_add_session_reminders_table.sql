
-- Create a table to track sent session reminders
CREATE TABLE IF NOT EXISTS public.session_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.mentor_sessions(id) ON DELETE CASCADE,
  reminder_time INTEGER NOT NULL, -- minutes before session
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Make sure we don't send the same reminder twice
  CONSTRAINT unique_session_reminder UNIQUE (session_id, reminder_time)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS session_reminders_session_id_idx ON public.session_reminders (session_id);
