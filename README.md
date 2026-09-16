# SaludSimple

Web App / PWA mobile-first de gestión personal de salud, pensada para
personas mayores y para los familiares o cuidadores que las ayudan.

Permite registrar medicamentos y horarios, recibir recordatorios, registrar
mediciones (glucosa, presión, peso, temperatura, pulso, saturación), llevar
un historial ordenado, ver gráficos simples de evolución y generar un
informe para el médico.

> **Aviso importante**: SaludSimple es una herramienta de registro y
> organización de información de salud. No diagnostica enfermedades, no
> recomienda tratamientos y no reemplaza la consulta con un profesional de
> la salud.

---

## Índice

1. [Stack](#stack)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Puesta en marcha local, paso a paso](#puesta-en-marcha-local-paso-a-paso)
4. [Variables de entorno](#variables-de-entorno)
5. [Base de datos y seguridad (Supabase)](#base-de-datos-y-seguridad-supabase)
6. [Autenticación](#autenticación)
7. [PWA y notificaciones push](#pwa-y-notificaciones-push)
8. [Deploy en Vercel](#deploy-en-vercel)
9. [Testing](#testing)
10. [Accesibilidad](#accesibilidad)
11. [Limitaciones conocidas](#limitaciones-conocidas)

---

## Stack

- **Frontend**: Next.js 16 (App Router, Server Components y Server Actions), React 19, TypeScript, Tailwind CSS 4.
- **Backend / base de datos**: Supabase (PostgreSQL, Auth, Storage, Row Level Security).
- **Gráficos**: Recharts.
- **Iconos**: Lucide React.
- **Validación**: Zod, en el servidor (Server Actions) y con feedback nativo en los formularios.
- **PWA**: Service Worker propio (`public/sw.js`), Web Push con `web-push` + VAPID.
- **Tests**: Vitest + Testing Library (unitarios/UI) y pgTAP (RLS, en `supabase/tests`).
- **Deploy**: Vercel.

No se usa ningún framework de estado global, ORM ni capa de abstracción
adicional: las páginas son Server Components que consultan Supabase
directamente, y la interactividad puntual vive en componentes cliente
chicos y específicos.

## Estructura del proyecto

```
src/
  app/                     # Rutas (App Router)
    (app)/                 # Rutas autenticadas, con barra de navegación inferior
      inicio/
      medicamentos/
      mediciones/
      historial/
      informe/
      cuidadores/
      configuracion/
    ingresar/, registrarse/, auth/callback/   # Autenticación
    onboarding/            # Wizard de primera vez
    privacidad/, terminos/ # Páginas legales públicas
    api/                   # Route Handlers (cron de recordatorios, export, push)
  components/
    ui/                    # Componentes reutilizables (LargeButton, Card, etc.)
    layout/                # BottomNavigation, PageHeader, shells
  features/                # Lógica + UI específica de cada dominio
    medications/
    measurements/
    history/
    reports/
    caregivers/
    notifications/
    settings/
  lib/
    supabase/              # Clientes de Supabase (browser, server, admin, middleware)
    auth/                  # Sesión y Server Actions de autenticación
    validations/           # Esquemas Zod
    medications/           # Lógica pura de horarios/dosis (testeada)
    utils/                 # Helpers (fechas, clases CSS)
  types/database.ts        # Tipos TypeScript del esquema (a mano, ver nota abajo)
supabase/
  01_extensions.sql .. 07_storage.sql   # Esquema completo, en orden de ejecución
  tests/rls.test.sql       # Tests de Row Level Security (pgTAP)
public/
  sw.js                    # Service worker
  manifest.webmanifest
  icons/
scripts/
  generate-icons.mjs       # Genera los íconos PNG de la PWA
  generate-vapid-keys.mjs  # Genera las claves VAPID para Web Push
```

> **Nota sobre `src/types/database.ts`**: estos tipos están escritos a mano
> para que coincidan con el esquema SQL. Si preferís generarlos automáticamente
> con el Supabase CLI (`supabase gen types typescript`), tené en cuenta que
> `@supabase/postgrest-js` requiere que `Row`/`Insert`/`Update` sean tipos
> **literales** (sin `Partial<T>` ni otros tipos genéricos/mapeados): si el
> tipo generado usa esa forma, respetalo tal cual la generó el CLI.

## Puesta en marcha local, paso a paso

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto nuevo.
2. Anotá la **Project URL** y la **anon / publishable key** (Settings → API).
3. Guardá también la **service_role key** (Settings → API) — es secreta, solo se usa en el servidor.

### 3. Ejecutar el SQL

En el SQL Editor de Supabase, ejecutá los archivos de `supabase/` **en este orden**:

```
01_extensions.sql
02_tables.sql
03_indexes.sql
04_rls.sql
05_functions.sql
06_seed.sql      (opcional, ver instrucciones dentro del archivo)
07_storage.sql   (opcional, solo si querés permitir foto de perfil)
```

Si preferís usar el Supabase CLI en vez de pegar el SQL a mano:

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

(Esto asume que copiaste los archivos de `supabase/*.sql` a `supabase/migrations/`
con nombres numerados, como espera el CLI.)

### 4. Configurar Auth

En el dashboard de Supabase → Authentication:

1. **Providers → Email**: dejalo activado. Si querés permitir el acceso sin
   contraseña (enlace mágico), no hace falta nada más: la app ya lo soporta.
2. **URL Configuration**: agregá tu URL de desarrollo y de producción a
   **Site URL** y a **Redirect URLs**, por ejemplo:
   - `http://localhost:3000/auth/callback`
   - `https://tu-dominio.vercel.app/auth/callback`
3. Los correos de confirmación y de enlace mágico ya vienen con una
   plantilla por defecto de Supabase; podés personalizarlos en
   **Authentication → Email Templates** si querés.

### 5. Variables de entorno

Copiá `.env.example` a `.env.local` y completá los valores (ver la sección
[Variables de entorno](#variables-de-entorno) para el detalle de cada una).

```bash
cp .env.example .env.local
```

### 6. Generar los íconos de la PWA (ya incluidos, opcional regenerarlos)

```bash
npm run generate-icons
```

### 7. (Opcional) Generar claves VAPID para notificaciones push

```bash
npm run generate-vapid-keys
```

Copiá la clave pública a `NEXT_PUBLIC_VAPID_PUBLIC_KEY` y la privada a
`VAPID_PRIVATE_KEY` en tu `.env.local`.

### 8. Correr en local

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000), creá una cuenta y
seguí el asistente de bienvenida.

## Variables de entorno

Ver `.env.example` para la lista completa. Resumen:

| Variable | Dónde va | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Local **y** Vercel | URL del proyecto de Supabase. Pública. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Local **y** Vercel | Clave `anon`/publishable de Supabase. Pública, protegida por RLS. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Local **y** Vercel | Clave pública VAPID para Web Push. |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo Vercel (server) | **Secreta**. Solo la usan las rutas de servidor (`/api/cron/reminders`). Nunca se expone al navegador. |
| `VAPID_PRIVATE_KEY` | Solo Vercel (server) | **Secreta**. Firma los envíos de Web Push. |
| `VAPID_SUBJECT` | Local y Vercel | Un `mailto:` de contacto, lo exige la spec de VAPID. |
| `CRON_SECRET` | Solo Vercel (server) | Protege `/api/cron/reminders` de invocaciones externas no autorizadas. |

Regla general: **todo lo que empieza con `NEXT_PUBLIC_` termina en el
navegador**, así que nunca pongas ahí una clave secreta. El resto de las
variables solo se leen en Server Components, Server Actions o Route
Handlers.

## Base de datos y seguridad (Supabase)

- Todas las tablas usan `uuid` como clave primaria, `timestamptz` para
  fechas/horas y `created_at`/`updated_at` donde corresponde.
- **Row Level Security (RLS) está activado en todas las tablas.** La regla
  general: `user_id = auth.uid()` para el dueño de los datos, más una
  excepción para cuidadores autorizados y aceptados (tabla `caregivers`,
  función `is_caregiver_of()` en `04_rls.sql`).
- El cliente del navegador (`src/lib/supabase/client.ts`) y el de Server
  Components (`src/lib/supabase/server.ts`) usan siempre la clave
  **anon/publishable**. El cliente con `service_role`
  (`src/lib/supabase/admin.ts`) está marcado con el paquete `server-only`
  y solo se usa desde `/api/cron/reminders`, la única ruta que
  legítimamente necesita leer datos de todos los usuarios (para calcular
  a quién enviarle un recordatorio).
- Los medicamentos y sus registros de toma **nunca se eliminan
  automáticamente**: desactivar un medicamento (`is_active = false`)
  conserva todo su historial.

## Autenticación

- Email + contraseña, y enlace mágico (sin contraseña), ambos con Supabase
  Auth.
- La sesión se gestiona con `@supabase/ssr` y se refresca en
  `src/proxy.ts` (el archivo de middleware/proxy de Next.js 16), que
  también protege las rutas privadas y redirige a `/ingresar` si hace
  falta.
- Al crear una cuenta se dispara un trigger en Postgres
  (`handle_new_user`, en `05_functions.sql`) que crea automáticamente la
  fila de `profiles` y de `notification_preferences` para ese usuario.

## PWA y notificaciones push

- La app se puede instalar en el teléfono (manifest +
  `public/sw.js`). Configuración → Notificaciones muestra el botón de
  instalación y las instrucciones para iOS (Safari no dispara el evento
  automático de instalación).
- El service worker cachea el "app shell" para que la interfaz cargue
  aunque no haya conexión (ver `/offline`), y muestra las notificaciones
  push con tres acciones: **Ya la tomé**, **Recordar más tarde**,
  **Omitir**.
- El envío real de los recordatorios ocurre en `/api/cron/reminders`, un
  Route Handler pensado para ser invocado periódicamente (ver
  `vercel.json`). Compara la hora local de cada usuario (guardada en
  `profiles.timezone`, detectada automáticamente en el navegador) contra
  sus horarios de medicamentos activos.

### Que la alerta "insista" hasta que la persona la note

Dos mecanismos trabajan juntos, uno para cuando el teléfono está bloqueado
o la app está cerrada, y otro para cuando está abierta:

- **Reintento del lado del servidor**: `/api/cron/reminders` no solo
  dispara una vez a la hora exacta — cada vez que se ejecuta (ver más
  abajo cómo configurar que corra seguido), revisa si la toma sigue sin
  resolver (nadie tocó "Ya la tomé" ni "Omitir") y, si es así, vuelve a
  enviar la notificación con el mismo `tag` y `renotify: true`. Eso hace
  que Android vuelva a sonar y vibrar en cada reintento, en vez de
  mostrar una notificación silenciosa una sola vez. Esto se repite
  durante `ESCALATION_WINDOW_MINUTES` (20 minutos por defecto, en
  `src/app/api/cron/reminders/route.ts`) o hasta que se resuelva la toma,
  lo que pase primero.
- **Sonido dentro de la app**: mientras el diálogo de "Es hora de tomar"
  está abierto (`DoseActionDialog`), suena en bucle un tono corto
  (`public/sounds/alert.wav`, generado con `npm run generate-alert-sound`)
  hasta que se toca cualquiera de los tres botones. Esto funciona
  independientemente del sistema operativo o de las políticas de sonido
  de las notificaciones push, porque el audio lo controla directamente la
  aplicación.

Ningún navegador permite que una web controle el sonido nativo de una
notificación del sistema (no existe una API para eso); lo que se puede
controlar es la frecuencia de los reintentos (`renotify`) y el sonido
propio de la app una vez abierta. Por eso, para que el reintento del
servidor funcione, hace falta que `/api/cron/reminders` se ejecute
seguido — ver la limitación del plan gratuito de Vercel más abajo.

### Cómo configurar el cron en Vercel

**Importante**: el plan gratuito ("Hobby") de Vercel no deja programar un
Cron Job propio de Vercel más de una vez por día — si `vercel.json` pide
`*/5 * * * *` (cada 5 minutos), el deploy directamente se bloquea con el
error "Hobby accounts are limited to daily cron jobs". Por eso
`vercel.json` viene con una sola ejecución diaria por defecto:

```json
{
  "crons": [{ "path": "/api/cron/reminders", "schedule": "0 13 * * *" }]
}
```

Con una sola corrida al día, el sistema de recordatorios (y la escalación
de notificaciones descripta más abajo) prácticamente no cumple su función:
solo va a alcanzar a las tomas programadas dentro de la ventana de
reintento (20 minutos) alrededor del horario fijo del cron. Para que los
recordatorios funcionen de verdad, elegí una de estas dos opciones:

- **Recomendada, sin pagar Vercel Pro**: un servicio externo gratuito de
  cron (por ejemplo [cron-job.org](https://cron-job.org) o UptimeRobot)
  que llame a `https://tu-dominio/api/cron/reminders` cada 1-5 minutos,
  enviando el header `Authorization: Bearer <CRON_SECRET>`. El límite de
  Vercel es sobre *su propio* sistema de Cron Jobs, no sobre quién puede
  llamar a esa URL — un servicio externo no tiene esa restricción. Podés
  dejar `vercel.json` como está (o borrar la sección `crons`) y manejar
  todo desde el servicio externo.
- **Plan Pro de Vercel**: cambiá el `schedule` de `vercel.json` a algo
  como `*/5 * * * *` (cada 5 minutos) — ahí Vercel sí lo permite.

### Cómo probar las notificaciones

1. Configurá `NEXT_PUBLIC_VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY`
   (`npm run generate-vapid-keys`).
2. Entrá a Configuración → Notificaciones y activalas.
3. Llamá manualmente a `/api/cron/reminders` (con el header
   `Authorization` si configuraste `CRON_SECRET`) en el minuto exacto en
   el que tengas un horario de medicamento configurado.

## Deploy en Vercel

1. Subí este repositorio a GitHub (o el proveedor que uses).
2. En [vercel.com](https://vercel.com), **Add New → Project** y elegí el repositorio.
3. Framework Preset: Vercel lo detecta solo como Next.js.
4. En **Environment Variables**, cargá las mismas variables que en
   `.env.local` (ver tabla más arriba), separando las públicas de las
   privadas como corresponde.
5. Deploy. Vercel construye con `next build` automáticamente.
6. Volvé al dashboard de Supabase → Authentication → URL Configuration y
   agregá la URL de producción (`https://tu-proyecto.vercel.app/auth/callback`)
   a las Redirect URLs.

### Dominio personalizado

En Vercel → tu proyecto → **Settings → Domains**, agregá tu dominio y
seguí las instrucciones de DNS (registro `A` o `CNAME` según el caso).
Después actualizá las Redirect URLs de Supabase con el dominio nuevo.

### Probar la PWA en producción

1. Abrí el sitio deployado desde el celular.
2. Safari (iOS): botón Compartir → "Agregar a pantalla de inicio".
   Android/Chrome: menú → "Instalar aplicación" (o el banner que aparece
   solo).
3. Abrí la app desde el ícono de la pantalla de inicio y activá las
   notificaciones desde Configuración.

## Testing

```bash
npm run test          # corre toda la suite una vez
npm run test:watch    # modo watch
npm run lint          # ESLint (incluye reglas de accesibilidad y de React)
npx tsc --noEmit      # chequeo de tipos
```

La suite de Vitest cubre lógica crítica y difícil de verificar a simple
vista: el cálculo de qué dosis corresponden a un día dado (`schedule.ts`),
las validaciones de cada formulario (Zod), el cálculo de adherencia para
el informe médico, el agrupado del historial por día, y la interacción del
diálogo de "Ya la tomé / Recordar más tarde / Omitir".

Los tests de Row Level Security viven en `supabase/tests/rls.test.sql`
(pgTAP) y se corren con `supabase test db` — necesitan una instancia local
de Supabase (Docker), por eso no forman parte de `npm run test`. Instrucciones
completas en `supabase/tests/README.md`.

## Accesibilidad

- Tipografía [Atkinson Hyperlegible](https://brailleinstitute.org/freefont),
  diseñada para mejorar la legibilidad en personas con baja visión.
- Tamaño de texto ajustable (normal / grande / muy grande) y modo de alto
  contraste, ambos persistidos por usuario y aplicados sin parpadeo
  (cookie + columna en `profiles`).
- Objetivos táctiles de al menos 48×56px, foco visible en todos los
  elementos interactivos, `aria-label` en iconos sin texto, mensajes de
  error asociados a su campo (`aria-describedby`), enlace "Saltar al
  contenido principal".
- Los estados nunca dependen solo del color: por ejemplo, una toma
  aparece como "✓ TOMADO" u "! OMITIDO" además del color verde/rojo.
- `prefers-reduced-motion` respetado (transiciones desactivadas si el
  sistema operativo lo pide).

## Limitaciones conocidas

Documentadas explícitamente en vez de prometidas y no cumplidas:

- **Notificaciones en iOS**: solo funcionan si la app fue agregada a la
  pantalla de inicio (no alcanza con tenerla abierta en Safari), y el
  sistema operativo decide cuándo entregarlas exactamente; no hay alarma
  garantizada al segundo, en ningún sistema operativo. iOS tampoco
  soporta los botones de acción de la notificación (Android sí).
- **"Sonar hasta que se note" depende de la frecuencia del cron**: el
  reintento del servidor (ver PWA más arriba) solo insiste tan seguido
  como se ejecute `/api/cron/reminders`. Si el cron corre una vez por día
  (plan gratuito de Vercel sin cron externo), no hay reintentos
  intermedios: solo el sonido dentro de la app, si la persona la abre.
- **Cron en el plan gratuito de Vercel**: limitado a una vez por día (ver
  sección de PWA más arriba para alternativas).
- **Zona horaria y formato de hora**: todas las pantallas que muestran
  fecha/hora (dashboard, medicamentos, mediciones, historial, informe)
  calculan y formatean con la zona horaria real del paciente
  (`profiles.timezone`, detectada del navegador en el onboarding). El
  valor por defecto antes de detectarla es `America/Argentina/Buenos_Aires`
  (`DEFAULT_TIMEZONE` en `src/lib/utils/datetime.ts`), y la hora siempre
  se muestra en formato 24 horas (`hour12: false` explícito en
  `formatTime`, porque `Intl` con locale `es-AR` arma "05:30 p. m." si no
  se lo pedís así). Si tu público no es de Argentina, cambiá
  `DEFAULT_TIMEZONE`.
- **Cuidadores con permiso de edición**: pueden ver los datos completos
  del paciente y el sistema de permisos ya está modelado en la base de
  datos, pero la carga de mediciones "en nombre de" otra persona todavía
  no está conectada a los formularios de la app (por ahora, un cuidador
  ve la información en modo solo lectura desde `/cuidadores/[id]`). Es la
  próxima extensión natural del modelo de permisos ya implementado.
- **Sin service_role en el cliente, nunca**: si en algún momento agregás
  una función que necesite privilegios de administrador, hacela en un
  Route Handler o Server Action, nunca en un componente cliente.
