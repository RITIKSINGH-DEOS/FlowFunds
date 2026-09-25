import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname.startsWith('/login');
      const isPublicPage =
        nextUrl.pathname.startsWith('/privacy') ||
        nextUrl.pathname.startsWith('/terms');

      if (isLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }

      if (isPublicPage) {
        return true;
      }

      return isLoggedIn;
    },
  },
  providers: [],
};
