import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { useIsAdmin } from "@/components/admin-check"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  try {
    // Check if user is authenticated and admin
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // For now, we'll allow access and let the component handle admin checks
    // In production, you'd want to verify admin status here
    
    // Get all proposals with creator and customer information
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
    `

    const proposals = await executeQuery(proposalsQuery)

    // Calculate statistics
    const totalProposals = proposals.length
    const totalValue = proposals.reduce((sum: number, p: any) => sum + (parseFloat(p.total) || 0), 0)
    const averageValue = totalProposals > 0 ? totalValue / totalProposals : 0

    // Count proposals by status
    const statusCounts = proposals.reduce((acc: Record<string, number>, proposal: any) => {
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