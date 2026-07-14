
CREATE TABLE IF NOT EXISTS public.resource_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS resource_downloads_resource_id_idx
  ON public.resource_downloads (resource_id);
CREATE INDEX IF NOT EXISTS resource_downloads_downloaded_at_idx
  ON public.resource_downloads (downloaded_at);

GRANT SELECT, INSERT ON public.resource_downloads TO anon;
GRANT SELECT, INSERT ON public.resource_downloads TO authenticated;
GRANT ALL ON public.resource_downloads TO service_role;

ALTER TABLE public.resource_downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can log a download" ON public.resource_downloads;
CREATE POLICY "Anyone can log a download"
  ON public.resource_downloads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read download logs" ON public.resource_downloads;
CREATE POLICY "Anyone can read download logs"
  ON public.resource_downloads
  FOR SELECT
  TO anon, authenticated
  USING (true);
