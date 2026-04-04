-- Supabase Storage: bucket + RLS for post images (public read, authenticated write under own profile paths)

INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;
--> statement-breakpoint
DROP POLICY IF EXISTS "Users can upload post images" ON storage.objects;
--> statement-breakpoint
CREATE POLICY "Users can upload post images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'posts' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id::text = (storage.foldername(name))[1]
    AND profiles.user_id = auth.uid()
  )
);
--> statement-breakpoint
DROP POLICY IF EXISTS "Users can update own post images" ON storage.objects;
--> statement-breakpoint
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
--> statement-breakpoint
DROP POLICY IF EXISTS "Users can delete own post images" ON storage.objects;
--> statement-breakpoint
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
--> statement-breakpoint
DROP POLICY IF EXISTS "Anyone can view post images" ON storage.objects;
--> statement-breakpoint
CREATE POLICY "Anyone can view post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');
