-- Schedule auto-post-screams to run daily at 2:00 PM UTC
SELECT cron.schedule(
  'auto-post-screams-daily',
  '0 14 * * *', -- Daily at 2:00 PM UTC
  $$
  SELECT net.http_post(
    url := 'https://orucuxrquthieojrbyze.supabase.co/functions/v1/auto-post-screams',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydWN1eHJxdXRoaWVvanJieXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3Nzk1NTMsImV4cCI6MjA2NzM1NTU1M30.3HPL72f6c97V5MhwDsbS2ckh826iq66At36xU6yTNhk"}'::jsonb,
    body := '{"trigger": "cron_daily"}'::jsonb
  );
  $$
);