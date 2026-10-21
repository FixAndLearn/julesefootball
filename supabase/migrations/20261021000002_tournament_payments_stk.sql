-- ==============================================================================
-- Migration: Tournament STK Push Payments & Verification
-- Ensures players must pay entry fees before joining tournaments.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.tournament_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  gamer_tag VARCHAR(100) NOT NULL,
  friend_id VARCHAR(100) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  checkout_request_id VARCHAR(100) UNIQUE,
  merchant_request_id VARCHAR(100),
  mpesa_receipt_number VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  result_code INTEGER,
  result_desc TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent column additions
ALTER TABLE public.tournament_payments ADD COLUMN IF NOT EXISTS mpesa_receipt_number VARCHAR(100);
ALTER TABLE public.tournament_participants ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) NOT NULL DEFAULT 'mpesa_stk';
ALTER TABLE public.tournament_participants ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tournament_payments_tourney ON public.tournament_payments(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_payments_checkout ON public.tournament_payments(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_tournament_payments_status ON public.tournament_payments(status);

-- RLS
ALTER TABLE public.tournament_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view tournament payments" ON public.tournament_payments;
CREATE POLICY "Public can view tournament payments" ON public.tournament_payments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users and backend can manage tournament payments" ON public.tournament_payments;
CREATE POLICY "Users and backend can manage tournament payments" ON public.tournament_payments FOR ALL USING (true);

-- Realtime Publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tournament_payments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_payments;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;
