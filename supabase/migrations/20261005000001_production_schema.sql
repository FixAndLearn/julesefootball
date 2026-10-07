-- ==============================================================================
-- eFootballMarket: Global Production Database Migration
-- Version: 1.0.0
-- Standards: PostgreSQL 15+, Supabase, Full RLS, Strict Auditing, Zero Mock Data
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. UTILITY TRIGGER FUNCTION FOR UPDATED_AT
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. RBAC & USER PROFILE DOMAIN
-- ==============================================================================

CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO roles (id, name, description) VALUES
  ('guest', 'Guest', 'Unauthenticated visitor'),
  ('buyer', 'Buyer', 'Standard verified purchaser'),
  ('seller', 'Seller', 'User who can list accounts'),
  ('verified_seller', 'Verified Seller', 'KYC verified trusted merchant with badge'),
  ('moderator', 'Moderator', 'Listing review and report inspector'),
  ('support', 'Customer Support', 'Dispute handler and ticket agent'),
  ('admin', 'Administrator', 'Platform management and financial review'),
  ('super_admin', 'Super Administrator', 'Full system privilege and ledger auditor')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
  username CITEXT UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL DEFAULT '',
  last_name VARCHAR(100) NOT NULL DEFAULT '',
  phone_number VARCHAR(20) NOT NULL DEFAULT '',
  country VARCHAR(3) NOT NULL DEFAULT 'KEN',
  avatar_url TEXT,
  bio TEXT,
  is_verified_seller BOOLEAN NOT NULL DEFAULT FALSE,
  seller_rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00 CHECK (seller_rating >= 0.00 AND seller_rating <= 5.00),
  total_reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (total_reviews_count >= 0),
  completed_sales_count INTEGER NOT NULL DEFAULT 0 CHECK (completed_sales_count >= 0),
  available_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (available_balance >= 0.00),
  escrow_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (escrow_balance >= 0.00),
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Ensure column defaults exist if table was already created
ALTER TABLE profiles ALTER COLUMN first_name SET DEFAULT '';
ALTER TABLE profiles ALTER COLUMN last_name SET DEFAULT '';
ALTER TABLE profiles ALTER COLUMN phone_number SET DEFAULT '';


CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS seller_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  id_document_front_url TEXT NOT NULL,
  id_document_back_url TEXT,
  selfie_with_id_url TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'resubmission_required')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_seller_verifications_updated_at
  BEFORE UPDATE ON seller_verifications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50),
  login_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT TRUE
);

-- ==============================================================================
-- 4. MARKETPLACE DOMAIN
-- ==============================================================================

CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 100.00),
  currency VARCHAR(3) NOT NULL DEFAULT 'KES',
  platform VARCHAR(30) NOT NULL CHECK (platform IN ('android', 'ios', 'pc_steam', 'playstation_4', 'playstation_5', 'xbox_one', 'xbox_series_x')),
  game_version VARCHAR(30) NOT NULL DEFAULT 'v4.0.0',
  region VARCHAR(50) NOT NULL DEFAULT 'Global',
  
  -- Account Attributes
  account_level INTEGER NOT NULL DEFAULT 1 CHECK (account_level >= 1),
  overall_team_strength INTEGER NOT NULL CHECK (overall_team_strength >= 2000),
  gp_balance BIGINT NOT NULL DEFAULT 0 CHECK (gp_balance >= 0),
  coin_balance INTEGER NOT NULL DEFAULT 0 CHECK (coin_balance >= 0),
  efootball_points INTEGER NOT NULL DEFAULT 0 CHECK (efootball_points >= 0),
  contract_renewal_tickets INTEGER NOT NULL DEFAULT 0 CHECK (contract_renewal_tickets >= 0),
  booster_tokens INTEGER NOT NULL DEFAULT 0 CHECK (booster_tokens >= 0),
  training_programs INTEGER NOT NULL DEFAULT 0 CHECK (training_programs >= 0),
  player_slots INTEGER NOT NULL DEFAULT 500 CHECK (player_slots >= 100),
  
  -- Special Players Counts
  legend_players_count INTEGER NOT NULL DEFAULT 0 CHECK (legend_players_count >= 0),
  epic_players_count INTEGER NOT NULL DEFAULT 0 CHECK (epic_players_count >= 0),
  big_time_players_count INTEGER NOT NULL DEFAULT 0 CHECK (big_time_players_count >= 0),
  highlight_players_count INTEGER NOT NULL DEFAULT 0 CHECK (highlight_players_count >= 0),
  featured_players_count INTEGER NOT NULL DEFAULT 0 CHECK (featured_players_count >= 0),
  key_players_list TEXT[] NOT NULL DEFAULT '{}',
  
  -- Team & Tactical Attributes
  manager_name VARCHAR(100),
  formation VARCHAR(20),
  primary_playstyle VARCHAR(50) NOT NULL CHECK (primary_playstyle IN ('possession', 'quick_counter', 'long_ball_counter', 'out_wide', 'long_ball')),
  possession_rating INTEGER DEFAULT 70 CHECK (possession_rating BETWEEN 0 AND 100),
  quick_counter_rating INTEGER DEFAULT 70 CHECK (quick_counter_rating BETWEEN 0 AND 100),
  long_ball_counter_rating INTEGER DEFAULT 70 CHECK (long_ball_counter_rating BETWEEN 0 AND 100),
  out_wide_rating INTEGER DEFAULT 70 CHECK (out_wide_rating BETWEEN 0 AND 100),
  long_ball_rating INTEGER DEFAULT 70 CHECK (long_ball_rating BETWEEN 0 AND 100),
  current_division INTEGER NOT NULL DEFAULT 10 CHECK (current_division BETWEEN 1 AND 10),
  highest_division INTEGER NOT NULL DEFAULT 10 CHECK (highest_division BETWEEN 1 AND 10),
  dream_team_name VARCHAR(100),
  
  -- Match Stats
  matches_played INTEGER NOT NULL DEFAULT 0 CHECK (matches_played >= 0),
  wins INTEGER NOT NULL DEFAULT 0 CHECK (wins >= 0),
  draws INTEGER NOT NULL DEFAULT 0 CHECK (draws >= 0),
  losses INTEGER NOT NULL DEFAULT 0 CHECK (losses >= 0),
  goals_scored INTEGER NOT NULL DEFAULT 0 CHECK (goals_scored >= 0),
  goals_conceded INTEGER NOT NULL DEFAULT 0 CHECK (goals_conceded >= 0),
  account_age_months INTEGER NOT NULL DEFAULT 0 CHECK (account_age_months >= 0),
  
  -- Security & Transferability status
  konami_id_status VARCHAR(50) NOT NULL CHECK (konami_id_status IN ('linked_changeable', 'unlinked', 'linked_immutable')),
  linked_email_status VARCHAR(50) NOT NULL CHECK (linked_email_status IN ('transferable_full_access', 'buyer_email_bindable')),
  
  -- Listing Lifecycle
  status VARCHAR(30) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'pending_review', 'published', 'in_escrow', 'sold', 'archived')),
  views_count INTEGER NOT NULL DEFAULT 0 CHECK (views_count >= 0),
  favorites_count INTEGER NOT NULL DEFAULT 0 CHECK (favorites_count >= 0),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  search_query TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. ORDERS & ESCROW DOMAIN
-- ==============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(30) UNIQUE NOT NULL,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
  platform_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (platform_fee >= 0),
  seller_net_amount NUMERIC(12, 2) NOT NULL CHECK (seller_net_amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'KES',
  status VARCHAR(30) NOT NULL DEFAULT 'payment_pending' CHECK (status IN (
    'payment_pending',
    'escrow_locked',
    'seller_delivered',
    'buyer_reviewing',
    'completed',
    'disputed',
    'cancelled',
    'refunded'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS escrow_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  gross_amount NUMERIC(12, 2) NOT NULL CHECK (gross_amount > 0),
  fee_amount NUMERIC(12, 2) NOT NULL CHECK (fee_amount >= 0),
  net_amount NUMERIC(12, 2) NOT NULL CHECK (net_amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'KES',
  escrow_state VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (escrow_state IN (
    'pending',
    'payment_initiated',
    'payment_received',
    'waiting_for_seller',
    'seller_delivered',
    'buyer_reviewing',
    'completed',
    'refund_pending',
    'refunded',
    'disputed',
    'cancelled',
    'expired'
  )),
  inspection_deadline TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_escrow_accounts_updated_at
  BEFORE UPDATE ON escrow_accounts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL REFERENCES escrow_accounts(id) ON DELETE RESTRICT,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('deposit', 'fee_deduction', 'release_to_seller', 'refund_to_buyer', 'penalty')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  balance_after NUMERIC(12, 2) NOT NULL,
  performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS account_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  encrypted_konami_email TEXT NOT NULL,
  encrypted_konami_password TEXT NOT NULL,
  encrypted_backup_codes TEXT,
  transfer_instructions TEXT,
  seller_ip INET,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  buyer_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. PAYMENTS & M-PESA DARAJA DOMAIN
-- ==============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  payment_method VARCHAR(30) NOT NULL DEFAULT 'mpesa' CHECK (payment_method IN ('mpesa', 'visa', 'mastercard', 'paypal')),
  phone_number VARCHAR(20) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'KES',
  merchant_request_id VARCHAR(100),
  checkout_request_id VARCHAR(100) UNIQUE,
  mpesa_receipt_number VARCHAR(100) UNIQUE,
  result_code INTEGER,
  result_desc TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  raw_callback JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID UNIQUE NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  issued_to UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'KES',
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 200.00),
  payout_method VARCHAR(30) NOT NULL DEFAULT 'mpesa' CHECK (payout_method IN ('mpesa', 'bank_transfer')),
  phone_number VARCHAR(20) NOT NULL,
  b2c_conversation_id VARCHAR(100),
  b2c_originator_conversation_id VARCHAR(100),
  b2c_transaction_id VARCHAR(100) UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'failed')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_seller_withdrawals_updated_at
  BEFORE UPDATE ON seller_withdrawals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 7. REAL-TIME MESSAGING DOMAIN
-- ==============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  conversation_type VARCHAR(30) NOT NULL DEFAULT 'order' CHECK (conversation_type IN ('order', 'inquiry', 'support')),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  unread_count INTEGER NOT NULL DEFAULT 0 CHECK (unread_count >= 0),
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  message_type VARCHAR(30) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system', 'credential_alert', 'escrow_alert')),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ==============================================================================
-- 8. DISPUTES DOMAIN
-- ==============================================================================

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  opened_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  reason VARCHAR(100) NOT NULL CHECK (reason IN (
    'credentials_invalid',
    'wrong_account_details',
    'account_recovered_by_seller',
    'missing_players_or_coins',
    'unauthorized_changes',
    'seller_unresponsive',
    'other'
  )),
  description TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN (
    'open',
    'under_review',
    'resolved_buyer_refund',
    'resolved_seller_release',
    'closed_dismissed'
  )),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_disputes_updated_at
  BEFORE UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS dispute_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. REVIEWS, RATINGS & NOTIFICATIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
  speed_rating INTEGER CHECK (speed_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  seller_reply TEXT,
  seller_replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('listing', 'user', 'message', 'review')),
  target_id UUID NOT NULL,
  reason VARCHAR(100) NOT NULL,
  details TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. SYSTEM SETTINGS & AUDIT LOGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO system_settings (key, value, description) VALUES
  ('platform_fee_percent', '5.0', 'Marketplace platform fee percentage deducted on order completion'),
  ('escrow_inspection_hours', '24', 'Standard buyer inspection window in hours before automatic settlement'),
  ('min_withdrawal_amount', '200.0', 'Minimum seller M-Pesa withdrawal threshold in KES')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100),
  ip_address INET,
  changes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 11. INDEXES FOR PERFORMANCE AT SCALE (10M+ USERS / 100M+ LISTINGS)
-- ==============================================================================

-- Listings Indexes
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status_price ON listings(status, price);
CREATE INDEX IF NOT EXISTS idx_listings_platform ON listings(platform);
CREATE INDEX IF NOT EXISTS idx_listings_strength ON listings(overall_team_strength DESC);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_trgm_title ON listings USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_trgm_manager ON listings USING gin (manager_name gin_trgm_ops);

-- Orders & Escrow Indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_escrow_order ON escrow_accounts(order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_state ON escrow_accounts(escrow_state);

-- Payments Indexes
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_checkout_req ON payments(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_payments_receipt ON payments(mpesa_receipt_number);

-- Messaging Indexes
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);

-- ==============================================================================
-- 12. STORED PROCEDURES & ATOMIC TRANSACTIONS
-- ==============================================================================

-- Stored Procedure to process an M-Pesa payment confirmation and lock funds into escrow
CREATE OR REPLACE FUNCTION handle_mpesa_payment_success(
  p_checkout_request_id VARCHAR,
  p_receipt_number VARCHAR,
  p_amount NUMERIC,
  p_raw_callback JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment RECORD;
  v_order RECORD;
BEGIN
  -- Locate and lock payment row by checkout_request_id OR merchant_request_id
  SELECT * INTO v_payment
  FROM payments
  WHERE checkout_request_id = p_checkout_request_id
     OR merchant_request_id = p_checkout_request_id
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment record with ID % not found in payments table', p_checkout_request_id;
  END IF;

  IF v_payment.status = 'completed' THEN
    -- Idempotent exit
    RETURN;
  END IF;

  -- Locate and lock order row
  SELECT * INTO v_order
  FROM orders
  WHERE id = v_payment.order_id
  FOR UPDATE;

  -- 1. Update payment record
  UPDATE payments
  SET
    status = 'completed',
    mpesa_receipt_number = p_receipt_number,
    raw_callback = p_raw_callback,
    completed_at = NOW()
  WHERE id = v_payment.id;

  -- 2. Update order status
  UPDATE orders
  SET
    status = 'escrow_locked',
    updated_at = NOW()
  WHERE id = v_order.id;

  -- 3. Update escrow account state
  UPDATE escrow_accounts
  SET
    escrow_state = 'waiting_for_seller',
    updated_at = NOW()
  WHERE order_id = v_order.id;

  -- 4. Mark listing as in_escrow
  UPDATE listings
  SET
    status = 'in_escrow',
    updated_at = NOW()
  WHERE id = v_order.listing_id;

  -- 5. Credit seller escrow balance
  UPDATE profiles
  SET
    escrow_balance = COALESCE(escrow_balance, 0) + v_order.seller_net_amount,
    updated_at = NOW()
  WHERE id = v_order.seller_id;

  -- 6. Notify seller
  INSERT INTO notifications (recipient_id, type, title, message, action_url)
  VALUES (
    v_order.seller_id,
    'payment_received',
    'Payment Secured in Escrow!',
    'The buyer paid KES ' || p_amount || '. Please deliver the account credentials promptly.',
    '/seller/orders/' || v_order.id
  );

  -- 6. Audit log
  INSERT INTO audit_logs (action, resource_type, resource_id, changes)
  VALUES (
    'mpesa_payment_completed',
    'payment',
    v_payment.id::text,
    jsonb_build_object('receipt', p_receipt_number, 'amount', p_amount, 'order_id', v_order.id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stored Procedure to release escrow funds to seller upon confirmation or expiry
CREATE OR REPLACE FUNCTION release_escrow_funds(
  p_order_id UUID,
  p_performed_by UUID
)
RETURNS VOID AS $$
DECLARE
  v_order RECORD;
  v_escrow RECORD;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  SELECT * INTO v_escrow FROM escrow_accounts WHERE order_id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escrow account not found';
  END IF;

  IF v_escrow.escrow_state = 'completed' THEN
    RETURN;
  END IF;

  -- Credit seller available balance
  UPDATE profiles
  SET
    available_balance = available_balance + v_escrow.net_amount,
    completed_sales_count = completed_sales_count + 1,
    updated_at = NOW()
  WHERE id = v_order.seller_id;

  -- Update Escrow
  UPDATE escrow_accounts
  SET
    escrow_state = 'completed',
    released_at = NOW(),
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_escrow.id;

  -- Update Order
  UPDATE orders
  SET
    status = 'completed',
    updated_at = NOW()
  WHERE id = v_order.id;

  -- Update Listing
  UPDATE listings
  SET
    status = 'sold',
    updated_at = NOW()
  WHERE id = v_order.listing_id;

  -- Escrow transaction entry
  INSERT INTO escrow_transactions (escrow_id, action_type, amount, balance_after, performed_by, notes)
  VALUES (
    v_escrow.id,
    'release_to_seller',
    v_escrow.net_amount,
    0.00,
    p_performed_by,
    'Escrow funds released to seller available balance'
  );

  -- Notification to seller
  INSERT INTO notifications (recipient_id, type, title, message, action_url)
  VALUES (
    v_order.seller_id,
    'funds_released',
    'Payout Credited!',
    'KES ' || v_escrow.net_amount || ' has been credited to your available balance for order #' || v_order.order_number,
    '/seller/earnings'
  );

  -- Audit log
  INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, changes)
  VALUES (
    p_performed_by,
    'escrow_released',
    'escrow_account',
    v_escrow.id::text,
    jsonb_build_object('order_id', p_order_id, 'amount', v_escrow.net_amount)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, User can insert and update own profile
DROP POLICY IF EXISTS "Public profiles are readable" ON profiles;
CREATE POLICY "Public profiles are readable" ON profiles
  FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- User Roles: Public read, User can insert own roles
DROP POLICY IF EXISTS "Public user roles are viewable" ON user_roles;
CREATE POLICY "Public user roles are viewable" ON user_roles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own roles" ON user_roles;
CREATE POLICY "Users can insert own roles" ON user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- Listings: Published is public, Sellers manage own
CREATE POLICY "Published listings are viewable by everyone" ON listings
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Sellers can view own listings of any status" ON listings
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings" ON listings
  FOR UPDATE USING (auth.uid() = seller_id);

-- Listing Images: Public read
CREATE POLICY "Listing images are viewable by everyone" ON listing_images
  FOR SELECT USING (true);

CREATE POLICY "Sellers can manage images for own listings" ON listing_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM listings WHERE listings.id = listing_images.listing_id AND listings.seller_id = auth.uid()
    )
  );

-- Favorites: User can only see and manage own favorites
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Orders: Buyer and Seller can see, create, and update their orders
DROP POLICY IF EXISTS "Buyers and sellers can view their own orders" ON orders;
CREATE POLICY "Buyers and sellers can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Buyers can create orders" ON orders;
CREATE POLICY "Buyers can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Buyers and sellers can update their own orders" ON orders;
CREATE POLICY "Buyers and sellers can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Escrow Accounts: Accessible to participants
DROP POLICY IF EXISTS "Escrow visible to participants" ON escrow_accounts;
CREATE POLICY "Escrow visible to participants" ON escrow_accounts
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Participants can create escrow accounts" ON escrow_accounts;
CREATE POLICY "Participants can create escrow accounts" ON escrow_accounts
  FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Participants can update escrow accounts" ON escrow_accounts;
CREATE POLICY "Participants can update escrow accounts" ON escrow_accounts
  FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Escrow Transactions: Visible and auditable by participants
DROP POLICY IF EXISTS "Escrow transactions visible to participants" ON escrow_transactions;
CREATE POLICY "Escrow transactions visible to participants" ON escrow_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM escrow_accounts WHERE escrow_accounts.id = escrow_transactions.escrow_id AND (escrow_accounts.buyer_id = auth.uid() OR escrow_accounts.seller_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Participants can insert escrow transactions" ON escrow_transactions;
CREATE POLICY "Participants can insert escrow transactions" ON escrow_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM escrow_accounts WHERE escrow_accounts.id = escrow_transactions.escrow_id AND (escrow_accounts.buyer_id = auth.uid() OR escrow_accounts.seller_id = auth.uid())
    )
  );

-- Account Deliveries: Buyer, seller, and admin access
DROP POLICY IF EXISTS "Account credentials strictly visible to order parties" ON account_deliveries;
DROP POLICY IF EXISTS "Sellers can deliver credentials" ON account_deliveries;
DROP POLICY IF EXISTS "Order parties can update deliveries" ON account_deliveries;
DROP POLICY IF EXISTS "Sellers can insert credentials" ON account_deliveries;

CREATE POLICY "Account credentials strictly visible to order parties" ON account_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = account_deliveries.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role_id IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Sellers can insert credentials" ON account_deliveries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = account_deliveries.order_id AND orders.seller_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role_id IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Order parties can update deliveries" ON account_deliveries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = account_deliveries.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role_id IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = account_deliveries.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role_id IN ('admin', 'super_admin')
    )
  );

-- Payments: Accessible and creatable by order parties
DROP POLICY IF EXISTS "Payments visible to order parties" ON payments;
CREATE POLICY "Payments visible to order parties" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = payments.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Buyers can initiate payments" ON payments;
CREATE POLICY "Buyers can initiate payments" ON payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.buyer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Order parties can update payments" ON payments;
CREATE POLICY "Order parties can update payments" ON payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = payments.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Disputes: Visible and manageable by participants
DROP POLICY IF EXISTS "Disputes visible to order parties" ON disputes;
CREATE POLICY "Disputes visible to order parties" ON disputes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = disputes.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Order parties can open disputes" ON disputes;
CREATE POLICY "Order parties can open disputes" ON disputes
  FOR INSERT WITH CHECK (
    auth.uid() = opened_by AND
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = disputes.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Dispute evidence visible to order parties" ON dispute_evidence;
CREATE POLICY "Dispute evidence visible to order parties" ON dispute_evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM disputes
      JOIN orders ON orders.id = disputes.order_id
      WHERE disputes.id = dispute_evidence.dispute_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Order parties can submit dispute evidence" ON dispute_evidence;
CREATE POLICY "Order parties can submit dispute evidence" ON dispute_evidence
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);


-- Conversation Members: Members can view and join conversations
DROP POLICY IF EXISTS "Members can view conversation members" ON conversation_members;
CREATE POLICY "Members can view conversation members" ON conversation_members
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert conversation members" ON conversation_members;
CREATE POLICY "Users can insert conversation members" ON conversation_members
  FOR INSERT WITH CHECK (true);

-- Conversations: Members only
DROP POLICY IF EXISTS "Members can view conversations" ON conversations;
CREATE POLICY "Members can view conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_members WHERE conversation_members.conversation_id = conversations.id AND conversation_members.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = conversations.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Members can update conversations" ON conversations;
CREATE POLICY "Members can update conversations" ON conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversation_members WHERE conversation_members.conversation_id = conversations.id AND conversation_members.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = conversations.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Messages: Members only
DROP POLICY IF EXISTS "Members can view messages" ON messages;
CREATE POLICY "Members can view messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_members WHERE conversation_members.conversation_id = messages.conversation_id AND conversation_members.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN orders o ON o.id = c.order_id
      WHERE c.id = messages.conversation_id AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Members can insert messages" ON messages;
CREATE POLICY "Members can insert messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND (
      EXISTS (
        SELECT 1 FROM conversation_members WHERE conversation_members.conversation_id = messages.conversation_id AND conversation_members.user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM conversations c
        JOIN orders o ON o.id = c.order_id
        WHERE c.id = messages.conversation_id AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Members can update messages" ON messages;
CREATE POLICY "Members can update messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Notifications: Only recipient can view, update, delete; system & users can insert
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = recipient_id);


-- Reviews: Public read
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Buyers can write reviews for completed orders" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ==============================================================================
-- 14. AUTH USER LIFECYCLE TRIGGER & BACKFILL
-- Automatically provisions public.profiles and user_roles when any user signs up
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_clean_id TEXT;
BEGIN
  v_clean_id := substr(replace(NEW.id::text, '-', ''), 1, 6);
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    CASE
      WHEN NEW.email IS NOT NULL AND NEW.email != '' THEN split_part(NEW.email, '@', 1) || '_' || v_clean_id
      ELSE 'trader_' || v_clean_id
    END
  );

  INSERT INTO public.profiles (
    id,
    username,
    first_name,
    last_name,
    phone_number,
    country
  )
  VALUES (
    NEW.id,
    v_username,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1), 'Trader'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    'KEN'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (NEW.id, 'buyer')
  ON CONFLICT (user_id, role_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Immediate backfill for any existing auth.users lacking a profile
INSERT INTO public.profiles (id, username, first_name, last_name, phone_number, country)
SELECT
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'username',
    CASE
      WHEN u.email IS NOT NULL AND u.email != '' THEN split_part(u.email, '@', 1) || '_' || substr(replace(u.id::text, '-', ''), 1, 6)
      ELSE 'trader_' || substr(replace(u.id::text, '-', ''), 1, 6)
    END
  ),
  COALESCE(u.raw_user_meta_data->>'first_name', split_part(u.email, '@', 1), 'Trader'),
  COALESCE(u.raw_user_meta_data->>'last_name', ''),
  COALESCE(u.raw_user_meta_data->>'phone_number', ''),
  'KEN'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Immediate backfill for user_roles
INSERT INTO public.user_roles (user_id, role_id)
SELECT p.id, 'buyer'
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id AND ur.role_id = 'buyer'
WHERE ur.user_id IS NULL
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 13. USER ROLES & NEWS ARTICLES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

-- Automatically set brianokibo@gmail.com as super_admin if profile exists
UPDATE profiles
SET role = 'super_admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE lower(email) = 'brianokibo@gmail.com'
);

CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(350) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'efootball_news',
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name VARCHAR(150) DEFAULT 'eFootballMarket Editorial',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published news" ON news_articles;
CREATE POLICY "Public can view published news" ON news_articles
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage news" ON news_articles;
CREATE POLICY "Admins can manage news" ON news_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND lower(auth.users.email) = 'brianokibo@gmail.com'
    )
  );
