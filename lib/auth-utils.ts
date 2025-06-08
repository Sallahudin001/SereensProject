import { executeQuery } from "./db";
import { auth } from "@clerk/nextjs/server";

export type Role = 'admin' | 'user';

export interface UserData {
  id: number;
  clerk_id: string;
  email: string;
  name: string | null;
  role: Role;
  last_login: Date;
}

// Admin user IDs - fallback if metadata is unavailable
// These are Clerk user IDs that should have admin access
export const ADMIN_USER_IDS: string[] = [
  // Add admin user IDs here, e.g. 'user_2xB9Hk2...'
];

// Helper function to get the current user ID
export async function getCurrentUserId() {
  try {
    const { userId } = await auth();
    return userId;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

/**
 * Get the role for a user from our database or fallback list
 */
export async function getUserRole(userId: string): Promise<Role> {
  try {
    // Try to get from our database first
    const users = await executeQuery(
      `SELECT role FROM users WHERE clerk_id = $1`,
      [userId]
    );
    
    if (users.length > 0 && users[0].role) {
      return users[0].role as Role;
    }
    
    // If not in database, use fallback list
    return ADMIN_USER_IDS.includes(userId) ? 'admin' : 'user';
  } catch (error) {
    console.error(`Error getting user role:`, error);
    // Fallback to hardcoded list
    return ADMIN_USER_IDS.includes(userId) ? 'admin' : 'user';
  }
}

/**
 * Get the current user's data from the database
 */
export async function getCurrentUser(): Promise<UserData | null> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      console.log("AUTH-UTILS: No user ID in auth context");
      return null;
    }
    
    const users = await executeQuery(
      `SELECT * FROM users WHERE clerk_id = $1`,
      [userId]
    );
    
    if (users.length === 0) {
      console.log(`AUTH-UTILS: User ${userId} not found in database`);
      return null;
    }
    
    return users[0] as UserData;
  } catch (error) {
    console.error("AUTH-UTILS: Error getting current user:", error);
    return null;
  }
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getCurrentUserId();
  return !!userId;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return false;
    
    // First try to get role from our database
    const currentUser = await getCurrentUser();
    if (currentUser) {
      return currentUser.role === 'admin';
    }
    
    // If not in our database, check Clerk metadata
    const role = await getUserRole(userId);
    return role === 'admin';
  } catch (error) {
    console.error("AUTH-UTILS: Error checking admin status:", error);
    return false;
  }
}

/**
 * Get user by ID from the database
 */
export async function getUserById(userId: string): Promise<UserData | null> {
  try {
    const users = await executeQuery(
      `SELECT * FROM users WHERE clerk_id = $1`,
      [userId]
    );
    
    if (users.length === 0) {
      return null;
    }
    
    return users[0] as UserData;
  } catch (error) {
    console.error(`AUTH-UTILS: Error getting user ${userId}:`, error);
    return null;
  }
}

/**
 * Get all users from the database
 */
export async function getAllUsers(): Promise<UserData[]> {
  try {
    const users = await executeQuery(`SELECT * FROM users ORDER BY id`);
    return users as UserData[];
  } catch (error) {
    console.error("AUTH-UTILS: Error getting all users:", error);
    return [];
  }
}

/**
 * Verify if a user can access specific data
 * Admin users can access any data
 * Regular users can only access their own data
 */
export async function canAccessData(dataOwnerId: string): Promise<boolean> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return false;
    
    // Admins can access all data
    if (currentUser.role === 'admin') return true;
    
    // Regular users can only access their own data
    return currentUser.clerk_id === dataOwnerId;
  } catch (error) {
    console.error("AUTH-UTILS: Error checking data access:", error);
    return false;
  }
}

/**
 * Apply user filters to a SQL query
 * For admin users, returns all data
 * For regular users, only returns their own data
 * 
 * @param query The SQL query to filter
 * @param params The existing parameters for the query
 * @param userIdColumn The column name that contains the user ID (default: 'user_id')
 * @param tableName Optional table name prefix for the user ID column (e.g., 'p.' for 'p.user_id')
 */
export async function applyUserFilter(
  query: string, 
  params: string[] | number[] | any[] = [], 
  userIdColumn: string = 'user_id',
  tableName: string = ''
): Promise<{ query: string, params: any[] }> {
  const isUserAdmin = await isAdmin();
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  if (isUserAdmin) {
    // Admin users can see all data
    return { query, params };
  } else {
    // Regular users can only see their own data
    const columnName = tableName ? `${tableName}.${userIdColumn}` : userIdColumn;
    
    // Check if the query has GROUP BY, ORDER BY, or LIMIT clauses
    const hasGroupBy = query.toLowerCase().includes('group by');
    const hasOrderBy = query.toLowerCase().includes('order by');
    const hasLimit = query.toLowerCase().includes('limit');
    
    let modifiedQuery = query;
    
    if (query.toLowerCase().includes('where')) {
      // If the query already has a WHERE clause, add user filter with AND
      // Find the position of GROUP BY, ORDER BY, or LIMIT if they exist
      let insertPosition = modifiedQuery.length;
      
      if (hasGroupBy) {
        const groupByPos = modifiedQuery.toLowerCase().indexOf('group by');
        insertPosition = Math.min(insertPosition, groupByPos);
      }
      
      if (hasOrderBy) {
        const orderByPos = modifiedQuery.toLowerCase().indexOf('order by');
        insertPosition = Math.min(insertPosition, orderByPos);
      }
      
      if (hasLimit) {
        const limitPos = modifiedQuery.toLowerCase().indexOf('limit');
        insertPosition = Math.min(insertPosition, limitPos);
      }
      
      // Insert the filter condition at the right position
      modifiedQuery = modifiedQuery.slice(0, insertPosition) + 
                    ` AND ${columnName} = $${params.length + 1} ` + 
                    modifiedQuery.slice(insertPosition);
    } else {
      // If no WHERE clause, add one for user_id, but before GROUP BY/ORDER BY/LIMIT
      let insertPosition = modifiedQuery.length;
      
      if (hasGroupBy) {
        const groupByPos = modifiedQuery.toLowerCase().indexOf('group by');
        insertPosition = Math.min(insertPosition, groupByPos);
      }
      
      if (hasOrderBy) {
        const orderByPos = modifiedQuery.toLowerCase().indexOf('order by');
        insertPosition = Math.min(insertPosition, orderByPos);
      }
      
      if (hasLimit) {
        const limitPos = modifiedQuery.toLowerCase().indexOf('limit');
        insertPosition = Math.min(insertPosition, limitPos);
      }
      
      // Insert the WHERE clause at the right position
      modifiedQuery = modifiedQuery.slice(0, insertPosition) + 
                    ` WHERE ${columnName} = $${params.length + 1} ` + 
                    modifiedQuery.slice(insertPosition);
    }
    
    return { 
      query: modifiedQuery, 
      params: [...params, userId] 
    };
  }
} 