'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

export type UserRole = 'admin' | 'user' | null;

export function useUserRole() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      setIsLoading(true);
      setError(null);
      
      const fetchUserRole = async () => {
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
            if (data.success && data.user?.role) {
              setRole(data.user.role);
            } else {
              setRole('user'); // Default to user if no role found
            }
          } else {
            console.error('Failed to fetch user role:', response.statusText);
            setError('Failed to fetch user role');
            setRole(null);
          }
        } catch (err) {
          console.error('Error fetching user role:', err);
          setError('Error fetching user role');
          setRole(null);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUserRole();
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