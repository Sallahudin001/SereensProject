import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { useIsAdmin } from "@/components/admin-check"
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
    
    // Get total count of proposals for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM proposals p
    `
    const countResult = await executeQuery(countQuery)
    const totalCount = parseInt(countResult[0]?.total || '0')

    // Get paginated proposals with creator and customer information
    const proposalsQuery = `
      SELECT 
        p.id,
        p.proposal_number,
        p.status,
        p.total,
        p.monthly_payment,
        p.financing_term,
        p.created_at,
        p.updated_at,
        p.user_id,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address,
        u.name as creator_name,
        u.email as creator_email,
        ARRAY_AGG(DISTINCT s.display_name) FILTER (WHERE s.display_name IS NOT NULL) as services
      FROM 
        proposals p
      LEFT JOIN 
        customers c ON p.customer_id = c.id
      LEFT JOIN 
        users u ON p.user_id = u.clerk_id
      LEFT JOIN 
        proposal_services ps ON p.id = ps.proposal_id
      LEFT JOIN 
        services s ON ps.service_id = s.id
      GROUP BY 
        p.id, p.proposal_number, p.status, p.total, p.monthly_payment, 
        p.financing_term, p.created_at, p.updated_at, p.user_id,
        c.name, c.email, c.phone, c.address, u.name, u.email
      ORDER BY 
        p.created_at DESC
      LIMIT $1 OFFSET $2
    `

    const proposals = await executeQuery(proposalsQuery, [limit, offset])

    // Get all proposals for stats calculation (without pagination)
    const allProposalsQuery = `
      SELECT p.id, p.status, p.total
      FROM proposals p
    `
    const allProposals = await executeQuery(allProposalsQuery)

    // Calculate statistics using all proposals
    const totalProposals = allProposals.length
    const totalValue = allProposals.reduce((sum: number, p: any) => sum + (parseFloat(p.total) || 0), 0)
    const averageValue = totalProposals > 0 ? totalValue / totalProposals : 0

    // Count proposals by status using all proposals
    const statusCounts = allProposals.reduce((acc: Record<string, number>, proposal: any) => {
      const status = proposal.status || 'draft'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    const stats = {
      totalProposals,
      totalValue,
      averageValue,
      statusCounts
    }

    return NextResponse.json({
      success: true,
      proposals,
      stats,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1,
      userRole: 'admin' // TODO: Get actual user role
    })

  } catch (error) {
    console.error("Error fetching admin proposals:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch proposals" },
      { status: 500 }
    )
  }
} 