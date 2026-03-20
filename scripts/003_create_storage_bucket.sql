-- Create storage bucket for post images
-- Bucket is public for reading (displaying images) but RLS controlled for uploads

-- Create the bucket (public for reading)
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images to their own profile folders
CREATE POLICY "Users can upload post images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'posts' AND
  -- Path must be: {profile_id}/{filename}
  -- Check that the profile belongs to the user
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id::text = (storage.foldername(name))[1]
    AND profiles.user_id = auth.uid()
  )
);

-- Allow users to update/overwrite their own images
CREATE POLICY "Users can update own post images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'posts' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id::text = (storage.foldername(name))[1]
    AND profiles.user_id = auth.uid()
  )
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own post images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'posts' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id::text = (storage.foldername(name))[1]
    AND profiles.user_id = auth.uid()
  )
);

-- Allow public read access (since bucket is public)
CREATE POLICY "Anyone can view post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');
