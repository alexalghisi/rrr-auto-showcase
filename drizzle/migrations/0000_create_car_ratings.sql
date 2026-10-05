CREATE TABLE public.car_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  voter_hash text NOT NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (car_id, voter_hash)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.car_ratings TO authenticated;
GRANT ALL ON public.car_ratings TO service_role;

ALTER TABLE public.car_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view car ratings"
ON public.car_ratings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete car ratings"
ON public.car_ratings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.cars
  ADD COLUMN rating_average numeric(2,1) NOT NULL DEFAULT 0,
  ADD COLUMN rating_count integer NOT NULL DEFAULT 0;

CREATE INDEX car_ratings_car_id_idx ON public.car_ratings(car_id);

CREATE OR REPLACE FUNCTION public.refresh_car_rating_summary()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_car_id uuid;
BEGIN
  target_car_id := COALESCE(NEW.car_id, OLD.car_id);
  UPDATE public.cars
  SET rating_average = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.car_ratings WHERE car_id = target_car_id), 0),
      rating_count = (SELECT COUNT(*) FROM public.car_ratings WHERE car_id = target_car_id)
  WHERE id = target_car_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER car_ratings_refresh_summary
AFTER INSERT OR UPDATE OR DELETE ON public.car_ratings
FOR EACH ROW EXECUTE FUNCTION public.refresh_car_rating_summary();

CREATE TRIGGER car_ratings_set_updated_at
BEFORE UPDATE ON public.car_ratings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();