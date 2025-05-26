import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { isAdmin } from "@/lib/auth-utils"

// Helper to format date for SQL queries
const formatDateForSQL = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split("T")[0]
}

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
    const timeRange = searchParams.get("timeRange") || "30"
    const daysAgo = Number.parseInt(timeRange)

    const startDate = formatDateForSQL(daysAgo)
    
    // Get user info for filtering
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Check if user is admin
    const admin = await isAdmin();
    
    // User filter condition
    const userFilter = admin ? "" : "AND p.user_id = $2";
    const userParams = admin ? [] : [userId];

    // Fetch proposal status distribution
    const statusDistribution = await sql`
      SELECT status, COUNT(*) as count
      FROM proposals p
      WHERE created_at >= ${startDate} ${userFilter ? sql`AND p.user_id = ${userId}` : sql``}
      GROUP BY status
      ORDER BY count DESC
    ` || [];

    // Fetch revenue trend (monthly)
    const revenueTrend = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(total) as revenue
      FROM proposals p
      WHERE created_at >= ${startDate} ${userFilter ? sql`AND p.user_id = ${userId}` : sql``}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    ` || [];

    // Fetch popular services
    const popularServices = await sql`
      SELECT 
        s.name as product_type, 
        COUNT(*) as count
      FROM proposal_services ps
      JOIN proposals p ON p.id = ps.proposal_id
      JOIN services s ON s.id = ps.service_id
      WHERE p.created_at >= ${startDate} ${userFilter ? sql`AND p.user_id = ${userId}` : sql``}
      GROUP BY s.name
      ORDER BY count DESC
      LIMIT 5
    ` || [];

    // Fetch conversion rate
    const conversionRate = await sql`
      WITH proposal_counts AS (
        SELECT 
          DATE_TRUNC('week', created_at) as week,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'signed' THEN 1 END) as signed
        FROM proposals p
        WHERE created_at >= ${startDate} ${userFilter ? sql`AND p.user_id = ${userId}` : sql``}
        GROUP BY DATE_TRUNC('week', created_at)
      )
      SELECT 
        week,
        total,
        signed,
        CASE 
          WHEN total > 0 THEN (signed * 100.0 / total)::numeric(10,2)
          ELSE 0 
        END as rate
      FROM proposal_counts
      ORDER BY week
    ` || [];

    return NextResponse.json({
      statusDistribution: statusDistribution || [],
      revenueTrend: revenueTrend || [],
      popularServices: popularServices || [],
      conversionRate: conversionRate || [],
    })
  } catch (error) {
    console.error("Error fetching report data:", error)
    return NextResponse.json({ 
      error: "Failed to fetch report data",
      statusDistribution: [],
      revenueTrend: [],
      popularServices: [],
      conversionRate: []
    }, { status: 500 })
  }
}
