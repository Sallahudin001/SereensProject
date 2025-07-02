"use server"

import { executeQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import { logActivity, logProposalCreation } from "@/lib/activity-logger"

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
        p.id, p.proposal_number, c.name, p.status, p.total, p.created_at
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
        c.address as customer_address,
        p.rep_first_name,
        p.rep_last_name,
        p.rep_phone
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
    
    // Get applied discounts and offers
    const discountsResult = await executeQuery(
      `
      SELECT
        po.offer_type,
        po.offer_id,
        po.discount_amount,
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
          ELSE 'Custom Discount'
        END as name,
        CASE
          WHEN po.custom_description IS NOT NULL THEN po.custom_description
          WHEN po.offer_type = 'special_offer' THEN so.description
          WHEN po.offer_type = 'bundle_rule' THEN br.description
          ELSE NULL
        END as description,
        CASE
          WHEN po.offer_type = 'special_offer' THEN so.category
          WHEN po.offer_type = 'bundle_rule' THEN 'Bundle'
          ELSE NULL
        END as category
      FROM
        proposal_offers po
      LEFT JOIN
        special_offers so ON po.offer_type = 'special_offer' AND po.offer_id = so.id
      LEFT JOIN
        bundle_rules br ON po.offer_type = 'bundle_rule' AND po.offer_id = br.id
      WHERE
        po.proposal_id = $1
        AND po.status = 'active'
    `,
      [id],
    )
    
    // Fetch custom adders for this proposal
    const customAddersResult = await executeQuery(
      `SELECT * FROM custom_pricing_adders 
       WHERE proposal_id = $1 
       ORDER BY product_category, id`,
      [id],
    )
    
    // Note: Customer discount and custom adders data will be fetched from the proposal data structure instead of separate tables

    // Format the response with enhanced product details
    return {
      id: proposal.id,
      proposalNumber: proposal.proposal_number,
      customer: {
        name: proposal.customer_name,
        email: proposal.customer_email,
        phone: proposal.customer_phone,
        address: proposal.customer_address,
      },
      rep_first_name: proposal.rep_first_name,
      rep_last_name: proposal.rep_last_name,
      rep_phone: proposal.rep_phone,
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
        financingNotes: proposal.financing_notes,
        paymentFactor: proposal.payment_factor
      },
      // Include applied discounts
      appliedDiscounts: discountsResult.map(discount => ({
        type: discount.offer_type,
        name: discount.name,
        description: discount.description,
        amount: Number.parseFloat(discount.discount_amount) || 0,
        category: discount.category
      })),
      // Extract selected offers and customized offers
      selectedOffers: discountsResult
        .filter(discount => discount.offer_type === 'special_offer')
        .map(discount => discount.offer_id),
      customizedOffers: discountsResult
        .filter(discount => discount.offer_type === 'special_offer' && discount.custom_name)
        .map(discount => ({
          originalOfferId: discount.offer_id,
          name: discount.custom_name,
          description: discount.custom_description,
          discount_amount: discount.custom_discount_amount,
          discount_percentage: discount.custom_discount_percentage,
          free_product_service: discount.custom_free_service,
          expiration_type: 'hours', // Default for now
          expiration_value: 72 // Default for now
        })),
      // Add custom adders to the response
      customAdders: customAddersResult.map(adder => ({
        id: adder.id,
        description: adder.description,
        product_category: adder.product_category,
        cost: Number.parseFloat(adder.cost) || 0
      })),
      // Extract customer discounts from pricing_breakdown if available
      customerDiscounts: proposal.pricing_breakdown && typeof proposal.pricing_breakdown === 'object' ? 
        (proposal.pricing_breakdown.discountTypes || [])
          .filter((discount: any) => discount && discount.isEnabled)
          .map((discount: any) => ({
            type: discount.id,
            name: discount.name,
            amount: Number.parseFloat(discount.amount) || 0,
            category: discount.category || 'Customer'
          })) : [],
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

// Helper function to check if form data is valid for creating a draft
function isValidForDraft(data: any): boolean {
  return !!(
    data.customer &&
    data.customer.name &&
    data.customer.email &&
    data.customer.name.trim() !== "" &&
    data.customer.email.trim() !== ""
  );
}

// Helper function to find existing draft proposal
export async function findExistingDraftProposal(customerEmail: string, userId: string) {
  try {
    const result = await executeQuery(
      `SELECT * FROM find_existing_draft($1, $2, INTERVAL '2 hours')`,
      [customerEmail, userId]
    );
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error finding existing draft:', error);
    // If function has issues, fall back to direct query
    try {
      const fallbackResult = await executeQuery(
        `
        SELECT p.id as proposal_id, p.proposal_number
        FROM proposals p
        JOIN customers c ON p.customer_id = c.id
        WHERE c.email = $1 
        AND p.user_id = $2
        AND p.status IN ('draft', 'draft_in_progress', 'draft_complete')
        AND p.updated_at > NOW() - INTERVAL '2 hours'
        ORDER BY p.updated_at DESC
        LIMIT 1
        `,
        [customerEmail, userId]
      );
      
      return fallbackResult.length > 0 ? fallbackResult[0] : null;
    } catch (fallbackError) {
      console.error("Fallback query also failed:", fallbackError);
      return null;
    }
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
    
    // If an ID is provided, this is an update to an existing proposal
    if (data.id) {
      // Start a transaction
      await executeQuery("BEGIN")
      
      try {
        // Update the customer data
        const customerResult = await executeQuery(
          `
          UPDATE customers
          SET name = $1,
              phone = $2,
              address = $3,
              updated_at = CURRENT_TIMESTAMP
          WHERE email = $4
          RETURNING id
          `,
          [data.customer.name, data.customer.phone, data.customer.address, data.customer.email]
        )
        
        let customerId: number
        if (customerResult.length === 0) {
          // Customer doesn't exist, create it
          const newCustomerResult = await executeQuery(
            `
            INSERT INTO customers (name, email, phone, address, user_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
            `,
            [data.customer.name, data.customer.email, data.customer.phone, data.customer.address, userId]
          )
          customerId = newCustomerResult[0].id
        } else {
          customerId = customerResult[0].id
        }
        
        // Update the existing proposal
        await executeQuery(
          `
          UPDATE proposals
          SET customer_id = $1,
              subtotal = $2,
              discount = $3, 
              total = $4,
              monthly_payment = $5,
              financing_term = $6,
              interest_rate = $7,
              financing_plan_id = $8,
              financing_plan_name = $9,
              merchant_fee = $10,
              financing_notes = $11,
              status = COALESCE($12, status),
              pricing_breakdown = $13,
              pricing_override = $14,
              rep_first_name = $15,
              rep_last_name = $16,
              rep_phone = $17,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $18
          `,
          [
            customerId,
            parseFloat(data.pricing.subtotal) || 0,
            parseFloat(data.pricing.discount) || 0,
            parseFloat(data.pricing.total) || 0,
            parseFloat(data.pricing.monthlyPayment) || 0,
            parseInt(data.pricing.financingTerm) || 60,
            parseFloat(data.pricing.interestRate) || 5.99,
            data.pricing.financingPlanId || null,
            data.pricing.financingPlanName || null,
            data.pricing.merchantFee ? parseFloat(data.pricing.merchantFee) : null,
            data.pricing.financingNotes || null,
            data.status || null,
            JSON.stringify({
              discountTypes: data.pricing.discountTypes || [],
              pricingBreakdown: data.pricing.pricingBreakdown || {},
              discountLog: data.pricing.discountLog || []
            }),
            data.pricing.pricingOverride || false,
            data.customer.repFirstName || null,
            data.customer.repLastName || null,
            data.customer.repPhone || null,
            data.id
          ]
        )
        
        // Get the proposal number for response
        const proposalData = await executeQuery(
          `SELECT proposal_number FROM proposals WHERE id = $1`,
          [data.id]
        )
        
        // Update services - delete existing and re-add
        await executeQuery(
          `DELETE FROM proposal_services WHERE proposal_id = $1`,
          [data.id]
        )
        
        await executeQuery(
          `DELETE FROM products WHERE proposal_id = $1`,
          [data.id]
        )
        
        // Re-add services and products
        for (const serviceName of data.services) {
          const serviceResult = await executeQuery(
            `SELECT id FROM services WHERE name = $1`,
            [serviceName]
          )
          
          if (serviceResult.length > 0) {
            const serviceId = serviceResult[0].id
            
            // Verify proposal exists before inserting into proposal_services
            const proposalExists = await executeQuery(
              `SELECT id FROM proposals WHERE id = $1`,
              [data.id]
            )
            
            if (proposalExists.length === 0) {
              throw new Error(`Proposal ID ${data.id} does not exist in proposals table`)
            }
            
            await executeQuery(
              `INSERT INTO proposal_services (proposal_id, service_id) VALUES ($1, $2)`,
              [data.id, serviceId]
            )
            
            if (data.products && data.products[serviceName]) {
              const productData = data.products[serviceName]
              const scopeNotes = productData.scopeNotes || ""
              const { scopeNotes: _, ...productDataWithoutNotes } = productData
              
              await executeQuery(
                `
                INSERT INTO products (proposal_id, service_id, product_data, scope_notes)
                VALUES ($1, $2, $3, $4)
                `,
                [data.id, serviceId, JSON.stringify(productDataWithoutNotes), scopeNotes]
              )
            }
          }
        }
        
        // Handle offers during update
        try {
          // Clear existing offers
          await executeQuery(
            `DELETE FROM proposal_offers WHERE proposal_id = $1`,
            [data.id]
          )
          
          // Apply rep-selected special offers if any
          if (data.selectedOffers && data.selectedOffers.length > 0) {
            for (const offerId of data.selectedOffers) {
              // Check if this offer has customizations
              const customization = data.customizedOffers?.find((co: any) => co.originalOfferId === offerId)
              
              if (customization) {
                // Use custom offer data
                const expirationDate = calculateOfferExpirationDate(
                  customization.expiration_type, 
                  customization.expiration_value || 72 // Default 72 hours
                )
                
                await executeQuery(
                  `
                  INSERT INTO proposal_offers (
                    proposal_id, offer_type, offer_id, discount_amount, expiration_date, status,
                    custom_name, custom_description, custom_discount_amount, 
                    custom_discount_percentage, custom_free_service, created_by_user
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                  ON CONFLICT (proposal_id, offer_type, offer_id) DO UPDATE SET
                    custom_name = EXCLUDED.custom_name,
                    custom_description = EXCLUDED.custom_description,
                    custom_discount_amount = EXCLUDED.custom_discount_amount,
                    custom_discount_percentage = EXCLUDED.custom_discount_percentage,
                    custom_free_service = EXCLUDED.custom_free_service,
                    created_by_user = EXCLUDED.created_by_user,
                    updated_at = CURRENT_TIMESTAMP
                `,
                  [
                    data.id,
                    'special_offer',
                    offerId,
                    customization.discount_amount || customization.discount_percentage || 0,
                    expirationDate,
                    'active',
                    customization.name,
                    customization.description,
                    customization.discount_amount || null,
                    customization.discount_percentage || null,
                    customization.free_product_service || null,
                    userId
                  ]
                )
              } else {
                // Use original offer data
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
                      data.id,
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
          }
          
          // Apply bundle rules if multiple services
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
                  data.id,
                  'bundle_rule',
                  bundle.id,
                  bundle.discount_value || 0,
                  expirationDate,
                  'active'
                ]
              )
            }
          }
        } catch (offerError) {
          console.error("Error updating offers:", offerError)
          // Don't fail the entire update if offer assignment fails
        }
        
        // Handle custom adders - delete existing and re-add
        try {
          // Delete existing custom adders
          await executeQuery(
            `DELETE FROM custom_pricing_adders WHERE proposal_id = $1`,
            [data.id]
          )
          
          // Re-add custom adders if any
          if (data.pricing && data.pricing.customAdders && data.pricing.customAdders.length > 0) {
            for (const adder of data.pricing.customAdders) {
              await executeQuery(
                `
                INSERT INTO custom_pricing_adders (
                  proposal_id, product_category, description, cost
                ) VALUES ($1, $2, $3, $4)
                `,
                [data.id, adder.product_category, adder.description, adder.cost]
              )
            }
          }
        } catch (adderError) {
          console.error("Error updating custom adders:", adderError)
          // Don't fail the entire update if adder assignment fails
        }
        
        // Commit the transaction
        await executeQuery("COMMIT")
        
        return {
          success: true,
          proposalId: data.id,
          proposalNumber: proposalData[0]?.proposal_number,
          isDuplicate: false
        }
      } catch (error) {
        // Rollback on error
        await executeQuery("ROLLBACK")
        throw error
      }
    }
    
    // Validate that we have minimum required data for creating a proposal
    if (!isValidForDraft(data)) {
      throw new Error("Invalid proposal data: customer name and email are required");
    }

    // Enhanced duplicate check using database function
    const existingDraftResult = await executeQuery(
      `SELECT * FROM find_existing_draft($1, $2, INTERVAL '2 hours')`,
      [data.customer.email, userId]
    );
    
    if (existingDraftResult.length > 0) {
      const existingDraft = existingDraftResult[0];
      console.log(`Found existing draft ${existingDraft.proposal_number} (ID: ${existingDraft.proposal_id}), updating instead of creating new`);
      
      // Update the existing draft instead of creating a new one
      const updateData = { ...data, id: existingDraft.proposal_id };
      return await createProposal(updateData);
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

    // 2. Generate a sequential proposal number
    const proposalNumberResult = await executeQuery(`SELECT generate_proposal_number() as proposal_number`);
    const proposalNumber = proposalNumberResult[0].proposal_number;

    // 3. Create the proposal
    const proposalResult = await executeQuery(
      `
      INSERT INTO proposals (
        proposal_number, customer_id, status, subtotal, discount, total, 
        monthly_payment, financing_term, interest_rate, created_by, user_id,
        financing_plan_id, financing_plan_name, merchant_fee, financing_notes,
        pricing_breakdown, pricing_override, rep_first_name, rep_last_name, rep_phone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING id
    `,
      [
        proposalNumber,
        customerId,
        data.status || "draft",
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
        data.pricing.financingNotes || null,
        JSON.stringify({
          discountTypes: data.pricing.discountTypes || [],
          pricingBreakdown: data.pricing.pricingBreakdown || {},
          discountLog: data.pricing.discountLog || []
        }),
        data.pricing.pricingOverride || false,
        data.customer.repFirstName || null,
        data.customer.repLastName || null,
        data.customer.repPhone || null
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

    // 5. Add custom adders if any
    if (data.pricing && data.pricing.customAdders && data.pricing.customAdders.length > 0) {
      for (const adder of data.pricing.customAdders) {
        await executeQuery(
          `
          INSERT INTO custom_pricing_adders (
            proposal_id, product_category, description, cost
          ) VALUES ($1, $2, $3, $4)
          `,
          [proposalId, adder.product_category, adder.description, adder.cost]
        )
      }
    }
    
    // 6. Auto-assign bundle discounts and rep-selected offers
    try {
      // Apply rep-selected special offers if any
      if (data.selectedOffers && data.selectedOffers.length > 0) {
        for (const offerId of data.selectedOffers) {
          // Check if this offer has customizations
          const customization = data.customizedOffers?.find((co: any) => co.originalOfferId === offerId)
          
          if (customization) {
            // Use custom offer data
            const expirationDate = calculateOfferExpirationDate(
              customization.expiration_type, 
              customization.expiration_value || 72 // Default 72 hours
            )
            
            await executeQuery(
              `
              INSERT INTO proposal_offers (
                proposal_id, offer_type, offer_id, discount_amount, expiration_date, status,
                custom_name, custom_description, custom_discount_amount, 
                custom_discount_percentage, custom_free_service, created_by_user
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
              ON CONFLICT (proposal_id, offer_type, offer_id) DO NOTHING
            `,
              [
                proposalId,
                'special_offer',
                offerId,
                customization.discount_amount || customization.discount_percentage || 0,
                expirationDate,
                'active',
                customization.name,
                customization.description,
                customization.discount_amount || null,
                customization.discount_percentage || null,
                customization.free_product_service || null,
                userId
              ]
            )
          } else {
            // Use original offer data
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

    // 7. Log the activity
    await logProposalCreation(
      userId,
      proposalId,
      proposalNumber,
      data.customer.name,
      data.services
    );

    // Commit the transaction
    await executeQuery("COMMIT")

    // Revalidate the dashboard path to update metrics
    revalidatePath("/dashboard")
    // Revalidate the proposals path to ensure consistency
    revalidatePath("/proposals")

    return {
      success: true,
      proposalId,
      proposalNumber,
      isDuplicate: false
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
      INSERT INTO activity_log (
        action, action_category, actor_id, 
        proposal_id, metadata
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
      [
        `update_status_${status}`, 
        "proposal", 
        userId || "system", 
        id, 
        JSON.stringify({ status })
      ]
    );

    // Revalidate the dashboard path to update metrics
    revalidatePath("/dashboard")
    revalidatePath("/proposals")
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
      INSERT INTO activity_log (
        action, action_category, actor_id, 
        proposal_id, metadata
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        "send_proposal_email", 
        "proposal", 
        "system", 
        proposalId, 
        JSON.stringify({ method: "api" })
      ]
    );

    return { success: true };
  } catch (error) {
    console.error("Error marking proposal as sent:", error);
    return { success: false, error: "Failed to update proposal status" };
  }
}
