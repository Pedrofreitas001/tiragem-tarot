-- Add delivery period to WhatsApp subscriptions
-- Safe to run multiple times

ALTER TABLE public.whatsapp_subscriptions
  ADD COLUMN IF NOT EXISTS delivery_period TEXT NOT NULL DEFAULT 'morning';

ALTER TABLE public.whatsapp_subscriptions
  DROP CONSTRAINT IF EXISTS whatsapp_subscriptions_delivery_period_check;

ALTER TABLE public.whatsapp_subscriptions
  ADD CONSTRAINT whatsapp_subscriptions_delivery_period_check
  CHECK (delivery_period IN ('morning', 'afternoon', 'evening'));
