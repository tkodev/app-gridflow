-- Add subtitle to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS subtitle TEXT;

-- Add grid_ratio to profiles table (square or portrait 4:5)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grid_ratio TEXT NOT NULL DEFAULT 'square' CHECK (grid_ratio IN ('square', 'portrait'));

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload avatars to their own profile folders
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id::text = (storage.foldername(name))[1]
    AND profiles.user_id = auth.uid()
  )
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id::text = (storage.foldername(name))[1]
    AND profiles.user_id = auth.uid()
  )
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id::text = (storage.foldername(name))[1]
    AND profiles.user_id = auth.uid()
  )
);

-- Allow public read access
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
