-- Add tagline column to posts (location or music reference)

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS tagline TEXT;
