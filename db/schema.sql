create table profiles (
  id                       uuid references auth.users(id) on delete cascade primary key,
  nombre                   text,
  despacho                 text,
  cedula                   text,
  correo                   text,
  direccion                text,
  logo_url                 text,
  color_primario           text,
  porcentaje_conciliacion  integer default 50,
  color_secundario         text,
  fuente                   text default 'helvetica',
  created_at               timestamptz default now()
);

create table expedientes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  nombre_empleado text not null,
  empresa         text,
  datos_calculo   jsonb not null,
  resultado       jsonb not null,
  pdf_url         text,
  conciliacion_date timestamptz,
  conciliacion_title text,
  conciliacion_description text,
  created_at      timestamptz default now()
);

CREATE INDEX idx_expedientes_user_id ON expedientes(user_id);

create table subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users(id) on delete cascade,
  plan               text default 'free',
  status             text default 'active',
  stripe_customer_id text,
  stripe_sub_id      text,
  current_period_end timestamptz,
  created_at         timestamptz default now()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- RLS for profiles: users read/update only their own row
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS for expedientes: users CRUD only their own
ALTER TABLE expedientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own expedientes" ON expedientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expedientes" ON expedientes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expedientes" ON expedientes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expedientes" ON expedientes FOR DELETE USING (auth.uid() = user_id);

-- RLS for subscriptions: users read only their own, service role can do all
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role has full access to subscriptions" ON subscriptions
  AS PERMISSIVE FOR ALL USING (true) WITH CHECK (true);

-- Crear la tabla 'products'
CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  description text NULL,
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'mxn',
  features text[] DEFAULT '{}'::text[] NOT NULL,
  is_active boolean NOT NULL DEFAULT TRUE,
  plan_type text NOT NULL DEFAULT 'subscription', -- 'subscription' o 'one_time'
  doc_limit integer NOT NULL DEFAULT 0, -- Número de generaciones permitidas (0 = ilimitado para subscriptions, 1 para one_time)
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  stripe_product_id text UNIQUE NULL,
  stripe_price_id text UNIQUE NULL,

  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_plan_type_check CHECK (plan_type IN ('subscription', 'one_time'))
);

-- Habilitar Row Level Security (RLS) si es necesario (generalmente sí para Supabase)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS (ejemplo: permitir lectura pública de productos activos)
CREATE POLICY "Enable read access for all users" ON public.products
  FOR SELECT USING (is_active = TRUE);

-- Función para actualizar 'updated_at' automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar 'updated_at' en cada UPDATE
CREATE TRIGGER products_updated_at_trigger
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tabla para almacenar salarios mínimos por zona y año
CREATE TABLE public.minimum_wages (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  zone text NOT NULL DEFAULT 'general',
  year integer NOT NULL,
  daily_wage numeric(10, 2) NOT NULL,
  effective_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT minimum_wages_pkey PRIMARY KEY (id),
  CONSTRAINT minimum_wages_zone_year_unique UNIQUE (zone, year)
);

ALTER TABLE public.minimum_wages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Minimum wages are public" ON public.minimum_wages
  FOR SELECT USING (true);

-- Tabla para idempotencia de webhooks de Stripe
CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  body jsonb NOT NULL,
  processed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access" ON public.webhook_events
  AS PERMISSIVE FOR ALL USING (true) WITH CHECK (true);

-- Seed data: salarios mínimos 2020-2026 (zona general y frontera norte)
INSERT INTO public.minimum_wages (zone, year, daily_wage, effective_date) VALUES
  -- Zona general
  ('general', 2020, 123.22, '2020-01-01'),
  ('general', 2021, 141.70, '2021-01-01'),
  ('general', 2022, 172.87, '2022-01-01'),
  ('general', 2023, 207.44, '2023-01-01'),
  ('general', 2024, 248.93, '2024-01-01'),
  ('general', 2025, 278.80, '2025-01-01'),
  ('general', 2026, 300.00, '2026-01-01'),
  -- Frontera norte
  ('frontera_norte', 2020, 185.56, '2020-01-01'),
  ('frontera_norte', 2021, 213.39, '2021-01-01'),
  ('frontera_norte', 2022, 260.34, '2022-01-01'),
  ('frontera_norte', 2023, 312.41, '2023-01-01'),
  ('frontera_norte', 2024, 374.89, '2024-01-01'),
  ('frontera_norte', 2025, 419.88, '2025-01-01'),
  ('frontera_norte', 2026, 450.00, '2026-01-01');

-- Tabla para eventos del calendario
CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own calendar events" ON public.calendar_events
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
