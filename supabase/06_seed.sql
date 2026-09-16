-- SaludSimple - Datos de ejemplo (opcional)
--
-- Este seed NO crea usuarios (eso lo maneja Supabase Auth).
-- Para probarlo:
--   1. Registrate en la aplicacion normalmente (o desde el dashboard de
--      Supabase, Authentication > Users > Add user).
--   2. Copia el UUID de ese usuario.
--   3. Reemplaza el valor de :'demo_user_id' de abajo y ejecuta este
--      archivo en el SQL Editor de Supabase.
--
-- Es completamente opcional: la aplicacion funciona perfectamente sin
-- datos de ejemplo, simplemente mostrando los estados vacios.

-- Reemplazar por un UUID real antes de ejecutar:
-- \set demo_user_id 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'

do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- <-- reemplazar
  med_losartan uuid;
  med_metformina uuid;
begin
  -- Evita ejecutar el seed si el usuario no existe (placeholder sin reemplazar)
  if not exists (select 1 from auth.users where id = demo_user_id) then
    raise notice 'Seed omitido: reemplaza demo_user_id por un UUID de auth.users existente.';
    return;
  end if;

  update public.profiles
  set first_name = 'Maria', last_name = 'Gonzalez', onboarding_completed = true
  where id = demo_user_id;

  insert into public.medications (id, user_id, name, dose, dose_unit, form, instructions)
  values (gen_random_uuid(), demo_user_id, 'Losartan', 50, 'mg', 'comprimido', 'Tomar con el desayuno')
  returning id into med_losartan;

  insert into public.medications (id, user_id, name, dose, dose_unit, form, instructions)
  values (gen_random_uuid(), demo_user_id, 'Metformina', 850, 'mg', 'comprimido', 'Tomar con las comidas')
  returning id into med_metformina;

  insert into public.medication_schedules (medication_id, user_id, time_of_day, days_of_week)
  values (med_losartan, demo_user_id, '08:00', '{0,1,2,3,4,5,6}');

  insert into public.medication_schedules (medication_id, user_id, time_of_day, days_of_week)
  values
    (med_metformina, demo_user_id, '08:00', '{0,1,2,3,4,5,6}'),
    (med_metformina, demo_user_id, '20:00', '{0,1,2,3,4,5,6}');

  insert into public.glucose_readings (user_id, value, unit, context, measured_at)
  values (demo_user_id, 102, 'mg/dL', 'ayunas', now() - interval '2 hours');

  insert into public.blood_pressure_readings (user_id, systolic, diastolic, heart_rate, measured_at)
  values (demo_user_id, 128, 78, 72, now() - interval '1 hour');

  insert into public.weight_readings (user_id, value, unit, measured_at)
  values (demo_user_id, 74.2, 'kg', now() - interval '1 day');

  insert into public.emergency_contacts (user_id, name, phone, relationship)
  values (demo_user_id, 'Ana Gonzalez', '+54 9 11 5555-5555', 'Hija');

  raise notice 'Seed cargado correctamente para el usuario %', demo_user_id;
end $$;
