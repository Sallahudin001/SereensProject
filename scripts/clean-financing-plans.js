// Clean and deduplicate financing plans to fix the issue with duplicate plans in the UI
const { executeQuery } = require('../lib/db');

async function cleanFinancingPlans() {
  try {
    console.log('Starting financing plans cleanup...');
    
    // Get count before deduplication
    const beforeCount = await executeQuery(`
      SELECT COUNT(*) as count FROM financing_plans
    `);
    console.log(`Current financing plans count: ${beforeCount[0].count}`);
    
    // Find duplicates to get a mapping of which plans should be kept
    const duplicates = await executeQuery(`
      SELECT plan_number, provider, payment_factor, COUNT(*) as count,
        array_agg(id ORDER BY id DESC) as ids
      FROM financing_plans
      GROUP BY plan_number, provider, payment_factor
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate plan groups`);
      console.log('Duplicate plans found:');
      
      // Create a mapping of duplicate IDs to the ID that should be kept
      const idMapping = {};
      let totalDuplicates = 0;
      
      for (const group of duplicates) {
        const ids = group.ids.slice(1); // Skip the first ID (which we'll keep)
        const keepId = group.ids[0];
        totalDuplicates += ids.length;
        
        console.log(`Group: ${group.provider} - ${group.plan_number} (${group.payment_factor}%)`);
        console.log(`  Keep ID: ${keepId}, Duplicate IDs: ${ids.join(', ')}`);
        
        // Map each duplicate ID to the ID to keep
        for (const id of ids) {
          idMapping[id] = keepId;
        }
      }
      
      console.log(`Total duplicates to update: ${totalDuplicates}`);
      
      // Begin transaction
      await executeQuery('BEGIN');
      
      try {
        // First, update all financing_calculations references to point to the kept IDs
        console.log('Updating financing_calculations references...');
        
        for (const oldId in idMapping) {
          const newId = idMapping[oldId];
          console.log(`Updating references from ID ${oldId} to ID ${newId}`);
          
          await executeQuery(`
            UPDATE financing_calculations
            SET financing_plan_id = $1
            WHERE financing_plan_id = $2
          `, [newId, oldId]);
          
          // Also update proposals if needed
          await executeQuery(`
            UPDATE proposals
            SET financing_plan_id = $1
            WHERE financing_plan_id = $2
          `, [newId, oldId]);
        }
        
        // Now delete the duplicate plans
        console.log('Deleting duplicate plans...');
        for (const oldId in idMapping) {
          await executeQuery(`
            DELETE FROM financing_plans
            WHERE id = $1
          `, [oldId]);
        }
        
        // Try to add a unique constraint
        try {
          console.log('Attempting to add unique constraint...');
          await executeQuery(`
            ALTER TABLE financing_plans
            ADD CONSTRAINT unique_plan_provider_factor 
            UNIQUE (plan_number, provider, payment_factor)
          `);
          console.log('Unique constraint added successfully.');
        } catch (error) {
          console.log('Unique constraint may already exist or could not be created:', error.message);
        }
        
        // Commit transaction
        await executeQuery('COMMIT');
        console.log('Transaction committed successfully.');
      } catch (error) {
        // Rollback on error
        await executeQuery('ROLLBACK');
        console.error('Error during transaction, rolled back:', error);
        throw error;
      }
      
      // Get final count
      const afterCount = await executeQuery(`
        SELECT COUNT(*) as count FROM financing_plans
      `);
      
      console.log(`
        Deduplication complete:
        - Before: ${beforeCount[0].count} plans
        - After: ${afterCount[0].count} plans
        - Duplicates removed: ${beforeCount[0].count - afterCount[0].count}
      `);
    } else {
      console.log('No duplicates found, nothing to do.');
    }
  } catch (error) {
    console.error('Error cleaning financing plans:', error);
  } finally {
    process.exit(0);
  }
}

cleanFinancingPlans(); 