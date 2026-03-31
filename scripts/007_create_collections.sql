-- Collections: groups of media that a user curates

CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "collections_select_own" ON public.collections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = collections.profile_id AND profiles.user_id = auth.uid())
  );
CREATE POLICY "collections_insert_own" ON public.collections
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = collections.profile_id AND profiles.user_id = auth.uid())
  );
CREATE POLICY "collections_update_own" ON public.collections
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = collections.profile_id AND profiles.user_id = auth.uid())
  );
CREATE POLICY "collections_delete_own" ON public.collections
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = collections.profile_id AND profiles.user_id = auth.uid())
  );

-- Collection media items
CREATE TABLE public.collection_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.collection_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "collection_media_select_own" ON public.collection_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      JOIN public.profiles p ON p.id = c.profile_id
      WHERE c.id = collection_media.collection_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "collection_media_insert_own" ON public.collection_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collections c
      JOIN public.profiles p ON p.id = c.profile_id
      WHERE c.id = collection_media.collection_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "collection_media_update_own" ON public.collection_media
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      JOIN public.profiles p ON p.id = c.profile_id
      WHERE c.id = collection_media.collection_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "collection_media_delete_own" ON public.collection_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      JOIN public.profiles p ON p.id = c.profile_id
      WHERE c.id = collection_media.collection_id AND p.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_collections_profile_id ON public.collections(profile_id);
CREATE INDEX IF NOT EXISTS idx_collection_media_collection_id ON public.collection_media(collection_id);
