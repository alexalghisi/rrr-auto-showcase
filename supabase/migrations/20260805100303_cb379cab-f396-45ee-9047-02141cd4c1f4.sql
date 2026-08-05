CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE TABLE public.cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  make text NOT NULL,
  model text NOT NULL,
  trim text,
  year integer NOT NULL,
  mileage_km integer NOT NULL DEFAULT 0,
  fuel text NOT NULL DEFAULT 'Diesel',
  gearbox text NOT NULL DEFAULT 'Manuala',
  power_hp integer,
  engine_cc integer,
  body_type text,
  drivetrain text,
  color text,
  doors integer,
  price numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  description text,
  features text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'disponibila',
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cars TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cars TO authenticated;
GRANT ALL ON public.cars TO service_role;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published cars"
ON public.cars FOR SELECT TO anon, authenticated
USING (published = true);

CREATE POLICY "Admins can view all cars"
ON public.cars FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert cars"
ON public.cars FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update cars"
ON public.cars FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete cars"
ON public.cars FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER cars_set_updated_at
BEFORE UPDATE ON public.cars
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX cars_published_created_idx ON public.cars (published, created_at DESC);

CREATE POLICY "Admins can upload car photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'car-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view car photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'car-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update car photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'car-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete car photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'car-photos' AND public.has_role(auth.uid(), 'admin'));