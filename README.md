# eFootballMarket | Institutional eFootball Account Escrow Marketplace

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![M-Pesa](https://img.shields.io/badge/M--Pesa-Daraja_API_v2-00A651?style=for-the-badge)](https://developer.safaricom.co.ke)

An enterprise-grade, institutional escrow platform engineered specifically for trading verified **eFootball (PES)** accounts with automated Safaricom M-Pesa payment settlement and authenticated AES-256-GCM credential delivery.

---

## 🔒 Zero Mock Data Policy
In adherence to production financial standards:
- **No placeholder users, listings, sales, or fake analytics exist.**
- All numbers, volumes, ratings, and stats are computed dynamically from real PostgreSQL records.
- If zero records exist, contextual empty states are rendered with direct action triggers.

---

## 🏗 Architecture & Key Domains

```
efootball-market/
├── src/
│   ├── app/
│   │   ├── (auth)/login & register/
│   │   ├── (marketplace)/browse & listings/[id] & orders/[id]/
│   │   ├── api/
│   │   │   ├── listings/ (Dynamic search & creation)
│   │   │   ├── orders/ (Atomic order & escrow initiation)
│   │   │   ├── escrow/ (deliver, reveal, release, dispute)
│   │   │   ├── payments/mpesa/ (stkpush, callback, status)
│   │   │   ├── withdrawals/ (M-Pesa B2C disbursements)
│   │   │   └── analytics/overview/ (Real DB metrics)
│   │   ├── dashboard/ (buyer & seller control centers)
│   │   ├── escrow-guarantee/ (Security rules)
│   │   ├── seller/create-listing & verification/
│   │   ├── layout.tsx & globals.css
│   │   └── not-found.tsx & error.tsx
│   ├── components/
│   │   ├── ui/ (Button, Input, Badge, Card, EmptyState)
│   │   ├── marketplace/ (ListingCard, ListingFilters, ListingGrid, BuyNowButton)
│   │   ├── escrow/ (EscrowStatusStepper, OrderEscrowController, CredentialsDeliveryForm, CredentialsRevealModal, DisputeModal)
│   │   ├── payments/ (MpesaPaymentModal)
│   │   ├── chat/ (OrderChatBox)
│   │   ├── seller/ (SellerDashboardView, WithdrawModal)
│   │   └── layout/ (Header, Footer)
│   ├── lib/
│   │   ├── encryption/crypto.ts (AES-256-GCM cipher/decipher)
│   │   ├── mpesa/client.ts (Daraja API v2 client)
│   │   ├── supabase/ (client, server, admin)
│   │   └── utils.ts
│   ├── services/
│   │   ├── listingService.ts
│   │   ├── orderService.ts
│   │   ├── escrowService.ts
│   │   ├── paymentService.ts
│   │   └── messageService.ts
│   └── types/database.ts
├── supabase/migrations/
│   └── 20261005000001_production_schema.sql (Complete DDL, RLS, Indexes, Stored Procedures)
└── tests/
    └── verify.ts (Encryption, Phone Normalization, M-Pesa Callback verification)
```

---

## ⚡ Quickstart & Deployment

### 1. Prerequisites
- Node.js `v18.17+` or `v20+` or `v24+`
- A Supabase Project with PostgreSQL 15+

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and populate your keys:
```bash
cp .env.example .env.local
```

### 3. Apply Database Migration
Execute the migration script in your Supabase SQL editor:
```
supabase/migrations/20261005000001_production_schema.sql
```
This provisions:
- `pg_trgm`, `citext`, `uuid-ossp`, `pgcrypto`
- `profiles`, `user_roles`, `listings`, `listing_images`, `orders`, `escrow_accounts`, `payments`, `account_deliveries`, `conversations`, `messages`, `disputes`, `seller_withdrawals`, `audit_logs`
- Triggers for `updated_at`
- Row Level Security (RLS) policies on all tables
- Security-definer stored procedures `handle_mpesa_payment_success` and `release_escrow_funds`

### 4. Build and Run Production
```bash
npm run build
npm run start
```

### 5. Run Verification Suite
```bash
npx tsx tests/verify.ts
```
