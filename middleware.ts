export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: [
    '/((?!login|privacy|terms|api|_next|icons|manifest\\.json|sw\\.js|favicon).*)',
  ],
};
