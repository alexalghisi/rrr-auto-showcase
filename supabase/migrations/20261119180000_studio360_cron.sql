SELECT cron.unschedule(jobid)
FROM cron.job
WHERE command LIKE '%/api/public/hooks/studio360%';

-- La fiecare 3 minute se generează următoarele 2 unghiuri 360° de studio lipsă (mașinile noi intră automat).
SELECT cron.schedule(
  'studio360-generate',
  '*/3 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://bremenauto.ro/api/public/hooks/studio360',
    headers := '{"Content-Type": "application/json", "apikey": "sb_publishable_er4oRFJzhkQp4x_ZGo_sig_cC5WaYr8"}'::jsonb,
    body := '{}'::jsonb,
    timeout_milliseconds := 170000
  ) as request_id;
  $$
);
