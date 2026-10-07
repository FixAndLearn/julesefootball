-- ==============================================================================
-- Migration: Fix Account Deliveries RLS Policies
-- Ensures sellers and order parties can deliver, view, and confirm account credentials
-- ==============================================================================

-- 1. Ensure profiles table has a role column if referenced anywhere
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- 2. Configure RLS for account_deliveries
ALTER TABLE account_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Account credentials strictly visible to order parties" ON account_deliveries;
DROP POLICY IF EXISTS "Sellers can deliver credentials" ON account_deliveries;
DROP POLICY IF EXISTS "Order parties can update deliveries" ON account_deliveries;
DROP POLICY IF EXISTS "Sellers can insert credentials" ON account_deliveries;

-- 1. SELECT: Order parties (buyer, seller) and platform admins can view delivery records
CREATE POLICY "Account credentials strictly visible to order parties" ON account_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = account_deliveries.order_id
        AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role_id IN ('admin', 'super_admin')
    )
  );

-- 2. INSERT: Seller of the order or admin can deliver credentials
CREATE POLICY "Sellers can insert credentials" ON account_deliveries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = account_deliveries.order_id
        AND orders.seller_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role_id IN ('admin', 'super_admin')
    )
  );

-- 3. UPDATE: Order parties or admin can update (for upsert re-delivery and buyer confirmation)
CREATE POLICY "Order parties can update deliveries" ON account_deliveries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = account_deliveries.order_id
        AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role_id IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = account_deliveries.order_id
        AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role_id IN ('admin', 'super_admin')
    )
  );
