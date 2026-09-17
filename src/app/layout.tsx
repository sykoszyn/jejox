import type { Metadata, Viewport } from 'next';
import { Atkinson_Hyperlegible } from 'next/font/google';
import { readUiPrefs } from '@/lib/preferences';
import { ServiceWorkerRegister } from '@/features/notifications/ServiceWorkerRegister';
import './globals.css';

const bodyFont = Atkinson_Hyperlegible({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Mejoralito',
  description:
    'Organizá tus medicamentos, registrá tus mediciones y llevá un historial simple de tu salud.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mejoralito',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#c1531d',
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const prefs = await readUiPrefs();

  return (
    <html
      lang="es"
      className={`${bodyFont.variable} h-full antialiased`}
      data-theme={prefs.theme}
      data-text-size={prefs.textSize}
      data-contrast={prefs.highContrast ? 'alto' : 'normal'}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <a href="#contenido-principal" className="skip-link">
          Saltar al contenido principal
        </a>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
