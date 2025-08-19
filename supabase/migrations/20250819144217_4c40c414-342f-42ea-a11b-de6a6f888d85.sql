-- Set up cron job to automatically post AI-generated screams 3 times a day
-- This will run at 9 AM, 2 PM, and 7 PM UTC (peak engagement times)

SELECT cron.schedule(
  'auto-post-hilarious-screams',
  '0 9,14,19 * * *', -- At 9:00, 14:00, and 19:00 UTC every day
  $$
  SELECT
    net.http_post(
        url:='https://orucuxrquthieojrbyze.supabase.co/functions/v1/auto-post-screams',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydWN1eHJxdXRoaWVvanJieXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3Nzk1NTMsImV4cCI6MjA2NzM1NTU1M30.3HPL72f6c97V5MhwDsbS2ckh826iq66At36xU6yTNhk"}'::jsonb,
        body:='{"trigger": "cron", "timestamp": "'||now()||'"}'::jsonb
    ) as request_id;
  $$
);