SELECT cron.unschedule(jobid)
FROM cron.job
WHERE command LIKE '%/api/public/hooks/import-cars%';

SELECT cron.schedule(
  'import-cars-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--5b26f5fd-8d60-4955-8cd3-809e5e64b534.lovable.app/api/public/hooks/import-cars',
    headers := '{"Content-Type": "application/json", "apikey": "sb_publishable_er4oRFJzhkQp4x_ZGo_sig_cC5WaYr8"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);