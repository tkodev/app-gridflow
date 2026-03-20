-- Subtitle covers song/location-style line; dedicated columns were unused
ALTER TABLE public.posts
  DROP COLUMN IF EXISTS location,
  DROP COLUMN IF EXISTS music;
