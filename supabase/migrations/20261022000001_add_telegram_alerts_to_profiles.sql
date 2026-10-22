-- ==============================================================================
-- Migration: Add Telegram Alerting fields to public.profiles
-- Allows creators and traders to link their Telegram chat ID, username, or phone
-- to receive automated instant pings when buyers purchase accounts, offer prices,
-- or send messages in escrow.
-- ==============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS telegram_chat_id text,
ADD COLUMN IF NOT EXISTS telegram_username text,
ADD COLUMN IF NOT EXISTS telegram_phone text;

-- Create an index on telegram_chat_id for lightning-fast lookup during bot webhooks
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_chat_id ON public.profiles(telegram_chat_id);
