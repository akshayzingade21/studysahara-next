// middleware.js
import { NextResponse } from 'next/server';

export function middleware(req) {
  const publicPaths = ['/', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/auth/callback'];
  if (publicPaths.includes(req.nextUrl.pathname)) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith('/crm')) {
    const hasSession = req.cookies.get('sb-access-token') || req.cookies.get('sb:token');
    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = '/(auth)/login';
      url.searchParams.set('redirectedFrom', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/crm/:path*'] };