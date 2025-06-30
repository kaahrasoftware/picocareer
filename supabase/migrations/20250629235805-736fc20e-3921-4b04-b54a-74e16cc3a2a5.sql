
-- Create the database trigger to automatically send event confirmation emails
CREATE OR REPLACE FUNCTION public.send_event_confirmation_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  
  -- Call the edge function asynchronously to send confirmation email
  -- We use pg_notify to trigger the email process
  PERFORM pg_notify(
    'event_confirmation_email',
    json_build_object(
      'registrationId', NEW.id,
      'eventId', NEW.event_id,
      'email', NEW.email,
      'fullName', NEW.first_name || ' ' || NEW.last_name
    )::text
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

-- Create the trigger that fires after event registration insert
DROP TRIGGER IF EXISTS trigger_send_event_confirmation_email ON public.event_registrations;
CREATE TRIGGER trigger_send_event_confirmation_email
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.send_event_confirmation_email();
