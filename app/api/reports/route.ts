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
    
    const { searchParams } = new URL(request.url);
    const timeRange = parseInt(searchParams.get('timeRange') || '30');
    
    // 1. Status Distribution with RBAC
    const statusQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM proposals
      WHERE created_at >= NOW() - INTERVAL '${timeRange} days'
      GROUP BY status
    `;
    const { query: statusFilteredQuery, params: statusParams } = applyRBACFilter(
      statusQuery,
      [],
      context
    );
    const statusDistribution = await executeQuery(statusFilteredQuery, statusParams);
    
    // 2. Revenue Trend with RBAC
    const revenueQuery = `
      SELECT 
        DATE_TRUNC('week', created_at) as week,
        SUM(total) as revenue
      FROM proposals
      WHERE created_at >= NOW() - INTERVAL '${timeRange} days'
        AND status IN ('signed', 'completed')
      GROUP BY week
      ORDER BY week
    `;
    const { query: revenueFilteredQuery, params: revenueParams } = applyRBACFilter(
      revenueQuery,
      [],
      context
    );
    const revenueTrend = await executeQuery(revenueFilteredQuery, revenueParams);
    
    // 3. Popular Services with RBAC
    const servicesQuery = `
      SELECT 
        s.display_name as service,
        COUNT(ps.proposal_id) as count
      FROM services s
      LEFT JOIN proposal_services ps ON s.id = ps.service_id
      LEFT JOIN proposals p ON ps.proposal_id = p.id
      WHERE p.created_at >= NOW() - INTERVAL '${timeRange} days'
      GROUP BY s.display_name
      ORDER BY count DESC
      LIMIT 10
    `;
    const { query: servicesFilteredQuery, params: servicesParams } = applyRBACFilter(
      servicesQuery,
      [],
      context,
      'user_id',
      'p'
    );
    const popularServices = await executeQuery(servicesFilteredQuery, servicesParams);
    
    // 4. Conversion Rate Trend with RBAC
    const conversionQuery = `
      SELECT 
        DATE_TRUNC('week', created_at) as week,
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('signed', 'completed') THEN 1 END) as converted,
        CASE 
          WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(CASE WHEN status IN ('signed', 'completed') THEN 1 END) * 100.0 / COUNT(*))::numeric, 1)
          ELSE 0 
        END as rate
      FROM proposals
      WHERE created_at >= NOW() - INTERVAL '${timeRange} days'
      GROUP BY week
      ORDER BY week
    `;
    const { query: conversionFilteredQuery, params: conversionParams } = applyRBACFilter(
      conversionQuery,
      [],
      context
    );
    const conversionRate = await executeQuery(conversionFilteredQuery, conversionParams);
    
    // 5. Top Customers with RBAC
    const customersQuery = `
      SELECT 
        c.name as customer,
        COUNT(p.id) as proposals,
        SUM(CASE WHEN p.status IN ('signed', 'completed') THEN p.total ELSE 0 END) as revenue
      FROM customers c
      INNER JOIN proposals p ON c.id = p.customer_id
      WHERE p.created_at >= NOW() - INTERVAL '${timeRange} days'
      GROUP BY c.name
      ORDER BY revenue DESC
      LIMIT 10
    `;
    const { query: customersFilteredQuery, params: customersParams } = applyRBACFilter(
      customersQuery,
      [],
      context,
      'user_id',
      'p'
    );
    const topCustomers = await executeQuery(customersFilteredQuery, customersParams);
    
    return NextResponse.json({
      statusDistribution,
      revenueTrend,
      popularServices,
      conversionRate,
      topCustomers,
      timeRange,
      userRole: context.role,
      dataScope: context.isAdmin ? 'all' : 'user'
    });
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch report data" 
    }, { status: 500 });
  }
}
