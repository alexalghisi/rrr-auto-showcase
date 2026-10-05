CREATE OR REPLACE FUNCTION public.rate_car(
  p_car_slug text,
  p_voter_key text,
  p_rating smallint
)
RETURNS TABLE(rating_average numeric, rating_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  target_car_id uuid;
  hashed_voter text;
BEGIN
  IF p_car_slug !~ '^[a-z0-9-]{1,200}$' THEN
    RAISE EXCEPTION 'Mașină invalidă';
  END IF;
  IF p_voter_key !~ '^[a-f0-9-]{36}$' THEN
    RAISE EXCEPTION 'Identificator invalid';
  END IF;
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Evaluarea trebuie să fie între 1 și 5';
  END IF;

  SELECT id INTO target_car_id
  FROM public.cars
  WHERE slug = p_car_slug AND published = true;

  IF target_car_id IS NULL THEN
    RAISE EXCEPTION 'Mașina nu a fost găsită';
  END IF;

  hashed_voter := encode(digest(p_voter_key, 'sha256'), 'hex');

  INSERT INTO public.car_ratings (car_id, voter_hash, rating)
  VALUES (target_car_id, hashed_voter, p_rating)
  ON CONFLICT (car_id, voter_hash)
  DO UPDATE SET rating = EXCLUDED.rating, updated_at = now();

  RETURN QUERY
  SELECT c.rating_average, c.rating_count
  FROM public.cars c
  WHERE c.id = target_car_id;
END;
$$;

REVOKE ALL ON FUNCTION public.rate_car(text, text, smallint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rate_car(text, text, smallint) TO anon, authenticated, service_role;