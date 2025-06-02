"use client"

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import React from 'react'

export type Role = 'admin' | 'user'

interface RBACContext {
  isLoading: boolean
  isAuthenticated: boolean
  userId: string | null
  role: Role
  isAdmin: boolean
  canView: (resource: string) => boolean
  canEdit: (resource: string) => boolean
  canCreate: (resource: string) => boolean
  canDelete: (resource: string) => boolean
}

// Define permissions for each role
const permissions = {
  admin: {
    view: ['*'], // Can view everything
    edit: ['*'], // Can edit everything
    create: ['*'], // Can create everything
    delete: ['*'], // Can delete everything
  },
  user: {
    view: ['own_proposals', 'own_customers', 'own_metrics'],
    edit: ['own_proposals', 'own_customers'],
    create: ['proposals', 'customers'],
    delete: [] as string[], // Cannot delete anything
  },
}

export function useRBAC(): RBACContext {
  const { isLoaded, isSignedIn, user } = useUser()
  const [role, setRole] = useState<Role>('user')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = (user.publicMetadata?.role as Role) || 'user'
      setRole(userRole)
      setIsAdmin(userRole === 'admin')
    }
  }, [isLoaded, user])

  const canView = (resource: string): boolean => {
    if (isAdmin) return true
    return permissions.user.view.includes(resource) || permissions.user.view.includes(`own_${resource}`)
  }

  const canEdit = (resource: string): boolean => {
    if (isAdmin) return true
    return permissions.user.edit.includes(resource) || permissions.user.edit.includes(`own_${resource}`)
  }

  const canCreate = (resource: string): boolean => {
    if (isAdmin) return true
    return permissions.user.create.includes(resource)
  }

  const canDelete = (resource: string): boolean => {
    if (isAdmin) return true
    return permissions.user.delete.includes(resource)
  }

  return {
    isLoading: !isLoaded,
    isAuthenticated: isSignedIn || false,
    userId: user?.id || null,
    role,
    isAdmin,
    canView,
    canEdit,
    canCreate,
    canDelete,
  }
}

// Component wrapper for RBAC
interface RBACProps {
  children: React.ReactNode
  resource?: string
  action?: 'view' | 'edit' | 'create' | 'delete'
  fallback?: React.ReactNode
  requireAdmin?: boolean
}

export function RBAC({ 
  children, 
  resource, 
  action = 'view', 
  fallback = null,
  requireAdmin = false 
}: RBACProps) {
  const rbac = useRBAC()

  if (rbac.isLoading) {
    return <div>Loading...</div>
  }

  if (!rbac.isAuthenticated) {
    return <React.Fragment>{fallback}</React.Fragment>
  }

  if (requireAdmin && !rbac.isAdmin) {
    return <React.Fragment>{fallback}</React.Fragment>
  }

  if (resource) {
    let hasPermission = false
    
    switch (action) {
      case 'view':
        hasPermission = rbac.canView(resource)
        break
      case 'edit':
        hasPermission = rbac.canEdit(resource)
        break
      case 'create':
        hasPermission = rbac.canCreate(resource)
        break
      case 'delete':
        hasPermission = rbac.canDelete(resource)
        break
    }

    if (!hasPermission) {
      return <React.Fragment>{fallback}</React.Fragment>
    }
  }

  return <React.Fragment>{children}</React.Fragment>
} 