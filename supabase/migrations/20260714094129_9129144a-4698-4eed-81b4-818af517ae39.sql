CREATE TABLE public.resource_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id uuid NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.resource_views TO anon, authenticated;
GRANT ALL ON public.resource_views TO service_role;
ALTER TABLE public.resource_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log a view" ON public.resource_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read view logs" ON public.resource_views FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX resource_views_resource_id_idx ON public.resource_views(resource_id);
CREATE INDEX resource_views_viewed_at_idx ON public.resource_views(viewed_at);