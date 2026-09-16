-- SaludSimple - Funciones y triggers

-- =========================================================
-- updated_at automatico
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles',
    'medications',
    'medication_schedules',
    'medication_logs',
    'caregivers',
    'notification_preferences',
    'emergency_contacts'
  ]
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I;',
      t
    );
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();',
      t
    );
  end loop;
end $$;

-- =========================================================
-- Crear perfil + preferencias de notificacion automaticamente
-- cuando se registra un usuario nuevo en auth.users.
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'first_name', ''))
  on conflict (id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- Al aceptar una invitacion de cuidador, completar accepted_at.
-- =========================================================
create or replace function public.handle_caregiver_accepted()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    new.accepted_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists set_caregiver_accepted_at on public.caregivers;
create trigger set_caregiver_accepted_at
  before update on public.caregivers
  for each row execute function public.handle_caregiver_accepted();
