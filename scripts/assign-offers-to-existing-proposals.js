const { executeQuery } = require('../lib/db');
require('dotenv').config();

// Helper function to calculate offer expiration dates
function calculateOfferExpirationDate(expirationType, expirationValue) {
  const now = new Date();
  
  switch (expirationType) {
    case 'hours':
      now.setHours(now.getHours() + expirationValue);
      break;
    case 'days':
      now.setDate(now.getDate() + expirationValue);
      break;
    default:
      // Default to 3 days
      now.setDate(now.getDate() + 3);
      break;
  }
  
  return now;
}

async function assignOffersToExistingProposals() {
  try {
    console.log('Starting offer assignment to existing proposals...');

    // 1. Find proposals that don't have any offers assigned
    const proposalsWithoutOffers = await executeQuery(`
      SELECT p.id, p.proposal_number, ARRAY_AGG(s.name) as services
      FROM proposals p
      LEFT JOIN proposal_services ps ON p.id = ps.proposal_id
      LEFT JOIN services s ON ps.service_id = s.id
      LEFT JOIN proposal_offers po ON p.id = po.proposal_id
      WHERE po.id IS NULL AND p.status != 'completed'
      GROUP BY p.id, p.proposal_number
      HAVING COUNT(s.name) > 0
      ORDER BY p.created_at DESC
    `);

    console.log(`Found ${proposalsWithoutOffers.length} proposals without offers`);

    if (proposalsWithoutOffers.length === 0) {
      console.log('No proposals need offer assignment. Exiting.');
      return;
    }

    // 2. Get available offers
    const [specialOffers, bundleRules, lifestyleUpsells] = await Promise.all([
      executeQuery(`
        SELECT id, name, category, discount_amount, discount_percentage, 
               expiration_type, expiration_value, is_active
        FROM special_offers 
        WHERE is_active = true 
        ORDER BY created_at DESC
        LIMIT 10
      `),
      executeQuery(`
        SELECT id, name, required_services, discount_type, discount_value, free_service
        FROM bundle_rules 
        WHERE is_active = true 
        ORDER BY priority DESC
        LIMIT 5
      `),
      executeQuery(`
        SELECT id, product_suggestion, base_price, monthly_impact
        FROM lifestyle_upsells 
        WHERE is_active = true 
        ORDER BY display_order
        LIMIT 5
      `)
    ]);

    console.log(`Available offers:`);
    console.log(`- Special offers: ${specialOffers.length}`);
    console.log(`- Bundle rules: ${bundleRules.length}`);
    console.log(`- Lifestyle upsells: ${lifestyleUpsells.length}`);

    let totalAssigned = 0;

    // 3. Process each proposal
    for (const proposal of proposalsWithoutOffers) {
      console.log(`\nProcessing proposal ${proposal.proposal_number}...`);
      
      const proposalId = proposal.id;
      const services = proposal.services || [];
      
      // Map service names to offer categories
      const serviceCategories = services.map(service => {
        switch (service.toLowerCase()) {
          case 'roofing': return 'Roofing';
          case 'windows-doors': return 'Windows';
          case 'hvac': return 'HVAC';
          case 'paint': return 'Paint';
          case 'garage-doors': return 'Garage Doors';
          default: return 'Any';
        }
      });

      let assignedCount = 0;

      // Assign relevant special offers (max 3 per proposal)
      const relevantSpecialOffers = specialOffers.filter(offer => 
        offer.category === 'Bundle' || 
        offer.category === 'Any' || 
        serviceCategories.includes(offer.category)
      ).slice(0, 3);

      for (const offer of relevantSpecialOffers) {
        try {
          const expirationDate = calculateOfferExpirationDate(offer.expiration_type, offer.expiration_value);
          
          await executeQuery(`
            INSERT INTO proposal_offers (
              proposal_id, offer_type, offer_id, discount_amount, expiration_date, status
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (proposal_id, offer_type, offer_id) DO NOTHING
          `, [
            proposalId,
            'special_offer',
            offer.id,
            offer.discount_amount || 0,
            expirationDate,
            'active'
          ]);
          
          assignedCount++;
          totalAssigned++;
          console.log(`  ✓ Assigned special offer: ${offer.name}`);
        } catch (error) {
          console.log(`  ✗ Failed to assign special offer ${offer.name}:`, error.message);
        }
      }

      // Assign bundle rules for multi-service proposals
      if (services.length >= 2) {
        const applicableBundles = bundleRules.filter(bundle => {
          const requiredServices = bundle.required_services || [];
          return requiredServices.every(reqService => services.includes(reqService)) &&
                 requiredServices.length <= services.length;
        }).slice(0, 2);

        for (const bundle of applicableBundles) {
          try {
            const expirationDate = calculateOfferExpirationDate('days', 7);
            
            await executeQuery(`
              INSERT INTO proposal_offers (
                proposal_id, offer_type, offer_id, discount_amount, expiration_date, status
              ) VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (proposal_id, offer_type, offer_id) DO NOTHING
            `, [
              proposalId,
              'bundle_rule',
              bundle.id,
              bundle.discount_value || 0,
              expirationDate,
              'active'
            ]);
            
            assignedCount++;
            totalAssigned++;
            console.log(`  ✓ Assigned bundle rule: ${bundle.name}`);
          } catch (error) {
            console.log(`  ✗ Failed to assign bundle rule ${bundle.name}:`, error.message);
          }
        }
      }

      // Assign lifestyle upsells (max 2 per proposal)
      const selectedUpsells = lifestyleUpsells.slice(0, 2);
      
      for (const upsell of selectedUpsells) {
        try {
          const expirationDate = calculateOfferExpirationDate('days', 30);
          
          await executeQuery(`
            INSERT INTO proposal_offers (
              proposal_id, offer_type, offer_id, discount_amount, expiration_date, status
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (proposal_id, offer_type, offer_id) DO NOTHING
          `, [
            proposalId,
            'lifestyle_upsell',
            upsell.id,
            0, // Lifestyle upsells add cost, don't discount
            expirationDate,
            'active'
          ]);
          
          assignedCount++;
          totalAssigned++;
          console.log(`  ✓ Assigned lifestyle upsell: ${upsell.product_suggestion}`);
        } catch (error) {
          console.log(`  ✗ Failed to assign lifestyle upsell ${upsell.product_suggestion}:`, error.message);
        }
      }

      console.log(`  Total offers assigned to ${proposal.proposal_number}: ${assignedCount}`);
    }

    console.log(`\n✅ Assignment complete!`);
    console.log(`Total offers assigned: ${totalAssigned}`);
    console.log(`Proposals processed: ${proposalsWithoutOffers.length}`);

  } catch (error) {
    console.error('Error assigning offers to proposals:', error);
    throw error;
  } finally {
    // No need to close connection with Neon serverless
  }
}

// Run the script if called directly
if (require.main === module) {
  assignOffersToExistingProposals()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { assignOffersToExistingProposals }; 