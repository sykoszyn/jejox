# Tests de base de datos (RLS)

Estos tests verifican la regla de seguridad más importante de SaludSimple:
cada usuario solo accede a sus propios datos, y un cuidador solo accede a
los datos de otra persona si fue explícitamente autorizado (y pierde el
acceso apenas se le revoca).

## Cómo ejecutarlos

Requieren [Supabase CLI](https://supabase.com/docs/guides/cli) y Docker
corriendo localmente.

```bash
supabase init          # si todavía no inicializaste el proyecto local
supabase db start
supabase test db
```

Los tests usan la extensión [`supabase_test_helpers`](https://github.com/usebasejump/supabase-test-helpers),
que agrega funciones como `tests.create_supabase_user`,
`tests.authenticate_as` y `tests.get_supabase_uid` para simular distintos
usuarios autenticados dentro de un mismo test SQL (con pgTAP). Instalala una
vez en tu proyecto local con:

```bash
supabase db extensions add supabase_test_helpers
```

(o seguí las instrucciones del repositorio del paquete si tu versión de la
CLI no incluye ese comando).

## Qué cubre `rls.test.sql`

1. Un usuario puede ver y editar sus propios medicamentos.
2. Un usuario sin ninguna relación de cuidado NO puede ver ni editar los
   datos de otra persona.
3. Un cuidador con permiso de **lectura** puede ver los datos del paciente
   pero no puede editarlos.
4. Un cuidador con permiso de **edición** puede ver los datos del paciente
   y registrar mediciones en su nombre.
5. Al revocar la invitación, el cuidador pierde el acceso inmediatamente
   (tanto para leer como para escribir).

Si agregás una tabla nueva o cambiás una política de RLS, actualizá este
archivo para cubrir el caso nuevo.
