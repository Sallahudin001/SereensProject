import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth-utils"
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
    
    // Check if user is admin
    const admin = await isAdmin();
    
    let query;
    let params: any[];
    
    if (admin) {
      // Admin users can see all customers
      query = `
        SELECT 
          c.*,
          COUNT(p.id) as proposal_count
        FROM 
          customers c
        LEFT JOIN 
          proposals p ON c.id = p.customer_id
        GROUP BY 
          c.id
        ORDER BY 
          c.name ASC
      `;
      params = [];
    } else {
      // Regular users can only see customers linked to their proposals
      query = `
        SELECT 
          c.*,
          COUNT(p.id) as proposal_count
        FROM 
          customers c
        INNER JOIN 
          proposals p ON c.id = p.customer_id
        WHERE 
          p.user_id = $1
        GROUP BY 
          c.id
        ORDER BY 
          c.name ASC
      `;
      params = [userId];
    }
    
    const customers = await executeQuery(query, params);

    return NextResponse.json({ success: true, customers })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch customers" }, { status: 500 })
  }
}
//pushing