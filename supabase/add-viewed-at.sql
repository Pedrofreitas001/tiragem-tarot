-- Adicionar campo viewed_at para rastrear quando uma leitura foi visualizada
ALTER TABLE public.readings 
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_readings_viewed_at ON public.readings(viewed_at);

-- Comentário explicativo
COMMENT ON COLUMN public.readings.viewed_at IS 'Timestamp de quando a leitura foi visualizada pela primeira vez';
