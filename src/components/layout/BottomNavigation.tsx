'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Pill, Activity, History, Settings } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const items = [
  { href: '/inicio', label: 'Inicio', icon: Home },
  { href: '/medicamentos', label: 'Medicamentos', icon: Pill },
  { href: '/mediciones', label: 'Mediciones', icon: Activity },
  { href: '/historial', label: 'Historial', icon: History },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="no-print fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2.5 min-h-16 text-xs font-semibold',
                  active ? 'text-primary' : 'text-ink-muted'
                )}
              >
                <Icon size={24} aria-hidden="true" strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
