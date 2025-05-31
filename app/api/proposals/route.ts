import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"
import { applyUserFilter } from "@/lib/auth-utils"
import { auth } from "@clerk/nextjs/server"

// Helper function to get the current user ID
async function getCurrentUserId() {
  try {
    const { userId } = await auth();
    return userId;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
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
        p.id, p.proposal_number, c.name, p.status, p.total, p.created_at
      ORDER BY 
        p.created_at DESC
    `
    
    // Apply user filtering based on role
    const { query, params } = await applyUserFilter(baseQuery, [] as any[], 'user_id', 'p');
    const proposals = await executeQuery(query, params);

    return NextResponse.json({ success: true, proposals })
  } catch (error) {
    console.error("Error fetching proposals:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch proposals" }, { status: 500 })
  }
}
