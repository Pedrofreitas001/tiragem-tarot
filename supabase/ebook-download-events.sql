-- EBOOK DOWNLOAD EVENTS
-- ============================================
-- Rastreia quantidade de downloads de ebook por usuário
-- Cada download gera um evento (contagem por linhas)
-- ============================================

CREATE TABLE IF NOT EXISTS public.ebook_download_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  source TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ebook_download_events_user_id
  ON public.ebook_download_events(user_id);

CREATE INDEX IF NOT EXISTS idx_ebook_download_events_downloaded_at
  ON public.ebook_download_events(downloaded_at DESC);

ALTER TABLE public.ebook_download_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ebook download events"
  ON public.ebook_download_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ebook download events"
  ON public.ebook_download_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ebook download events"
  ON public.ebook_download_events FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.ebook_download_events TO authenticated;
