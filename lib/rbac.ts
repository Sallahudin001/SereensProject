import { auth } from "@clerk/nextjs/server";
import { executeQuery } from "./db";

export type Role = 'admin' | 'user';

export interface RBACContext {
  userId: string;
  role: Role;
  isAdmin: boolean;
}

/**
 * Get RBAC context for the current user
 * This is the single source of truth for all RBAC checks
 */
export async function getRBACContext(): Promise<RBACContext | null> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }
    
    // Get user role from database
    const userResult = await executeQuery(
      `SELECT role FROM users WHERE clerk_id = $1`,
      [userId]
    );
    
    if (userResult.length === 0) {
      // User not found in database, default to 'user' role
      console.warn(`User ${userId} not found in database, defaulting to 'user' role`);
      return {
        userId,
        role: 'user',
        isAdmin: false
      };
    }
    
    const role = (userResult[0].role || 'user') as Role;
    
    return {
      userId,
      role,
      isAdmin: role === 'admin'
    };
  } catch (error) {
    console.error('Error getting RBAC context:', error);
    return null;
  }
}

/**
 * Require authentication - throws if user is not authenticated
 */
export async function requireAuth(): Promise<RBACContext> {
  const context = await getRBACContext();
  
  if (!context) {
    throw new Error('Authentication required');
  }
  
  return context;
}

/**
 * Require admin role - throws if user is not admin
 */
export async function requireAdmin(): Promise<RBACContext> {
  const context = await requireAuth();
  
  if (!context.isAdmin) {
    throw new Error('Admin access required');
  }
  
  return context;
}

/**
 * Apply user filter to a query based on RBAC context
 */
export function applyRBACFilter(
  query: string,
  params: any[],
  context: RBACContext,
  userIdColumn: string = 'user_id',
  tableAlias?: string
): { query: string; params: any[] } {
  if (context.isAdmin) {
    // Admins see all data
    return { query, params };
  }
  
  // Regular users only see their own data
  const column = tableAlias ? `${tableAlias}.${userIdColumn}` : userIdColumn;
  const paramIndex = params.length + 1;
  
  // Check if query has WHERE clause
  if (query.toLowerCase().includes('where')) {
    // Find the right place to insert the filter
    const whereIndex = query.toLowerCase().indexOf('where');
    const groupByIndex = query.toLowerCase().indexOf('group by');
    const orderByIndex = query.toLowerCase().indexOf('order by');
    const limitIndex = query.toLowerCase().indexOf('limit');
    
    let insertIndex = query.length;
    if (groupByIndex > whereIndex) insertIndex = Math.min(insertIndex, groupByIndex);
    if (orderByIndex > whereIndex) insertIndex = Math.min(insertIndex, orderByIndex);
    if (limitIndex > whereIndex) insertIndex = Math.min(insertIndex, limitIndex);
    
    query = query.slice(0, insertIndex) + 
            ` AND ${column} = $${paramIndex} ` + 
            query.slice(insertIndex);
  } else {
    // Add WHERE clause
    const groupByIndex = query.toLowerCase().indexOf('group by');
    const orderByIndex = query.toLowerCase().indexOf('order by');
    const limitIndex = query.toLowerCase().indexOf('limit');
    
    let insertIndex = query.length;
    if (groupByIndex > -1) insertIndex = Math.min(insertIndex, groupByIndex);
    if (orderByIndex > -1) insertIndex = Math.min(insertIndex, orderByIndex);
    if (limitIndex > -1) insertIndex = Math.min(insertIndex, limitIndex);
    
    query = query.slice(0, insertIndex) + 
            ` WHERE ${column} = $${paramIndex} ` + 
            query.slice(insertIndex);
  }
  
  return {
    query,
    params: [...params, context.userId]
  };
}

/**
 * Check if a user can access a specific resource
 */
export async function canAccessResource(
  resourceOwnerId: string,
  context: RBACContext
): Promise<boolean> {
  // Admins can access all resources
  if (context.isAdmin) {
    return true;
  }
  
  // Regular users can only access their own resources
  return context.userId === resourceOwnerId;
}

/**
 * Get filtered count based on RBAC
 */
export async function getRBACFilteredCount(
  table: string,
  context: RBACContext,
  additionalWhere?: string,
  additionalParams?: any[]
): Promise<number> {
  let query = `SELECT COUNT(*) as count FROM ${table}`;
  let params = additionalParams || [];
  
  if (additionalWhere) {
    query += ` WHERE ${additionalWhere}`;
  }
  
  // Apply RBAC filter
  const filtered = applyRBACFilter(query, params, context);
  
  const result = await executeQuery(filtered.query, filtered.params);
  return parseInt(result[0]?.count || '0');
}

/**
 * RBAC-aware data fetching helper
 */
export async function fetchWithRBAC<T>(
  query: string,
  params: any[],
  context: RBACContext,
  userIdColumn: string = 'user_id',
  tableAlias?: string
): Promise<T[]> {
  const filtered = applyRBACFilter(query, params, context, userIdColumn, tableAlias);
  return executeQuery(filtered.query, filtered.params) as Promise<T[]>;
} 