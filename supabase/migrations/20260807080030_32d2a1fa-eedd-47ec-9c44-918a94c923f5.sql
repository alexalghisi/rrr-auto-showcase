-- Tighten public INSERT on leads with server-side validation in the policy
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a valid lead"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  kind IN ('rezervare','finantare','alerta','consilier')
  AND status = 'nou'
  AND (name IS NULL OR char_length(name) <= 100)
  AND (phone IS NULL OR char_length(phone) <= 40)
  AND (email IS NULL OR char_length(email) <= 255)
  AND (car_slug IS NULL OR char_length(car_slug) <= 200)
  AND (car_title IS NULL OR char_length(car_title) <= 200)
  AND (message IS NULL OR char_length(message) <= 1500)
  AND jsonb_typeof(details) = 'object'
  AND char_length(details::text) <= 4000
  AND (coalesce(phone,'') <> '' OR coalesce(email,'') <> '' OR coalesce(message,'') <> '')
);

-- Tighten public INSERT on page_views
DROP POLICY IF EXISTS "Anyone can record a view" ON public.page_views;
CREATE POLICY "Anyone can record a valid view"
ON public.page_views
FOR INSERT
TO anon, authenticated
WITH CHECK (
  path ~ '^/[A-Za-z0-9/_.:?=&%~+-]{0,299}$'
  AND char_length(path) <= 300
  AND (car_slug IS NULL OR car_slug ~ '^[a-z0-9-]{1,200}$')
);

-- Defense in depth: hard constraints at table level
ALTER TABLE public.leads
  ADD CONSTRAINT leads_kind_valid CHECK (kind IN ('rezervare','finantare','alerta','consilier')) NOT VALID,
  ADD CONSTRAINT leads_lengths_valid CHECK (
    coalesce(char_length(name),0) <= 100
    AND coalesce(char_length(phone),0) <= 40
    AND coalesce(char_length(email),0) <= 255
    AND coalesce(char_length(car_slug),0) <= 200
    AND coalesce(char_length(car_title),0) <= 200
    AND coalesce(char_length(message),0) <= 1500
    AND char_length(details::text) <= 4000
  ) NOT VALID;

ALTER TABLE public.page_views
  ADD CONSTRAINT page_views_path_valid CHECK (char_length(path) BETWEEN 1 AND 300) NOT VALID,
  ADD CONSTRAINT page_views_car_slug_valid CHECK (car_slug IS NULL OR char_length(car_slug) <= 200) NOT VALID;