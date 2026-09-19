# Aequo — Architecture Document

> **Status**: Frontend codebase is complete and self-contained. All backend services (Supabase, Stripe, Vercel, Gemini) must be provisioned and configured independently before the application is production-ready. The code references exact table names, column names, API keys, and webhook endpoints — these are not placeholders, they are the specification.

---

## 1. Stack

### 1a. Frontend Code (what lives in this repository)

| Layer | Technology | Version | Config File |
|-------|------------|---------|-------------|
| Framework | Next.js (App Router) | 16.2.1 | `next.config.ts` |
| UI Library | React | 19.2.4 | — |
| Language | TypeScript | 5.x | `tsconfig.json` |
| Styling | Tailwind CSS | 4.x | `tailwind.config.mjs`, `postcss.config.mjs` |
| State Management | Zustand | 5.0.12 | — |
| Forms | react-hook-form + @hookform/resolvers + Zod | 7.72.1 / 5.2.2 / 4.3.6 | `lib/forms/schemas.ts` |
| PDF Generation | jsPDF + html2canvas | 4.2.1 / 1.4.1 | — |
| Auth integration | @supabase/ssr + @supabase/supabase-js | 0.9.0 / 2.100.1 | `lib/supabase/*.ts` |
| Payments client | @stripe/stripe-js | 9.2.0 | — |
| AI client | @google/generative-ai | 0.24.1 | — |
| Calendar | react-big-calendar | 1.19.4 | — |
| Date utilities | moment | 2.30.1 | — |

**Package manager**: pnpm (`pnpm-workspace.yaml`)

**Build/test/lint**:
| Tool | Command | Config |
|------|---------|--------|
| Next.js build | `pnpm build` | `next.config.ts` (React Compiler on) |
| ESLint | `pnpm lint` | `eslint.config.mjs` (next/core-web-vitals + typescript) |
| TypeScript | `pnpm tsc --noEmit` | `tsconfig.json` (strict, `@/*` alias) |

### 1b. Infrastructure Services (must be provisioned separately)

| Service | Purpose in this app | Key integration points |
|---------|-------------------|----------------------|
| **Supabase** | PostgreSQL database, Auth (email/password), Row Level Security | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`; `middleware.ts` |
| **Stripe** | Subscription billing, one-time payments, webhooks | `lib/services/billing.ts`, `lib/stripe/client.ts`; `app/api/webhooks/stripe/route.ts` |
| **Vercel** | Hosting, edge functions (via Next.js deployment), environment variables | `next.config.ts`; `.env` keys |
| **Google Gemini** | AI chatbot for labor law Q&A | `app/api/chatbot/route.ts` (requires `GEMINI_API_KEY`) |

### Environment Variables

All validated at startup via `lib/env.ts` (Zod schema). These are the exact keys the code expects:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLIC_KEY

# Gemini
GEMINI_API_KEY
```

---

## 2. What the Product Does

### Purpose
Aequo is a **SaaS labor law calculator** for Mexican legal professionals (lawyers, HR consultants). It computes **finiquito** (resignation settlement) and **liquidación** (dismissal compensation) under Mexican Federal Labor Law, generates comparative PDF reports, and manages case files ("expedientes").

### Users
- **Abogados / consultores jurídicos** — generate liquidation calculations for labor conciliations
- **Target market**: Mexican legal professionals handling employee dismissals or resignations

### Main User Flows

1. **Register/Login**: User signs up via Supabase Auth (email + password)
2. **Calculate**: User enters employee data → system computes finiquito + liquidación → displays comparison table
3. **Download PDF**: Authenticated user downloads branded PDF report with full breakdown
4. **Save Expediente**: Calculation is saved to Supabase (cloud) + localStorage (offline backup)
5. **Manage Expedientes**: View, re-download, delete past calculations; add conciliation hearing dates
6. **Branding**: User customizes logo, colors, lawyer name, conciliation percentage
7. **Billing**: Free tier with monthly document limit; paid subscriptions via Stripe; one-time generation purchases ($50 MXN)
8. **AI Chatbot**: Legal Q&A about Mexican labor law (LFT 2015–2025)

---

## 3. Folder Structure

```
/
├── app/                          # Next.js App Router — all pages and API routes
│   ├── (auth)/                   # Auth group: login, registro, confirm, callback
│   ├── (dashboard)/              # Protected group (middleware-guarded)
│   │   ├── calculadora/         # Main calculator + download page
│   │   ├── expedientes/          # Saved cases
│   │   ├── billing/             # Subscription management + success page
│   │   ├── calendario/          # Hearing schedule
│   │   └── estilo/              # Branding settings
│   ├── api/                      # Route Handlers (server-side)
│   │   ├── billing/checkout/    # POST → create Stripe checkout session
│   │   ├── billing/check-subscription/
│   │   ├── chatbot/             # POST → Gemini AI
│   │   ├── create-payment-intent/
│   │   ├── minimum-wage/        # GET → SMG from Supabase
│   │   └── webhooks/stripe/     # POST → Stripe webhook handler
│   ├── layout.tsx                # Root layout (ThemeProvider, ToastContainer)
│   ├── error.tsx                 # Root error boundary
│   └── globals.css              # CSS variables (dark mode), global styles
│
├── components/                   # Atomic Design UI components
│   ├── billing/                 # Payment UI
│   ├── calculadora/             # FormularioEmpleado, TablaComparativa
│   ├── calendario/              # EventForm
│   ├── chatbot/                 # ChatWindow, ChatWidget, ChatBubble
│   ├── expediente/              # TarjetaExpedientes, ConciliacionForm
│   ├── forms/                  # FormProvider, FormField (react-hook-form wrappers)
│   ├── layout/                  # Sidebar, ThemeProvider, AuthProvider
│   └── ui/                      # Primitives: Button, Input, Dialog, Card, Heading, Popover, PaywallModal, toast/
│
├── hooks/                        # Custom React hooks
│   ├── useCalculadora.ts        # Labor calculation state machine
│   └── useExpedientes.ts        # Expediente CRUD with localStorage fallback
│
├── lib/                         # Business logic and infrastructure adapters
│   ├── auth/cache.ts            # localStorage auth caching
│   ├── calculos/                # Domain layer — pure TypeScript
│   │   ├── finiquito.ts         # Resignation settlement logic
│   │   ├── liquidacion.ts       # Dismissal compensation logic
│   │   ├── isr.ts              # Income tax calculation
│   │   ├── types.ts            # Core interfaces (DatosEmpleado, ResultadoCalculo…)
│   │   └── validators.ts        # Input validation
│   ├── env.ts                   # Zod env validation (runs at startup)
│   ├── forms/schemas.ts         # Zod schemas (login, registro, perfil)
│   ├── pdf/                     # Client-side PDF generation (jsPDF)
│   │   ├── generator.ts         # Main orchestrator
│   │   ├── branding.ts          # Header/footer with custom branding
│   │   └── templates/          # PDF content templates
│   ├── services/                # Server-side application services
│   │   ├── billing*.ts         # Stripe checkout, subscription, usage tracking
│   │   ├── chat-service.ts     # AI chatbot service
│   │   ├── expedientes-actions.server.ts # Server Actions for expediente updates
│   │   └── user-actions.server.ts
│   ├── share.ts                 # WhatsApp / email sharing
│   ├── stripe/                  # Stripe client helpers
│   ├── supabase/               # Supabase client factories
│   │   ├── client.ts           # Browser client (createBrowserClient)
│   │   ├── server.ts           # Server/client for RSC + Route Handlers
│   │   ├── admin.ts            # Service role client (bypasses RLS)
│   │   ├── expedientes.ts       # Expediente CRUD
│   │   ├── perfil.ts           # Profile queries
│   │   └── types.ts            # Supabase generated types
│   ├── toast/                   # Client-side toast notifications
│   └── utils/                   # Utilities (withTimeout, etc.)
│
├── store/                       # Zustand state stores
│   ├── brandingStore.ts         # Branding + theme + access control cache
│   ├── calculadoraStore.ts      # Calculator state
│   └── chatStore.ts            # Chat conversation history
│
├── db/
│   └── schema.sql               # PostgreSQL schema — RUN THIS IN SUPABASE
│
├── docs/
│   └── WEBHOOK_IDEMPOTENCY.sql  # Separate migration for webhook idempotency
│
├── middleware.ts                # Next.js middleware — protects /calculadora, /expedientes, /billing, etc.
├── next.config.ts               # Next.js (React Compiler enabled)
├── tailwind.config.mjs         # Tailwind CSS 4
├── eslint.config.mjs            # ESLint flat config
├── tsconfig.json               # TypeScript strict + path aliases
└── package.json
```

---

## 4. Infrastructure Provisioning Guide

> This section describes what must be created and configured in each external service before the application runs. The code references exact table names, column names, product IDs, and webhook paths — treat these as a specification to implement.

### 4a. Supabase

**Project setup**: Create a Supabase project at supabase.com. Enable **Email Auth** (no OAuth needed initially).

**Database schema**: Run `db/schema.sql` in the Supabase SQL Editor. This creates:

```sql
-- Table: profiles (1:1 with auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre TEXT,
  despacho TEXT,
  cedula TEXT,
  correo TEXT,
  direccion TEXT,
  logo_url TEXT,
  color_primario TEXT,
  porcentaje_conciliacion INTEGER DEFAULT 50,
  color_secundario TEXT,
  fuente TEXT DEFAULT 'helvetica',
  zona_salarial TEXT DEFAULT 'general',  -- 'general' or 'frontera_norte'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: expedientes
CREATE TABLE expedientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_empleado TEXT NOT NULL,
  empresa TEXT,
  datos_calculo JSONB NOT NULL,    -- DatosEmpleado serialized
  resultado JSONB NOT NULL,         -- ResultadoCalculo serialized
  pdf_url TEXT,
  conciliacion_date TIMESTAMPTZ,
  conciliacion_title TEXT,
  conciliacion_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_sub_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: products (subscription plans)
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,                    -- e.g., "Plan Profesional"
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'mxn',
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  stripe_product_id TEXT UNIQUE,
  stripe_price_id TEXT UNIQUE,
  doc_limit INTEGER DEFAULT 0,           -- monthly document limit (MISSING from schema.sql — see debt section)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: minimum_wages (SMG lookup table)
-- NOTE: This table is NOT in schema.sql but is queried by app/api/minimum-wage/route.ts
-- Must be created manually and populated with annual SMG data
CREATE TABLE minimum_wages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  zone TEXT NOT NULL DEFAULT 'general',  -- 'general' or 'frontera_norte'
  daily_wage NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(year, zone)
);

-- Table: webhook_events (idempotency log for Stripe webhooks)
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  body JSONB NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
-- Service role full access:
CREATE POLICY "Service role has full access" ON webhook_events AS PERMISSIVE FOR ALL USING (true) WITH CHECK (true);
```

**RLS policies** needed:
- `profiles`: Users can read/update their own row (`auth.uid() = id`)
- `expedientes`: Users can only CRUD their own (`auth.uid() = user_id`)
- `subscriptions`: Users can read their own (`auth.uid() = user_id`)
- `products`: Public read access (`is_active = TRUE`)
- `minimum_wages`: Public read access

**Auth callbacks**: Configure Supabase Auth callback URL to `https://your-domain.com/auth/callback`

### 4b. Stripe

**Dashboard setup**:
1. Create a Stripe account (test mode first)
2. Add products/plans in Stripe Dashboard matching the `products` table:
   - At least one subscription plan (e.g., "Plan Profesional" with monthly price)
   - One one-time product "Generación individual" ($50 MXN — referenced by name in `billing-usage.ts:24`)
3. Copy the `stripe_price_id` from Stripe into the `products.stripe_price_id` column in Supabase

**Webhook endpoint**: Configure in Stripe Dashboard → Webhooks → Add endpoint:
- **URL**: `https://your-domain.com/api/webhooks/stripe`
- **Events to listen for**:
  - `checkout.session.completed`
  - `customer.subscription.deleted`
  - `customer.subscription.updated`
- Copy the **Webhook Signing Secret** (`STRIPE_WEBHOOK_SECRET`)

**Keys**:
- `STRIPE_SECRET_KEY` (server-side)
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` (client-side)
- `STRIPE_WEBHOOK_SECRET`

### 4c. Vercel

**Deployment**:
1. Connect GitHub repo to Vercel
2. Add environment variables (all from section 1b)
3. Deploy — Vercel auto-detects Next.js

**Domain**: Configure custom domain in Vercel project settings.

**Auth redirect**: Add `https://your-domain.com/auth/callback` to Supabase allowed redirect URLs.

### 4d. Google Gemini

**Setup**:
1. Go to Google AI Studio → Create API Key
2. Set `GEMINI_API_KEY` environment variable in Vercel

**Model used**: `gemini-2.0-flash` (set in `app/api/chatbot/route.ts:56`)

---

## 5. Architecture

### Layer Overview

```
┌─────────────────────────────────────────────────────┐
│  PRESENTATION LAYER — Next.js App Router + React  │
│  Pages: app/(dashboard)/*, app/(auth)/*            │
│  Components: components/**                        │
│  Hooks: hooks/useCalculadora, useExpedientes      │
└───────────────────────┬─────────────────────────────┘
                        │ renders / user interaction
┌───────────────────────▼─────────────────────────────┐
│  APPLICATION LAYER — Zustand stores + Server Acts │
│  store/brandingStore.ts, store/chatStore.ts        │
│  lib/services/*.server.ts                         │
└───────────────────────┬─────────────────────────────┘
                        │ business logic
┌───────────────────────▼─────────────────────────────┐
│  DOMAIN LAYER — Pure TypeScript (no framework)    │
│  lib/calculos/finiquito.ts                        │
│  lib/calculos/liquidacion.ts                      │
│  lib/calculos/types.ts, validators.ts             │
└───────────────────────┬─────────────────────────────┘
                        │ I/O
┌───────────────────────▼─────────────────────────────┐
│  INFRASTRUCTURE ADAPTERS — External services       │
│  Supabase (PostgreSQL + Auth)                     │
│  Stripe (payments + webhooks)                     │
│  Gemini AI (chatbot)                              │
│  jsPDF + html2canvas (client-side PDF)            │
└─────────────────────────────────────────────────────┘
```

### End-to-End Request Flow: Calculate and Download PDF

```
USER FILLS FORM
  components/calculadora/FormularioEmpleado.tsx
  └── onCambio() → updates useCalculadora state (local)

CALCULATE ACTION
  hooks/useCalculadora.ts → calcular()
  ├── validates with lib/calculos/validators.ts
  ├── fetches SMG: GET /api/minimum-wage?year=Y&zone=Z
  │   └── app/api/minimum-wage/route.ts
  │       └── queries Supabase minimum_wages table
  ├── calcularFiniquito(datos, porcentajeConciliacion)
  │   └── lib/calculos/finiquito.ts
  └── calcularLiquidacion(datos, porcentajeConciliacion, SMG_value)
      └── lib/calculos/liquidacion.ts

ACCESS CHECK (on download)
  app/(dashboard)/calculadora/page.tsx → handleDescargar()
  ├── checkAccess() [billing-actions.ts 'use server']
  │   └── canGenerateDocument(userId) queries Supabase subscriptions + products
  ├── if no access → show PaywallModal
  └── if access → guardar() expediente

SAVE EXPEDIENTE (before PDF)
  hooks/useExpedientes.ts → guardar()
  ├── localStorage.setItem() — optimistic save
  ├── guardarExpedienteSupabase() → Supabase 'expedientes' INSERT
  └── toast success/error

PDF GENERATION (client-side)
  lib/pdf/generator.ts → generarPDF()
  ├── import('jspdf') + import('html2canvas') — dynamic
  ├── aplicarEncabezado(doc, branding)
  ├── generarComparativo(doc, resultado, ...) — per type (despido/renuncia)
  └── aplicarPiePagina(doc, branding)

DOWNLOAD
  descargarPDF({ resultado, datos, branding }, filename)
  └── doc.save(`${filename}.pdf`)
```

### Auth Flow

```
User → /calculadora
  middleware.ts
  ├── createServerClient(Supabase)
  ├── supabase.auth.getUser()
  ├── protectedRoutes = ['/calculadora', '/expedientes', '/estilo', '/reporte', '/billing']
  └── no user + protected → 302 to /login

/login → form submit
  app/(auth)/login/page.tsx
  └── supabase.auth.signInWithPassword()

on SIGNED_IN
  components/layout/AuthProvider.tsx
  ├── setCachedUserId(session.user.id)
  ├── getCachedBranding(userId) → localStorage
  ├── obtenerPerfilSupabase() → profiles table
  └── setBranding(perfil)

on SIGNED_OUT
  clearCachedUserId()
  resetear()
  router.push('/login')
```

### Stripe Billing Flow

```
User clicks "Suscribirse" or "Pagar $50"
  → POST /api/billing/checkout { planId, mode }
  → BillingService.createCheckoutSession()
      ├── queries products table for stripe_price_id
      ├── getOrCreateStripeCustomer(userId)
      └── stripe.checkout.sessions.create()
  → returns { url } → browser redirects to Stripe

Stripe Checkout → success redirect
  /billing/success?session_id=...&planId=...  (subscription)
  /calculadora/download?session_id=...        (one-time)

Stripe sends webhook POST /api/webhooks/stripe
  → stripe.webhooks.constructEvent() — signature verified
  → isEventNew(eventId) — checks webhook_events table
  → checkout.session.completed:
      ├── subscription mode → upsert subscriptions table
      └── payment mode → just log
  → customer.subscription.deleted → UPDATE subscriptions SET status = 'canceled'
  → customer.subscription.updated → UPDATE subscriptions SET status = ...
  → markEventProcessed(eventId) — INSERT webhook_events
```

---

## 6. Data Model

### Entity Relationship Diagram

```
Supabase Auth
auth.users (managed by Supabase)
    │
    ├── 1:1 ──────────────────────────── profiles
    │         id            → auth.users.id
    │         nombre, despacho, cedula, correo, direccion
    │         logo_url, color_primario, color_secundario, fuente
    │         porcentaje_conciliacion, zona_salarial
    │
    ├── 1:N ──────────────────────────── expedientes
    │         user_id       → auth.users.id
    │         id            (uuid PK)
    │         nombre_empleado, empresa
    │         datos_calculo  (JSONB — DatosEmpleado)
    │         resultado      (JSONB — ResultadoCalculo)
    │         pdf_url, conciliacion_date, conciliacion_title, conciliacion_description
    │
    └── 1:N ──────────────────────────── subscriptions
              user_id       → auth.users.id
              id            (uuid PK)
              plan          (product UUID)
              status        ('active', 'canceled', 'trialing')
              stripe_customer_id, stripe_sub_id
              current_period_end

    products (no user FK — global catalog)
        id            (uuid PK)
        name          (e.g., "Plan Profesional", "Generación individual")
        stripe_price_id, stripe_product_id
        price_cents, currency
        features      (text[])
        doc_limit     (monthly document limit)
        is_active

    minimum_wages (no user FK — reference table)
        year, zone   (composite PK — 'general' | 'frontera_norte')
        daily_wage

    webhook_events (no user FK — idempotency log)
        event_id     (text UNIQUE)
        event_type, body (JSONB)
```

### Key JSONB Structures

**datos_calculo** (`expedientes.datos_calculo`):
```typescript
interface DatosEmpleado {
  nombreEmpleado: string
  puestoEmpleado: string
  empresa: string
  fechaIngreso: string       // 'YYYY-MM-DD'
  fechaSalida: string        // 'YYYY-MM-DD'
  tipoDocumento: 'despido' | 'renuncia' | 'ambos'
  periodos: PeriodoAnual[]
}

interface PeriodoAnual {
  anio: number
  salarioDiario: number
  diasVacacionesUsados: number
  aplicaVacaciones: boolean
  aplicaPrimaVacacional: boolean
  aplicaAguinaldo: boolean
  incluirBeneficiosExtra?: boolean
  beneficiosExtra?: { nombre: string; monto: number }[]
}
```

**resultado** (`expedientes.resultado`):
```typescript
interface ResultadoCalculo {
  finiquito: ResultadoFiniquito
  liquidacion: ResultadoLiquidacion
  diasLaborados: number
  aniosServicio: number
  aniosCompletos: number
  mesesRestantes: number
  diasRestantes: number
  tipoDocumento: TipoDocumento
  datosCalculo: DatosEmpleado
}

interface ResultadoFiniquito {
  periodos: ResultadoPeriodo[]
  total: number
  desglose: DesglosePaso[]
}

interface ResultadoLiquidacion {
  indemnizacion: number
  diasPrimaAntiguedad: number
  montoPrimaAntiguedad: number
  periodos: ResultadoPeriodo[]
  total: number
  desglose: DesglosePaso[]
}

interface DesglosePaso {
  concepto: string
  dias: string
  total: number
  propuestaConciliacion: number
}
```

---

## 7. Entry Points

### Application Bootstrap
| File | Role |
|------|------|
| `app/layout.tsx` | Root layout — runs `validateEnv()` at module load; mounts ThemeProvider + ToastContainer |
| `middleware.ts` | Intercepts ALL requests; creates Supabase session; guards `/calculadora`, `/expedientes`, `/estilo`, `/reporte`, `/billing` |

### Page Routes
| Route | File | Auth |
|-------|------|------|
| `/login` | `app/(auth)/login/page.tsx` | Public |
| `/registro` | `app/(auth)/registro/page.tsx` | Public |
| `/calculadora` | `app/(dashboard)/calculadora/page.tsx` | Required |
| `/expedientes` | `app/(dashboard)/expedientes/page.tsx` | Required |
| `/billing` | `app/(dashboard)/billing/page.tsx` | Required |
| `/billing/success` | `app/(dashboard)/billing/success/page.tsx` | Required |
| `/calculadora/download` | `app/(dashboard)/calculadora/download/page.tsx` | Required (post-payment) |
| `/calendario` | `app/(dashboard)/calendario/page.tsx` | Required |
| `/estilo` | `app/(dashboard)/estilo/page.tsx` | Required |

### API Route Handlers
| Handler | File | Method |
|---------|------|--------|
| Chatbot AI | `app/api/chatbot/route.ts` | POST |
| Minimum wage SMG | `app/api/minimum-wage/route.ts` | GET |
| Stripe checkout | `app/api/billing/checkout/route.ts` | POST |
| Stripe webhook | `app/api/webhooks/stripe/route.ts` | POST |
| Payment intent | `app/api/create-payment-intent/route.ts` | POST |
| Subscription check | `app/api/billing/check-subscription/route.ts` | GET |

### Client State Initialization
| Store | File | Initializer |
|-------|------|-------------|
| Branding + theme + access cache | `store/brandingStore.ts` | `AuthProvider` on `SIGNED_IN` |
| Chat history | `store/chatStore.ts` | `ChatWidget` component |
| Expedientes | `hooks/useExpedientes.ts` | `useExpedientes()` hook — auto-loads from localStorage + Supabase |

---

## 8. Code Conventions

### Naming Conventions
| Category | Convention | Example |
|----------|------------|---------|
| Route/page files | kebab-case | `calculadora/page.tsx` |
| Module files | camelCase | `useCalculadora.ts`, `brandingStore.ts` |
| Types/Interfaces | PascalCase | `DatosEmpleado`, `ResultadoCalculo` |
| Functions | camelCase | `calcularFiniquito`, `guardarExpedienteSupabase` |
| CSS variables | kebab-case | `--bg-primary`, `--text-secondary` |
| Zod schemas | snake_case keys + `Schema` suffix | `loginSchema`, `perfilSchema` |
| DB tables/columns | snake_case | `nombre_empleado`, `datos_calculo` |
| Environment variables | SCREAMING_SNAKE_CASE | `NEXT_PUBLIC_SUPABASE_URL` |

### Error Handling
| Context | Pattern |
|---------|---------|
| API Routes | `NextResponse.json({ error: message }, status)` + `console.error` |
| Server Actions | Return `{ success: boolean, error?: string }` |
| Hooks | try/catch → `lib/toast/index.ts` for user feedback |
| Form validation | Zod schemas in `lib/forms/schemas.ts` |
| Domain validation | `lib/calculos/validators.ts` |
| Network calls | `withTimeout()` wrapper in `lib/utils/index.ts` |

### State Management
| Type | Solution |
|------|----------|
| UI state | React `useState` / `useRef` |
| Cross-component state | Zustand-like hooks (`useCalculadora`, `useBrandingStore`) |
| Server state | Server Actions (`'use server'`) + Supabase direct queries |
| Offline cache | localStorage per-user (`lib/auth/cache.ts`) |
| Form state | `react-hook-form` + `zodResolver` |

### Testing
- **No TypeScript test suite exists** — `test/widget_test.dart` is a Flutter file (legacy/irrelevant)
- Domain logic (`lib/calculos/`) has no unit tests
- Recommended: add Vitest or Jest with `@testing-library/react`

### Migrations
- **Supabase**: Run SQL files in the Supabase SQL Editor (no automatic migrations)
- `db/schema.sql` — primary schema (run first)
- `docs/WEBHOOK_IDEMPOTENCY.sql` — webhook_events table (run second)
- **minimum_wages table**: Not in any SQL file — must be created and seeded manually

---

## 9. Technical Debt & Fragile Areas

### Backend Configuration Gaps

1. **Missing `minimum_wages` table**
   - Referenced by `app/api/minimum-wage/route.ts` but not in `schema.sql`
   - Must be created manually in Supabase and populated with annual SMG data (2020–2026 for both zones)
   - Columns: `id`, `year`, `zone`, `daily_wage`, `created_at`

2. **Missing `doc_limit` column in `products` table**
   - `billing-usage.ts:87` reads `product.doc_limit` but `schema.sql` does not define it
   - Must be added: `ALTER TABLE products ADD COLUMN doc_limit INTEGER DEFAULT 0;`

3. **`products` table must be seeded**
   - Code queries products by name (`billing-usage.ts:24`: `"Generación individual"`)
   - Must INSERT sample products with Stripe price IDs after schema creation

4. **No seeding script for test data**
   - No `seeds.sql` or migration seed logic
   - Manual setup required for products, minimum wages, test users

### Code Quality

5. **No test suite for domain logic**
   - `lib/calculos/finiquito.ts`, `lib/calculos/liquidacion.ts` have zero unit tests
   - These contain critical legal calculation logic

6. **Complex session timeout handling** (`lib/supabase/expedientes.ts`)
   - `getSessionWithInitialWait()` races `getSession()` against a 1500ms timeout and `onAuthStateChange`
   - Fragile; repeated in multiple places

7. **Webhook idempotency is best-effort**
   - `isEventNew()` fails open — on error, returns `true` (processes duplicate)
   - `markEventProcessed()` error is swallowed — Stripe will retry

8. **Hardcoded product name** (`billing-usage.ts:24`)
   - `getSingleGenerationProduct()` queries `name = 'Generación individual'` — fragile if renamed

9. **No rate limiting**
   - `/api/chatbot` — Gemini AI calls unthrottled
   - `/api/billing/checkout` — Stripe session creation unthrottled

### Data Integrity

10. **Optimistic localStorage writes with no conflict resolution**
    - `useExpedientes` saves to localStorage before confirming remote
    - If remote fails, stale data persists; no merge/retry logic

11. **Branding cache invalidation**
    - `localStorage` caching of branding by userId with no TTL or invalidation on profile update

12. **Stripe API version `'2026-04-22.dahlia'`** (`billing.ts:7`, `webhooks/stripe/route.ts:6`)
    - Non-standard version string — verify it exists in Stripe API version history

### Performance & UX

13. **PDF generation is fully client-side**
    - Large calculations run in browser; no server-side fallback
    - Complex calculations may be slow on low-end devices

14. **Missing per-route error boundaries**
    - Only `app/error.tsx` and `app/(dashboard)/error.tsx`; chatbot API crash affects whole page

15. **No database indexes documented**
    - Only `webhook_events` index is in `docs/`; schema.sql has no explicit indexes
    - Recommend: index on `expedientes(user_id, created_at)`, `subscriptions(user_id, status)`
