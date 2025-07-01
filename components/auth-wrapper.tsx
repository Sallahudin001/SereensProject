'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [syncAttempted, setSyncAttempted] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    // Only run when auth is loaded and user is signed in
    if (isLoaded && isSignedIn && userId && !syncAttempted) {
      // Run sync in background without blocking navigation
      setTimeout(() => {
        const ensureUser = async () => {
          try {
            console.log('Auth Wrapper: Syncing user with database:', userId);
            
            // Call our API endpoint to ensure user exists in database
            const response = await fetch('/api/auth/sync-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              // Add retry on network failures
              credentials: 'same-origin',
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('Auth Wrapper: User synced with database successfully', data);
              setSyncSuccess(true);
            } else {
              let errorMessage = 'Unknown error';
              try {
                const data = await response.json();
                errorMessage = data.error || errorMessage;
                console.error('Auth Wrapper: Error syncing user with database:', data);
              } catch (e) {
                console.error('Auth Wrapper: Could not parse error response');
              }
              
              // If the error is related to middleware not being detected, we don't retry
              if (errorMessage.includes('clerkMiddleware')) {
                console.warn('Auth Wrapper: Middleware error detected, please check your middleware configuration');
              } else {
                // For other errors, we'll try again
                console.warn('Auth Wrapper: Will retry user sync in 3 seconds');
                setTimeout(() => {
                  setSyncAttempted(false); // Reset to allow another attempt
                }, 3000);
              }
            }
          } catch (error) {
            console.error('Auth Wrapper: Network error syncing user with database:', error);
            
            // If there was a network error or other issue, we might want to retry later
            console.warn('Auth Wrapper: Will retry user sync in 5 seconds due to network error');
            setTimeout(() => {
              setSyncAttempted(false); // Reset to allow another attempt
            }, 5000); // Try again in 5 seconds
          } finally {
            setSyncAttempted(true);
          }
        };

        ensureUser();
      }, 200); // Small delay to allow navigation to proceed first
    }
  }, [isLoaded, isSignedIn, userId, syncAttempted]);

  // Add direct debug information in the DOM when in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <>
        {children}
        {isLoaded && isSignedIn && userId && (
          <div style={{ 
            position: 'fixed', 
            bottom: '10px', 
            right: '10px', 
            background: syncSuccess ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)', 
            padding: '8px', 
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9999
          }}>
            User ID: {userId}<br />
            DB Sync: {syncSuccess ? 'Success' : (syncAttempted ? 'Attempted' : 'Not Started')}
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
} 