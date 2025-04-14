
-- Add the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to check for session reminders every 10 minutes
SELECT cron.schedule(
  'check-session-reminders-every-10-minutes',
  '*/10 * * * *', -- Run every 10 minutes
  $$
  SELECT net.http_post(
    url:='${SUPABASE_URL}/functions/v1/check-scheduled-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${SUPABASE_SERVICE_ROLE_KEY}"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);
