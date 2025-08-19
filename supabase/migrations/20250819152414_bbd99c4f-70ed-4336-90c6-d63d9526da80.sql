-- Drop the existing scheduled job
SELECT cron.unschedule('auto-post-hilarious-screams');

-- Create multiple random-timed jobs throughout the day for organic posting
-- Morning posts (random times between 7-11 AM UTC)
SELECT cron.schedule(
  'auto-post-screams-morning',
  '23 8 * * *', -- 8:23 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://orucuxrquthieojrbyze.supabase.co/functions/v1/auto-post-screams',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydWN1eHJxdXRoaWVvanJieXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3Nzk1NTMsImV4cCI6MjA2NzM1NTU1M30.3HPL72f6c97V5MhwDsbS2ckh826iq66At36xU6yTNhk"}'::jsonb,
        body:='{"trigger": "cron_morning", "timestamp": "'||now()||'"}'::jsonb
    ) as request_id;
  $$
);

-- Afternoon posts (random times between 1-4 PM UTC)
SELECT cron.schedule(
  'auto-post-screams-afternoon',
  '47 15 * * *', -- 3:47 PM UTC
  $$
  SELECT
    net.http_post(
        url:='https://orucuxrquthieojrbyze.supabase.co/functions/v1/auto-post-screams',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydWN1eHJxdXRoaWVvanJieXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3Nzk1NTMsImV4cCI6MjA2NzM1NTU1M30.3HPL72f6c97V5MhwDsbS2ckh826iq66At36xU6yTNhk"}'::jsonb,
        body:='{"trigger": "cron_afternoon", "timestamp": "'||now()||'"}'::jsonb
    ) as request_id;
  $$
);

-- Evening posts (random times between 6-10 PM UTC)  
SELECT cron.schedule(
  'auto-post-screams-evening',
  '12 20 * * *', -- 8:12 PM UTC
  $$
  SELECT
    net.http_post(
        url:='https://orucuxrquthieojrbyze.supabase.co/functions/v1/auto-post-screams',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydWN1eHJxdXRoaWVvanJieXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3Nzk1NTMsImV4cCI6MjA2NzM1NTU1M30.3HPL72f6c97V5MhwDsbS2ckh826iq66At36xU6yTNhk"}'::jsonb,
        body:='{"trigger": "cron_evening", "timestamp": "'||now()||'"}'::jsonb
    ) as request_id;
  $$
);