-- ==============================================================================
-- eFootballMarket Kenya - MASTER PRODUCTION DATABASE SCHEMA & MIGRATION
-- Migration File: supabase/migrations/20261021000001_master_production_schema.sql
-- 
-- Covers:
--  1. Authentication & Profiles (wallet balance, escrow, verification, roles)
--  2. Listings & Marketplace (credentials vault, offers, featured squad cards)
--  3. Orders & Escrow Custody (M-Pesa Till 1572931, payouts, dispute handling)
--  4. Withdrawals System (instant seller wallet cashouts to Safaricom)
--  5. News & Announcements (community updates, guides)
--  6. User Invitations (community referral tracking)
--  7. Tournaments & 1v1 Wager Duels:
--     - 1v1 wager duels (Winner Takes All 100%) vs multi-player tournaments
--     - Tiered platform commission fee (KES 10-20 for small pots, ~5% for large pots)
--     - In-game 12-minute game duration standard
--     - Wallet balance payment deduction or M-Pesa Till 1572931
--     - Knockout bracket tree nodes & match score reporting
--  8. Security: Row Level Security (RLS) policies for users, sellers, moderators & admins
--  9. Realtime Subscriptions configuration
--
-- IDEMPOTENT: Safe to run multiple times in Supabase SQL Editor with zero errors.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES & USERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  username VARCHAR(100) UNIQUE,
  phone_number VARCHAR(50),
  whatsapp_number VARCHAR(50),
  avatar_url TEXT,
  bio TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'user', 'seller', 'moderator', 'admin', 'super_admin'
  seller_rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  total_reviews_count INTEGER NOT NULL DEFAULT 0,
  completed_sales_count INTEGER NOT NULL DEFAULT 0,
  available_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  escrow_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified_seller BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent column additions for existing profiles tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(50);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS available_balance NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS escrow_balance NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified_seller BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'user';

-- User Roles Table (Role-based access control)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_roles UNIQUE (user_id, role_id)
);

-- ==============================================================================
-- 2. MARKETPLACE LISTINGS & CREDENTIALS VAULT
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  collective_strength INTEGER,
  division VARCHAR(50),
  account_level INTEGER,
  coin_balance INTEGER DEFAULT 0,
  gp_balance INTEGER DEFAULT 0,
  platform VARCHAR(50) NOT NULL DEFAULT 'all', -- 'all', 'android', 'ios', 'console_pc'
  region VARCHAR(100) DEFAULT 'Kenya',
  status VARCHAR(50) NOT NULL DEFAULT 'available', -- 'available', 'pending_escrow', 'sold', 'rejected', 'archived'
  images TEXT[] DEFAULT '{}',
  featured_players JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS featured_players JSONB DEFAULT '[]';
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Escrow Credentials Vault (Secure Konami ID / Linked account details)
CREATE TABLE IF NOT EXISTS public.listing_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  konami_id VARCHAR(255) NOT NULL,
  konami_password TEXT NOT NULL,
  linked_email VARCHAR(255),
  recovery_info TEXT,
  is_released BOOLEAN NOT NULL DEFAULT FALSE,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Buyer Offers on Listings
CREATE TABLE IF NOT EXISTS public.listing_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offer_amount NUMERIC(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'countered', 'cancelled'
  counter_amount NUMERIC(12, 2),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. ORDERS & ESCROW CUSTODY (Till 1572931)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL,
  platform_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  seller_payout NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'mpesa_till',
  mpesa_reference VARCHAR(100),
  escrow_status VARCHAR(50) NOT NULL DEFAULT 'pending_deposit', -- 'pending_deposit', 'funds_held', 'credentials_delivered', 'completed', 'disputed', 'refunded'
  delivery_deadline TIMESTAMPTZ,
  dispute_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. SELLER WALLET WITHDRAWALS (M-Pesa Cashout)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(12, 2) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processed', 'rejected'
  mpesa_reference VARCHAR(100),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ==============================================================================
-- 5. NEWS ARTICLES & GUIDES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'announcement',
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. USER INVITATIONS (Community Growth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_email VARCHAR(255),
  invitee_phone VARCHAR(50),
  code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'sent',
  joined_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. TOURNAMENTS & 1v1 WAGER DUELS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(350),
  description TEXT,
  platform VARCHAR(50) NOT NULL DEFAULT 'crossplay', -- 'all', 'android', 'ios', 'crossplay', 'console_pc'
  prize_pool_kes NUMERIC(12, 2) NOT NULL DEFAULT 0,
  first_place_kes NUMERIC(12, 2) NOT NULL DEFAULT 0,
  second_place_kes NUMERIC(12, 2) NOT NULL DEFAULT 0,
  entry_fee_kes NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tournament_type VARCHAR(50) NOT NULL DEFAULT 'tournament', -- '1v1', 'tournament'
  admin_fee_kes NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payout_split VARCHAR(50) NOT NULL DEFAULT 'winner_takes_all', -- 'winner_takes_all', '80_20', '70_30'
  format VARCHAR(100) NOT NULL DEFAULT 'Single Knockout 1v1 (12-Minute Game + Extra Time & PKs)',
  max_players INTEGER NOT NULL DEFAULT 8,
  registered_count INTEGER NOT NULL DEFAULT 0,
  start_date VARCHAR(150) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'registration_open', -- 'registration_open', 'in_progress', 'completed', 'cancelled'
  winner_name VARCHAR(150),
  winner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  winner_gamer_tag VARCHAR(100),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent column additions for tournaments
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS tournament_type VARCHAR(50) NOT NULL DEFAULT 'tournament';
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS admin_fee_kes NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS payout_split VARCHAR(50) NOT NULL DEFAULT 'winner_takes_all';
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Tournament Participants Table
CREATE TABLE IF NOT EXISTS public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  gamer_tag VARCHAR(100) NOT NULL,
  friend_id VARCHAR(100) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'exempt'
  payment_method VARCHAR(50) NOT NULL DEFAULT 'mpesa_till', -- 'wallet', 'mpesa_till', 'free'
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  seed INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_tournament_friend UNIQUE (tournament_id, friend_id)
);

ALTER TABLE public.tournament_participants ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) NOT NULL DEFAULT 'mpesa_till';
ALTER TABLE public.tournament_participants ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0;

-- Tournament Matches Table (Bracket nodes & 1v1 duels)
CREATE TABLE IF NOT EXISTS public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round VARCHAR(50) NOT NULL, -- 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Grand Final', '1v1 Duel Championship'
  match_number INTEGER NOT NULL,
  player1_name VARCHAR(100) NOT NULL DEFAULT 'TBD',
  player2_name VARCHAR(100) NOT NULL DEFAULT 'TBD',
  player1_friend_id VARCHAR(100),
  player2_friend_id VARCHAR(100),
  player1_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  player2_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  score1 INTEGER,
  score2 INTEGER,
  winner_name VARCHAR(100),
  winner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  match_code VARCHAR(50), -- Konami In-Game Match Room code
  next_match_id UUID REFERENCES public.tournament_matches(id) ON DELETE SET NULL,
  next_match_slot INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. INDEXES FOR LIGHTNING FAST QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(escrow_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON public.withdrawals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tournaments_type ON public.tournaments(tournament_type);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tourney ON public.tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user ON public.tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tourney ON public.tournament_matches(tournament_id, match_number);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

-- Helper admin check function for zero-overhead policy evaluation
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role_id IN ('admin', 'super_admin')
      ) OR
      EXISTS (
        SELECT 1 FROM auth.users u
        WHERE u.id = auth.uid() AND lower(u.email) IN ('brianokibo@gmail.com', 'admin@efootballmarket.co.ke')
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Listings Policies
DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;
CREATE POLICY "Public can view active listings" ON public.listings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers can manage own listings" ON public.listings;
CREATE POLICY "Sellers can manage own listings" ON public.listings FOR ALL USING (auth.uid() = seller_id OR public.is_admin_user());

-- Tournaments Policies (Public view, community members host, moderators & admins manage)
DROP POLICY IF EXISTS "Public can view tournaments" ON public.tournaments;
CREATE POLICY "Public can view tournaments" ON public.tournaments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create tournaments" ON public.tournaments;
CREATE POLICY "Authenticated users can create tournaments" ON public.tournaments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Hosts and admins can update tournaments" ON public.tournaments;
CREATE POLICY "Hosts and admins can update tournaments" ON public.tournaments FOR UPDATE USING (
  auth.uid() = created_by OR public.is_admin_user()
);

DROP POLICY IF EXISTS "Hosts and admins can delete tournaments" ON public.tournaments;
CREATE POLICY "Hosts and admins can delete tournaments" ON public.tournaments FOR DELETE USING (
  auth.uid() = created_by OR public.is_admin_user()
);

-- Tournament Participants Policies
DROP POLICY IF EXISTS "Public can view tournament participants" ON public.tournament_participants;
CREATE POLICY "Public can view tournament participants" ON public.tournament_participants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can register for tournament" ON public.tournament_participants;
CREATE POLICY "Users can register for tournament" ON public.tournament_participants FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid())
);

DROP POLICY IF EXISTS "Moderators and admins can manage participants" ON public.tournament_participants;
CREATE POLICY "Moderators and admins can manage participants" ON public.tournament_participants FOR ALL USING (
  public.is_admin_user() OR EXISTS (
    SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.created_by = auth.uid()
  )
);

-- Tournament Matches Policies
DROP POLICY IF EXISTS "Public can view tournament matches" ON public.tournament_matches;
CREATE POLICY "Public can view tournament matches" ON public.tournament_matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Moderators and admins can manage matches" ON public.tournament_matches;
CREATE POLICY "Moderators and admins can manage matches" ON public.tournament_matches FOR ALL USING (
  public.is_admin_user() OR EXISTS (
    SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.created_by = auth.uid()
  )
);

-- Withdrawals Policies
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id OR public.is_admin_user());

DROP POLICY IF EXISTS "Users can request withdrawals" ON public.withdrawals;
CREATE POLICY "Users can request withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- News Articles Policies
DROP POLICY IF EXISTS "Public can view published news" ON public.news_articles;
CREATE POLICY "Public can view published news" ON public.news_articles FOR SELECT USING (is_published = true OR public.is_admin_user());

-- ==============================================================================
-- 10. REALTIME CONFIGURATION
-- ==============================================================================
DO $$
BEGIN
  -- Enable Realtime publication for key live tables
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_matches;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_participants;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.listings;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawals;
  EXCEPTION WHEN duplicate_object THEN
    -- Table already in publication
  END;
END $$;
