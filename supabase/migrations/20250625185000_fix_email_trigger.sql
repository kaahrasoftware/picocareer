
-- Update the function to directly call the edge function
CREATE OR REPLACE FUNCTION public.send_event_confirmation_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
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
  
  -- Call the edge function directly using http_post extension
  -- Note: This requires the http extension to be enabled
  SELECT content INTO v_result
  FROM http_post(
    'https://wurdmlkfkzuivvwxjmxk.supabase.co/functions/v1/process-event-confirmations',
    json_build_object('registrationId', NEW.id)::text,
    'application/json',
    ARRAY[
      http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)),
      http_header('Content-Type', 'application/json')
    ]
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't let email failures block registration
  RAISE NOTICE 'Email notification failed for registration %: %', NEW.id, SQLERRM;
  
  -- Update the email log to failed status
  UPDATE public.event_email_logs 
  SET status = 'failed', 
      error_message = SQLERRM,
      updated_at = NOW()
  WHERE registration_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Enable the http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http;

-- Add a setting for the service role key (this should be set by an admin)
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key-here';
