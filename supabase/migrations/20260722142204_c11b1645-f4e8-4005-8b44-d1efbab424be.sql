
-- Create resources table if missing (aligning with existing app code), and add text/code sharing columns.
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_code text NOT NULL UNIQUE,
  original_name text NOT NULL,
  storage_path text,
  public_url text,
  file_type text NOT NULL,
  mime_type text,
  file_size bigint,
  expires_at timestamptz NOT NULL,
  views integer NOT NULL DEFAULT 0,
  downloads integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add new columns for text / code sharing (idempotent)
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS resource_type text NOT NULL DEFAULT 'file',
  ADD COLUMN IF NOT EXISTS text_content text,
  ADD COLUMN IF NOT EXISTS language text;

-- Ensure file-only columns are nullable so text resources can skip storage
ALTER TABLE public.resources ALTER COLUMN storage_path DROP NOT NULL;
ALTER TABLE public.resources ALTER COLUMN public_url DROP NOT NULL;
ALTER TABLE public.resources ALTER COLUMN mime_type DROP NOT NULL;
ALTER TABLE public.resources ALTER COLUMN file_size DROP NOT NULL;

-- Constrain resource_type values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'resources_resource_type_check'
  ) THEN
    ALTER TABLE public.resources
      ADD CONSTRAINT resources_resource_type_check CHECK (resource_type IN ('file','text'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS resources_share_code_idx ON public.resources(share_code);
CREATE INDEX IF NOT EXISTS resources_expires_at_idx ON public.resources(expires_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO anon, authenticated;
GRANT ALL ON public.resources TO service_role;

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='resources' AND policyname='Anyone can read resources') THEN
    CREATE POLICY "Anyone can read resources" ON public.resources FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='resources' AND policyname='Anyone can insert resources') THEN
    CREATE POLICY "Anyone can insert resources" ON public.resources FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='resources' AND policyname='Anyone can update resources') THEN
    CREATE POLICY "Anyone can update resources" ON public.resources FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='resources' AND policyname='Anyone can delete resources') THEN
    CREATE POLICY "Anyone can delete resources" ON public.resources FOR DELETE TO anon, authenticated USING (true);
  END IF;
END $$;
