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

-- Crear la tabla 'products'
CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  description text NULL,
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'mxn',
  features text[] DEFAULT '{}'::text[] NOT NULL,
  is_active boolean NOT NULL DEFAULT TRUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  stripe_product_id text UNIQUE NULL,
  stripe_price_id text UNIQUE NULL, -- Útil si usas Stripe Subscriptions con Price IDs

  CONSTRAINT products_pkey PRIMARY KEY (id)
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
