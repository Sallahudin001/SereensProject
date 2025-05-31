/**
 * CLIENT-SIDE ACTIVITY LOGGING
 * 
 * Safe utility functions for logging activities from client components
 * These functions use the API endpoints and don't directly access the database
 */

// Define valid entity types for type safety
export type EntityType = 'proposal' | 'user' | 'pricing' | 'financing' | 'approval' | 'system' | 'none';

// Base interface for activity logging
interface ActivityLogParams {
  action: string;
  userId?: string;
  details?: Record<string, any>;
  entityType?: EntityType;
  entityId?: number;
  userReferenceId?: string;
  proposalId?: number;
  status?: 'success' | 'failed' | 'pending';
}

/**
 * Log an activity via the API (for client-side code)
 * This is safe to use in client components
 */
export async function logActivity({
  action,
  details = {},
  userId,
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
    
    // Try to log to console at minimum if API call fails
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
 * Log user permission changes (CLIENT SIDE)
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
 * Log pricing table updates (CLIENT SIDE)
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
 * Log financing table updates (CLIENT SIDE)
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