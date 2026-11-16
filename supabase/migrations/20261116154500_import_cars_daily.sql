SELECT cron.unschedule(jobid)
FROM cron.job
WHERE command LIKE '%/api/public/hooks/import-cars%';

-- În fiecare zi, la 05:15 și 17:15 UTC, stocul se reia de pe OLX și Facebook.
SELECT cron.schedule(
  'import-cars-daily',
  '15 5,17 * * *',
  $$
  SELECT net.http_post(
    url := 'https://bremenauto.ro/api/public/hooks/import-cars',
    headers := '{"Content-Type": "application/json", "apikey": "sb_publishable_er4oRFJzhkQp4x_ZGo_sig_cC5WaYr8"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);
