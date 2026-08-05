UPDATE public.cars
SET images = COALESCE((
  SELECT array_agg(u ORDER BY ord)
  FROM unnest(images) WITH ORDINALITY AS t(u, ord)
  WHERE u NOT ILIKE '%facebook.com/%/posts/%'
    AND u NOT ILIKE '%olx.ro/d/%'
), '{}')
WHERE EXISTS (
  SELECT 1 FROM unnest(images) AS u
  WHERE u ILIKE '%facebook.com/%/posts/%' OR u ILIKE '%olx.ro/d/%'
);