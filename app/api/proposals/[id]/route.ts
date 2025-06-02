import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    // Get authenticated user
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get proposal details
    const proposalResult = await executeQuery(
      `
      SELECT 
        p.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address
      FROM 
        proposals p
      JOIN 
        customers c ON p.customer_id = c.id
      WHERE 
        p.id = $1
    `,
      [id]
    )
    
    if (proposalResult.length === 0) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }
    
    const proposal = proposalResult[0]
    
    // Get services
    const servicesResult = await executeQuery(
      `
      SELECT 
        s.name,
        s.display_name
      FROM 
        proposal_services ps
      JOIN 
        services s ON ps.service_id = s.id
      WHERE 
        ps.proposal_id = $1
    `,
      [id]
    )
    
    // Get products
    const productsResult = await executeQuery(
      `
      SELECT 
        p.service_id,
        s.name as service_name,
        p.product_data,
        p.scope_notes
      FROM 
        products p
      JOIN 
        services s ON p.service_id = s.id
      WHERE 
        p.proposal_id = $1
    `,
      [id]
    )
    
    // Check for pending approval request
    const approvalRequestResult = await executeQuery(
      `
      SELECT * FROM approval_requests
      WHERE proposal_id = $1 AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [id]
    )
    
    // Format the response
    const formattedProposal = {
      id: proposal.id,
      proposalNumber: proposal.proposal_number,
      customer: {
        name: proposal.customer_name,
        email: proposal.customer_email,
        phone: proposal.customer_phone,
        address: proposal.customer_address,
      },
      services: servicesResult.map((s) => s.name),
      products: productsResult.reduce((acc, product) => {
        acc[product.service_name] = {
          ...product.product_data,
          scopeNotes: product.scope_notes,
        }
        return acc
      }, {}),
      pricing: {
        subtotal: Number.parseFloat(proposal.subtotal),
        discount: Number.parseFloat(proposal.discount),
        total: Number.parseFloat(proposal.total),
        monthlyPayment: Number.parseFloat(proposal.monthly_payment) || 0,
        financingTerm: proposal.financing_term || 60,
        interestRate: Number.parseFloat(proposal.interest_rate) || 5.99,
        financingPlanId: proposal.financing_plan_id,
        financingPlanName: proposal.financing_plan_name,
        merchantFee: proposal.merchant_fee,
        financingNotes: proposal.financing_notes
      },
      status: proposal.status,
      pendingApprovalRequestId: proposal.pending_approval_request_id || (approvalRequestResult.length > 0 ? approvalRequestResult[0].id : null),
      createdAt: proposal.created_at,
      updatedAt: proposal.updated_at,
    }
    
    return NextResponse.json(formattedProposal)
  } catch (error) {
    console.error('Error fetching proposal:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch proposal',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 