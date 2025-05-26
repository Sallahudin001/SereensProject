import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

// POST - Track offer usage/interaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      offer_type,
      offer_id,
      proposal_id,
      user_id,
      action, // 'viewed', 'applied', 'selected', 'deselected'
      discount_amount,
      previous_total,
      new_total,
      monthly_impact
    } = body

    // Insert into upsell_interactions table
    const query = `
      INSERT INTO upsell_interactions (
        proposal_id, upsell_type, upsell_id, action,
        previous_total, new_total, monthly_impact
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `

    const result = await executeQuery(query, [
      proposal_id || 0,
      offer_type,
      offer_id,
      action,
      previous_total || null,
      new_total || null,
      monthly_impact || null
    ])

    // Also insert into proposal_offers if it's an applied offer
    if (action === 'applied' || action === 'selected') {
      const expirationDate = calculateExpirationDate(offer_type, 72) // Default 72 hours
      
      const proposalOfferQuery = `
        INSERT INTO proposal_offers (
          proposal_id, offer_type, offer_id, discount_amount, expiration_date, status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (proposal_id, offer_type, offer_id) 
        DO UPDATE SET 
          discount_amount = EXCLUDED.discount_amount,
          status = EXCLUDED.status,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `

      await executeQuery(proposalOfferQuery, [
        proposal_id || 0,
        offer_type,
        offer_id,
        discount_amount || 0,
        expirationDate,
        'active'
      ])
    }

    return NextResponse.json(result[0])

  } catch (error) {
    console.error('Error tracking offer usage:', error)
    return NextResponse.json(
      { error: 'Failed to track offer usage' },
      { status: 500 }
    )
  }
}

// GET - Fetch offer usage analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const proposalId = searchParams.get('proposal_id')
    const offerType = searchParams.get('offer_type')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = `
      SELECT 
        ui.*,
        CASE 
          WHEN ui.upsell_type = 'special_offer' THEN so.name
          WHEN ui.upsell_type = 'bundle_rule' THEN br.name
          WHEN ui.upsell_type = 'lifestyle_upsell' THEN lu.product_suggestion
        END as offer_name,
        CASE 
          WHEN ui.upsell_type = 'special_offer' THEN so.category
          WHEN ui.upsell_type = 'bundle_rule' THEN 'Bundle'
          WHEN ui.upsell_type = 'lifestyle_upsell' THEN lu.category
        END as offer_category
      FROM upsell_interactions ui
      LEFT JOIN special_offers so ON ui.upsell_type = 'special_offer' AND ui.upsell_id = so.id
      LEFT JOIN bundle_rules br ON ui.upsell_type = 'bundle_rule' AND ui.upsell_id = br.id
      LEFT JOIN lifestyle_upsells lu ON ui.upsell_type = 'lifestyle_upsell' AND ui.upsell_id = lu.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramCount = 0

    if (proposalId) {
      paramCount++
      query += ` AND ui.proposal_id = $${paramCount}`
      params.push(proposalId)
    }

    if (offerType) {
      paramCount++
      query += ` AND ui.upsell_type = $${paramCount}`
      params.push(offerType)
    }

    if (startDate) {
      paramCount++
      query += ` AND ui.created_at >= $${paramCount}`
      params.push(startDate)
    }

    if (endDate) {
      paramCount++
      query += ` AND ui.created_at <= $${paramCount}`
      params.push(endDate)
    }

    query += ` ORDER BY ui.created_at DESC LIMIT 100`

    const result = await executeQuery(query, params)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching offer usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offer usage' },
      { status: 500 }
    )
  }
}

// PUT - Update offer status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { proposal_id, offer_type, offer_id, status } = body

    const query = `
      UPDATE proposal_offers 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE proposal_id = $2 AND offer_type = $3 AND offer_id = $4
      RETURNING *
    `

    const result = await executeQuery(query, [status, proposal_id, offer_type, offer_id])

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result[0])

  } catch (error) {
    console.error('Error updating offer status:', error)
    return NextResponse.json(
      { error: 'Failed to update offer status' },
      { status: 500 }
    )
  }
}

// Helper function to calculate expiration date
function calculateExpirationDate(offerType: string, defaultHours: number = 72): Date {
  const now = new Date()
  now.setHours(now.getHours() + defaultHours)
  return now
} 