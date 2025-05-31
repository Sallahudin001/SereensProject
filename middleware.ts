import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isApiAdminRoute = createRouteMatcher(['/api/admin(.*)']);

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
      // Get user from Clerk to check role
      const { clerkClient } = await import('@clerk/nextjs/server');
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      const userRole = user.publicMetadata?.role || 'user';
      
      // Only allow admin role to access admin routes
      if (userRole !== 'admin') {
        // For API routes, return 403
        if (isApiAdminRoute(req)) {
          return NextResponse.json(
            { error: 'Access denied. Admin role required.' },
            { status: 403 }
          );
        }
        
        // For UI routes, redirect to dashboard with error
        const url = new URL('/dashboard', req.url);
        url.searchParams.set('error', 'admin_access_required');
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
      
      // Redirect to dashboard with error
      const url = new URL('/dashboard', req.url);
      url.searchParams.set('error', 'role_check_failed');
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