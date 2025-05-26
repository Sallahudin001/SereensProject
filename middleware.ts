import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico).*)',
    '/api/(.*)',
    '/'
  ],
};