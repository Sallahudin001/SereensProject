const { executeQuery } = require('../lib/db.js');

async function checkData() {
  try {
    console.log('🔍 Checking database relationships...\n');

    // Check proposals data
    console.log('📋 PROPOSALS DATA:');
    const proposals = await executeQuery(`
      SELECT 
        p.id, 
        p.proposal_number, 
        p.user_id, 
        u.name as creator_name,
        u.clerk_id as creator_clerk_id
      FROM proposals p 
      LEFT JOIN users u ON p.user_id = u.clerk_id 
      LIMIT 5
    `);
    
    console.log('Proposals with creator info:');
    proposals.forEach(p => {
      console.log(`  - Proposal ${p.proposal_number}: user_id=${p.user_id}, creator_name=${p.creator_name || 'NULL'}`);
    });

    // Check customers data
    console.log('\n👥 CUSTOMERS DATA:');
    const customers = await executeQuery(`
      SELECT 
        c.id, 
        c.name, 
        c.user_id, 
        u.name as creator_name,
        u.clerk_id as creator_clerk_id
      FROM customers c 
      LEFT JOIN users u ON c.user_id = u.clerk_id 
      LIMIT 5
    `);
    
    console.log('Customers with creator info:');
    customers.forEach(c => {
      console.log(`  - Customer ${c.name}: user_id=${c.user_id}, creator_name=${c.creator_name || 'NULL'}`);
    });

    // Check for null user_ids
    console.log('\n❓ NULL USER_ID ANALYSIS:');
    
    const nullProposals = await executeQuery(`
      SELECT COUNT(*) as count FROM proposals WHERE user_id IS NULL
    `);
    console.log(`Proposals with NULL user_id: ${nullProposals[0].count}`);

    const nullCustomers = await executeQuery(`
      SELECT COUNT(*) as count FROM customers WHERE user_id IS NULL
    `);
    console.log(`Customers with NULL user_id: ${nullCustomers[0].count}`);

    // Check total counts
    const totalProposals = await executeQuery(`SELECT COUNT(*) as count FROM proposals`);
    const totalCustomers = await executeQuery(`SELECT COUNT(*) as count FROM customers`);
    const totalUsers = await executeQuery(`SELECT COUNT(*) as count FROM users`);
    
    console.log(`\n📊 TOTALS:`);
    console.log(`Total proposals: ${totalProposals[0].count}`);
    console.log(`Total customers: ${totalCustomers[0].count}`);
    console.log(`Total users: ${totalUsers[0].count}`);

  } catch (error) {
    console.error('❌ Error checking data:', error);
  }
}

checkData(); 