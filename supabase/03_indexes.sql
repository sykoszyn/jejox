-- SaludSimple - Indices
-- Pensados para las consultas mas frecuentes: por usuario y por fecha.

create index if not exists idx_medications_user_id on public.medications(user_id);
create index if not exists idx_medications_user_active on public.medications(user_id, is_active);

create index if not exists idx_medication_schedules_medication_id on public.medication_schedules(medication_id);
create index if not exists idx_medication_schedules_user_id on public.medication_schedules(user_id);

create index if not exists idx_medication_logs_user_id on public.medication_logs(user_id);
create index if not exists idx_medication_logs_medication_id on public.medication_logs(medication_id);
create index if not exists idx_medication_logs_scheduled_for on public.medication_logs(user_id, scheduled_for desc);
create index if not exists idx_medication_logs_status on public.medication_logs(user_id, status);

-- Evita duplicar el registro de una misma toma programada (idempotencia
-- al marcar "ya la tome" / "omitir" / "recordar mas tarde").
create unique index if not exists uq_medication_logs_schedule_occurrence
  on public.medication_logs(schedule_id, scheduled_for)
  where schedule_id is not null;

create index if not exists idx_glucose_user_measured on public.glucose_readings(user_id, measured_at desc);
create index if not exists idx_bp_user_measured on public.blood_pressure_readings(user_id, measured_at desc);
create index if not exists idx_weight_user_measured on public.weight_readings(user_id, measured_at desc);
create index if not exists idx_temperature_user_measured on public.temperature_readings(user_id, measured_at desc);
create index if not exists idx_heart_rate_user_measured on public.heart_rate_readings(user_id, measured_at desc);
create index if not exists idx_oxygen_user_measured on public.oxygen_readings(user_id, measured_at desc);
create index if not exists idx_health_notes_user_measured on public.health_notes(user_id, measured_at desc);

create index if not exists idx_caregivers_owner_id on public.caregivers(owner_id);
create index if not exists idx_caregivers_caregiver_id on public.caregivers(caregiver_id);
create index if not exists idx_caregivers_email on public.caregivers(caregiver_email);

create index if not exists idx_push_subscriptions_user_id on public.push_subscriptions(user_id);
create index if not exists idx_emergency_contacts_user_id on public.emergency_contacts(user_id);
