-- ==============================================================================
-- REALTIME PUBLICATION MIGRATION
-- Enables Supabase Realtime WebSockets for listings, messages, notifications, and orders
-- Allows live instantaneous sync without page reloads.
-- ==============================================================================

DO $$
BEGIN
  -- 1. Realtime for listings (Instant publish, sold account removal, price updates)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'listings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.listings;
  END IF;

  -- 2. Realtime for listing_images (Squad screenshots)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'listing_images'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.listing_images;
  END IF;

  -- 3. Realtime for messages (Live buyer-seller-escrow chat)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  -- 4. Realtime for notifications (Instant alerts & badges)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  -- 5. Realtime for orders (Instant status transition & escrow lock)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  -- 6. Realtime for seller_withdrawals (Instant admin alerts and payouts queue)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'seller_withdrawals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.seller_withdrawals;
  END IF;
END $$;
