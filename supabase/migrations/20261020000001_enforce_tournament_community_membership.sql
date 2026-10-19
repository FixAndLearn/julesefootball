-- ==============================================================================
-- eFootballMarket Kenya - Enforce Community Membership For Tournament Entry
-- Migration: 20261020000001_enforce_tournament_community_membership.sql
-- Description: Blocks unregistered/anonymous visitors from joining tournaments.
-- Only authenticated community members can insert tournament participant slots.
-- ==============================================================================

-- 1. Drop old open-access policy
DROP POLICY IF EXISTS "Anyone can register for tournaments" ON public.tournament_participants;

-- 2. Create strict policy: Only registered, authenticated community members can register
DROP POLICY IF EXISTS "Registered community members can join tournaments" ON public.tournament_participants;
CREATE POLICY "Registered community members can join tournaments" ON public.tournament_participants
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND (p.role IN ('admin', 'super_admin') OR lower(p.email) = 'brianokibo@gmail.com')
      )
    )
  );

-- 3. Prevent duplicate registrations for the same tournament by the same community account
CREATE UNIQUE INDEX IF NOT EXISTS uq_tournament_participant_user
  ON public.tournament_participants(tournament_id, user_id)
  WHERE user_id IS NOT NULL;

-- 4. Revoke anonymous direct insert privileges and restrict to authenticated members
REVOKE INSERT ON public.tournament_participants FROM anon;
GRANT INSERT, SELECT ON public.tournament_participants TO authenticated;
GRANT SELECT ON public.tournament_participants TO anon;
