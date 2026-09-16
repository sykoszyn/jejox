-- SaludSimple - Extensiones necesarias
-- Ejecutar primero, una sola vez por proyecto.

create extension if not exists "pgcrypto" with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;
