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
    const isRecent = searchParams.get('recent') === 'true';
    
    const offset = (page - 1) * limit;
    
    // Base query for getting total count
    const countBaseQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM 
        proposals p
      JOIN 
        customers c ON p.customer_id = c.id
    `;
    
    const baseQuery = `
      SELECT 
        p.id, 
        p.proposal_number, 
        c.name as customer_name, 
        p.status, 
        p.total, 
        p.created_at,
        p.user_id,
        ARRAY_AGG(s.display_name) as services
      FROM 
        proposals p
      JOIN 
        customers c ON p.customer_id = c.id
      LEFT JOIN 
        proposal_services ps ON p.id = ps.proposal_id
      LEFT JOIN 
        services s ON ps.service_id = s.id
      GROUP BY 
        p.id, p.proposal_number, c.name, p.status, p.total, p.created_at, p.user_id
      ORDER BY 
        p.created_at DESC
    `;
    
    // Apply RBAC filter for count
    const { query: countQuery, params: countParams } = applyRBACFilter(countBaseQuery, [], context, 'user_id', 'p');
    const countResult = await executeQuery(countQuery, countParams);
    const totalCount = parseInt(countResult[0]?.total || '0');
    
    // Apply RBAC filter for data
    let { query, params } = applyRBACFilter(baseQuery, [], context, 'user_id', 'p');
    
    // Add pagination or recent limit
    if (isRecent) {
      // For dashboard - get recent 10 proposals
      query += ` LIMIT 10`;
    } else {
      // For proposals page - add pagination
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
    }
    
    const proposals = await executeQuery(query, params);

    return NextResponse.json({ 
      success: true, 
      proposals,
      userRole: context.role,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1
    });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch proposals" }, { status: 500 });
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
    
    // Add the user_id to the proposal data
    const proposalData = {
      ...data,
      user_id: context.userId,
      created_by: context.userId
    };
    
    // Here you would implement the proposal creation logic
    // For now, returning a placeholder response
    return NextResponse.json({ 
      success: true, 
      message: "Proposal creation endpoint - implement as needed",
      data: proposalData
    });
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json({ success: false, error: "Failed to create proposal" }, { status: 500 });
  }
}
