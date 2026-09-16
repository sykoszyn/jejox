-- Tests de Row Level Security con pgTAP.
--
-- Como ejecutarlos (requieren Supabase CLI y Docker corriendo local):
--   supabase test db
--
-- Cubren el requisito de seguridad mas importante del proyecto: un usuario
-- solo puede leer/escribir sus propios datos, y un cuidador solo accede a
-- los datos de otra persona si fue explicitamente autorizado (y deja de
-- poder hacerlo si se le revoca el acceso).

begin;
select plan(9);

-- =========================================================
-- Usuarios de prueba
-- =========================================================
select tests.create_supabase_user('paciente');
select tests.create_supabase_user('cuidador_lectura');
select tests.create_supabase_user('cuidador_edicion');
select tests.create_supabase_user('extrano');

-- El paciente crea un medicamento propio.
select tests.authenticate_as('paciente');

insert into public.medications (id, user_id, name, dose, dose_unit)
values ('11111111-1111-1111-1111-111111111111', tests.get_supabase_uid('paciente'), 'Losartan', 50, 'mg');

select is(
  (select count(*)::int from public.medications where user_id = tests.get_supabase_uid('paciente')),
  1,
  'El paciente puede ver su propio medicamento'
);

-- =========================================================
-- Un extraño (sin invitacion) no puede ver los datos del paciente
-- =========================================================
select tests.authenticate_as('extrano');

select is(
  (select count(*)::int from public.medications where user_id = tests.get_supabase_uid('paciente')),
  0,
  'Un usuario sin relacion de cuidado no ve medicamentos ajenos'
);

select throws_ok(
  $$ update public.medications set name = 'hackeado'
     where user_id = (select tests.get_supabase_uid('paciente')) $$,
  null,
  null,
  'Un extraño no puede editar medicamentos ajenos (RLS lo bloquea silenciosamente)'
);

-- =========================================================
-- El paciente invita a un cuidador de solo lectura
-- =========================================================
select tests.authenticate_as('paciente');

insert into public.caregivers (owner_id, caregiver_email, permission, status, caregiver_id)
values (
  tests.get_supabase_uid('paciente'),
  (select email from auth.users where id = tests.get_supabase_uid('cuidador_lectura')),
  'read',
  'accepted',
  tests.get_supabase_uid('cuidador_lectura')
);

insert into public.caregivers (owner_id, caregiver_email, permission, status, caregiver_id)
values (
  tests.get_supabase_uid('paciente'),
  (select email from auth.users where id = tests.get_supabase_uid('cuidador_edicion')),
  'edit',
  'accepted',
  tests.get_supabase_uid('cuidador_edicion')
);

-- =========================================================
-- El cuidador de solo lectura puede ver pero no editar
-- =========================================================
select tests.authenticate_as('cuidador_lectura');

select is(
  (select count(*)::int from public.medications where user_id = tests.get_supabase_uid('paciente')),
  1,
  'El cuidador con permiso de lectura ve los medicamentos del paciente'
);

select throws_ok(
  $$ update public.medications set name = 'cambiado'
     where user_id = (select tests.get_supabase_uid('paciente')) $$,
  null,
  null,
  'El cuidador de solo lectura NO puede editar medicamentos del paciente'
);

-- =========================================================
-- El cuidador de edicion puede ver y registrar mediciones
-- =========================================================
select tests.authenticate_as('cuidador_edicion');

select is(
  (select count(*)::int from public.medications where user_id = tests.get_supabase_uid('paciente')),
  1,
  'El cuidador con permiso de edicion ve los medicamentos del paciente'
);

select lives_ok(
  $$ insert into public.glucose_readings (user_id, value)
     values ((select tests.get_supabase_uid('paciente')), 105) $$,
  'El cuidador con permiso de edicion puede registrar una medicion para el paciente'
);

-- =========================================================
-- El paciente revoca al cuidador de edicion: pierde el acceso
-- =========================================================
select tests.authenticate_as('paciente');

update public.caregivers
set status = 'revoked'
where owner_id = tests.get_supabase_uid('paciente')
  and caregiver_id = tests.get_supabase_uid('cuidador_edicion');

select tests.authenticate_as('cuidador_edicion');

select is(
  (select count(*)::int from public.medications where user_id = tests.get_supabase_uid('paciente')),
  0,
  'Tras revocar el acceso, el ex-cuidador ya no ve los medicamentos del paciente'
);

select throws_ok(
  $$ insert into public.glucose_readings (user_id, value)
     values ((select tests.get_supabase_uid('paciente')), 110) $$,
  null,
  null,
  'Tras revocar el acceso, el ex-cuidador no puede registrar mediciones'
);

select * from finish();
rollback;
