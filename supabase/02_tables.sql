-- SaludSimple - Esquema de tablas
-- Todas las tablas usan UUID, timestamptz y created_at/updated_at donde corresponde.

-- =========================================================
-- PROFILES
-- Un perfil por usuario de auth.users. Se crea automáticamente
-- mediante el trigger handle_new_user (ver 05_functions.sql).
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  birth_date date,
  phone text,
  avatar_url text,
  text_size text not null default 'normal' check (text_size in ('normal', 'grande', 'muy_grande')),
  high_contrast boolean not null default false,
  theme text not null default 'claro' check (theme in ('claro', 'oscuro')),
  glucose_unit text not null default 'mg/dL' check (glucose_unit in ('mg/dL', 'mmol/L')),
  -- IANA timezone (ej. 'America/Argentina/Buenos_Aires'), detectada en el navegador.
  -- La usa el cron de recordatorios para saber a que hora local le corresponde
  -- cada horario de medicamento (los horarios se guardan sin zona horaria).
  timezone text not null default 'America/Argentina/Buenos_Aires',
  enabled_metrics jsonb not null default '{
    "glucose": true,
    "blood_pressure": true,
    "weight": true,
    "temperature": true,
    "heart_rate": true,
    "oxygen": true
  }'::jsonb,
  reminders_enabled boolean not null default true,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Datos de perfil de cada usuario, 1:1 con auth.users.';

-- =========================================================
-- MEDICATIONS
-- =========================================================
create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  active_ingredient text,
  dose numeric(10, 2) not null,
  dose_unit text not null default 'mg',
  form text not null default 'comprimido' check (
    form in ('comprimido', 'capsula', 'liquido', 'inyeccion', 'gotas', 'crema', 'inhalador', 'parche', 'otro')
  ),
  instructions text,
  start_date date not null default current_date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint medications_end_after_start check (end_date is null or end_date >= start_date)
);

comment on table public.medications is 'Medicamentos registrados por cada usuario. Nunca se borran, se desactivan.';

-- =========================================================
-- MEDICATION SCHEDULES
-- Un medicamento puede tener varios horarios, cada uno con sus días.
-- days_of_week: 0=domingo ... 6=sabado (ISO-like, domingo=0)
-- =========================================================
create table if not exists public.medication_schedules (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  time_of_day time not null,
  days_of_week smallint[] not null default '{0,1,2,3,4,5,6}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint medication_schedules_days_valid check (
    days_of_week <@ array[0,1,2,3,4,5,6]::smallint[]
  )
);

comment on table public.medication_schedules is 'Horarios y dias de la semana para cada medicamento.';

-- =========================================================
-- MEDICATION LOGS
-- Registro real de cada toma (programada o manual).
-- =========================================================
create table if not exists public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications(id) on delete cascade,
  schedule_id uuid references public.medication_schedules(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  scheduled_for timestamptz not null,
  taken_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'taken', 'skipped', 'snoozed')),
  snoozed_until timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.medication_logs is 'Historial de tomas: programadas, tomadas, omitidas o pospuestas. Nunca se elimina automaticamente.';

-- =========================================================
-- MEDICIONES
-- =========================================================
create table if not exists public.glucose_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  value numeric(6, 2) not null check (value > 0 and value < 1000),
  unit text not null default 'mg/dL' check (unit in ('mg/dL', 'mmol/L')),
  context text not null default 'otro' check (
    context in ('ayunas', 'antes_comer', 'despues_comer', 'antes_dormir', 'otro')
  ),
  measured_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.blood_pressure_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  systolic smallint not null check (systolic > 0 and systolic < 300),
  diastolic smallint not null check (diastolic > 0 and diastolic < 200),
  heart_rate smallint check (heart_rate is null or (heart_rate > 0 and heart_rate < 300)),
  measured_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.weight_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  value numeric(6, 2) not null check (value > 0 and value < 500),
  unit text not null default 'kg' check (unit in ('kg', 'lb')),
  measured_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.temperature_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  value numeric(4, 1) not null check (value > 25 and value < 45),
  unit text not null default '°C' check (unit in ('°C', '°F')),
  measured_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.heart_rate_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value > 0 and value < 300),
  measured_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.oxygen_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value > 0 and value <= 100),
  measured_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.health_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note text not null check (char_length(note) > 0),
  measured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- =========================================================
-- CUIDADORES
-- owner_id: la persona duena de los datos (paciente).
-- caregiver_id: se completa cuando el invitado acepta y tiene cuenta.
-- =========================================================
create table if not exists public.caregivers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  caregiver_id uuid references auth.users(id) on delete cascade,
  caregiver_email text not null,
  permission text not null default 'read' check (permission in ('read', 'edit')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint caregivers_unique_invite unique (owner_id, caregiver_email)
);

comment on table public.caregivers is 'Relacion de cuidado: quien puede ver/editar los datos de quien.';

-- =========================================================
-- NOTIFICACIONES
-- =========================================================
create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  reminders_enabled boolean not null default true,
  reminder_lead_minutes smallint not null default 0,
  sound_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- CONTACTO DE EMERGENCIA
-- =========================================================
create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  relationship text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
