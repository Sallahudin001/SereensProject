'use client';

import { ReactNode } from 'react';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { useAuth } from '@clerk/nextjs';

type RoleRestrictedProps = {
  allowedRoles: ('admin' | 'user')[];
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Component that only renders its children if the current user has one of the specified roles
 */
export default function RoleRestricted({ 
  allowedRoles, 
  children, 
  fallback = null 
}: RoleRestrictedProps) {
  const { role, isLoading } = useUserRole();
  
  // While loading, don't render anything
  if (isLoading) return null;
  
  // If user has one of the allowed roles, render children
  if (role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }
  
  // Otherwise render fallback
  return <>{fallback}</>;
}

/**
 * Component that only renders its children if the current user is an admin
 */
export function AdminOnly({ 
  children, 
  fallback = null 
}: Omit<RoleRestrictedProps, 'allowedRoles'>) {
  return (
    <RoleRestricted allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleRestricted>
  );
}

/**
 * Component that only renders its children for the owner of the data or admins
 */
export function OwnerOrAdminOnly({ 
  children, 
  ownerId,
  fallback = null 
}: Omit<RoleRestrictedProps, 'allowedRoles'> & { ownerId: string }) {
  const { role, isLoading } = useUserRole();
  const { userId } = useAuth();
  
  // While loading, don't render anything
  if (isLoading) return null;
  
  // Allow if user is an admin
  if (role === 'admin') {
    return <>{children}</>;
  }
  
  // Allow if user is the owner
  if (userId && userId === ownerId) {
    return <>{children}</>;
  }
  
  // Otherwise render fallback
  return <>{fallback}</>;
} 