import { executeQuery } from "@/lib/db"
import { NextResponse } from "next/server"
import { getRBACContext, applyRBACFilter } from "@/lib/rbac"

export async function GET() {
  try {
    // Get RBAC context
    const context = await getRBACContext();
    
    if (!context) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    
    // Get total proposals count with RBAC filter
    const proposalsQuery = `SELECT COUNT(*) as total FROM proposals`;
    const { query: filteredProposalsQuery, params: proposalsParams } = applyRBACFilter(
      proposalsQuery, 
      [], 
      context
    );
    const totalProposalsResult = await executeQuery(filteredProposalsQuery, proposalsParams);
    const totalProposals = parseInt(totalProposalsResult[0]?.total) || 0;

    // Get active customers count with RBAC filter
    const customersQuery = `
      SELECT COUNT(DISTINCT c.id) as active 
      FROM customers c
      INNER JOIN proposals p ON c.id = p.customer_id
      WHERE p.status NOT IN ('completed', 'cancelled')
    `;
    const { query: filteredCustomersQuery, params: customersParams } = applyRBACFilter(
      customersQuery, 
      [], 
      context,
      'user_id',
      'p'
    );
    const activeCustomersResult = await executeQuery(filteredCustomersQuery, customersParams);
    const activeCustomers = parseInt(activeCustomersResult[0]?.active) || 0;

    // Get conversion rate with RBAC filter
    const conversionQuery = `
      SELECT 
        COUNT(CASE WHEN status = 'signed' OR status = 'completed' THEN 1 END) as converted,
        COUNT(*) as total,
        CASE 
          WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(CASE WHEN status = 'signed' OR status = 'completed' THEN 1 END) * 100.0 / COUNT(*))::numeric, 1)
          ELSE 0 
        END as rate
      FROM proposals
    `;
    const { query: filteredConversionQuery, params: conversionParams } = applyRBACFilter(
      conversionQuery, 
      [], 
      context
    );
    const conversionRateResult = await executeQuery(filteredConversionQuery, conversionParams);
    const conversionRate = parseFloat(conversionRateResult[0]?.rate) || 0;

    // Get recent proposals with RBAC filter
    const recentProposalsQuery = `
      SELECT 
        p.id, 
        p.proposal_number, 
        c.name as customer_name, 
        p.status, 
        p.total, 
        p.created_at
      FROM 
        proposals p
      JOIN 
        customers c ON p.customer_id = c.id
      ORDER BY 
        p.created_at DESC
      LIMIT 5
    `;
    const { query: filteredRecentQuery, params: recentParams } = applyRBACFilter(
      recentProposalsQuery, 
      [], 
      context,
      'user_id',
      'p'
    );
    const recentProposals = await executeQuery(filteredRecentQuery, recentParams);

    // Get revenue metrics with RBAC filter
    const revenueQuery = `
      SELECT 
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN total ELSE 0 END), 0) as monthly_revenue
      FROM proposals
      WHERE status IN ('signed', 'completed')
    `;
    const { query: filteredRevenueQuery, params: revenueParams } = applyRBACFilter(
      revenueQuery, 
      [], 
      context
    );
    const revenueResult = await executeQuery(filteredRevenueQuery, revenueParams);
    const totalRevenue = parseFloat(revenueResult[0]?.total_revenue) || 0;
    const monthlyRevenue = parseFloat(revenueResult[0]?.monthly_revenue) || 0;

    return NextResponse.json({
      success: true,
      metrics: {
        totalProposals,
        activeCustomers,
        conversionRate,
        totalRevenue,
        monthlyRevenue
      },
      recentProposals,
      userRole: context.role,
      isAdmin: context.isAdmin
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard metrics" }, { status: 500 });
  }
} 