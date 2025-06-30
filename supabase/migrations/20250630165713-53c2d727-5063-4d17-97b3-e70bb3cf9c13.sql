
-- Create the enhanced database trigger for event confirmation emails
CREATE OR REPLACE FUNCTION public.send_event_confirmation_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_exists BOOLEAN;
BEGIN
  -- Check if the event exists
  SELECT EXISTS(SELECT 1 FROM events WHERE id = NEW.event_id) INTO v_event_exists;
  
  IF NOT v_event_exists THEN
    RAISE NOTICE 'Event % not found for registration %', NEW.event_id, NEW.id;
    RETURN NEW;
  END IF;

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
  
  -- Call the edge function directly using HTTP POST
  BEGIN
    -- First try immediate processing
    PERFORM pg_notify(
      'event_confirmation_email',
      json_build_object(
        'registrationId', NEW.id,
        'eventId', NEW.event_id,
        'email', NEW.email,
        'fullName', NEW.first_name || ' ' || NEW.last_name
      )::text
    );
    
    -- Also trigger the process-event-confirmations function immediately
    PERFORM net.http_post(
      url := 'https://wurdmlkfkzuivvwxjmxk.supabase.co/functions/v1/process-event-confirmations',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)
      ),
      body := jsonb_build_object('registrationId', NEW.id)
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the registration
    RAISE NOTICE 'Immediate email processing failed for registration %: %', NEW.id, SQLERRM;
    
    -- Update status to indicate immediate processing failed
    UPDATE public.event_email_logs 
    SET status = 'queued',
        error_message = 'Immediate processing failed: ' || SQLERRM,
        updated_at = NOW()
    WHERE registration_id = NEW.id;
  END;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't let any email failures block registration
  RAISE NOTICE 'Email trigger failed for registration %: %', NEW.id, SQLERRM;
  
  -- Try to log the error if possible
  BEGIN
    INSERT INTO public.event_email_logs (
      registration_id,
      email,
      status,
      error_message,
      created_at
    ) VALUES (
      NEW.id,
      NEW.email,
      'failed',
      SQLERRM,
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    -- If we can't even log, just continue
    NULL;
  END;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger is properly created
DROP TRIGGER IF EXISTS trigger_send_event_confirmation_email ON public.event_registrations;
CREATE TRIGGER trigger_send_event_confirmation_email
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.send_event_confirmation_email();

-- Add an index for better performance on email logs
CREATE INDEX IF NOT EXISTS idx_event_email_logs_status_created 
ON public.event_email_logs(status, created_at);

-- Enable the HTTP extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http;
