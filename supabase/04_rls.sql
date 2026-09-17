-- SaludSimple - Row Level Security
-- Regla fundamental: un usuario solo puede leer/escribir sus propios datos.
-- Los cuidadores solo acceden a los datos de un usuario si fueron
-- explicitamente autorizados (tabla caregivers, status = 'accepted').

-- =========================================================
-- Funcion auxiliar: ¿el usuario autenticado es cuidador aceptado
-- de target_user_id, con al menos el permiso indicado?
-- security definer + search_path fijo: patron recomendado por Supabase
-- para evitar recursion de RLS y fugas de search_path.
-- =========================================================
create or replace function public.is_caregiver_of(target_user_id uuid, min_permission text default 'read')
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.caregivers c
    where c.owner_id = target_user_id
      and c.caregiver_id = auth.uid()
      and c.status = 'accepted'
      and (min_permission = 'read' or c.permission = 'edit')
  );
$$;

revoke all on function public.is_caregiver_of(uuid, text) from public;
grant execute on function public.is_caregiver_of(uuid, text) to authenticated;

-- =========================================================
-- PROFILES
-- =========================================================
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_caregiver"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_caregiver_of(id, 'read'));

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- =========================================================
-- MEDICATIONS
-- =========================================================
alter table public.medications enable row level security;

create policy "medications_select"
  on public.medications for select
  to authenticated
  using (user_id = auth.uid() or public.is_caregiver_of(user_id, 'read'));

create policy "medications_insert"
  on public.medications for insert
  to authenticated
  with check (user_id = auth.uid() or public.is_caregiver_of(user_id, 'edit'));

create policy "medications_update"
  on public.medications for update
  to authenticated
  using (user_id = auth.uid() or public.is_caregiver_of(user_id, 'edit'))
  with check (user_id = auth.uid() or public.is_caregiver_of(user_id, 'edit'));

create policy "medications_delete"
  on public.medications for delete
  to authenticated
  using (user_id = auth.uid());

-- =========================================================
-- MEDICATION SCHEDULES
-- =========================================================
alter table public.medication_schedules enable row level security;

create policy "medication_schedules_select"
  on public.medication_schedules for select
  to authenticated
  using (user_id = auth.uid() or public.is_caregiver_of(user_id, 'read'));

create policy "medication_schedules_insert"
  on public.medication_schedules for insert
  to authenticated
  with check (user_id = auth.uid() or public.is_caregiver_of(user_id, 'edit'));

create policy "medication_schedules_update"
  on public.medication_schedules for update
  to authenticated
  using (user_id = auth.uid() or public.is_caregiver_of(user_id, 'edit'))
  with check (user_id = auth.uid() or public.is_caregiver_of(user_id, 'edit'));

create policy "medication_schedules_delete"
  on public.medication_schedules for delete
  to authenticated
  using (user_id = auth.uid() or public.is_caregiver_of(user_id, 'edit'));

-- =========================================================
-- MEDICATION LOGS
-- =========================================================
alter table public.medication_logs enable row level security;

create policy "medication_logs_select"
  on public.medication_logs for select
  to authenticated
  using (user_id = auth.uid() or public.is_caregiver_of(user_id, 'read'));

create policy "medication_logs_insert"
  on public.medication_logs for insert
  to authenticated
  with check (user_id = auth.uid() or public.is_caregiver_of(user_id, 'edit'));

create policy "medication_logs_update"
  on public.medication_logs for update
  to authenticated
  using (user_id = auth.uid() or public.is_caregiver_of(user_id, 'edit'))
  with check (user_id = auth.uid() or public.is_caregiver_of(user_id, 'edit'));

-- =========================================================
-- MEDICIONES (mismo patron para las 7 tablas)
-- =========================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'glucose_readings',
    'blood_pressure_readings',
    'weight_readings',
    'temperature_readings',
    'heart_rate_readings',
    'oxygen_readings',
    'health_notes'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);

    execute format($f$
      create policy "%1$s_select" on public.%1$s for select
      to authenticated
      using (user_id = auth.uid() or public.is_caregiver_of(user_id, 'read'));
    $f$, t);

    execute format($f$
      create policy "%1$s_insert" on public.%1$s for insert
      to authenticated
      with check (user_id = auth.uid() or public.is_caregiver_of(user_id, 'edit'));
    $f$, t);

    execute format($f$
      create policy "%1$s_update" on public.%1$s for update
      to authenticated
      using (user_id = auth.uid() or public.is_caregiver_of(user_id, 'edit'))
      with check (user_id = auth.uid() or public.is_caregiver_of(user_id, 'edit'));
    $f$, t);

    execute format($f$
      create policy "%1$s_delete" on public.%1$s for delete
      to authenticated
      using (user_id = auth.uid());
    $f$, t);
  end loop;
end $$;

-- =========================================================
-- CAREGIVERS
-- El dueno gestiona sus invitaciones. El invitado puede ver y
-- aceptar/rechazar la invitacion dirigida a su email o a su user id.
-- =========================================================
alter table public.caregivers enable row level security;

create policy "caregivers_select"
  on public.caregivers for select
  to authenticated
  using (
    owner_id = auth.uid()
    or caregiver_id = auth.uid()
    or caregiver_email = (auth.jwt() ->> 'email')
  );

create policy "caregivers_insert"
  on public.caregivers for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "caregivers_update_owner"
  on public.caregivers for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "caregivers_accept_invite"
  on public.caregivers for update
  to authenticated
  using (
    status = 'pending'
    and (caregiver_id = auth.uid() or caregiver_email = (auth.jwt() ->> 'email'))
  )
  with check (caregiver_id = auth.uid());

create policy "caregivers_delete"
  on public.caregivers for delete
  to authenticated
  using (owner_id = auth.uid());

-- =========================================================
-- NOTIFICATION PREFERENCES
-- =========================================================
alter table public.notification_preferences enable row level security;

create policy "notification_preferences_all_own"
  on public.notification_preferences for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- =========================================================
-- PUSH SUBSCRIPTIONS
-- =========================================================
alter table public.push_subscriptions enable row level security;

create policy "push_subscriptions_all_own"
  on public.push_subscriptions for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- =========================================================
-- EMERGENCY CONTACTS
-- =========================================================
alter table public.emergency_contacts enable row level security;

create policy "emergency_contacts_select"
  on public.emergency_contacts for select
  to authenticated
  using (user_id = auth.uid() or public.is_caregiver_of(user_id, 'read'));

create policy "emergency_contacts_insert"
  on public.emergency_contacts for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "emergency_contacts_update"
  on public.emergency_contacts for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "emergency_contacts_delete"
  on public.emergency_contacts for delete
  to authenticated
  using (user_id = auth.uid());

-- =========================================================
-- Permisos de tabla (GRANT)
-- Las policies de arriba son necesarias pero no alcanzan: Postgres
-- primero exige el permiso "de tabla" (GRANT) y recien despues, si lo
-- tiene, evalua las policies de RLS fila por fila. Sin este GRANT,
-- toda query del rol "authenticated" contra estas tablas falla con
-- "permission denied for table ..." (SQLSTATE 42501), sin importar
-- que las policies esten bien. El RLS de arriba sigue siendo el que
-- de verdad restringe el acceso por fila.
-- =========================================================
grant usage on schema public to authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;

-- Para que las tablas que se creen mas adelante (si se agrega alguna)
-- tengan este mismo permiso sin tener que acordarse de repetir el grant.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
