import { executeQuery } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/admin/dashboard
 * Retrieves metrics for the admin dashboard
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
    
    // Get dashboard metrics data
    
    // 1. Get proposals metrics
    const proposalsMetrics = await executeQuery(`
      SELECT 
        COUNT(*) AS total_count,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS last_month_count,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '60 days' 
                 AND created_at < NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS previous_month_count
      FROM proposals
    `);
    
    const totalProposals = parseInt(proposalsMetrics[0]?.total_count) || 0;
    const lastMonthProposals = parseInt(proposalsMetrics[0]?.last_month_count) || 0;
    const previousMonthProposals = parseInt(proposalsMetrics[0]?.previous_month_count) || 0;
    
    // Calculate month-over-month change
    const proposalsChange = previousMonthProposals > 0 
      ? ((lastMonthProposals - previousMonthProposals) / previousMonthProposals) * 100 
      : 0;
    
    // 2. First check if is_active column exists in services table
    let activeProducts = 0;
    let totalProducts = 0;
    let lastMonthProducts = 0;
    let previousMonthProducts = 0;
    let productsChange = 0;
    
    try {
      const columnCheck = await executeQuery(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'services' AND column_name = 'is_active'
        ) AS exists
      `);
      
      const isActiveExists = columnCheck[0]?.exists === true;
      
      if (isActiveExists) {
        // Use is_active column if it exists
        const productsMetrics = await executeQuery(`
          SELECT 
            COUNT(*) AS total_count,
            COUNT(CASE WHEN is_active = true THEN 1 END) AS active_count,
            SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS last_month_count,
            SUM(CASE WHEN created_at >= NOW() - INTERVAL '60 days' 
                     AND created_at < NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS previous_month_count
          FROM services
        `);
        
        totalProducts = parseInt(productsMetrics[0]?.total_count) || 0;
        activeProducts = parseInt(productsMetrics[0]?.active_count) || 0;
        lastMonthProducts = parseInt(productsMetrics[0]?.last_month_count) || 0;
        previousMonthProducts = parseInt(productsMetrics[0]?.previous_month_count) || 0;
      } else {
        // If is_active doesn't exist, count all as active
        const productsMetrics = await executeQuery(`
          SELECT 
            COUNT(*) AS total_count,
            COUNT(*) AS active_count,
            SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS last_month_count,
            SUM(CASE WHEN created_at >= NOW() - INTERVAL '60 days' 
                     AND created_at < NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS previous_month_count
          FROM services
        `);
        
        totalProducts = parseInt(productsMetrics[0]?.total_count) || 0;
        activeProducts = totalProducts; // All are considered active
        lastMonthProducts = parseInt(productsMetrics[0]?.last_month_count) || 0;
        previousMonthProducts = parseInt(productsMetrics[0]?.previous_month_count) || 0;
      }
      
      // Calculate month-over-month change
      productsChange = previousMonthProducts > 0 
        ? ((lastMonthProducts - previousMonthProducts) / previousMonthProducts) * 100 
        : 0;
    } catch (error) {
      console.error("Error checking services table:", error);
      // Set default values in case of error
      totalProducts = 0;
      activeProducts = 0;
      lastMonthProducts = 0;
      previousMonthProducts = 0;
      productsChange = 0;
    }
    
    // 3. Get pending approvals count
    const approvalsMetrics = await executeQuery(`
      SELECT 
        COUNT(*) AS total_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_count,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS last_month_count,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '60 days' 
                 AND created_at < NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) AS previous_month_count
      FROM approval_requests
    `);
    
    const totalApprovals = parseInt(approvalsMetrics[0]?.total_count) || 0;
    const pendingApprovals = parseInt(approvalsMetrics[0]?.pending_count) || 0;
    const lastMonthApprovals = parseInt(approvalsMetrics[0]?.last_month_count) || 0;
    const previousMonthApprovals = parseInt(approvalsMetrics[0]?.previous_month_count) || 0;
    
    // Calculate month-over-month change (negative is good - fewer pending approvals)
    const approvalsChange = previousMonthApprovals > 0 
      ? ((lastMonthApprovals - previousMonthApprovals) / previousMonthApprovals) * -100 
      : 0;
    
    // 4. Get revenue metrics
    const revenueMetrics = await executeQuery(`
      SELECT 
        SUM(total) AS total_revenue,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN total ELSE 0 END) AS last_month_revenue,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '60 days' 
                 AND created_at < NOW() - INTERVAL '30 days' THEN total ELSE 0 END) AS previous_month_revenue
      FROM proposals
      WHERE status IN ('signed', 'completed')
    `);
    
    const totalRevenue = parseFloat(revenueMetrics[0]?.total_revenue) || 0;
    const lastMonthRevenue = parseFloat(revenueMetrics[0]?.last_month_revenue) || 0;
    const previousMonthRevenue = parseFloat(revenueMetrics[0]?.previous_month_revenue) || 0;
    
    // Calculate month-over-month change
    const revenueChange = previousMonthRevenue > 0 
      ? ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0;
    
    // Return all metrics
    return NextResponse.json({
      success: true,
      metrics: [
        {
          id: "proposals",
          name: "Proposals Created",
          value: totalProposals,
          change: parseFloat(proposalsChange.toFixed(1)),
          trend: proposalsChange >= 0 ? "up" : "down"
        },
        {
          id: "products",
          name: "Active Products",
          value: activeProducts,
          change: parseFloat(productsChange.toFixed(1)),
          trend: productsChange >= 0 ? "up" : "down"
        },
        {
          id: "approvals",
          name: "Pending Approvals",
          value: pendingApprovals,
          change: parseFloat(approvalsChange.toFixed(1)),
          trend: approvalsChange >= 0 ? "up" : "down" // Negative change is good for pending approvals
        }
      ]
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard metrics" },
      { status: 500 }
    );
  }
} 