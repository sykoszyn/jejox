import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/ingresar', '/registrarse', '/auth', '/privacidad', '/terminos', '/offline'];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.some((path) => pathname === path) ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/icons') ||
    // Las rutas de API hacen su propia verificacion (requireUser(), o el
    // secreto CRON_SECRET en /api/cron/reminders): no tiene sentido
    // redirigirlas a /ingresar con un 307 como si fueran una pagina, y
    // eso es justamente lo que rompia el cron externo (cron-job.org
    // recibia el redirect en vez de llegar al handler real).
    pathname.startsWith('/api/')
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/ingresar';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === '/ingresar' || pathname === '/registrarse')) {
    const url = request.nextUrl.clone();
    url.pathname = '/inicio';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
