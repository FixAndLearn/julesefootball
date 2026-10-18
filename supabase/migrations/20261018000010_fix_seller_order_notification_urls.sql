-- ==============================================================================
-- Fix seller order notification URLs in handle_mpesa_payment_success & existing records
-- ==============================================================================

-- 1. Heal existing notification URLs
UPDATE notifications
SET action_url = REPLACE(action_url, '/seller/orders/', '/orders/')
WHERE action_url LIKE '/seller/orders/%';

UPDATE notifications
SET action_url = '/dashboard/seller'
WHERE action_url IN ('/seller/orders', '/seller');

-- 2. Update handle_mpesa_payment_success to use canonical /orders/ route
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

  -- 6. Notify seller with canonical /orders/ route
  INSERT INTO notifications (recipient_id, type, title, message, action_url)
  VALUES (
    v_order.seller_id,
    'payment_received',
    'Payment Secured in Escrow!',
    'The buyer paid KES ' || p_amount || '. Please deliver the account credentials promptly.',
    '/orders/' || v_order.id
  );

  -- 7. Audit log
  INSERT INTO audit_logs (action, resource_type, resource_id, changes)
  VALUES (
    'mpesa_payment_completed',
    'payment',
    v_payment.id::text,
    jsonb_build_object('receipt', p_receipt_number, 'amount', p_amount, 'order_id', v_order.id)
  );
END;
$$;
