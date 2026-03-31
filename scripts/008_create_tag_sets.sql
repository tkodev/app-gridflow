-- Tag Sets: reusable groups of hashtags that can be assigned to posts

CREATE TABLE public.tag_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tag_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tag_sets_select_own" ON public.tag_sets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = tag_sets.profile_id AND profiles.user_id = auth.uid())
  );
CREATE POLICY "tag_sets_insert_own" ON public.tag_sets
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = tag_sets.profile_id AND profiles.user_id = auth.uid())
  );
CREATE POLICY "tag_sets_update_own" ON public.tag_sets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = tag_sets.profile_id AND profiles.user_id = auth.uid())
  );
CREATE POLICY "tag_sets_delete_own" ON public.tag_sets
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = tag_sets.profile_id AND profiles.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_tag_sets_profile_id ON public.tag_sets(profile_id);

-- Junction table: posts can have multiple tag sets
CREATE TABLE public.post_tag_sets (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_set_id UUID NOT NULL REFERENCES public.tag_sets(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_set_id)
);

ALTER TABLE public.post_tag_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_tag_sets_select_own" ON public.post_tag_sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.posts po
      JOIN public.profiles p ON p.id = po.profile_id
      WHERE po.id = post_tag_sets.post_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "post_tag_sets_insert_own" ON public.post_tag_sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts po
      JOIN public.profiles p ON p.id = po.profile_id
      WHERE po.id = post_tag_sets.post_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "post_tag_sets_delete_own" ON public.post_tag_sets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.posts po
      JOIN public.profiles p ON p.id = po.profile_id
      WHERE po.id = post_tag_sets.post_id AND p.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_post_tag_sets_post_id ON public.post_tag_sets(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tag_sets_tag_set_id ON public.post_tag_sets(tag_set_id);
