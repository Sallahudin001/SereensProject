import { executeQuery } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getRBACContext, applyRBACFilter } from "@/lib/rbac"

export async function GET(request: NextRequest) {
  try {
    // Get RBAC context
    const context = await getRBACContext();
    
    if (!context) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const offset = (page - 1) * limit;
    
    let countQuery;
    let query;
    let params: any[] = [];
    let countParams: any[] = [];
    
    if (context.isAdmin) {
      // Admin users can see all customers with proposal count
      countQuery = `
        SELECT COUNT(DISTINCT c.id) as total
        FROM customers c
      `;
      
      query = `
        SELECT 
          c.*,
          COUNT(DISTINCT p.id) as proposal_count,
          COUNT(DISTINCT CASE WHEN p.status IN ('signed', 'completed') THEN p.id END) as signed_proposals
        FROM 
          customers c
        LEFT JOIN 
          proposals p ON c.id = p.customer_id
        GROUP BY 
          c.id
        ORDER BY 
          c.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      params = [limit, offset];
    } else {
      // Regular users see customers from their proposals
      countQuery = `
        SELECT COUNT(DISTINCT c.id) as total
        FROM customers c
        INNER JOIN proposals p ON c.id = p.customer_id
        WHERE p.user_id = $1
      `;
      countParams = [context.userId];
      
      query = `
        SELECT 
          c.*,
          COUNT(DISTINCT p.id) as proposal_count,
          COUNT(DISTINCT CASE WHEN p.status IN ('signed', 'completed') THEN p.id END) as signed_proposals
        FROM 
          customers c
        INNER JOIN 
          proposals p ON c.id = p.customer_id
        WHERE 
          p.user_id = $1
        GROUP BY 
          c.id
        ORDER BY 
          c.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      params = [context.userId, limit, offset];
    }

    // Get total count
    const countResult = await executeQuery(countQuery, countParams);
    const totalCount = parseInt(countResult[0]?.total || '0');
    
    // Get paginated data
    const customers = await executeQuery(query, params);

    return NextResponse.json({ 
      success: true, 
      customers,
      userRole: context.role,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get RBAC context
    const context = await getRBACContext();
    
    if (!context) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Insert new customer with user association
    const result = await executeQuery(
      `
      INSERT INTO customers (name, email, phone, address, user_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        user_id = CASE 
          WHEN customers.user_id IS NULL THEN EXCLUDED.user_id
          ELSE customers.user_id
        END,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
      `,
      [data.name, data.email, data.phone || null, data.address || null, context.userId]
    );

    return NextResponse.json({ 
      success: true, 
      customer: result[0]
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json({ success: false, error: "Failed to create customer" }, { status: 500 });
  }
}
//pushing