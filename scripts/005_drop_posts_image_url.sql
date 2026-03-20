-- Media URLs live only on post_media; drop legacy posts.image_url
ALTER TABLE public.posts DROP COLUMN IF EXISTS image_url;
