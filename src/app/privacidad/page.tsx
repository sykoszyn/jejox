import type { Metadata } from 'next';
import { LegalShell } from '@/components/layout/LegalShell';

export const metadata: Metadata = { title: 'Política de privacidad · Mejoralito' };

export default function PrivacidadPage() {
  return (
    <LegalShell title="Política de privacidad">
      <p className="text-ink-muted">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>

      <p>
        Mejoralito es una herramienta de registro y organización de información de salud. Esta
        política explica qué datos guardamos, para qué los usamos y qué derechos tenés sobre ellos.
      </p>

      <h2 className="text-xl font-bold mt-2">1. Qué datos recopilamos</h2>
      <p>Solo pedimos la información necesaria para que la aplicación funcione:</p>
      <ul className="list-disc pl-6 flex flex-col gap-1">
        <li>Datos de cuenta: correo electrónico y contraseña (o acceso por enlace mágico).</li>
        <li>Datos de perfil que decidas ingresar: nombre, apellido, fecha de nacimiento, teléfono, foto.</li>
        <li>
          Datos de salud que registrás vos mismo/a: medicamentos, horarios, tomas, mediciones
          (glucosa, presión, peso, temperatura, pulso, saturación) y notas.
        </li>
        <li>Contacto de emergencia, si elegís cargarlo.</li>
        <li>
          Suscripción a notificaciones push (un identificador técnico del navegador), si activás
          los recordatorios.
        </li>
        <li>Zona horaria del dispositivo, para calcular correctamente los horarios de recordatorio.</li>
      </ul>

      <h2 className="text-xl font-bold mt-2">2. Para qué usamos estos datos</h2>
      <p>
        Exclusivamente para mostrar tu información dentro de la aplicación, calcular recordatorios,
        generar tu historial y el informe de salud que vos elijas generar. No usamos tus datos de
        salud para publicidad ni los vendemos a terceros.
      </p>

      <h2 className="text-xl font-bold mt-2">3. Dónde se guardan los datos</h2>
      <p>
        Los datos se almacenan en una base de datos PostgreSQL administrada por Supabase, con
        controles de seguridad a nivel de fila (Row Level Security): cada persona solo puede leer y
        modificar su propia información. Un cuidador solo accede a los datos de otra persona si esa
        persona lo autorizó explícitamente desde la aplicación, y ese acceso puede revocarse en
        cualquier momento.
      </p>

      <h2 className="text-xl font-bold mt-2">4. Cuidadores y familiares</h2>
      <p>
        Si invitás a un cuidador, esa persona podrá ver (y, si le diste permiso de edición, ayudar a
        registrar) tu información de salud. Vos controlás quién tiene acceso y podés quitarlo cuando
        quieras desde Configuración → Cuidadores.
      </p>

      <h2 className="text-xl font-bold mt-2">5. Terceros involucrados</h2>
      <p>
        Usamos Supabase (base de datos y autenticación) y Vercel (alojamiento) como proveedores de
        infraestructura. No compartimos tu información de salud con redes sociales, anunciantes ni
        servicios de análisis de terceros.
      </p>

      <h2 className="text-xl font-bold mt-2">6. Tus derechos</h2>
      <p>
        Podés exportar una copia de todos tus datos en cualquier momento desde Configuración →
        Exportar mis datos. También podés eliminar medicamentos, mediciones o tu contacto de
        emergencia individualmente. Si querés eliminar tu cuenta por completo, escribinos a través
        del correo de soporte indicado en la aplicación.
      </p>

      <h2 className="text-xl font-bold mt-2">7. Seguridad</h2>
      <p>
        Aplicamos controles de acceso a nivel de base de datos (RLS), conexiones cifradas (HTTPS) y
        minimizamos la cantidad de datos que pedimos. Ninguna clave sensible se expone en el
        navegador ni en el código fuente de la aplicación.
      </p>

      <h2 className="text-xl font-bold mt-2">8. Aviso médico</h2>
      <p>
        Mejoralito sirve para registrar y organizar información de salud. No diagnostica
        enfermedades, no recomienda tratamientos y no reemplaza la consulta con un profesional de
        la salud.
      </p>

      <h2 className="text-xl font-bold mt-2">9. Contacto</h2>
      <p>
        Si tenés preguntas sobre esta política o sobre tus datos, podés contactarnos al correo de
        soporte que figura en la aplicación.
      </p>
    </LegalShell>
  );
}
