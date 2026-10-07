-- ==============================================================================
-- Migration: Fix Seller Withdrawals RLS & Lower Min Threshold
-- ==============================================================================

-- 1. Lower minimum constraint to KES 10.00 for testing & flexible payouts
ALTER TABLE seller_withdrawals DROP CONSTRAINT IF EXISTS seller_withdrawals_amount_check;
ALTER TABLE seller_withdrawals ADD CONSTRAINT seller_withdrawals_amount_check CHECK (amount >= 10.00);

-- 2. Enable RLS and define policies for seller_withdrawals
ALTER TABLE seller_withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sellers can view own withdrawals" ON seller_withdrawals;
DROP POLICY IF EXISTS "Sellers can insert own withdrawals" ON seller_withdrawals;
DROP POLICY IF EXISTS "Admins can update withdrawals" ON seller_withdrawals;

CREATE POLICY "Sellers can view own withdrawals" ON seller_withdrawals
  FOR SELECT USING (
    auth.uid() = seller_id
    OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role_id IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Sellers can insert own withdrawals" ON seller_withdrawals
  FOR INSERT WITH CHECK (
    auth.uid() = seller_id
    OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role_id IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update withdrawals" ON seller_withdrawals
  FOR UPDATE USING (
    auth.uid() = seller_id
    OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role_id IN ('admin', 'super_admin')
    )
  );
