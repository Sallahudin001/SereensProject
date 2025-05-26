"use server"

import { executeQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"

// Get dashboard metrics
export async function getDashboardMetrics() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        totalProposals: 0,
        activeCustomers: 0,
        conversionRate: 0,
      };
    }
    
    // Count total proposals
    const totalProposalsResult = await executeQuery(`
      SELECT COUNT(*) as count FROM proposals
    `)
    const totalProposals = Number.parseInt(totalProposalsResult[0].count) || 0

    // Count active customers
    const activeCustomersResult = await executeQuery(`
      SELECT COUNT(DISTINCT customer_id) as count FROM proposals
    `)
    const activeCustomers = Number.parseInt(activeCustomersResult[0].count) || 0

    // Calculate conversion rate (signed proposals / total proposals)
    const conversionRateResult = await executeQuery(`
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND((COUNT(*) FILTER (WHERE status = 'signed' OR status = 'completed')) * 100.0 / COUNT(*), 1)
        END as rate
      FROM proposals
    `)
    const conversionRate = Number.parseFloat(conversionRateResult[0].rate) || 0

    return {
      totalProposals,
      activeCustomers,
      conversionRate,
    }
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error)
    return {
      totalProposals: 0,
      activeCustomers: 0,
      conversionRate: 0,
    }
  }
}

// Get recent proposals
export async function getRecentProposals(limit = 5) {
  try {
    const proposals = await executeQuery(
      `
      SELECT 
        p.id, 
        p.proposal_number, 
        c.name as customer_name, 
        p.status, 
        p.total, 
        p.created_at,
        ARRAY_AGG(s.display_name) as services
      FROM 
        proposals p
      JOIN 
        customers c ON p.customer_id = c.id
      LEFT JOIN 
        proposal_services ps ON p.id = ps.proposal_id
      LEFT JOIN 
        services s ON ps.service_id = s.id
      GROUP BY 
        p.id, c.name
      ORDER BY 
        p.created_at DESC
      LIMIT $1
    `,
      [limit],
    )

    return proposals
  } catch (error) {
    console.error("Error fetching recent proposals:", error)
    return []
  }
}

// Get proposal by ID
export async function getProposalById(id: string) {
  try {
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
      [id],
    )

    if (proposalResult.length === 0) {
      return null
    }

    const proposal = proposalResult[0]

    // Get services for this proposal
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
      [id],
    )

    // Get products for this proposal
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
      [id],
    )

    // Format the response
    return {
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
        showLineItems: proposal.show_line_items !== false, // Default to true if not specified
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
      sentAt: proposal.sent_at,
      viewedAt: proposal.viewed_at,
      signedAt: proposal.signed_at,
      completedAt: proposal.completed_at,
    }
  } catch (error) {
    console.error("Error fetching proposal:", error)
    return null
  }
}

// Function to get the current user's ID from Clerk
async function getCurrentUserId() {
  try {
    const { userId } = await auth();
    return userId;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

// Create a new proposal
export async function createProposal(data: any) {
  try {
    // Get current user's ID from Clerk
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Start a transaction
    await executeQuery("BEGIN")

    // 1. Create or update customer
    const customerResult = await executeQuery(
      `
      INSERT INTO customers (name, email, phone, address, user_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `,
      [data.customer.name, data.customer.email, data.customer.phone, data.customer.address, userId],
    )

    const customerId = customerResult[0].id

    // 2. Generate a proposal number
    const proposalNumber = `PRO-${Math.floor(10000 + Math.random() * 90000)}`

    // 3. Create the proposal
    const proposalResult = await executeQuery(
      `
      INSERT INTO proposals (
        proposal_number, customer_id, status, subtotal, discount, total, 
        monthly_payment, financing_term, interest_rate, created_by, user_id,
        financing_plan_id, financing_plan_name, merchant_fee, financing_notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id
    `,
      [
        proposalNumber,
        customerId,
        "draft",
        parseFloat(data.pricing.subtotal) || 0,
        parseFloat(data.pricing.discount) || 0,
        parseFloat(data.pricing.total) || 0,
        parseFloat(data.pricing.monthlyPayment) || 0,
        parseInt(data.pricing.financingTerm) || 60,
        parseFloat(data.pricing.interestRate) || 5.99,
        data.createdBy || userId,
        userId,
        data.pricing.financingPlanId || null,
        data.pricing.financingPlanName || null,
        data.pricing.merchantFee ? parseFloat(data.pricing.merchantFee) : null,
        data.pricing.financingNotes || null
      ],
    )

    const proposalId = proposalResult[0].id

    // 4. Add services to the proposal
    for (const serviceName of data.services) {
      // Get service ID
      const serviceResult = await executeQuery(
        `
        SELECT id FROM services WHERE name = $1
      `,
        [serviceName],
      )

      if (serviceResult.length > 0) {
        const serviceId = serviceResult[0].id

        // Add to proposal_services
        await executeQuery(
          `
          INSERT INTO proposal_services (proposal_id, service_id)
          VALUES ($1, $2)
        `,
          [proposalId, serviceId],
        )

        // Add product data if available
        if (data.products && data.products[serviceName]) {
          const productData = data.products[serviceName]
          const scopeNotes = productData.scopeNotes || ""

          // Remove scopeNotes from productData to avoid duplication
          const { scopeNotes: _, ...productDataWithoutNotes } = productData

          await executeQuery(
            `
            INSERT INTO products (proposal_id, service_id, product_data, scope_notes)
            VALUES ($1, $2, $3, $4)
          `,
            [proposalId, serviceId, JSON.stringify(productDataWithoutNotes), scopeNotes],
          )
        }
      }
    }

    // 5. Auto-assign bundle discounts and rep-selected offers
    try {
      // Apply rep-selected special offers if any
      if (data.selectedOffers && data.selectedOffers.length > 0) {
        for (const offerId of data.selectedOffers) {
          // Fetch offer details
          const offerQuery = `
            SELECT id, name, category, discount_amount, discount_percentage, 
                   expiration_type, expiration_value, is_active
            FROM special_offers 
            WHERE id = $1 AND is_active = true
          `
          
          const offerResult = await executeQuery(offerQuery, [offerId])
          
          if (offerResult.length > 0) {
            const offer = offerResult[0]
            const expirationDate = calculateOfferExpirationDate(offer.expiration_type, offer.expiration_value)
            
            await executeQuery(
              `
              INSERT INTO proposal_offers (
                proposal_id, offer_type, offer_id, discount_amount, expiration_date, status
              ) VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (proposal_id, offer_type, offer_id) DO NOTHING
            `,
              [
                proposalId,
                'special_offer',
                offer.id,
                offer.discount_amount || 0,
                expirationDate,
                'active'
              ]
            )
          }
        }
      }

      // Fetch and assign relevant bundle rules if multiple services
      if (data.services.length >= 2) {
        const bundleRulesQuery = `
          SELECT id, name, required_services, discount_type, discount_value, free_service
          FROM bundle_rules 
          WHERE is_active = true 
          AND required_services <@ $1::text[]
          AND array_length(required_services, 1) <= $2
          ORDER BY priority DESC
          LIMIT 3
        `
        
        const bundleRules = await executeQuery(bundleRulesQuery, [data.services, data.services.length])

        for (const bundle of bundleRules) {
          const expirationDate = calculateOfferExpirationDate('days', 7) // Default 7 days for bundles
          
          await executeQuery(
            `
            INSERT INTO proposal_offers (
              proposal_id, offer_type, offer_id, discount_amount, expiration_date, status
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (proposal_id, offer_type, offer_id) DO NOTHING
          `,
            [
              proposalId,
              'bundle_rule',
              bundle.id,
              bundle.discount_value || 0,
              expirationDate,
              'active'
            ]
          )
        }
      }

      // Note: Lifestyle upsells are NOT auto-assigned - customers choose them interactively

    } catch (offerError) {
      console.error("Error assigning offers to proposal:", offerError)
      // Don't fail the entire proposal creation if offer assignment fails
    }

    // 6. Log the activity
    await executeQuery(
      `
      INSERT INTO activity_log (proposal_id, user_id, action, details)
      VALUES ($1, $2, $3, $4)
    `,
      [proposalId, userId, "create_proposal", JSON.stringify({ proposalNumber })],
    )

    // Commit the transaction
    await executeQuery("COMMIT")

    // Revalidate the dashboard path to update metrics
    revalidatePath("/dashboard")

    return {
      success: true,
      proposalId,
      proposalNumber,
    }
  } catch (error) {
    // Rollback on error
    await executeQuery("ROLLBACK")
    console.error("Error creating proposal:", error)
    return {
      success: false,
      error: "Failed to create proposal",
    }
  }
}

// Helper function to calculate offer expiration dates
function calculateOfferExpirationDate(expirationType: string, expirationValue: number): Date {
  const now = new Date()
  
  switch (expirationType) {
    case 'hours':
      now.setHours(now.getHours() + expirationValue)
      break
    case 'days':
      now.setDate(now.getDate() + expirationValue)
      break
    default:
      // Default to 3 days
      now.setDate(now.getDate() + 3)
      break
  }
  
  return now
}

// Update proposal status
export async function updateProposalStatus(id: string, status: string, userId?: string) {
  try {
    let updateFields = ""
    const params = [id, status]

    // Set appropriate timestamp based on status
    switch (status) {
      case "sent":
        updateFields = ", sent_at = CURRENT_TIMESTAMP"
        break
      case "viewed":
        updateFields = ", viewed_at = CURRENT_TIMESTAMP"
        break
      case "signed":
        updateFields = ", signed_at = CURRENT_TIMESTAMP"
        break
      case "completed":
        updateFields = ", completed_at = CURRENT_TIMESTAMP"
        break
    }

    await executeQuery(
      `
      UPDATE proposals
      SET status = $2, updated_at = CURRENT_TIMESTAMP ${updateFields}
      WHERE id = $1
    `,
      params,
    )

    // Log the activity
    await executeQuery(
      `
      INSERT INTO activity_log (proposal_id, user_id, action, details)
      VALUES ($1, $2, $3, $4)
    `,
      [id, userId || "system", `update_status_${status}`, JSON.stringify({ status })],
    )

    // Revalidate the dashboard path to update metrics
    revalidatePath("/dashboard")
    revalidatePath(`/proposals/view/${id}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating proposal status:", error)
    return { success: false, error: "Failed to update proposal status" }
  }
}

// Get all services
export async function getAllServices() {
  try {
    const services = await executeQuery(`
      SELECT * FROM services ORDER BY display_name
    `)
    return services
  } catch (error) {
    console.error("Error fetching services:", error)
    return []
  }
}

// Mark proposal as sent
export async function markProposalAsSent(proposalId: string) {
  try {
    await executeQuery(
      `
      UPDATE proposals
      SET status = 'sent', sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [proposalId]
    );

    // Log the activity
    await executeQuery(
      `
      INSERT INTO activity_log (proposal_id, user_id, action, details)
      VALUES ($1, $2, $3, $4)
      `,
      [proposalId, "system", "send_proposal_email", JSON.stringify({ method: "api" })]
    );

    return { success: true };
  } catch (error) {
    console.error("Error marking proposal as sent:", error);
    return { success: false, error: "Failed to update proposal status" };
  }
}
