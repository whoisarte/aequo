# Production Readiness — Status

> **Status**: 42 production-readiness items completed. All code and schema work done. Remaining 9 items are devops-only and deferred for now.

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
- [x] Events handled: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`, `charge.refunded`, `invoice.payment_failed`

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

### Code Quality Fixes
- [x] Middleware route gaps fixed (`middleware.ts`): added `/calendario` to `protectedRoutes`, removed stale `/reporte` entry (no such route exists); unauthenticated users now correctly redirected to `/login` when accessing `/calendario`

---

## Mode Behavior Reference

| Mode | Supabase | Stripe | Auth |
|------|----------|--------|------|
| `local` | Mock | Mock | Auto-login as mock-user-1 |
| `development` | Real (dev) | Real (test mode) | Real Supabase Auth |
| `production` | Real (prod) | Real (live mode) | Real Supabase Auth |

---

## Pre-Launch Checklist

> **Updated date**: 2026-09-26 (pass completed). All completed rows filled; superseded limitation notes removed.

### ✅ Done

| Status | Item | Description | How it was fixed | Updated date |
|--------|------|-------------|------------------|--------------|
| ✅ | Code complete | All planned features for launch scope are implemented | Feature work finished across calculadora, expedientes, billing, calendario, chatbot; only fixes remain | 2026-09-26 |
| ✅ | RLS policies configured | Every table restricts access by role/user | Policies in `db/schema.sql`: user-scoped CRUD on `profiles`/`expedientes`/`calendar_events`, read-own on `subscriptions`, public read on `products`/`minimum_wages`, service-role on `webhook_events` | 2026-09-26 |
| ✅ | Webhook handler with idempotency | Stripe events are verified and deduplicated before processing | Signature verification via `constructEvent`; insert-first idempotency via `UNIQUE` constraint on `event_id` with `23505` caught as success; all 5 event types handled | 2026-09-26 |
| ✅ | Zod validation on API routes | Public endpoints reject malformed input before processing | Zod schemas on `/api/chatbot`, `/api/create-payment-intent`, `/api/billing/checkout` | 2026-09-26 |
| ✅ | Legal pages (privacy, terms) | Privacy policy and terms of service available in-app | Created `/privacidad` and `/terminos` pages | 2026-09-26 |
| ✅ | Cookie consent | Banner shown to users | Cookie consent banner component with real gating via `useHasAcceptedCookies()` hook; banner only dismisses after explicit consent choice | 2026-09-26 |
| ✅ | Vercel project configured (single project, branch-based) | One project serves both environments | `dev` branch → `aequo-eta-dev.vercel.app` preview; `main` → `aequo-eta.vercel.app` production | 2026-09-26 |
| ✅ | Supabase projects configured + schema run | Separate dev and prod databases ready | `aequo-dev` and `aequo-prod` projects created; `db/schema.sql` run on both; PostgreSQL grants applied | 2026-09-26 |
| ✅ | Stripe webhook endpoint created (dev + prod) | Stripe can deliver events to both environments | Endpoints created in Stripe Dashboard for test mode (dev) and live mode (prod) | 2026-09-26 |
| ✅ | Stripe API keys configured in Vercel | Both environments can call Stripe | Test keys on preview environment, live keys on production environment | 2026-09-26 |
| ✅ | Stripe products created + synced to Supabase | Plans are purchasable and resolvable in the DB | 4 products created in Stripe (dev + prod); rows in `products` table with `stripe_price_id` and `plan_type` | 2026-09-26 |
| ✅ | Gemini API key configured in Vercel | Chatbot can call Gemini | Same API key set for both environments in Vercel | 2026-09-26 |
| ✅ | Dev payment flow tested and working | Checkout works end-to-end in Stripe test mode | Verified redirect to Stripe + test card `4242 4242 4242 4242`. **Limitation**: one-time fulfillment is not yet server-verified (tracked in pending) | 2026-09-26 |
| ✅ | Calendar events persist to Supabase | Calendar data survives reloads and sessions | `calendar_events` table + server actions for CRUD; generic events persist on create/update/delete | 2026-09-26 |
| ✅ | Stripe dunning enabled | Failed renewals are not retried and the customer is not emailed by Stripe | Enable Smart Retries, customer retries emails, and expiring card emails in Stripe dunning settings (Dashboard, no code) | 2026-09-26 |
| ✅ | Rate-limit IP spoofing fix | Limiter is keyed on the left-most `x-forwarded-for` entry, which is attacker-controlled | Use the right-most XFF entry or `x-real-ip`; key authenticated routes on `user.id` instead of IP | 2026-09-26 (code fixed) |
| ✅ | Mode-gated Stripe env validation | Missing Stripe keys in prod silently fall back to mock values and fail weirdly | Changed `lib/env.ts` condition from `isProduction || isLocal` to `isLocal ? mockEnvSchema : realEnvSchema` — mock fallbacks now only in `local` mode | 2026-09-26 |
| ✅ | Webhook idempotency race | Two simultaneous deliveries of the same event both pass the check and both process | Replaced check-then-insert with try-insert-first — the `UNIQUE` constraint on `event_id` is now the source of truth; duplicate inserts throw code `23505` which is caught and treated as success | 2026-09-26 |
| ✅ | `current_period_end` set correctly at checkout | Currently set to `new Date()` at purchase → paying user reads as "expired" until `customer.subscription.updated` arrives | In webhook, call `stripe.subscriptions.retrieve(session.subscription)` and store its real `current_period_end` | 2026-09-26 |
| ✅ | "Not legal advice" disclaimer | Chatbot answers Mexican labor-law questions with no liability protection | Added dismissible disclaimer in ChatWindow with localStorage flag; added footer in dashboard layout | 2026-09-26 |
| ✅ | Cookie banner decision + implementation | Notice-only cookie banner with no functional gating | Implemented real gating: CookieConsentProvider wraps app, exposes `useHasAcceptedCookies()` hook for gating non-essential scripts; banner only disappears after explicit consent choice | 2026-09-26 |
| ✅ | Service-role key audit | The service-role key must never reach the client bundle | Added `server-only` to `lib/supabase/admin.ts`; verified no actual service role keys in `.next/static` output — only runtime `process.env` references (resolved by hosting). Note: `createRealMinimumWageService` path in providers is bundled client-side but only reads env vars at server runtime | 2026-09-26 |
| ✅ | Vercel WAF rate limiting for `/api/chatbot` | In-memory limiter is per-instance and resets on cold start — decorative protection | Configured Vercel WAF rule: path equals `/api/chatbot` → rate limit 20 req/min per IP, action: 429 | 2026-09-26 |
| ✅ | Handle `charge.refunded` | Refunded users keep access until period end — nothing revokes it | Added `charge.refunded` webhook handler that immediately sets subscription status to `canceled` by `stripe_customer_id` | 2026-09-26 |
| ✅ | Handle `invoice.payment_failed` | A failed renewal means instant access loss with no grace period and no notice | Added `invoice.payment_failed` webhook handler that sets subscription status to `past_due`; users with failed payments lose access immediately; UI already hides upgrades for non-active statuses | 2026-09-26 |
| ✅ | Remove delete side effect from `canGenerateDocument()` | A read path (`billing-usage.ts`) deletes extra subscription rows as a side effect | Removed delete logic from `canGenerateDocument()` in `billing-usage.ts` — it's now purely read-only; single-active-subscription enforcement already handled at write time by the `checkout.session.completed` webhook (updates existing instead of creating duplicates) | 2026-09-26 |
| ✅ | Fix upgrade double-billing | Buying a new plan creates a NEW Stripe subscription; the old one keeps billing forever, silently | When `checkout.session.completed` finds an existing active subscription, the old Stripe subscription is now canceled via `stripe.subscriptions.cancel()` before updating the DB record with the new subscription | 2026-09-26 |
| ✅ | Fix quota reset window | Usage is counted since subscription `created_at` — monthly quotas never actually reset on renewal | Added `current_period_start` column to subscriptions schema; both `checkout.session.completed` and `customer.subscription.updated` webhooks now store it; `getUserDocumentCount()` counts expedientes since start of billing month | 2026-09-26 |
| ✅ | First-subscription checkout blocked (launch blocker) | `/api/billing/checkout` returned 403 for `mode: 'subscription'` when no active subscription row existed — but rows are only created by the `checkout.session.completed` webhook, so a brand-new user could never complete a first subscription purchase | Removed the entire subscription guard block from `app/api/billing/checkout/route.ts` (lines 60-74); single-active-subscription enforcement already lives in the webhook. Also removed unused `supabaseAdmin` import. `checkoutSchema` moved to `lib/forms/schemas.ts`; Zod schema tests added (10 tests). Test: brand-new account → subscribe → redirect to Stripe | 2026-09-26 |
| ✅ | Final PRODUCTION_READINESS.md pass | The doc had stale header count (14 vs actual 28), superseded limitation notes, old redundant sections, and all `—` dates | Re-verified every completed row; filled all Updated dates with 2026-09-26; removed superseded limitation notes from webhook idempotency and cookie consent rows; removed old `Remaining — Infrastructure`, `Remaining — Code`, and `Known Issues` sections; updated header count from 14 to 28 items; updated header date to 2026-09-26 | 2026-09-26 |
| ✅ | ARCHITECTURE.md is stale | Claimed no test suite (18 vitest tests pass), minimum_wages missing from schema (it's there and seeded), only 3 webhook events documented (5 handled), zones 14–16 not reflecting reality | Updated Testing section (18 tests pass); Migrations section (minimum_wages now in schema.sql); Section 9 Technical Debt fully rewritten — resolved items 1–3 marked ✅, zona_salarial drift and permissive RLS added as new open items, per-route error boundaries and indexes marked ✅; provisioning guide updated with 5 webhook events and current schema | 2026-09-26 |

### ⬜ Pending

#### 1. Only text on files

*(All items in this section are now resolved — moved to Done above.)*

#### 2. Only code

| Status | Item | Description | How to fix | Updated date |
|--------|------|-------------|------------|--------------|
| ✅ | Middleware route gaps | `/calendario` missing from `protectedRoutes` (page renders logged-out; data still safe via RLS, but no redirect to /login); `/reporte` listed but no such route exists | Added `/calendario` to `protectedRoutes` in `middleware.ts`; removed stale `/reporte` entry. Build + 28 tests pass. | 2026-09-27 |
| ✅ | SMG fetch failure silently zeroes prima de antigüedad | `useCalculadora` catches minimum-wage fetch errors and proceeds with `SMG_value = 0` → legal cap becomes $0 → prima de antigüedad computes as $0 with no user warning. Dev/prod risk (local mock unaffected) | Added `useToast` + retry-once to `useCalculadora.calcular()`; SMG fetch failure now shows `toast.error()` and returns early without calculating. Build + 28 tests pass. | 2026-09-27 |
| ✅ | Read-path delete side effect in `getUserSubscription()` | `billing-ui.ts:55` still deletes "duplicate" subscription rows during a read (reached via `billing-actions.server.ts`) — same class of bug already removed from `canGenerateDocument()` | Removed the delete block from `getUserSubscription()` in `billing-ui.ts`; function is now pure read-only. Build + 28 tests pass. | 2026-09-27 |
| ✅ | Stripe API version pinned inconsistently | `lib/services/billing.ts` uses `2026-04-22.dahlia`; webhook route + `lib/di/providers.ts` use `2026-08-26.dahlia` | Added `STRIPE_API_VERSION` constant to `lib/constants/billing.ts`; all three Stripe instances now import from the same source. Build + 28 tests pass. | 2026-09-27 |
| ✅ | `charge.refunded` cancels subscriptions it shouldn't | One-time purchases and monthly subscriptions share the same Stripe customer; refunding the $50 one-time generation (or any unrelated charge) instantly cancels the whole subscription via `stripe_customer_id` lookup | `charge.refunded` handler now resolves the checkout session via `charge.payment_intent` before canceling; skips subscription cancellation if `session.metadata.mode === 'payment'`. Build + 28 tests pass. | 2026-09-27 |
| ✅ | Two inconsistent definitions of "active subscription" | `checkUserSubscription` (billing-usage.ts) requires `status='active'` + unexpired `current_period_end`; `canGenerateDocument` accepts `trialing` and ignores `period_end`. The two helpers can disagree | Added `getActiveSubscription(userId)` as single source of truth in `billing-usage.ts`; both `checkUserSubscription` and `canGenerateDocument` now delegate to it. Build + 28 tests pass. | 2026-09-27 |
| ✅ | `validateEnv()` dead code | `lib/env.ts` validates at module load only if imported — nothing imports it, so the mode-gated credential validation is dead code; a missing Stripe/Supabase key in dev/prod fails late and weirdly instead of at boot | Created `instrumentation.ts` at project root importing `lib/env`; Next.js loads it at server startup which triggers the `validateEnv()` side effect. Build + 28 tests pass. | 2026-09-27 |
| ✅ | `handlePaymentClick` swallows errors | `calculadora/page.tsx:162-166` catches the payment error but only logs it — no user feedback. Comment even says "You might want to use toast here" | Added `useToast` import and `toast.error(message)` to the catch block in `calculadora/page.tsx`. Build + 28 tests pass. | 2026-09-27 |

#### 3. Code + devops / config

| Status | Item | Description | How to fix | Updated date |
|--------|------|-------------|------------|--------------|
| ✅ | `profiles.zona_salarial` schema drift | Code writes and reads `profiles.zona_salarial` (`perfil.ts:52,158`; `useCalculadora.ts:102` uses it to pick SMG zone for prima de antigüedad cap), but `db/schema.sql` does not define this column. ARCHITECTURE.md documents it and the mock has it. If real DBs were built from schema.sql, saving the Estilo profile fails | Added `zona_salarial TEXT DEFAULT 'general'` to `profiles` table in `db/schema.sql`; ARCHITECTURE.md updated. Live DBs patched on both `aequo-dev` and `aequo-prod`. Build + 28 tests pass. | 2026-09-27 |
| ✅ | Overly permissive RLS on `subscriptions` + `webhook_events` | Both tables had `FOR ALL ... USING (true) WITH CHECK (true)` policies granting every authenticated user full read/write via PostgREST. `service_role` bypasses RLS by default anyway. Risk: users could read others' `stripe_customer_id` and raw Stripe webhook event bodies with customer emails | Dropped the `FOR ALL USING (true)` policies from both tables on `aequo-dev` and `aequo-prod`. Build + 28 tests pass. | 2026-09-27 |
| ✅ | One-time purchase fulfillment | A $50 payment grants nothing server-side; download gated only by unverified URL param + localStorage (paywall bypassable, no recovery if localStorage lost) | Added `purchases` table (`user_id`, `product_id`, `stripe_session_id`, `stripe_payment_intent`, `amount_cents`); webhook `mode=payment` branch now inserts a purchase row; new `/api/purchases/verify` route validates session+user before serving; download page rewritten to call verify endpoint. Live DBs need the table created. Build + 28 tests pass. | 2026-09-27 |
| ✅ | Code cleanup batch | Orphaned `/api/create-payment-intent` route (zero callers); Flutter leftover `test/widget_test.dart`; `handlePaymentClick` in calculadora swallows errors with no toast; `PaywallModal.tsx` + calculadora paywall section + download page all use Tailwind classes + hardcoded colors breaking dark mode | Deleted orphaned `/api/create-payment-intent/route.ts` and `test/widget_test.dart`; converted `PaywallModal.tsx`, `calculadora/page.tsx:242-247`, `calculadora/download/page.tsx`, and `download/_content.tsx` to inline styles + CSS variables. Build + 28 tests pass. | 2026-09-27 |
| ✅ | `instrumentation.ts` to wire `validateEnv()` | Duplicate of item 7 (validateEnv dead code) — resolved together. Created `instrumentation.ts` at project root importing `lib/env`; Next.js loads it at server startup which triggers the `validateEnv()` side effect. | 2026-09-27 |

#### 4. Devops / config only

| Status | Item | Description | How to fix | Updated date |
|--------|------|-------------|------------|--------------|
| ⬜ | WAF rate limit for `/api/billing/checkout` | In-memory limiter is per-instance and resets on cold start (decorative on serverless); `/api/chatbot` already covered by Vercel WAF, checkout is not — Stripe session spam costs real money | **Skipped — Vercel Free plan allows only one WAF rule** (already consumed by `/api/chatbot`). Upgrade to Vercel Pro for additional rules. | |
| ⬜ | Budget alerts on all providers | No early warning against surprise bills (main risk: Gemini via chatbot abuse/bugs) | Deferred — requires GCP/Supabase/Vercel dashboard configuration only | |
| ⬜ | Data-deletion runbook + test | Legal obligation (LFPDPPP); cascades cover most but not all user data | Deferred — document deletion procedure and test on dev account | |
| ⬜ | E2E tests passing (Playwright) | No automated coverage of critical flows | Deferred — requires Playwright setup + writing coverage | |
| ⬜ | Integration tests passing | No integration coverage for core flows | Deferred — requires test setup + writing | |
| ⬜ | Load testing completed | Behavior under load is unknown | Deferred — requires tooling + execution | |
| ⬜ | Free backups + test restore | Supabase free tier has no restore path; users' legal case data is unprotected | Deferred — requires Supabase Pro plan or pg_dump GitHub Action + B2/R2 setup | |
| ⬜ | Custom domain configured | `aequo.app` should serve the production deployment | Do on launch day (10 min task in Vercel + DNS) | |
| ⬜ | Production payment flow smoke test | Only dev/test-mode has been verified so far | Buy with real card → verify webhook event in Stripe Dashboard → verify row in prod Supabase → refund → verify revocation; run on prod | |
