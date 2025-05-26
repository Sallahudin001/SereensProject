import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { isAdmin } from "@/lib/auth-utils"

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    
    if (!status) {
      return NextResponse.json({ 
        success: false, 
        error: "Status parameter is required" 
      }, { status: 400 })
    }
    
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    
    // Check if user is admin
    const admin = await isAdmin();
    
    // Build query based on user role
    let whereClause: string, params: any[];
    
    if (admin) {
      whereClause = "WHERE p.status = $1";
      params = [status];
    } else {
      whereClause = "WHERE p.status = $1 AND p.user_id = $2";
      params = [status, userId];
    }
    
    const query = `
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
      ${whereClause}
      GROUP BY 
        p.id, c.name
      ORDER BY 
        p.created_at DESC
    `;
    
    const proposals = await executeQuery(query, params);

    return NextResponse.json({ success: true, proposals })
  } catch (error) {
    console.error(`Error fetching proposals with status:`, error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch proposals" 
    }, { status: 500 })
  }
} 