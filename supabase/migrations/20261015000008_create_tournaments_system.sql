-- ==============================================================================
-- eFootballMarket Kenya - Production Tournaments, Brackets & Matches System
-- Migration: 20261015000008_create_tournaments_system.sql
-- Zero Mock Data - Persistent Database-Backed Tournament Lifecycle
-- ==============================================================================

-- 1. Create tournaments table
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(350),
  description TEXT,
  platform VARCHAR(50) NOT NULL DEFAULT 'all', -- 'all', 'android', 'ios', 'crossplay', 'console_pc'
  prize_pool_kes NUMERIC(12, 2) NOT NULL DEFAULT 0,
  first_place_kes NUMERIC(12, 2) NOT NULL DEFAULT 0,
  second_place_kes NUMERIC(12, 2) NOT NULL DEFAULT 0,
  entry_fee_kes NUMERIC(12, 2) NOT NULL DEFAULT 0,
  format VARCHAR(100) NOT NULL DEFAULT 'Single Knockout 1v1',
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

-- 2. Create tournament participants table
CREATE TABLE IF NOT EXISTS public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  gamer_tag VARCHAR(100) NOT NULL,
  friend_id VARCHAR(100) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'exempt'
  seed INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_tournament_friend UNIQUE (tournament_id, friend_id)
);

-- 3. Create tournament matches table (bracket tree nodes)
CREATE TABLE IF NOT EXISTS public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round VARCHAR(50) NOT NULL, -- 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Grand Final'
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
  match_code VARCHAR(50), -- e.g. In-game Match Room code
  next_match_id UUID REFERENCES public.tournament_matches(id) ON DELETE SET NULL,
  next_match_slot INTEGER, -- 1 = player1 in next match, 2 = player2 in next match
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tourney ON public.tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tourney ON public.tournament_matches(tournament_id, match_number);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

-- 6. Tournaments RLS Policies
DROP POLICY IF EXISTS "Public can view tournaments" ON public.tournaments;
CREATE POLICY "Public can view tournaments" ON public.tournaments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage tournaments" ON public.tournaments;
CREATE POLICY "Admins can manage tournaments" ON public.tournaments
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role_id IN ('admin', 'super_admin')
      ) OR
      EXISTS (
        SELECT 1 FROM auth.users u
        WHERE u.id = auth.uid() AND lower(u.email) = 'brianokibo@gmail.com'
      )
    )
  );

-- 7. Tournament Participants RLS Policies
DROP POLICY IF EXISTS "Public can view tournament participants" ON public.tournament_participants;
CREATE POLICY "Public can view tournament participants" ON public.tournament_participants
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can register for tournaments" ON public.tournament_participants;
CREATE POLICY "Anyone can register for tournaments" ON public.tournament_participants
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage participants" ON public.tournament_participants;
CREATE POLICY "Admins can manage participants" ON public.tournament_participants
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role_id IN ('admin', 'super_admin')
      ) OR
      EXISTS (
        SELECT 1 FROM auth.users u
        WHERE u.id = auth.uid() AND lower(u.email) = 'brianokibo@gmail.com'
      )
    )
  );

-- 8. Tournament Matches RLS Policies
DROP POLICY IF EXISTS "Public can view tournament matches" ON public.tournament_matches;
CREATE POLICY "Public can view tournament matches" ON public.tournament_matches
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage tournament matches" ON public.tournament_matches;
CREATE POLICY "Admins can manage tournament matches" ON public.tournament_matches
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role_id IN ('admin', 'super_admin')
      ) OR
      EXISTS (
        SELECT 1 FROM auth.users u
        WHERE u.id = auth.uid() AND lower(u.email) = 'brianokibo@gmail.com'
      )
    )
  );

-- 9. Grant Permissions to anon & authenticated
GRANT SELECT ON public.tournaments TO anon, authenticated;
GRANT SELECT, INSERT ON public.tournament_participants TO anon, authenticated;
GRANT SELECT ON public.tournament_matches TO anon, authenticated;

-- 10. Enable Supabase Realtime for Tournaments, Participants, and Matches
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tournaments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tournament_participants') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_participants;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tournament_matches') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_matches;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
