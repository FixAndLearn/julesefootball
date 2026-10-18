-- Create user_invitations tracking table
CREATE TABLE IF NOT EXISTS public.user_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    invitee_email TEXT NOT NULL,
    invite_code TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_invitations_code ON public.user_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON public.user_invitations(invitee_email);

-- Enable RLS
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Inviter can read their invitations
CREATE POLICY "Inviters can view their sent invitations"
    ON public.user_invitations FOR SELECT
    USING (auth.uid() = inviter_id);

-- Inviter can create invitations
CREATE POLICY "Users can create invitations"
    ON public.user_invitations FOR INSERT
    WITH CHECK (auth.uid() = inviter_id OR auth.uid() IS NOT NULL);

-- Public can check invitation by code
CREATE POLICY "Public can view invitation by code"
    ON public.user_invitations FOR SELECT
    USING (true);
