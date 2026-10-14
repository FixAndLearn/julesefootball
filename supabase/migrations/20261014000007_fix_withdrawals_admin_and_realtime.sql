-- ==============================================================================
-- MIGRATION: FIX SELLER WITHDRAWALS RLS, REALTIME & ADMIN VISIBILITY
-- Ensures seller withdrawals reach the admin center instantly with zero permission errors.
-- ==============================================================================

-- 1. Ensure amount check constraint is flexible (min KES 10.00)
ALTER TABLE public.seller_withdrawals DROP CONSTRAINT IF EXISTS seller_withdrawals_amount_check;
ALTER TABLE public.seller_withdrawals ADD CONSTRAINT seller_withdrawals_amount_check CHECK (amount >= 10.00);

-- 2. Enable Row Level Security on seller_withdrawals
ALTER TABLE public.seller_withdrawals ENABLE ROW LEVEL SECURITY;

-- 3. SELECT Policy: Sellers can view own withdrawals; Admins and Brian Okibo can view ALL withdrawals
DROP POLICY IF EXISTS "Sellers and admins can view withdrawals" ON public.seller_withdrawals;
DROP POLICY IF EXISTS "Sellers can view own withdrawals" ON public.seller_withdrawals;
DROP POLICY IF EXISTS "Admins can view withdrawals" ON public.seller_withdrawals;

CREATE POLICY "Sellers and admins can view withdrawals" ON public.seller_withdrawals
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = seller_id OR
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

-- 4. INSERT Policy: Sellers can insert own withdrawals
DROP POLICY IF EXISTS "Sellers can insert own withdrawals" ON public.seller_withdrawals;

CREATE POLICY "Sellers can insert own withdrawals" ON public.seller_withdrawals
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      auth.uid() = seller_id OR
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

-- 5. UPDATE Policy: Admins can approve/reject/update withdrawals
DROP POLICY IF EXISTS "Admins can update withdrawals" ON public.seller_withdrawals;

CREATE POLICY "Admins can update withdrawals" ON public.seller_withdrawals
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = seller_id OR
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

-- 6. UPDATE Policy for profiles: Admins can update seller profile balances when refunding rejected withdrawals
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      auth.uid() = id OR
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

-- 7. Ensure Brian Okibo is guaranteed super_admin role in user_roles and profiles
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM auth.users WHERE lower(email) = 'brianokibo@gmail.com' LIMIT 1;
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (v_admin_id, 'super_admin')
    ON CONFLICT (user_id, role_id) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (v_admin_id, 'admin')
    ON CONFLICT (user_id, role_id) DO NOTHING;

    UPDATE public.profiles SET role = 'super_admin' WHERE id = v_admin_id;
  END IF;
END $$;

-- 8. Add seller_withdrawals to Supabase Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'seller_withdrawals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.seller_withdrawals;
  END IF;
END $$;

GRANT ALL ON public.seller_withdrawals TO authenticated, service_role;
GRANT SELECT ON public.seller_withdrawals TO anon;

NOTIFY pgrst, 'reload schema';
