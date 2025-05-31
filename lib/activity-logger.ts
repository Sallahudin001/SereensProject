/**
 * Enhanced Activity Logger Utility
 * Robust logging system with consistent entity references
 */

import { executeQuery } from "./db";

// Define valid entity types for type safety
export type EntityType = 'proposal' | 'user' | 'pricing' | 'financing' | 'approval' | 'system' | 'none';

// Base interface for activity logging
interface ActivityLogParams {
  action: string;
  userId: string | number;
  details?: Record<string, any>;
  entityType?: EntityType;
  entityId?: number;
  userReferenceId?: string;
  proposalId?: number;
  status?: 'success' | 'failed' | 'pending';
}

/**
 * SERVER-SIDE ACTIVITY LOGGING
 * These functions should ONLY be used in server components, API routes, or server actions
 * Never import these directly in client components
 */

/**
 * Enhanced log activity function with better entity references
 * @server This function should only be used in server components or API routes
 */
export async function logActivity({
  action,
  userId,
  details = {},
  entityType = 'none',
  entityId,
  userReferenceId,
  proposalId,
  status = 'success'
}: ActivityLogParams): Promise<boolean> {
  try {
    // Validate required fields
    if (!action || !userId) {
      console.error("Error logging activity: action and userId are required");
      return false;
    }

    // Build the query
    const result = await executeQuery(
      `INSERT INTO activity_log (
        action, user_id, details, entity_type, entity_id, 
        user_reference_id, proposal_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        action,
        userId.toString(),
        JSON.stringify(details),
        entityType,
        entityId || null,
        userReferenceId || null,
        proposalId || null,
        status
      ]
    );

    return result.length > 0;
  } catch (error) {
    console.error("Error logging activity:", error);
    
    // Try to log to console at minimum if database fails
    try {
      console.warn("Activity log fallback:", {
        action,
        userId,
        entityType,
        entityId,
        proposalId,
        timestamp: new Date().toISOString(),
        details
      });
    } catch (e) {
      // Last resort, just log the action
      console.warn(`Failed to log activity: ${action}`);
    }
    
    return false;
  }
}

/**
 * CLIENT-SIDE ACTIVITY LOGGING
 * These functions can be safely used in client components
 */

/**
 * Log an activity via the API (for client-side code)
 * This is safe to use in client components
 */
export async function logActivityViaApi({
  action,
  userId,
  details = {},
  entityType = 'none',
  entityId,
  userReferenceId,
  proposalId,
  status = 'success'
}: ActivityLogParams): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        user_id: userId,
        details,
        entity_type: entityType,
        entity_id: entityId,
        user_reference_id: userReferenceId,
        proposal_id: proposalId,
        status
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to log activity: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error logging activity via API:", error);
    return false;
  }
}

/**
 * Log user permission changes (SERVER SIDE ONLY)
 * @server This function should only be used in server components or API routes
 */
export async function logPermissionChange(
  userId: string, 
  targetUserId: string,
  targetUserName: string,
  permissionsChanged: Record<string, any>,
  oldPermissions?: Record<string, any>
): Promise<boolean> {
  return logActivity({
    action: 'update_permissions',
    userId,
    details: {
      targetUserName,
      permissionsChanged,
      oldPermissions
    },
    entityType: 'user',
    userReferenceId: targetUserId
  });
}

/**
 * Log proposal creation (SERVER SIDE ONLY)
 * @server This function should only be used in server components or API routes
 */
export async function logProposalCreation(
  userId: string,
  proposalId: number,
  proposalNumber: string,
  customerName: string,
  services?: string[]
): Promise<boolean> {
  return logActivity({
    action: 'create_proposal',
    userId,
    details: {
      proposalNumber,
      customerName,
      services
    },
    entityType: 'proposal',
    entityId: proposalId,
    proposalId
  });
}

/**
 * Log proposal status updates (SERVER SIDE ONLY)
 * @server This function should only be used in server components or API routes
 */
export async function logProposalStatusUpdate(
  userId: string,
  proposalId: number,
  proposalNumber: string,
  status: string,
  additionalDetails: Record<string, any> = {}
): Promise<boolean> {
  return logActivity({
    action: `update_status_${status}`,
    userId,
    details: {
      proposalNumber,
      ...additionalDetails
    },
    entityType: 'proposal',
    entityId: proposalId,
    proposalId
  });
}

/**
 * Log discount request (SERVER SIDE ONLY)
 * @server This function should only be used in server components or API routes
 */
export async function logDiscountRequest(
  userId: string,
  proposalId: number,
  proposalNumber: string,
  originalValue: number,
  requestedValue: number,
  discountPercent: number,
  reason?: string
): Promise<boolean> {
  return logActivity({
    action: 'request_discount',
    userId,
    details: {
      proposalNumber,
      originalValue,
      requestedValue,
      discountPercent,
      reason
    },
    entityType: 'approval',
    entityId: proposalId, // Using proposal ID as the entity ID for approvals
    proposalId
  });
}

/**
 * Log discount approval/rejection (SERVER SIDE ONLY)
 * @server This function should only be used in server components or API routes
 */
export async function logDiscountDecision(
  userId: string,
  proposalId: number,
  proposalNumber: string,
  originalValue: number,
  requestedValue: number,
  approved: boolean,
  notes?: string
): Promise<boolean> {
  return logActivity({
    action: approved ? 'approved_discount' : 'rejected_discount',
    userId,
    details: {
      proposalNumber,
      originalValue,
      requestedValue,
      notes
    },
    entityType: 'approval',
    entityId: proposalId,
    proposalId
  });
}

/**
 * Log pricing table updates (SERVER SIDE ONLY)
 * @server This function should only be used in server components or API routes
 */
export async function logPricingUpdate(
  userId: string,
  action: 'create' | 'update' | 'delete',
  category: string,
  itemId?: number | string,
  rateName?: string,
  additionalDetails: Record<string, any> = {}
): Promise<boolean> {
  return logActivity({
    action: 'update_pricing_table',
    userId,
    details: {
      action,
      category,
      rateName,
      ...additionalDetails
    },
    entityType: 'pricing',
    entityId: itemId ? Number(itemId) : undefined
  });
}

/**
 * Log financing table updates (SERVER SIDE ONLY)
 * @server This function should only be used in server components or API routes
 */
export async function logFinancingUpdate(
  userId: string,
  changeType: 'create' | 'update' | 'delete',
  planId: number | string,
  planNumber: string,
  planName: string,
  provider: string,
  additionalDetails: Record<string, any> = {}
): Promise<boolean> {
  return logActivity({
    action: 'update_financing_table',
    userId,
    details: {
      changeType,
      planNumber,
      planName,
      provider,
      ...additionalDetails
    },
    entityType: 'financing',
    entityId: planId ? Number(planId) : undefined
  });
}

/**
 * CLIENT-SIDE API versions of all logging functions
 * These can be safely used in client components
 */

/**
 * Log user permission changes (CLIENT SIDE)
 */
export async function logPermissionChangeViaApi(
  userId: string, 
  targetUserId: string,
  targetUserName: string,
  permissionsChanged: Record<string, any>,
  oldPermissions?: Record<string, any>
): Promise<boolean> {
  return logActivityViaApi({
    action: 'update_permissions',
    userId,
    details: {
      targetUserName,
      permissionsChanged,
      oldPermissions
    },
    entityType: 'user',
    userReferenceId: targetUserId
  });
}

/**
 * Log pricing table updates (CLIENT SIDE)
 */
export async function logPricingUpdateViaApi(
  userId: string,
  action: 'create' | 'update' | 'delete',
  category: string,
  itemId?: number | string,
  rateName?: string,
  additionalDetails: Record<string, any> = {}
): Promise<boolean> {
  return logActivityViaApi({
    action: 'update_pricing_table',
    userId,
    details: {
      action,
      category,
      rateName,
      ...additionalDetails
    },
    entityType: 'pricing',
    entityId: itemId ? Number(itemId) : undefined
  });
}

/**
 * Log financing table updates (CLIENT SIDE)
 */
export async function logFinancingUpdateViaApi(
  userId: string,
  changeType: 'create' | 'update' | 'delete',
  planId: number | string,
  planNumber: string,
  planName: string,
  provider: string,
  additionalDetails: Record<string, any> = {}
): Promise<boolean> {
  return logActivityViaApi({
    action: 'update_financing_table',
    userId,
    details: {
      changeType,
      planNumber,
      planName,
      provider,
      ...additionalDetails
    },
    entityType: 'financing',
    entityId: planId ? Number(planId) : undefined
  });
} 