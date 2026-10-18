-- ==============================================================================
-- Enforce Strict Email Verification for Anti-Scam Protection
-- Drops any auto-confirm triggers so accounts MUST be verified via 6-digit OTP code
-- ==============================================================================

-- 1. Remove auto-confirm trigger on auth.users so unconfirmed users cannot bypass OTP
DROP TRIGGER IF EXISTS trg_auto_confirm_new_user ON auth.users;
DROP FUNCTION IF EXISTS public.auto_confirm_new_user();

-- 2. Document anti-scam security policy
COMMENT ON TABLE public.profiles IS 'Profiles protected by mandatory 6-digit email OTP verification';
