'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface ClerkClientProviderProps {
  children: ReactNode;
}

export function ClerkClientProvider({ children }: ClerkClientProviderProps) {
  // For Clerk v6.19.1, we need to make sure we handle client-side rendering correctly
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  
  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
} 