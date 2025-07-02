import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isApiAdminRoute = createRouteMatcher(['/api/admin(.*)']);

// Simple in-memory cache for user roles (cleared periodically)
const roleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default clerkMiddleware(async (auth, req) => {
  // Check if this is an admin route (either UI or API)
  if (isAdminRoute(req) || isApiAdminRoute(req)) {
    // Get authentication info
    const { userId, redirectToSignIn } = await auth();
    
    // If not authenticated, redirect to sign in
    if (!userId) {
      return redirectToSignIn();
    }

    try {
      let userRole = 'user';
      
      // Check cache first
      const cached = roleCache.get(userId);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        userRole = cached.role;
      } else {
        // Get user from Clerk to check role
        const { clerkClient } = await import('@clerk/nextjs/server');
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
        userRole = (user.publicMetadata?.role as string) || 'user';
        
        // Cache the result
        roleCache.set(userId, { role: userRole, timestamp: Date.now() });
        
        // Clean old cache entries periodically
        if (roleCache.size > 1000) {
          const now = Date.now();
          for (const [key, value] of roleCache.entries()) {
            if (now - value.timestamp > CACHE_DURATION) {
              roleCache.delete(key);
            }
          }
        }
      }
      
      // Only allow admin role to access admin routes
      if (userRole !== 'admin') {
        // For API routes, return 403
        if (isApiAdminRoute(req)) {
          return NextResponse.json(
            { error: 'Access denied. Admin role required.' },
            { status: 403 }
          );
        }
        
        // For UI routes, redirect to 403 Forbidden page
        const url = new URL('/403', req.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      
      // On error, deny access
      if (isApiAdminRoute(req)) {
        return NextResponse.json(
          { error: 'Unable to verify admin access.' },
          { status: 500 }
        );
      }
      
      // Redirect to 403 page for security reasons
      const url = new URL('/403', req.url);
      return NextResponse.redirect(url);
    }
  }

  // Continue with normal processing for non-admin routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};