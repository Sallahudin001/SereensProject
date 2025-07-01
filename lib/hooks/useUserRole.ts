'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

export type UserRole = 'admin' | 'user' | null;

// Simple cache for user roles
const roleCache = new Map<string, { role: UserRole; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useUserRole() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      // Check cache first
      const cached = roleCache.get(userId);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        setRole(cached.role);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Use a timeout to avoid blocking the UI
      setTimeout(async () => {
        try {
          const response = await fetch('/api/direct-user-sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              userId,
              email: user?.primaryEmailAddress?.emailAddress || 'pending@example.com',
              name: user?.fullName || ''
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            const userRole = data.success && data.user?.role ? data.user.role : 'user';
            setRole(userRole);
            
            // Cache the result
            roleCache.set(userId, { role: userRole, timestamp: Date.now() });
          } else {
            console.error('Failed to fetch user role:', response.statusText);
            setError('Failed to fetch user role');
            setRole('user'); // Default to user role instead of null
          }
        } catch (err) {
          console.error('Error fetching user role:', err);
          setError('Error fetching user role');
          setRole('user'); // Default to user role instead of null
        } finally {
          setIsLoading(false);
        }
      }, 50); // Small delay to allow UI to render first
    } else if (isLoaded && !isSignedIn) {
      setRole(null);
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, userId, user]);
  
  return {
    role,
    isAdmin: role === 'admin',
    isLoading,
    error
  };
} 