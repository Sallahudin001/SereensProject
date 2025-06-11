import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import ProposalPDF from '@/components/pdf/ProposalPDF'
import { getProposalById } from '@/app/actions/proposal-actions'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const includeSigningLink = searchParams.get('signature') === 'true'
    const download = searchParams.get('download') === 'true'

    // Get the proposal data
    const proposal = await getProposalById(id)
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    // Get bundle rules and offer data for this proposal
    let bundleRules: any[] = []
    let selectedAddons: Record<string, any[]> = {}

    try {
      // Import executeQuery function
      const { executeQuery } = await import('@/lib/db')
      
      // Fetch bundle rules applied to this proposal (deduplicated)
      const bundleRulesResult = await executeQuery(`
        SELECT DISTINCT ON (br.name, br.id)
          po.offer_id,
          po.discount_amount,
          br.name,
          br.description,
          br.discount_type,
          br.discount_value,
          br.free_service,
          br.bonus_message
        FROM proposal_offers po
        LEFT JOIN bundle_rules br ON po.offer_id = br.id
        WHERE po.proposal_id = $1 
          AND po.offer_type = 'bundle_rule' 
          AND po.status = 'active'
        ORDER BY br.name, br.id
      `, [id])

      bundleRules = bundleRulesResult.map((bundle: any) => ({
        id: bundle.offer_id,
        name: bundle.name,
        description: bundle.description,
        discount_type: bundle.discount_type,
        discount_value: bundle.discount_value || bundle.discount_amount,
        free_service: bundle.free_service,
        bonus_message: bundle.bonus_message
      }))

      // For now, selected addons would come from URL params or proposal data
      // In the future, this would be fetched from a database table
      const addonsParam = searchParams.get('addons')
      if (addonsParam) {
        try {
          selectedAddons = JSON.parse(decodeURIComponent(addonsParam))
        } catch (error) {
          console.log('Error parsing addons parameter:', error)
        }
      }

    } catch (error) {
      console.error('Error fetching bundle rules:', error)
      // Continue with empty bundle rules if there's an error
    }

    // Generate the PDF
    const pdfBuffer = await renderToBuffer(
      <ProposalPDF 
        proposal={proposal} 
        includeSigningLink={includeSigningLink}
        selectedAddons={selectedAddons}
        bundleRules={bundleRules}
      />
    )

    // Set response headers
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Length', pdfBuffer.length.toString())
    
    if (download) {
      const filename = `proposal-${proposal.proposalNumber || id}.pdf`
      headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    } else {
      headers.set('Content-Disposition', 'inline')
    }

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' }, 
      { status: 500 }
    )
  }
} 