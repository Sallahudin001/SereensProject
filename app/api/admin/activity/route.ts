import { executeQuery } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { formatDistanceToNow } from "date-fns";
import { auth } from "@clerk/nextjs/server";

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
      whereConditions.push(`al.user_id = $${paramIndex++}`);
      queryParams.push(userId);
    }
    
    if (entityType) {
      whereConditions.push(`al.entity_type = $${paramIndex++}`);
      queryParams.push(entityType);
    }
    
    if (entityId) {
      whereConditions.push(`al.entity_id = $${paramIndex++}`);
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
    
    // Query recent activities with user information and related data
    const activities = await executeQuery(`
      SELECT 
        al.id,
        al.action,
        al.details,
        al.created_at,
        al.proposal_id,
        al.user_id,
        al.entity_type,
        al.entity_id,
        al.user_reference_id,
        al.status,
        COALESCE(
          CASE 
            WHEN al.user_id = 'system' THEN 'System' 
            WHEN al.user_id IS NULL THEN 'System'
            ELSE au.first_name || ' ' || au.last_name
          END,
          'Unknown User'
        ) as user_name,
        p.proposal_number,
        p.customer_id,
        c.name as customer_name
      FROM 
        activity_log al
      LEFT JOIN 
        admin_users au ON al.user_id = au.clerk_id
      LEFT JOIN 
        proposals p ON al.proposal_id = p.id
      LEFT JOIN
        customers c ON p.customer_id = c.id
      ${whereClause}
      ORDER BY 
        al.created_at DESC
      LIMIT $${paramIndex}
    `, queryParams);
    
    // Transform the data for the frontend
    const formattedActivities = activities.map(activity => {
      // Parse the JSONB details if it's a string
      const details = typeof activity.details === 'string' 
        ? JSON.parse(activity.details) 
        : activity.details;
      
      // Format the timestamp as a relative time (e.g., "2 hours ago")
      const timestamp = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });
      
      // Map action to a type for the frontend
      let type = determineActivityType(activity.action, activity.entity_type);
      let formattedDetails = formatActivityDetails(activity, details);
      
      return {
        id: activity.id,
        type,
        user: activity.user_name,
        timestamp,
        details: formattedDetails,
        proposalId: activity.proposal_id,
        proposalNumber: activity.proposal_number,
        userId: activity.user_id,
        action: activity.action,
        created_at: activity.created_at,
        entityType: activity.entity_type,
        entityId: activity.entity_id,
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
function formatActivityDetails(activity: any, details: any): string {
  const action = activity.action;
  
  switch (action) {
    case "update_permissions":
      return `Updated permissions for ${details.targetUserName || 'user'}`;
      
    case "create_proposal":
      return `Created proposal ${activity.proposal_number || details.proposalNumber}${
        activity.customer_name ? ` for ${activity.customer_name}` : ''
      }`;
      
    case "update_status_sent":
      return `Sent proposal ${activity.proposal_number || details.proposalNumber}${
        activity.customer_name ? ` to ${activity.customer_name}` : ''
      }`;
      
    case "update_status_viewed":
      return `Proposal ${activity.proposal_number || details.proposalNumber} was viewed`;
      
    case "update_status_signed":
      return `Proposal ${activity.proposal_number || details.proposalNumber} was signed`;
      
    case "approved_discount":
    case "rejected_discount":
      const requestAmount = details.requestedValue ? 
        `$${parseFloat(details.requestedValue).toLocaleString()}` : '';
      const proposalRef = activity.proposal_number || details.proposalNumber || '';
      
      return `${action === 'approved_discount' ? 'Approved' : 'Rejected'} discount ${
        requestAmount ? requestAmount : ''
      } for proposal ${proposalRef}`;
      
    case "request_discount":
      const discountAmount = details.requestedValue ? 
        `$${parseFloat(details.requestedValue).toLocaleString()}` : '';
      const percent = details.discountPercent ? `(${details.discountPercent}%)` : '';
      
      return `Requested discount ${discountAmount} ${percent} for proposal ${
        activity.proposal_number || details.proposalNumber
      }`;
      
    case "update_pricing_table":
      const pricingAction = details.action ? details.action : 'updated';
      
      return `${pricingAction.charAt(0).toUpperCase() + pricingAction.slice(1)} pricing for ${
        details.category || 'services'
      }${details.rateName ? `: ${details.rateName}` : ''}`;
      
    case "update_financing_table":
      const changeType = details.changeType ? details.changeType : 'updated';
      const planInfo = details.planName || details.planNumber || '';
      
      let formattedDetails = `${changeType.charAt(0).toUpperCase() + changeType.slice(1)} financing plan`;
      if (planInfo) {
        formattedDetails += `: ${planInfo}`;
      }
      if (details.provider) {
        formattedDetails += ` (${details.provider})`;
      }
      return formattedDetails;
      
    case "send_proposal_email":
      return `Sent proposal ${activity.proposal_number || details.proposalNumber} email`;
      
    case "provide_rejection_feedback":
      return `Customer provided rejection feedback for proposal ${
        activity.proposal_number || details.proposalNumber
      }`;
      
    default:
      // Handle other action types
      return `${action.replace(/_/g, ' ')}`;
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
      user_id, 
      proposal_id, 
      details,
      entity_type,
      entity_id,
      user_reference_id,
      status
    } = await request.json();
    
    // Validate required fields
    if (!action) {
      return NextResponse.json({ 
        success: false, 
        error: "Action is required" 
      }, { status: 400 });
    }
    
    // Get current user if user_id not provided
    let userId = user_id;
    if (!userId) {
      const { userId: currentUserId } = await auth();
      userId = currentUserId || 'system';
    }
    
    // Determine entity type if not provided
    const entityType = entity_type || determineEntityTypeFromAction(action);
    
    // Insert the activity log with enhanced fields
    const result = await executeQuery(
      `INSERT INTO activity_log (
        action, user_id, details, proposal_id, 
        entity_type, entity_id, user_reference_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at`,
      [
        action, 
        userId, 
        JSON.stringify(details || {}), 
        proposal_id || null,
        entityType,
        entity_id || null,
        user_reference_id || null,
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