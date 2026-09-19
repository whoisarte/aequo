# Production Readiness — Status

> **Status**: The codebase is feature-complete. The following documents what has been completed and what remains before production launch.

---

## ✅ Completed

### Environment Strategy
- [x] Mode behavior clarified (`local` / `development` / `production`)
- [x] `.env.local.example` updated with mode documentation
- [x] `lib/env.ts` strict validation for production mode

### Database Schema (`db/schema.sql`)
- [x] All tables created with proper RLS policies
- [x] `profiles` — RLS: SELECT, INSERT, UPDATE (user only)
- [x] `expedientes` — RLS: SELECT, INSERT, UPDATE, DELETE (user only)
- [x] `subscriptions` — RLS: SELECT (user only)
- [x] `products` — RLS: public read (active only)
- [x] `minimum_wages` — RLS: public read + seed data (2020-2026)
- [x] `webhook_events` — RLS: service role full access + idempotency
- [x] `doc_limit` column added to `products`
- [x] Index on `expedientes.user_id`
- [x] Index on `subscriptions.user_id`

### Stripe Integration
- [x] Stripe API version set to `2026-08-26.dahlia` (Stripe library default)
- [x] Webhook handler with signature verification
- [x] Webhook idempotency implemented
- [x] Events handled: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`

### Input Validation
- [x] Zod LSP error fixed (`@hookform/resolvers` upgraded to 5.9.1)
- [x] `/api/chatbot` — Zod validation for `userMessage` and `conversationHistory`
- [x] `/api/create-payment-intent` — Zod validation for `amount`, `currency`, `planId`, `customerId`
- [x] `/api/billing/checkout` — Zod validation for `planId` and `mode`

### Legal & UX
- [x] Privacy policy page (`/privacidad`)
- [x] Terms of service page (`/terminos`)
- [x] Cookie consent banner
- [x] Per-page error boundaries:
  - `calculadora/error.tsx`
  - `expedientes/error.tsx`
  - `billing/error.tsx`
  - `calendario/error.tsx`
  - `estilo/error.tsx`

---

## 🔴 Remaining — Infrastructure (You)

These require your action in external services:

### 1. Create Vercel Projects
- [ ] Create `aequo-dev` project (branch: main, alias: `aequo-dev.vercel.app`)
- [ ] Create `aequo-prod` project (branch: main, alias: `aequo.app`)

### 2. Create Supabase Projects
- [ ] Create `aequo-dev` project
- [ ] Create `aequo-prod` project
- [ ] Run `db/schema.sql` on both
- [ ] Configure Auth callback URLs:
  - Dev: `https://aequo-dev.vercel.app/auth/callback`
  - Prod: `https://aequo.app/auth/callback`

### 3. Stripe Setup
- [ ] Dev account: test mode API keys
- [ ] Prod account: live mode API keys
- [ ] Configure webhook endpoints:
  - Dev: `https://aequo-dev.vercel.app/api/webhooks/stripe`
  - Prod: `https://aequo.app/api/webhooks/stripe`

### 4. Environment Variables in Vercel
Configure per project:
- [ ] `NEXT_PUBLIC_APP_MODE` (`development` / `production`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- [ ] `GEMINI_API_KEY`

### 5. Stripe Products
- [ ] Create Plan Profesional in both Stripe dashboards
- [ ] Create Generación individual in both Stripe dashboards
- [ ] Sync `stripe_price_id` to Supabase `products` table

### 6. Custom Domain
- [ ] Configure `aequo.app` domain in Vercel
- [ ] Add DNS records

---

## 🟡 Remaining — Code (Optional Improvements)

These are not blocking but improve production quality:

### Error Logging
- [ ] Integrate **Sentry** or use Vercel Analytics
- [ ] Structured logging for billing failures, auth failures, Supabase errors

### Stripe Price Sync
- [ ] Products in Supabase `products` table must have correct `stripe_price_id` from Stripe Dashboard
- [ ] Currently manual — consider automation

### Polish
- [ ] Per-page loading states (skeleton screens)
- [ ] Retry logic for transient failures
- [ ] SEO: sitemap.xml, robots.txt, Open Graph tags

### Testing
- [ ] Integration tests (auth, billing, expediente, calculator flows)
- [ ] E2E tests (Playwright)
- [ ] Load testing (chatbot, DB, PDF generation)
- [ ] Test payment flow with Stripe test cards

---

## 🔴 Known Issues (Pre-existing)

These exist in the codebase but are not blocking:

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | Multiple `any` types | Various components | Type safety warnings |
| 2 | React hook rule violations | Multiple pages | React 19 strict mode warnings |
| 3 | `mock-supabase.ts` type errors | `lib/di/mock-supabase.ts:580-610` | Fixed — `gte`, `lte`, `gt`, `lt` params typed as `number \| string` |
| 4 | Stripe API version type mismatch | `lib/di/providers.ts:16` | Stripe lib TS defs out of sync with runtime |

---

## Mode Behavior Reference

| Mode | Supabase | Stripe | Auth |
|------|----------|--------|------|
| `local` | Mock | Mock | Auto-login as mock-user-1 |
| `development` | Real | Real (test mode) | Real Supabase Auth |
| `production` | Real | Real (live mode) | Real Supabase Auth |

---

## Pre-Launch Checklist

- [x] Code complete
- [x] RLS policies configured
- [x] Webhook handler with idempotency
- [x] Zod validation on API routes
- [x] Legal pages (privacy, terms)
- [x] Cookie consent
- [ ] Vercel projects configured
- [ ] Supabase projects configured + schema run
- [ ] Stripe accounts configured + webhooks set up
- [ ] Environment variables in Vercel
- [ ] Stripe products synced to Supabase
- [ ] Custom domain configured
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Load testing completed
- [ ] Payment flow tested with real Stripe
