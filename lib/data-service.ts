import { executeQuery } from "./db";
import { isAdmin, getCurrentUser, applyUserFilter } from "./auth-utils";
import { auth } from "@clerk/nextjs/server";

/**
 * Base service for data with role-based access control
 * This service ensures that:
 * - Admin users can see all data
 * - Regular users can only see their own data
 */
export class DataService<T extends { id: number; user_id?: string }> {
  protected tableName: string;
  
  constructor(tableName: string) {
    this.tableName = tableName;
  }
  
  /**
   * Get all records with role-based filtering
   */
  async getAll(): Promise<T[]> {
    try {
      // Check if user is admin
      const admin = await isAdmin();
      const { userId } = await auth();
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // If admin, return all records
      if (admin) {
        const query = `SELECT * FROM ${this.tableName} ORDER BY id DESC`;
        const result = await executeQuery(query);
        return result as T[];
      } else {
        // For regular users, only return their own records
        const query = `SELECT * FROM ${this.tableName} WHERE user_id = $1 ORDER BY id DESC`;
        const result = await executeQuery(query, [userId]);
        return result as T[];
      }
    } catch (error) {
      console.error(`DATA-SERVICE: Error getting all ${this.tableName}:`, error);
      return [];
    }
  }
  
  /**
   * Get a single record by ID with role-based access control
   */
  async getById(id: number): Promise<T | null> {
    try {
      // Check if user is admin
      const admin = await isAdmin();
      const { userId } = await auth();
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // First get the record
      const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
      const result = await executeQuery(query, [id]);
      
      if (result.length === 0) {
        return null;
      }
      
      const record = result[0] as T;
      
      // Check if user has access to this record
      if (admin || record.user_id === userId) {
        return record;
      } else {
        console.log(`DATA-SERVICE: User ${userId} attempted to access record ${id} in ${this.tableName} but doesn't have permission`);
        return null;
      }
    } catch (error) {
      console.error(`DATA-SERVICE: Error getting ${this.tableName} by ID:`, error);
      return null;
    }
  }
  
  /**
   * Create a new record with the current user as owner
   */
  async create(data: Omit<T, 'id' | 'user_id'>): Promise<T | null> {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // Add the user_id to the data
      const dataWithUser = { ...data, user_id: userId };
      
      // Get column names and values for the query
      const columns = Object.keys(dataWithUser);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const values = Object.values(dataWithUser);
      
      const query = `
        INSERT INTO ${this.tableName} (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;
      
      const result = await executeQuery(query, values);
      
      if (result.length === 0) {
        return null;
      }
      
      return result[0] as T;
    } catch (error) {
      console.error(`DATA-SERVICE: Error creating ${this.tableName}:`, error);
      return null;
    }
  }
  
  /**
   * Update a record with role-based access control
   */
  async update(id: number, data: Partial<Omit<T, 'id' | 'user_id'>>): Promise<T | null> {
    try {
      // First check if the user can access this record
      const record = await this.getById(id);
      
      if (!record) {
        return null;
      }
      
      // Get column names and values for the query
      const columns = Object.keys(data);
      const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(', ');
      const values = Object.values(data);
      
      const query = `
        UPDATE ${this.tableName}
        SET ${setClause}
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await executeQuery(query, [id, ...values]);
      
      if (result.length === 0) {
        return null;
      }
      
      return result[0] as T;
    } catch (error) {
      console.error(`DATA-SERVICE: Error updating ${this.tableName}:`, error);
      return null;
    }
  }
  
  /**
   * Delete a record with role-based access control
   */
  async delete(id: number): Promise<boolean> {
    try {
      // First check if the user can access this record
      const record = await this.getById(id);
      
      if (!record) {
        return false;
      }
      
      const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
      await executeQuery(query, [id]);
      
      return true;
    } catch (error) {
      console.error(`DATA-SERVICE: Error deleting ${this.tableName}:`, error);
      return false;
    }
  }
  
  /**
   * Run a custom query with role-based filtering
   */
  async customQuery(query: string, params: any[] = []): Promise<T[]> {
    try {
      // Check if user is admin
      const admin = await isAdmin();
      const { userId } = await auth();
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // For regular users, add filtering for user_id
      if (!admin) {
        // Check if WHERE clause exists
        if (query.toLowerCase().includes('where')) {
          // Add AND user_id = $X
          query = query + ` AND ${this.tableName}.user_id = $${params.length + 1}`;
          params.push(userId);
        } else {
          // Add WHERE user_id = $X
          query = query + ` WHERE ${this.tableName}.user_id = $${params.length + 1}`;
          params.push(userId);
        }
      }
      
      const result = await executeQuery(query, params);
      return result as T[];
    } catch (error) {
      console.error(`DATA-SERVICE: Error running custom query for ${this.tableName}:`, error);
      return [];
    }
  }
}

/**
 * Proposal Service - Handles proposals with role-based access control
 */
export class ProposalService {
  /**
   * Get all proposals with role-based filtering
   */
  static async getAll() {
    const baseQuery = `
      SELECT p.*, u.name as creator_name 
      FROM proposals p
      LEFT JOIN users u ON p.user_id = u.clerk_id
      ORDER BY p.created_at DESC
    `;
    
    const { query, params } = await applyUserFilter(baseQuery);
    return executeQuery(query, params);
  }
  
  /**
   * Get a proposal by ID with role-based access check
   */
  static async getById(proposalId: number) {
    const isUserAdmin = await isAdmin();
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    if (isUserAdmin) {
      // Admin can access any proposal
      return executeQuery(
        `SELECT * FROM proposals WHERE id = $1`,
        [proposalId]
      );
    } else {
      // Regular user can only access their own proposals
      return executeQuery(
        `SELECT * FROM proposals WHERE id = $1 AND user_id = $2`,
        [proposalId, userId]
      );
    }
  }
  
  /**
   * Create a new proposal with current user as creator
   */
  static async create(proposalData: any) {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Add user_id to the proposal data
    const dataWithUser = {
      ...proposalData,
      user_id: userId
    };
    
    // Build the query dynamically based on provided fields
    const fields = Object.keys(dataWithUser);
    const values = Object.values(dataWithUser);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO proposals (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    return executeQuery(query, values);
  }
}

/**
 * Customer Service - Handles customers with role-based access control
 */
export class CustomerService {
  /**
   * Get all customers with role-based filtering
   */
  static async getAll() {
    const baseQuery = `
      SELECT c.*, u.name as creator_name 
      FROM customers c
      LEFT JOIN users u ON c.user_id = u.clerk_id
      ORDER BY c.created_at DESC
    `;
    
    const { query, params } = await applyUserFilter(baseQuery);
    return executeQuery(query, params);
  }
  
  /**
   * Get a customer by ID with role-based access check
   */
  static async getById(customerId: number) {
    const isUserAdmin = await isAdmin();
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    if (isUserAdmin) {
      // Admin can access any customer
      return executeQuery(
        `SELECT * FROM customers WHERE id = $1`,
        [customerId]
      );
    } else {
      // Regular user can only access their own customers
      return executeQuery(
        `SELECT * FROM customers WHERE id = $1 AND user_id = $2`,
        [customerId, userId]
      );
    }
  }
  
  /**
   * Create a new customer with current user as creator
   */
  static async create(customerData: any) {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Add user_id to the customer data
    const dataWithUser = {
      ...customerData,
      user_id: userId
    };
    
    // Build the query dynamically based on provided fields
    const fields = Object.keys(dataWithUser);
    const values = Object.values(dataWithUser);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO customers (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    return executeQuery(query, values);
  }
} 