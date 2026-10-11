-- Migration: Create listing_offers table for bargaining and counter-offers
-- Run in Supabase SQL editor or automated deployment

CREATE TABLE IF NOT EXISTS public.listing_offers (
  id TEXT PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  buyer_name VARCHAR(150) NOT NULL,
  buyer_phone VARCHAR(50) NOT NULL,
  offered_price NUMERIC(12, 2) NOT NULL,
  original_price NUMERIC(12, 2) NOT NULL,
  discount_percentage INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending, accepted, declined, countered, expired
  note TEXT,
  counter_price NUMERIC(12, 2),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_listing_offers_listing_id ON public.listing_offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_offers_seller_id ON public.listing_offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_listing_offers_status ON public.listing_offers(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.listing_offers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to offers for the listing
CREATE POLICY "Public read offers" ON public.listing_offers
  FOR SELECT USING (true);

-- Allow public insert of offers
CREATE POLICY "Public insert offers" ON public.listing_offers
  FOR INSERT WITH CHECK (true);

-- Allow updates
CREATE POLICY "Public update offers" ON public.listing_offers
  FOR UPDATE USING (true);
