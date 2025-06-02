import { executeQuery } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getRBACContext, applyRBACFilter } from "@/lib/rbac"

export async function GET() {
  try {
    // Get RBAC context
    const context = await getRBACContext();
    
    if (!context) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    
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
    
    // Apply RBAC filter
    const { query, params } = applyRBACFilter(baseQuery, [], context, 'user_id', 'p');
    const proposals = await executeQuery(query, params);

    return NextResponse.json({ 
      success: true, 
      proposals,
      userRole: context.role,
      totalCount: proposals.length
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
