-- ==============================================================================
-- Migration: Prepare Credential Retention & Nullification
-- 
-- Legal Context:
-- Aligns schema with the storage limitation principle (Section 30(1)(e)) and
-- retention rules (Section 39) of the Kenya Data Protection Act, 2019, as well as
-- Regulations 19 & 20 of the Data Protection (General) Regulations, 2021.
--
-- Storage Limits Notice:
-- Dropping NOT NULL allows setting credential columns to NULL upon retention expiry.
-- Note: Setting columns to NULL removes active database references, but residual data
-- persists in PostgreSQL MVCC dead tuples, WAL, and managed backup snapshots until
-- naturally overwritten or rolled off by backup retention windows.
-- ==============================================================================

-- 1. Add purged_at timestamp column to track retention nullification events
ALTER TABLE account_deliveries ADD COLUMN IF NOT EXISTS purged_at TIMESTAMPTZ;

-- 2. Drop NOT NULL constraint on credential columns to permit nullification upon retention expiry
ALTER TABLE account_deliveries ALTER COLUMN encrypted_konami_email DROP NOT NULL;
ALTER TABLE account_deliveries ALTER COLUMN encrypted_konami_password DROP NOT NULL;

-- 3. Add index for efficient filtering by purge status
CREATE INDEX IF NOT EXISTS idx_account_deliveries_purged ON account_deliveries(purged_at);
