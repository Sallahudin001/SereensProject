const { executeQuery } = require('../lib/db.js');

async function fixUserAssociations() {
  try {
    console.log('🔧 Fixing user associations for existing data...\n');

    // Get the first admin user to assign orphaned data to
    const adminUsers = await executeQuery(`
      SELECT clerk_id, name, email 
      FROM users 
      WHERE role = 'admin' 
      ORDER BY created_at ASC 
      LIMIT 1
    `);

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found. Creating a default admin user first...');
      
      // Create a default admin user using the first user in the system
      const firstUser = await executeQuery(`
        SELECT clerk_id, name, email 
        FROM users 
        ORDER BY created_at ASC 
        LIMIT 1
      `);
      
      if (firstUser.length === 0) {
        console.log('❌ No users found in the system at all!');
        return;
      }

      // Update first user to be admin
      await executeQuery(`
        UPDATE users 
        SET role = 'admin' 
        WHERE clerk_id = $1
      `, [firstUser[0].clerk_id]);
      
      adminUsers.push(firstUser[0]);
      console.log(`✅ Made user ${firstUser[0].name} (${firstUser[0].email}) an admin`);
    }

    const defaultAdmin = adminUsers[0];
    console.log(`📝 Using ${defaultAdmin.name} (${defaultAdmin.email}) as default creator for orphaned data\n`);

    // Fix proposals with NULL user_id
    console.log('🔧 Fixing proposals with NULL user_id...');
    const proposalUpdate = await executeQuery(`
      UPDATE proposals 
      SET user_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id IS NULL
    `, [defaultAdmin.clerk_id]);
    
    console.log(`✅ Updated ${proposalUpdate.rowCount || 0} proposals`);

    // Fix customers with NULL user_id
    console.log('🔧 Fixing customers with NULL user_id...');
    const customerUpdate = await executeQuery(`
      UPDATE customers 
      SET user_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id IS NULL
    `, [defaultAdmin.clerk_id]);
    
    console.log(`✅ Updated ${customerUpdate.rowCount || 0} customers`);

    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    
    const proposalsAfter = await executeQuery(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_user,
        COUNT(CASE WHEN user_id IS NULL THEN 1 END) as without_user
      FROM proposals
    `);
    
    const customersAfter = await executeQuery(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_user,
        COUNT(CASE WHEN user_id IS NULL THEN 1 END) as without_user
      FROM customers
    `);

    console.log(`📊 Proposals: ${proposalsAfter[0].total} total, ${proposalsAfter[0].with_user} with user, ${proposalsAfter[0].without_user} without user`);
    console.log(`📊 Customers: ${customersAfter[0].total} total, ${customersAfter[0].with_user} with user, ${customersAfter[0].without_user} without user`);

    // Test the admin API queries
    console.log('\n🧪 Testing admin API queries...');
    
    const proposalTest = await executeQuery(`
      SELECT 
        p.proposal_number,
        u.name as creator_name
      FROM proposals p 
      LEFT JOIN users u ON p.user_id = u.clerk_id 
      LIMIT 3
    `);
    
    console.log('Sample proposals with creator names:');
    proposalTest.forEach(p => {
      console.log(`  - ${p.proposal_number}: ${p.creator_name || 'NULL'}`);
    });

    const customerTest = await executeQuery(`
      SELECT 
        c.name,
        u.name as creator_name
      FROM customers c 
      LEFT JOIN users u ON c.user_id = u.clerk_id 
      LIMIT 3
    `);
    
    console.log('Sample customers with creator names:');
    customerTest.forEach(c => {
      console.log(`  - ${c.name}: ${c.creator_name || 'NULL'}`);
    });

    console.log('\n✅ User associations fixed! Sales rep names should now display correctly in admin dashboard.');

  } catch (error) {
    console.error('❌ Error fixing user associations:', error);
  }
}

fixUserAssociations(); 