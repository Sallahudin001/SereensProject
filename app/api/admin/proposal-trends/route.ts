import { executeQuery } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/admin/proposal-trends
 * Retrieves monthly proposal trends data for the admin dashboard chart
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user ID for authorization check
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    // Get monthly proposal trends for the last 12 months
    const trendsData = await executeQuery(`
      WITH monthly_data AS (
        SELECT 
          DATE_TRUNC('month', created_at) AS month,
          COUNT(*) AS proposals_count,
          COUNT(CASE WHEN status IN ('signed', 'completed') THEN 1 END) AS signed_count,
          SUM(CASE WHEN status IN ('signed', 'completed') THEN COALESCE(total, 0) ELSE 0 END) AS revenue
        FROM proposals 
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      )
      SELECT 
        month,
        proposals_count,
        signed_count,
        COALESCE(revenue, 0) as revenue,
        CASE 
          WHEN proposals_count > 0 THEN ROUND((signed_count::decimal / proposals_count::decimal) * 100, 1)
          ELSE 0 
        END as conversion_rate
      FROM monthly_data
      ORDER BY month ASC
    `);

    // Format the data for the chart
    const chartData = trendsData.map((row: any) => ({
      month: row.month,
      proposals: parseInt(row.proposals_count) || 0,
      signed: parseInt(row.signed_count) || 0,
      revenue: parseFloat(row.revenue) || 0,
      conversionRate: parseFloat(row.conversion_rate) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error("Error fetching proposal trends:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch proposal trends" },
      { status: 500 }
    );
  }
} 