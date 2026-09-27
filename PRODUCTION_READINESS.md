# Production Readiness — Status

> **Status**: 14 production-readiness items completed. Ready for dev testing and production smoke test.

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
- [x] PostgreSQL grants applied (`GRANT SELECT ON public.* TO authenticated/service_role`)

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
- [x] Webhook endpoint created (dev + prod)
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

### Billing Code Fixes
- [x] Mode detection fixed for Vercel (removed `NODE_ENV` override)
- [x] Added `plan_type` to products interface and queries
- [x] Fixed features filter keywords (added "generations" English)
- [x] PaymentSection uses `plan_type` filter instead of hardcoded ID
- [x] Created `PlanType` enum in `lib/constants/billing.ts`
- [x] Mock products updated to match real products (4 plans, correct prices)

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

### Payment Flow Testing (Dev)
- [x] Checkout redirect to Stripe works
- [x] Stripe test card (`4242 4242 4242 4242`) works
- [x] One-time purchase (`Generación individual`) works

### Calendar Events Persistence
- [x] `calendar_events` table added (dev + prod schema)
- [x] RLS: user CRUD only
- [x] Server actions: `createCalendarEvent`, `updateCalendarEvent`, `deleteCalendarEvent`, `getCalendarEvents`, `getCalendarEvent`
- [x] Generic events persist to Supabase on create/update/delete
- [x] Full-screen event form overlay (theme-aware, follows system dark/light mode)
- [x] Single `ActiveForm` state for create / edit-event / edit-expediente flows
- [x] Form prefill on edit (generic events + expediente hearings)
- [x] Form stays open on save error (user can retry); dismisses on success or Cancelar

---

## 🔴 Remaining — Infrastructure

### 1. Production Payment Flow
- [ ] Test production payment flow with Stripe live mode
- [ ] Verify webhook processes live events correctly

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

> **Updated date**: fill in when an unchecked item gets fixed, then flip its status to ✅.

### ✅ Done

| Status | Item | Description | How it was fixed | Updated date |
|--------|------|-------------|------------------|--------------|
| ✅ | Code complete | All planned features for launch scope are implemented | Feature work finished across calculadora, expedientes, billing, calendario, chatbot; only fixes remain | — |
| ✅ | RLS policies configured | Every table restricts access by role/user | Policies in `db/schema.sql`: user-scoped CRUD on `profiles`/`expedientes`/`calendar_events`, read-own on `subscriptions`, public read on `products`/`minimum_wages`, service-role on `webhook_events` | — |
| ✅ | Webhook handler with idempotency | Stripe events are verified and deduplicated before processing | Signature verification via `constructEvent`; processed events recorded in `webhook_events`. **Limitation**: check-then-insert race and missing `payment_failed`/`refunded` events — fixes tracked below | — |
| ✅ | Zod validation on API routes | Public endpoints reject malformed input before processing | Zod schemas on `/api/chatbot`, `/api/create-payment-intent`, `/api/billing/checkout` | — |
| ✅ | Legal pages (privacy, terms) | Privacy policy and terms of service available in-app | Created `/privacidad` and `/terminos` pages | — |
| ✅ | Cookie consent | Banner shown to users | Cookie consent banner component. **Limitation**: currently notice-only (no script gating); real decision tracked below | — |
| ✅ | Vercel project configured (single project, branch-based) | One project serves both environments | `dev` branch → `aequo-eta-dev.vercel.app` preview; `main` → `aequo-eta.vercel.app` production | — |
| ✅ | Supabase projects configured + schema run | Separate dev and prod databases ready | `aequo-dev` and `aequo-prod` projects created; `db/schema.sql` run on both; PostgreSQL grants applied | — |
| ✅ | Stripe webhook endpoint created (dev + prod) | Stripe can deliver events to both environments | Endpoints created in Stripe Dashboard for test mode (dev) and live mode (prod) | — |
| ✅ | Stripe API keys configured in Vercel | Both environments can call Stripe | Test keys on preview environment, live keys on production environment | — |
| ✅ | Stripe products created + synced to Supabase | Plans are purchasable and resolvable in the DB | 4 products created in Stripe (dev + prod); rows in `products` table with `stripe_price_id` and `plan_type` | — |
| ✅ | Gemini API key configured in Vercel | Chatbot can call Gemini | Same API key set for both environments in Vercel | — |
| ✅ | Dev payment flow tested and working | Checkout works end-to-end in Stripe test mode | Verified redirect to Stripe + test card `4242 4242 4242 4242`. **Limitation**: only the checkout redirect was verified — one-time fulfillment is not yet server-verified (tracked below) | — |
| ✅ | Calendar events persist to Supabase | Calendar data survives reloads and sessions | `calendar_events` table + server actions for CRUD; generic events persist on create/update/delete | — |
| ✅ | Stripe dunning enabled | Failed renewals are not retried and the customer is not emailed by Stripe | Enable Smart Retries, customer retries emails, and expiring card emails in Stripe dunning settings (Dashboard, no code) | 2026-09-26 |
| ✅ | Rate-limit IP spoofing fix | Limiter is keyed on the left-most `x-forwarded-for` entry, which is attacker-controlled | Use the right-most XFF entry or `x-real-ip`; key authenticated routes on `user.id` instead of IP | 2026-09-26 (code fixed) |
| ✅ | Mode-gated Stripe env validation | Missing Stripe keys in prod silently fall back to mock values and fail weirdly | Changed `lib/env.ts` condition from `isProduction || isLocal` to `isLocal ? mockEnvSchema : realEnvSchema` — mock fallbacks now only in `local` mode | 2026-09-26 |
| ✅ | Webhook idempotency race | Two simultaneous deliveries of the same event both pass the check and both process | Replaced check-then-insert with try-insert-first — the `UNIQUE` constraint on `event_id` is now the source of truth; duplicate inserts throw code `23505` which is caught and treated as success | 2026-09-26 |
| ✅ | `current_period_end` set correctly at checkout | Currently set to `new Date()` at purchase → paying user reads as "expired" until `customer.subscription.updated` arrives | In webhook, call `stripe.subscriptions.retrieve(session.subscription)` and store its real `current_period_end` | 2026-09-26 |
| ✅ | "Not legal advice" disclaimer | Chatbot answers Mexican labor-law questions with no liability protection | Added dismissible disclaimer in ChatWindow with localStorage flag; added footer in dashboard layout | 2026-09-26 |
| ✅ | Cookie banner decision + implementation | Banner is decorative; it does not gate any script | Implemented real gating: CookieConsentProvider wraps app, exposes `useHasAcceptedCookies()` hook for gating non-essential scripts; banner only disappears after explicit consent choice | 2026-09-26 |
| ✅ | Service-role key audit | The service-role key must never reach the client bundle | Added `server-only` to `lib/supabase/admin.ts`; verified no actual service role keys in `.next/static` output — only runtime `process.env` references (resolved by hosting). Note: `createRealMinimumWageService` path in providers is bundled client-side but only reads env vars at server runtime | 2026-09-26 |
| ✅ | Vercel WAF rate limiting for `/api/chatbot` | In-memory limiter is per-instance and resets on cold start — decorative protection | Configured Vercel WAF rule: path equals `/api/chatbot` → rate limit 20 req/min per IP, action: 429 | 2026-09-26 |
| ✅ | Handle `charge.refunded` | Refunded users keep access until period end — nothing revokes it | Added `charge.refunded` webhook handler that immediately sets subscription status to `canceled` by `stripe_customer_id` | 2026-09-26 |
| ✅ | Handle `invoice.payment_failed` | A failed renewal means instant access loss with no grace period and no notice | Added `invoice.payment_failed` webhook handler that sets subscription status to `past_due`; checkout route now blocks subscription-mode checkout if no active subscription; UI already hides upgrades for non-active statuses | 2026-09-26 |
| ✅ | Remove delete side effect from `canGenerateDocument()` | A read path (`billing-usage.ts`) deletes extra subscription rows as a side effect | Removed delete logic from `canGenerateDocument()` in `billing-usage.ts` — it's now purely read-only; single-active-subscription enforcement already handled at write time by the `checkout.session.completed` webhook (updates existing instead of creating duplicates) | 2026-09-26 |
| ✅ | Fix upgrade double-billing | Buying a new plan creates a NEW Stripe subscription; the old one keeps billing forever, silently | When `checkout.session.completed` finds an existing active subscription, the old Stripe subscription is now canceled via `stripe.subscriptions.cancel()` before updating the DB record with the new subscription | 2026-09-26 |
| ✅ | Fix quota reset window | Usage is counted since subscription `created_at` — monthly quotas never actually reset on renewal | Added `current_period_start` column to subscriptions schema; both `checkout.session.completed` and `customer.subscription.updated` webhooks now store it; `getUserDocumentCount()` counts expedientes since start of billing month | 2026-09-26 |

### ⬜ Pending

| Status | Item | Description | How to fix | Updated date |
|--------|------|-------------|------------|--------------|
| ⬜ | Free backups + test restore | Supabase free tier has no restore path; users' legal case data is unprotected | Skipped — consider Supabase Pro plan (includes point-in-time restore) or set up pg_dump GitHub Action + B2/R2 | |
| ⬜ | Data-deletion runbook + test | Legal obligation (LFPDPPP); cascades cover most but not all user data | Document deletion procedure: auth user (cascades to profiles/expedientes/subscriptions/calendar_events), `webhook_events` by stripe_customer_id, Storage files, Stripe customer; test on dev account | |
| ⬜ | One-time purchase fulfillment | A $50 payment grants nothing server-side; download is gated only by an unverified URL param + localStorage (paywall bypassable, no recovery if localStorage is lost) | Skipped — low risk for MVP; can revisit later with purchases table + download verification | |
| ⬜ | Custom domain configured | `aequo.app` should serve the production deployment | Skipped — do on launch day (10 min task in Vercel + DNS) | |
| ⬜ | Production payment flow tested (smoke-test script) | Only dev/test-mode has been verified so far | Write script: buy with real card → verify webhook in Stripe Dashboard → verify row in prod Supabase → refund → verify revocation; run it on prod | |
| ⬜ | E2E tests passing (Playwright) | No automated coverage of critical flows | Cover: auth, subscription checkout, one-time checkout, quota reset on renewal, upgrade path, RLS cross-user access denial | |
| ⬜ | Integration tests passing | No integration coverage for core flows | Add integration tests for auth, billing, expediente, and calculator flows | |
| ⬜ | Load testing completed | Behavior under load is unknown | Load test chatbot, DB, and PDF generation | |
| ⬜ | Budget alerts on all providers | No early warning against surprise bills (main risk: Gemini via chatbot abuse/bugs) | Google Cloud budget alert on the Gemini project; Supabase spend cap; Vercel usage alerts — all free, dashboard-only | |
| ⬜ | First-subscription checkout blocked (launch blocker) | `/api/billing/checkout` returns 403 for `mode: 'subscription'` when the user has no active subscription row — but rows are only created by the `checkout.session.completed` webhook, so a brand-new user can never complete a first subscription purchase. Only affects dev/prod (local never exercises real billing); one-time `mode: 'payment'` unaffected, which is why dev payment testing passed | Rework the guard added 2026-09-26: allow checkout when no row exists; single-active-subscription enforcement already lives in the webhook (update-or-insert + cancel old). Test: brand-new account → subscribe → redirect to Stripe | |
| ⬜ | `validateEnv()` never runs | `lib/env.ts` validates at module load only if imported — nothing imports it, so the mode-gated credential validation (fixed 2026-09-26) is dead code; a missing Stripe/Supabase key in dev/prod fails late and weirdly instead of at boot | Import for side effect in `instrumentation.ts` (Next.js startup hook) or `app/layout.tsx`; verify a preview deploy with a missing key fails loudly at startup | |
| ⬜ | SMG fetch failure silently zeroes prima de antigüedad | `useCalculadora` catches minimum-wage fetch errors and proceeds with `SMG_value = 0` → legal cap becomes $0 → prima de antigüedad computes as $0 with no user warning. Dev/prod risk (local mock unaffected) | Block the calculation and show an error toast on SMG fetch failure; optionally retry once before failing | |
| ⬜ | Read-path delete side effect in `getUserSubscription()` | `billing-ui.ts:55` still deletes "duplicate" subscription rows during a read (reached via `billing-actions.server.ts`) — same class of bug already removed from `canGenerateDocument()` | Move duplicate cleanup to the webhook/write path or a one-off maintenance script; keep reads pure | |
| ⬜ | Stripe API version pinned inconsistently | `lib/services/billing.ts` uses `2026-04-22.dahlia`; webhook route + `lib/di/providers.ts` use `2026-08-26.dahlia` | Extract one `STRIPE_API_VERSION` constant (e.g. in `lib/constants/billing.ts`) and use it in all three places | |
| ⬜ | Middleware route gaps | `/calendario` missing from `protectedRoutes` (page renders logged-out; data still safe via RLS, but no redirect to /login); `/reporte` listed but no such route exists | Add `/calendario`, remove `/reporte` in `middleware.ts`; verify logged-out redirect on preview | |
| ⬜ | WAF rate limit for `/api/billing/checkout` | In-memory limiter is per-instance and resets on cold start (decorative on serverless); `/api/chatbot` already covered by Vercel WAF, checkout is not — Stripe session spam costs real money | Add WAF rule: path equals `/api/billing/checkout` → rate limit 10 req/min per IP → 429 (Dashboard, no code) | |
| ⬜ | Code cleanup batch | Orphaned `/api/create-payment-intent` route (zero callers); Flutter leftover `test/widget_test.dart`; `handlePaymentClick` in calculadora swallows errors with no toast; Tailwind gray classes in calculadora paywall section + download page break the inline-styles/CSS-vars convention and dark mode | Delete orphaned route + dart file; wire `useToast()` into payment error path; convert both spots to inline styles with CSS variables per the Membresías standard | |
| ⬜ | Final PRODUCTION_READINESS.md pass | The doc must reflect reality at launch time | Re-verify every row; fill remaining Updated dates; collapse completed sections | |
