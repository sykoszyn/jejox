import type { Metadata } from 'next';
import { LegalShell } from '@/components/layout/LegalShell';

export const metadata: Metadata = { title: 'Términos y condiciones · SaludSimple' };

export default function TerminosPage() {
  return (
    <LegalShell title="Términos y condiciones">
      <p className="text-ink-muted">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>

      <h2 className="text-xl font-bold mt-2">1. Qué es SaludSimple</h2>
      <p>
        SaludSimple es una aplicación de registro y organización personal de información de salud:
        medicamentos, horarios, recordatorios, mediciones e historial. Al crear una cuenta, aceptás
        estos términos.
      </p>

      <h2 className="text-xl font-bold mt-2">2. Esto NO es un servicio médico</h2>
      <p>
        SaludSimple no diagnostica enfermedades, no interpreta resultados clínicos ni recomienda
        tratamientos. Es una herramienta de organización y recordatorio. Ante cualquier duda o
        síntoma, consultá siempre con un profesional de la salud. En una emergencia, comunicate con
        los servicios de emergencia de tu país.
      </p>

      <h2 className="text-xl font-bold mt-2">3. Tu cuenta</h2>
      <p>
        Sos responsable de mantener segura tu contraseña y de la información que ingresás. Si
        compartís el acceso a tu cuenta con un cuidador mediante la función de invitación, esa
        persona podrá ver la información que autorizaste.
      </p>

      <h2 className="text-xl font-bold mt-2">4. Recordatorios y notificaciones</h2>
      <p>
        Los recordatorios se envían mediante notificaciones push del navegador. No podemos
        garantizar la entrega exacta en el segundo programado: el sistema operativo del teléfono
        (especialmente iOS) puede retrasar o agrupar notificaciones para ahorrar batería. No uses
        SaludSimple como única fuente de alarmas para medicación crítica sin un respaldo adicional.
      </p>

      <h2 className="text-xl font-bold mt-2">5. Exactitud de la información</h2>
      <p>
        La información que ves en la aplicación depende de lo que vos (o tu cuidador autorizado)
        ingresen. Somos una herramienta de registro: no verificamos la exactitud médica de los
        datos ingresados.
      </p>

      <h2 className="text-xl font-bold mt-2">6. Disponibilidad del servicio</h2>
      <p>
        Hacemos lo posible para que la aplicación esté disponible en todo momento, pero puede haber
        interrupciones por mantenimiento o fallas técnicas. La versión instalada como PWA permite
        seguir viendo la interfaz sin conexión, aunque los datos no se sincronizan hasta que vuelva
        la conexión.
      </p>

      <h2 className="text-xl font-bold mt-2">7. Cambios en estos términos</h2>
      <p>
        Podemos actualizar estos términos ocasionalmente. Si los cambios son importantes, te lo
        vamos a comunicar dentro de la aplicación.
      </p>

      <h2 className="text-xl font-bold mt-2">8. Contacto</h2>
      <p>Para consultas sobre estos términos, escribinos al correo de soporte de la aplicación.</p>
    </LegalShell>
  );
}
