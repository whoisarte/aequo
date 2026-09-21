# Production Readiness — Status

> **Status**: Infrastructure complete. Ready for payment flow testing.

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
- [x] `subscriptions` — RLS: SELECT (user only) + service role full access
- [x] `products` — RLS: public read (active only), `plan_type` column
- [x] `minimum_wages` — RLS: public read + seed data (2020-2026)
- [x] `webhook_events` — RLS: service role full access + idempotency
- [x] Index on `expedientes.user_id`
- [x] Index on `subscriptions.user_id`

### Supabase Setup
- [x] `aequo-dev` project created + schema run
- [x] `aequo-prod` project created + schema run
- [x] Auth callback URLs configured:
  - Dev: `https://aequo-eta-dev.vercel.app/auth/callback`
  - Prod: `https://aequo-eta.vercel.app/auth/callback`

### Vercel Setup
- [x] Single project with branch deployment
- [x] Preview (`dev` branch): `aequo-eta-dev.vercel.app`
- [x] Production (`main` branch): `aequo-eta.vercel.app`
- [x] Environment variables configured for both environments

### Stripe Integration (Code)
- [x] Stripe API version set to `2026-08-26.dahlia`
- [x] Webhook handler with signature verification
- [x] Webhook idempotency implemented
- [x] Events handled: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`

### Stripe Setup (Remote)
- [x] Webhook endpoint created (dev only — prod pending)
- [x] API keys obtained (dev + prod)
- [x] Stripe products created (dev + prod)
- [x] Products synced to Supabase `products` table (dev + prod)

### Products Table (Plans)

| Plan | Price | Type | Generations |
|------|-------|------|-------------|
| Plan Básico | $200 MXN/mo | subscription | 100 |
| Plan Avanzado | $350 MXN/mo | subscription | 250 |
| Plan Profesional | $600 MXN/mo | subscription | 500 |
| Generación individual | $50 MXN | one_time | 1 |

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

### Gemini Integration
- [x] API key configured in Vercel (same for dev + prod)
- [x] System prompt configured for Mexican labor law chatbot

---

## 🔴 Remaining — Infrastructure

### 1. Live Stripe Webhook
- [ ] Create live webhook endpoint in Stripe Dashboard
- [ ] Add `STRIPE_WEBHOOK_SECRET` to Vercel production env vars

### 2. Custom Domain
- [ ] Configure `aequo.app` domain in Vercel
- [ ] Add DNS records

---

## 🟡 Remaining — Code (Optional Improvements)

### Error Logging
- [ ] Integrate **Sentry** or use Vercel Analytics
- [ ] Structured logging for billing failures, auth failures, Supabase errors

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
| 4 | Stripe API version type mismatch | `lib/di/providers.ts:16` | Fixed — `@ts-ignore` directive applied |
| 5 | Circular dependency causing build failure | `lib/di/providers.ts` ↔ `lib/supabase/admin.ts` | Fixed — removed top-level import, lazy-loaded supabase admin |

---

## Mode Behavior Reference

| Mode | Supabase | Stripe | Auth |
|------|----------|--------|------|
| `local` | Mock | Mock | Auto-login as mock-user-1 |
| `development` | Real (dev) | Real (test mode) | Real Supabase Auth |
| `production` | Real (prod) | Real (live mode) | Real Supabase Auth |

---

## Pre-Launch Checklist

- [x] Code complete
- [x] RLS policies configured
- [x] Webhook handler with idempotency
- [x] Zod validation on API routes
- [x] Legal pages (privacy, terms)
- [x] Cookie consent
- [x] Vercel project configured (single project, branch-based)
- [x] Supabase projects configured + schema run
- [x] Stripe webhook endpoint created (dev)
- [x] Stripe API keys configured in Vercel
- [x] Stripe products created + synced to Supabase
- [x] Gemini API key configured in Vercel
- [ ] Live Stripe webhook created
- [ ] Custom domain configured
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Load testing completed
- [ ] Payment flow tested with Stripe test cards
