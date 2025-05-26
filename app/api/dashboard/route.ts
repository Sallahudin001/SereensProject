import { executeQuery, sql } from "@/lib/db"
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
    // Get current user's ID
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    
    // Check if user is admin
    const admin = await isAdmin();
    
    // Build where clause based on user role
    const whereClause = admin ? "" : "WHERE user_id = $1";
    const params = admin ? [] : [userId];
    
    // Get total proposals count
    const totalProposalsResult = await executeQuery(`
      SELECT COUNT(*) as total FROM proposals ${whereClause}
    `, params);
    const totalProposals = parseInt(totalProposalsResult[0]?.total) || 0;

    // Get active customers count
    const activeCustomersResult = await executeQuery(`
      SELECT COUNT(DISTINCT customer_id) as active 
      FROM proposals 
      ${whereClause ? whereClause + " AND" : "WHERE"} status NOT IN ('completed', 'cancelled')
    `, params);
    const activeCustomers = parseInt(activeCustomersResult[0]?.active) || 0;

    // Get conversion rate (signed / total)
    const conversionRateResult = await executeQuery(`
      SELECT 
        COUNT(CASE WHEN status = 'signed' OR status = 'completed' THEN 1 END) as converted,
        COUNT(*) as total,
        CASE 
          WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(CASE WHEN status = 'signed' OR status = 'completed' THEN 1 END) * 100.0 / COUNT(*))::numeric, 1)
          ELSE 0 
        END as rate
      FROM proposals
      ${whereClause}
    `, params);
    const conversionRate = parseFloat(conversionRateResult[0]?.rate) || 0;

    return NextResponse.json({
      success: true,
      metrics: {
        totalProposals,
        activeCustomers,
        conversionRate
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard metrics" }, { status: 500 });
  }
} 