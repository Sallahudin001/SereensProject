import { executeQuery } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET - Fetch offers linked to a specific proposal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await the params object before accessing its properties
    const resolvedParams = await params;
    const proposalId = resolvedParams.id

    if (!proposalId) {
      return NextResponse.json(
        { success: false, error: "Proposal ID is required" },
        { status: 400 }
      )
    }

    // Get all offers linked to this proposal from proposal_offers table
    // and join with the respective offer tables to get full offer details
    const query = `
      SELECT 
        po.proposal_id,
        po.offer_type,
        po.offer_id,
        po.discount_amount,
        po.status,
        po.expiration_date,
        po.custom_name,
        po.custom_description,
        po.custom_discount_amount,
        po.custom_discount_percentage,
        po.custom_free_service,
        po.created_by_user,
        CASE 
          WHEN po.custom_name IS NOT NULL THEN po.custom_name
          WHEN po.offer_type = 'special_offer' THEN so.name
          WHEN po.offer_type = 'bundle_rule' THEN br.name
          WHEN po.offer_type = 'lifestyle_upsell' THEN lu.product_suggestion
        END as name,
        CASE 
          WHEN po.custom_description IS NOT NULL THEN po.custom_description
          WHEN po.offer_type = 'special_offer' THEN so.description
          WHEN po.offer_type = 'bundle_rule' THEN br.description
          WHEN po.offer_type = 'lifestyle_upsell' THEN lu.description
        END as description,
        CASE 
          WHEN po.offer_type = 'special_offer' THEN so.category
          WHEN po.offer_type = 'bundle_rule' THEN 'Bundle'
          WHEN po.offer_type = 'lifestyle_upsell' THEN lu.category
        END as category,
        CASE 
          WHEN po.custom_free_service IS NOT NULL THEN po.custom_free_service
          WHEN po.offer_type = 'special_offer' THEN so.free_product_service
          WHEN po.offer_type = 'bundle_rule' THEN br.free_service
          ELSE NULL
        END as free_item,
        CASE 
          WHEN po.custom_discount_percentage IS NOT NULL THEN po.custom_discount_percentage
          WHEN po.offer_type = 'special_offer' THEN so.discount_percentage
          ELSE NULL
        END as discount_percentage,
        CASE 
          WHEN po.custom_discount_amount IS NOT NULL THEN po.custom_discount_amount
          WHEN po.offer_type = 'special_offer' THEN so.discount_amount
          WHEN po.offer_type = 'bundle_rule' THEN br.discount_value
          ELSE po.discount_amount
        END as effective_discount_amount
      FROM proposal_offers po
      LEFT JOIN special_offers so ON po.offer_type = 'special_offer' AND po.offer_id = so.id
      LEFT JOIN bundle_rules br ON po.offer_type = 'bundle_rule' AND po.offer_id = br.id
      LEFT JOIN lifestyle_upsells lu ON po.offer_type = 'lifestyle_upsell' AND po.offer_id = lu.id
      WHERE po.proposal_id = $1 AND po.status = 'active'
    `

    const proposalOffers = await executeQuery(query, [proposalId])

    // If no offers are found, return an empty array
    if (!proposalOffers || proposalOffers.length === 0) {
      return NextResponse.json({ success: true, offers: [] })
    }

    return NextResponse.json({ success: true, offers: proposalOffers })
  } catch (error) {
    console.error("Error fetching proposal offers:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch proposal offers" },
      { status: 500 }
    )
  }
} 