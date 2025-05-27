import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Ensure params is properly awaited
    const params = await context.params
    const { id } = params
    
    if (!id) {
      return NextResponse.json({ error: 'Proposal ID is required' }, { status: 400 })
    }
    
    // Query for proposal details including pending approval request ID
    const proposalQuery = `
      SELECT 
        p.id,
        p.proposal_number,
        p.subtotal,
        p.discount,
        p.total,
        p.monthly_payment,
        p.financing_term,
        p.interest_rate,
        p.financing_plan_id,
        p.financing_plan_name,
        p.merchant_fee,
        p.financing_notes,
        p.status,
        p.created_at,
        p.updated_at,
        p.pending_approval_request_id,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        c.address AS customer_address
      FROM proposals p
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE p.id = $1
    `
    
    const proposalResult = await executeQuery(proposalQuery, [id])
    
    if (!proposalResult || proposalResult.length === 0) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }
    
    const proposal = proposalResult[0]
    
    // Get the services for this proposal
    const servicesQuery = `
      SELECT 
        s.name, 
        s.display_name
      FROM proposal_services ps
      JOIN services s ON ps.service_id = s.id
      WHERE ps.proposal_id = $1
    `
    
    const servicesResult = await executeQuery(servicesQuery, [id])
    
    // Get the products for this proposal
    const productsQuery = `
      SELECT 
        s.name AS service_name,
        p.product_data,
        p.scope_notes
      FROM products p
      JOIN services s ON p.service_id = s.id
      WHERE p.proposal_id = $1
    `
    
    const productsResult = await executeQuery(productsQuery, [id])
    
    // Check if there's a pending approval request
    let approvalRequest = null
    if (proposal.pending_approval_request_id) {
      const approvalQuery = `
        SELECT 
          id,
          requestor_id,
          approver_id,
          request_type,
          original_value,
          requested_value,
          notes,
          status,
          created_at,
          updated_at
        FROM approval_requests
        WHERE id = $1
      `
      
      const approvalResult = await executeQuery(approvalQuery, [proposal.pending_approval_request_id])
      
      if (approvalResult && approvalResult.length > 0) {
        approvalRequest = approvalResult[0]
      }
    }
    
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
      serviceNames: servicesResult.map((s) => s.display_name),
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
        showLineItems: proposal.show_line_items !== false, 
        financingTerm: proposal.financing_term || 60,
        interestRate: Number.parseFloat(proposal.interest_rate) || 5.99,
        financingPlanId: proposal.financing_plan_id,
        financingPlanName: proposal.financing_plan_name,
        merchantFee: proposal.merchant_fee,
        financingNotes: proposal.financing_notes
      },
      status: proposal.status,
      createdAt: proposal.created_at,
      updatedAt: proposal.updated_at,
      pendingApprovalRequestId: proposal.pending_approval_request_id,
      approvalRequest: approvalRequest
    }
    
    return NextResponse.json(formattedProposal)
    
  } catch (error) {
    console.error('Error fetching proposal:', error)
    return NextResponse.json({ error: 'Failed to fetch proposal details' }, { status: 500 })
  }
} 