const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function fixApprovalRequestsReferences() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', 'fix_approval_requests_user_references.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Starting migration: Fix approval_requests table references...');

    // Execute the migration
    await client.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    
    // Verify the changes
    console.log('\n📋 Verifying migration results...');
    
    // Check foreign key constraints
    const constraints = await client.query(`
      SELECT conname, conrelid::regclass AS table_name, confrelid::regclass AS referenced_table
      FROM pg_constraint 
      WHERE conrelid = 'approval_requests'::regclass 
      AND contype = 'f'
    `);
    
    console.log('Foreign key constraints:');
    constraints.rows.forEach(constraint => {
      console.log(`  - ${constraint.conname}: ${constraint.table_name} -> ${constraint.referenced_table}`);
    });
    
    // Check approval_requests count
    const countResult = await client.query('SELECT COUNT(*) as count FROM approval_requests');
    console.log(`\nTotal approval requests: ${countResult.rows[0].count}`);
    
    // Check for any approval requests with invalid user references
    const invalidRefs = await client.query(`
      SELECT 
        ar.id,
        ar.requestor_id,
        ar.approver_id,
        u_requestor.clerk_id as requestor_clerk_id,
        u_approver.clerk_id as approver_clerk_id
      FROM approval_requests ar
      LEFT JOIN users u_requestor ON ar.requestor_id = u_requestor.id
      LEFT JOIN users u_approver ON ar.approver_id = u_approver.id
      WHERE u_requestor.id IS NULL OR (ar.approver_id IS NOT NULL AND u_approver.id IS NULL)
      LIMIT 5
    `);
    
    if (invalidRefs.rows.length > 0) {
      console.log(`\n⚠️  Found ${invalidRefs.rows.length} approval requests with invalid user references:`);
      invalidRefs.rows.forEach(row => {
        console.log(`  - Request ID ${row.id}: requestor_id=${row.requestor_id}, approver_id=${row.approver_id}`);
      });
    } else {
      console.log('\n✅ All approval requests have valid user references');
    }

  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  fixApprovalRequestsReferences()
    .then(() => {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { fixApprovalRequestsReferences }; 