
-- Create a function to handle event registration email notifications
CREATE OR REPLACE FUNCTION public.send_event_confirmation_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Call the edge function asynchronously to send confirmation email
  -- We use pg_notify to avoid blocking the registration insert
  PERFORM pg_notify(
    'event_confirmation_email',
    json_build_object(
      'registration_id', NEW.id,
      'event_id', NEW.event_id,
      'email', NEW.email,
      'full_name', NEW.first_name || ' ' || NEW.last_name
    )::text
  );
  
  -- Log the email request for debugging
  INSERT INTO public.event_email_logs (
    registration_id,
    email,
    status,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    'queued',
    NOW()
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't let email failures block registration
  RAISE NOTICE 'Email notification failed for registration %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Create trigger that fires after event registration insert
DROP TRIGGER IF EXISTS trigger_send_event_confirmation ON public.event_registrations;
CREATE TRIGGER trigger_send_event_confirmation
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.send_event_confirmation_email();

-- Create table to log email attempts
CREATE TABLE IF NOT EXISTS public.event_email_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id uuid REFERENCES event_registrations(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'queued', -- queued, sent, failed
  error_message text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- Add RLS policies for the email logs table
ALTER TABLE public.event_email_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all email logs
CREATE POLICY "Admins can view email logs" ON public.event_email_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_email_logs_registration_id ON public.event_email_logs(registration_id);
CREATE INDEX IF NOT EXISTS idx_event_email_logs_status ON public.event_email_logs(status);
CREATE INDEX IF NOT EXISTS idx_event_email_logs_created_at ON public.event_email_logs(created_at);
