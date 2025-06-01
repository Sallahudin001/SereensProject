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

    // Map entityType to action_category
    const actionCategory = entityType;
    
    // Build the query
    const result = await executeQuery(
      `INSERT INTO activity_log (
        action, action_category, actor_id, 
        target_type, target_id, target_identifier,
        proposal_id, metadata, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [
        action,
        actionCategory,
        userId.toString(),
        entityType,
        entityId || null,
        userReferenceId || null,
        proposalId || null,
        JSON.stringify(details),
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
        action_category: entityType,
        actor_id: userId,
        target_type: entityType,
        target_id: entityId,
        target_identifier: userReferenceId,
        proposal_id: proposalId,
        metadata: details,
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
 * Log an activity using clerk_id for tracking
 * This updated version ensures all activity is tracked with clerk_id
 */
export async function logActivityWithClerkId({
  action,
  actionCategory,
  clerkId,
  description,
  targetType,
  targetId,
  targetIdentifier,
  proposalId,
  approvalRequestId,
  metadata = {},
  beforeState = null,
  afterState = null,
  status = 'success',
  errorMessage = null
}: {
  action: string;
  actionCategory: string;
  clerkId: string;
  description?: string;
  targetType?: string;
  targetId?: number;
  targetIdentifier?: string;
  proposalId?: number;
  approvalRequestId?: number;
  metadata?: any;
  beforeState?: any;
  afterState?: any;
  status?: string;
  errorMessage?: string | null;
}): Promise<boolean> {
  try {
    // Insert the activity log entry
    await executeQuery(
      `INSERT INTO activity_log (
        action, action_category, actor_id, description,
        target_type, target_id, target_identifier,
        proposal_id, approval_request_id,
        metadata, before_state, after_state,
        status, error_message
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )`,
      [
        action,
        actionCategory,
        clerkId,
        description || '',
        targetType || null,
        targetId || null,
        targetIdentifier || null,
        proposalId || null,
        approvalRequestId || null,
        JSON.stringify(metadata || {}),
        beforeState ? JSON.stringify(beforeState) : null,
        afterState ? JSON.stringify(afterState) : null,
        status,
        errorMessage
      ]
    );
    
    console.log(`Activity logged: ${action} by ${clerkId}`);
    return true;
  } catch (error) {
    console.error("Error logging activity:", error);
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
  return logActivityWithClerkId({
    action: 'create_proposal',
    actionCategory: 'proposal',
    clerkId: userId,
    description: `Created proposal #${proposalNumber} for ${customerName}`,
    targetType: 'proposal',
    targetId: proposalId,
    targetIdentifier: proposalNumber,
    proposalId,
    metadata: {
      proposalNumber,
      customerName,
      services
    }
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
  return logActivityWithClerkId({
    action: `update_status_${status}`,
    actionCategory: 'proposal',
    clerkId: userId,
    description: `Proposal #${proposalNumber} status changed to ${status}`,
    targetType: 'proposal',
    targetId: proposalId,
    targetIdentifier: proposalNumber,
    proposalId,
    metadata: {
      proposalNumber,
      status,
      ...additionalDetails
    }
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

// SPECIALIZED LOGGING FUNCTIONS USING CLERK_ID
// These replace the old implementations

/**
 * Log permission change with clerk_id
 */
export async function logPermissionChangeWithClerkId(
  adminClerkId: string,
  targetClerkId: string,
  targetUserName: string,
  previousRole: string,
  newRole: string
): Promise<boolean> {
  return logActivityWithClerkId({
    action: 'update_permissions',
    actionCategory: 'user',
    clerkId: adminClerkId,
    description: `Changed role for ${targetUserName} from ${previousRole} to ${newRole}`,
    targetType: 'user',
    targetIdentifier: targetClerkId,
    metadata: {
      targetClerkId,
      targetUserName,
      previousRole,
      newRole
    },
    beforeState: {
      role: previousRole
    },
    afterState: {
      role: newRole
    }
  });
}

/**
 * Log proposal sent with clerk_id
 */
export async function logProposalSentWithClerkId(
  clerkId: string,
  proposalId: number,
  proposalNumber: string,
  customerEmail: string,
  customerName: string
): Promise<boolean> {
  return logActivityWithClerkId({
    action: 'send_proposal',
    actionCategory: 'proposal',
    clerkId,
    description: `Proposal #${proposalNumber} sent to ${customerName}`,
    targetType: 'proposal',
    targetId: proposalId,
    targetIdentifier: proposalNumber,
    proposalId,
    metadata: {
      customerEmail,
      customerName
    }
  });
}

/**
 * Log discount request with clerk_id
 */
export async function logDiscountRequestWithClerkId(
  clerkId: string,
  proposalId: number,
  proposalNumber: string,
  originalValue: number,
  requestedValue: number,
  discountPercent: number,
  approvalRequestId: number,
  notes?: string
): Promise<boolean> {
  return logActivityWithClerkId({
    action: 'request_discount',
    actionCategory: 'approval',
    clerkId,
    description: `Discount of ${discountPercent}% requested for proposal #${proposalNumber}`,
    targetType: 'approval_request',
    targetId: approvalRequestId,
    targetIdentifier: `Request for Proposal #${proposalNumber}`,
    proposalId,
    approvalRequestId,
    metadata: {
      originalValue,
      requestedValue,
      discountPercent,
      notes
    }
  });
}

/**
 * Log discount decision with clerk_id
 */
export async function logDiscountDecisionWithClerkId(
  clerkId: string,
  proposalId: number,
  proposalNumber: string,
  originalValue: number,
  requestedValue: number,
  approvalRequestId: number,
  approved: boolean,
  notes?: string
): Promise<boolean> {
  const action = approved ? 'approve_discount' : 'reject_discount';
  const status = approved ? 'approved' : 'rejected';
  
  return logActivityWithClerkId({
    action,
    actionCategory: 'approval',
    clerkId,
    description: `Discount ${status} for proposal #${proposalNumber}`,
    targetType: 'approval_request',
    targetId: approvalRequestId,
    targetIdentifier: `Request for Proposal #${proposalNumber}`,
    proposalId,
    approvalRequestId,
    metadata: {
      originalValue,
      requestedValue,
      notes
    },
    beforeState: {
      status: 'pending'
    },
    afterState: {
      status
    }
  });
} 