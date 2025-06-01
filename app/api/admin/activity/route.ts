import { executeQuery } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { formatDistanceToNow } from "date-fns";
import { auth } from "@clerk/nextjs/server";
import { getUserNamesFromClerk } from '@/lib/user-utils';

/**
 * GET /api/admin/activity
 * Retrieves recent activity logs for the admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10", 10);
    const action = request.nextUrl.searchParams.get("action");
    const userId = request.nextUrl.searchParams.get("userId");
    const entityType = request.nextUrl.searchParams.get("entityType");
    const entityId = request.nextUrl.searchParams.get("entityId");
    const days = parseInt(request.nextUrl.searchParams.get("days") || "30", 10);
    
    // Build the WHERE clause based on filters
    let whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;
    
    if (action) {
      whereConditions.push(`al.action = $${paramIndex++}`);
      queryParams.push(action);
    }
    
    if (userId) {
      whereConditions.push(`al.actor_id = $${paramIndex++}`);
      queryParams.push(userId);
    }
    
    if (entityType) {
      whereConditions.push(`al.target_type = $${paramIndex++}`);
      queryParams.push(entityType);
    }
    
    if (entityId) {
      whereConditions.push(`al.target_id = $${paramIndex++}`);
      queryParams.push(parseInt(entityId));
    }
    
    if (days > 0) {
      whereConditions.push(`al.created_at >= NOW() - INTERVAL '${days} days'`);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    // Add limit parameter
    queryParams.push(limit);
    
    // Query recent activities with basic data first
    const activities = await executeQuery(`
      SELECT 
        al.id,
        al.action,
        al.action_category,
        al.description,
        al.actor_id,
        al.actor_type,
        al.actor_name,
        al.target_type,
        al.target_id,
        al.target_identifier,
        al.proposal_id,
        al.approval_request_id,
        al.metadata,
        al.before_state,
        al.after_state,
        al.status,
        al.created_at,
        p.proposal_number,
        p.customer_id,
        c.name as customer_name
      FROM 
        activity_log al
      LEFT JOIN 
        proposals p ON al.proposal_id = p.id
      LEFT JOIN
        customers c ON p.customer_id = c.id
      ${whereClause}
      ORDER BY 
        al.created_at DESC
      LIMIT $${paramIndex}
    `, queryParams);
    
    // Extract unique actor_ids that are numeric (database IDs) and need resolution
    const databaseIds = new Set<number>()
    const directClerkIds = new Set<string>()
    
    activities.forEach(activity => {
      if (activity.actor_id && activity.actor_id !== 'system' && activity.actor_id !== 'null') {
        // Check if actor_id looks like a number (database ID) or a Clerk ID
        if (/^\d+$/.test(activity.actor_id)) {
          // Numeric ID - likely a database ID that needs resolution
          databaseIds.add(parseInt(activity.actor_id))
        } else {
          // Non-numeric ID - likely already a Clerk ID
          directClerkIds.add(activity.actor_id)
        }
      }
    })
    
    // Resolve database IDs to clerk_ids through users table (not admin_users)
    let userIdToClerkId: Record<number, string> = {}
    if (databaseIds.size > 0) {
      const userMappings = await executeQuery(
        `SELECT id, clerk_id FROM users WHERE id = ANY($1) AND clerk_id IS NOT NULL`,
        [Array.from(databaseIds)]
      )
      
      userMappings.forEach(mapping => {
        if (mapping.clerk_id) {
          // Filter out fake/test clerk_ids - only process real Clerk IDs
          if (!isTestClerkId(mapping.clerk_id)) {
            userIdToClerkId[mapping.id] = mapping.clerk_id
            directClerkIds.add(mapping.clerk_id)
          }
        }
      })
    }
    
    // Also filter direct clerk_ids to remove any test IDs
    const filteredDirectClerkIds = Array.from(directClerkIds).filter(id => !isTestClerkId(id))
    
    // Fetch user names from Clerk in batch for all real clerk_ids only
    const userNames = filteredDirectClerkIds.length > 0 ? await getUserNamesFromClerk(filteredDirectClerkIds) : {}
    
    // Transform the data for the frontend
    const formattedActivities = activities.map(activity => {
      // Parse the JSONB metadata if it's a string
      const metadata = typeof activity.metadata === 'string' 
        ? JSON.parse(activity.metadata) 
        : activity.metadata;
      
      // Format the timestamp as a relative time (e.g., "2 hours ago")
      const timestamp = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });
      
      // Determine user name with proper fallbacks
      let userName = 'Unknown User';
      if (activity.actor_id === 'system' || activity.actor_id === null) {
        userName = 'System';
      } else if (activity.actor_id) {
        // Check if actor_id is a numeric database ID that needs resolution
        if (/^\d+$/.test(activity.actor_id)) {
          const databaseId = parseInt(activity.actor_id)
          const clerkId = userIdToClerkId[databaseId]
          if (clerkId && userNames[clerkId]) {
            userName = userNames[clerkId]
          } else if (activity.actor_name) {
            userName = activity.actor_name
          } else {
            // Fallback for database IDs without resolved names
            userName = `User #${databaseId}`
          }
        } else {
          // Direct Clerk ID - check if it's not a test ID
          if (!isTestClerkId(activity.actor_id) && userNames[activity.actor_id]) {
            userName = userNames[activity.actor_id]
          } else if (activity.actor_name) {
            userName = activity.actor_name
          } else if (isTestClerkId(activity.actor_id)) {
            // Provide a better name for test users
            userName = formatTestUserName(activity.actor_id)
          }
        }
      } else if (activity.actor_name) {
        userName = activity.actor_name;
      }
      
      // Map action to a type for the frontend
      let type = determineActivityType(activity.action, activity.target_type);
      let formattedDetails = activity.description || formatActivityDetails(activity, metadata);
      
      return {
        id: activity.id,
        type,
        user: userName,
        timestamp,
        details: formattedDetails,
        proposalId: activity.proposal_id,
        proposalNumber: activity.proposal_number,
        userId: activity.actor_id,
        action: activity.action,
        created_at: activity.created_at,
        entityType: activity.target_type,
        entityId: activity.target_id,
        status: activity.status
      };
    });
    
    return NextResponse.json({
      success: true,
      activities: formattedActivities
    });
  } catch (error) {
    console.error("Error fetching activity log:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activity log" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to determine activity type based on action and entity_type
 */
function determineActivityType(action: string, entityType: string): string {
  // If entity_type is already set, use that as the primary guide
  if (entityType && entityType !== 'none') {
    switch (entityType) {
      case 'proposal': return 'proposal';
      case 'user': return 'permissions';
      case 'pricing': return 'pricing_update';
      case 'financing': return 'financing_update';
      case 'approval': return 'approval';
      case 'system': return 'system';
      default: return 'default';
    }
  }
  
  // Fall back to determining type from action
  if (action.includes('proposal') || action.includes('update_status')) {
    return 'proposal';
  } else if (action === 'update_permissions') {
    return 'permissions';
  } else if (action === 'update_pricing_table') {
    return 'pricing_update';
  } else if (action === 'update_financing_table') {
    return 'financing_update';
  } else if (['request_discount', 'approved_discount', 'rejected_discount'].includes(action)) {
    return 'approval';
  }
  
  return 'default';
}

/**
 * Helper function to format activity details based on action type
 */
function formatActivityDetails(activity: any, metadata: any): string {
  const action = activity.action;
  
  switch (action) {
    case "update_permissions":
      return `Updated permissions for ${metadata.targetUserName || 'user'}`;
      
    case "create_proposal":
      return `Created proposal ${activity.proposal_number || metadata.proposalNumber}${
        activity.customer_name ? ` for ${activity.customer_name}` : ''
      }`;
      
    case "update_status_sent":
    case "send_proposal":
      return `Sent proposal ${activity.proposal_number || metadata.proposalNumber}${
        activity.customer_name ? ` to ${activity.customer_name}` : ''
      }`;
      
    case "update_status_viewed":
      return `Proposal ${activity.proposal_number || metadata.proposalNumber} was viewed`;
      
    case "update_status_signed":
      return `Proposal ${activity.proposal_number || metadata.proposalNumber} was signed`;
      
    case "approve_discount":
    case "reject_discount":
      const requestAmount = metadata.requestedValue ? 
        `$${parseFloat(metadata.requestedValue).toLocaleString()}` : '';
      const action = activity.action === 'approve_discount' ? 'Approved' : 'Rejected';
      return `${action} discount request ${requestAmount ? `of ${requestAmount}` : ''} for Proposal ${activity.proposal_number || ''}`;
      
    case "request_discount":
      const amount = metadata.requestedValue ? 
        `$${parseFloat(metadata.requestedValue).toLocaleString()}` : '';
      const percent = metadata.discountPercent ? 
        `${parseFloat(metadata.discountPercent).toFixed(1)}%` : '';
      return `Requested discount ${amount ? `of ${amount}` : ''}${percent ? ` (${percent})` : ''} for Proposal ${activity.proposal_number || ''}`;
      
    case "update_pricing_table":
      const pricingAction = metadata.action || 'updated';
      const category = metadata.category || '';
      const rateName = metadata.rateName || '';
      return `${capitalize(pricingAction)} pricing ${category ? `for ${category}` : ''}${rateName ? ` (${rateName})` : ''}`;
      
    case "update_financing_table":
      const financeAction = metadata.changeType || 'updated';
      const provider = metadata.provider || '';
      const planName = metadata.planName || '';
      return `${capitalize(financeAction)} financing plan ${planName ? `${planName}` : ''}${provider ? ` from ${provider}` : ''}`;
      
    default:
      return activity.action.replace(/_/g, ' ');
  }
}

/**
 * POST /api/admin/activity
 * Creates a new activity log entry
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      action, 
      action_category,
      description,
      actor_id, 
      actor_type,
      actor_name,
      target_type,
      target_id,
      target_identifier,
      proposal_id, 
      approval_request_id,
      metadata,
      status = 'success'
    } = await request.json();
    
    // Validate required fields
    if (!action) {
      return NextResponse.json({ 
        success: false, 
        error: "Action is required" 
      }, { status: 400 });
    }
    
    // Get current user if actor_id not provided
    let actorId = actor_id;
    if (!actorId) {
      const { userId: currentUserId } = await auth();
      actorId = currentUserId || 'system';
    }
    
    // Determine target type if not provided
    const targetType = target_type || determineEntityTypeFromAction(action);
    
    // Insert the activity log with enhanced fields
    const result = await executeQuery(
      `INSERT INTO activity_log (
        action, action_category, description, 
        actor_id, actor_type, actor_name,
        target_type, target_id, target_identifier,
        proposal_id, approval_request_id, 
        metadata, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, created_at`,
      [
        action, 
        action_category || determineActionCategory(action),
        description || null,
        actorId, 
        actor_type || 'user',
        actor_name || null,
        targetType,
        target_id || null,
        target_identifier || null,
        proposal_id || null,
        approval_request_id || null,
        JSON.stringify(metadata || {}),
        status || 'success'
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: "Activity logged successfully",
      activity: {
        id: result[0].id,
        created_at: result[0].created_at
      }
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log activity" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to determine entity type from action
 */
function determineEntityTypeFromAction(action: string): string {
  if (action.includes('proposal') || action.includes('update_status')) {
    return 'proposal';
  } else if (action === 'update_permissions') {
    return 'user';
  } else if (action === 'update_pricing_table') {
    return 'pricing';
  } else if (action === 'update_financing_table') {
    return 'financing';
  } else if (['request_discount', 'approved_discount', 'rejected_discount'].includes(action)) {
    return 'approval';
  }
  
  return 'none';
}

/**
 * Helper function to determine action category from action
 */
function determineActionCategory(action: string): string {
  if (action.includes('proposal') || action.includes('update_status')) {
    return 'proposal';
  } else if (action === 'update_permissions') {
    return 'user';
  } else if (action === 'update_pricing_table') {
    return 'pricing';
  } else if (action === 'update_financing_table') {
    return 'financing';
  } else if (['request_discount', 'approve_discount', 'reject_discount'].includes(action)) {
    return 'approval';
  }
  
  return 'system';
}

/**
 * Helper function to capitalize the first letter of a string
 */
function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Helper function to check if a clerk_id is a test ID
 */
function isTestClerkId(clerk_id: string): boolean {
  if (!clerk_id) return true;
  
  // Common patterns for fake/test clerk IDs
  const testPatterns = [
    /^test_/i,              // Starts with "test_"
    /^demo_/i,              // Starts with "demo_"
    /^fake_/i,              // Starts with "fake_"
    /^admin-default$/i,     // Exact match "admin-default"
    /^user_\d+_\d+$/,      // Pattern like "user_38_774589"
    /test.*user/i,          // Contains "test" and "user"
    /demo.*user/i,          // Contains "demo" and "user"
    /^\d+$/,                // Just numeric (database ID)
  ];
  
  // Check if clerk_id matches any test pattern
  return testPatterns.some(pattern => pattern.test(clerk_id));
}

/**
 * Helper function to format test user name
 */
function formatTestUserName(clerk_id: string): string {
  if (!clerk_id) return 'Test User';
  
  // Extract meaningful parts from test clerk_ids
  if (clerk_id.startsWith('demo_manager')) return 'Demo Manager';
  if (clerk_id.startsWith('demo_rep')) return 'Demo Sales Rep';
  if (clerk_id.startsWith('demo_')) return 'Demo User';
  if (clerk_id.startsWith('test_')) return 'Test User';
  if (clerk_id === 'admin-default') return 'Default Admin';
  if (/^user_\d+_\d+$/.test(clerk_id)) {
    // Extract the first number from patterns like "test_user_38_774589"
    const match = clerk_id.match(/user_(\d+)_/);
    return match ? `Test User #${match[1]}` : 'Test User';
  }
  
  // Generic fallback
  return 'Test User';
} 