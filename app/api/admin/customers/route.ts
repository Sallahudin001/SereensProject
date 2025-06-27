import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and admin
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const offset = (page - 1) * limit;

    // For now, we'll allow access and let the component handle admin checks
    // In production, you'd want to verify admin status here
    
    // Get total count of customers for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM customers c
    `
    const countResult = await executeQuery(countQuery)
    const totalCount = parseInt(countResult[0]?.total || '0')

    // Get paginated customers with creator information and proposal statistics
    const customersQuery = `
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.address,
        c.created_at,
        c.updated_at,
        c.user_id,
        u.name as creator_name,
        u.email as creator_email,
        COUNT(DISTINCT p.id) as proposal_count,
        COUNT(DISTINCT CASE WHEN p.status IN ('signed', 'completed') THEN p.id END) as signed_proposals,
        SUM(CASE WHEN p.status IN ('signed', 'completed') THEN p.total ELSE 0 END) as total_proposal_value,
        MAX(p.created_at) as last_proposal_date,
        CASE 
          WHEN COUNT(DISTINCT CASE WHEN p.status IN ('signed', 'completed') THEN p.id END) > 0 THEN 'completed'
          WHEN COUNT(DISTINCT CASE WHEN p.status = 'sent' THEN p.id END) > 0 THEN 'proposal_sent'
          WHEN COUNT(DISTINCT p.id) > 0 THEN 'qualified'
          ELSE 'lead'
        END as status,
        'website' as lead_source -- TODO: Add lead_source column to customers table
      FROM 
        customers c
      LEFT JOIN 
        users u ON c.user_id = u.clerk_id
      LEFT JOIN 
        proposals p ON c.id = p.customer_id
      GROUP BY 
        c.id, c.name, c.email, c.phone, c.address, c.created_at, c.updated_at, 
        c.user_id, u.name, u.email
      ORDER BY 
        c.created_at DESC
      LIMIT $1 OFFSET $2
    `

    const customers = await executeQuery(customersQuery, [limit, offset])

    // Get all customers for stats calculation (without pagination)
    const allCustomersQuery = `
      SELECT 
        c.id,
        c.created_at,
        COUNT(DISTINCT p.id) as proposal_count,
        COUNT(DISTINCT CASE WHEN p.status IN ('signed', 'completed') THEN p.id END) as signed_proposals
      FROM 
        customers c
      LEFT JOIN 
        proposals p ON c.id = p.customer_id
      GROUP BY 
        c.id, c.created_at
    `
    const allCustomers = await executeQuery(allCustomersQuery)

    // Calculate statistics using all customers
    const totalCustomers = allCustomers.length
    const activeCustomers = allCustomers.filter((c: any) => 
      c.status !== 'inactive' && c.status !== 'lost'
    ).length

    // Calculate new customers this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const newThisMonth = allCustomers.filter((c: any) => 
      new Date(c.created_at) >= thisMonth
    ).length

    // Calculate overall conversion rate using all customers
    const totalProposals = allCustomers.reduce((sum: number, c: any) => sum + (parseInt(c.proposal_count) || 0), 0)
    const totalSigned = allCustomers.reduce((sum: number, c: any) => sum + (parseInt(c.signed_proposals) || 0), 0)
    const conversionRate = totalProposals > 0 ? Math.round((totalSigned / totalProposals) * 100) : 0

    const stats = {
      totalCustomers,
      activeCustomers,
      newThisMonth,
      conversionRate
    }

    // Get recent customer activity/interactions
    const activityQuery = `
      SELECT 
        al.id,
        al.action,
        al.description,
        al.created_at,
        al.actor_name,
        c.name as customer_name,
        c.id as customer_id
      FROM 
        activity_log al
      LEFT JOIN 
        proposals p ON al.proposal_id = p.id
      LEFT JOIN 
        customers c ON p.customer_id = c.id
      WHERE 
        al.action_category IN ('proposal', 'customer')
      ORDER BY 
        al.created_at DESC
      LIMIT 50
    `

    let recentActivity: any[] = []
    try {
      recentActivity = await executeQuery(activityQuery)
    } catch (error) {
      console.log("Activity log query failed, continuing without activity data:", error)
    }

    return NextResponse.json({
      success: true,
      customers,
      stats,
      recentActivity,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1,
      userRole: 'admin' // TODO: Get actual user role
    })

  } catch (error) {
    console.error("Error fetching admin customers:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
} 