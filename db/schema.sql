create table profiles (
  id           uuid references auth.users primary key,
  nombre       text,
  despacho     text,
  logo_url     text,
  color_primario text,
  color_secundario text,
  fuente       text default 'helvetica',
  created_at   timestamptz default now()
);

create table expedientes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  nombre_empleado text not null,
  empresa         text,
  datos_calculo   jsonb not null,   
  resultado       jsonb not null,   
  pdf_url         text,             
  created_at      timestamptz default now()
);

create table subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references profiles(id) on delete cascade,
  plan               text default 'free',  
  status             text default 'active', 
  stripe_customer_id text,
  stripe_sub_id      text,
  current_period_end timestamptz,
  created_at         timestamptz default now()
);