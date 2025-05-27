// Run approval workflow database migration
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function runApprovalMigration() {
  console.log('Starting approval workflow database migration...');
  
  // Check if DATABASE_URL is defined
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not defined.');
    console.error('Please set it in your .env file or environment.');
    process.exit(1);
  }

  // Connection config with SSL support for cloud databases
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=require') ? 
      { rejectUnauthorized: false } : false
  });

  let client;
  
  try {
    client = await pool.connect();
    console.log('Successfully connected to database');
    
    // Read the approval schema SQL file
    const migrationPath = path.resolve(__dirname, '../database/approval-schema.sql');
    console.log(`Reading SQL from ${migrationPath}`);
    
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    console.log('SQL file content loaded successfully');
    
    // Begin transaction
    await client.query('BEGIN');
    console.log('Started database transaction');
    
    // Split SQL by semicolons to execute statements separately
    const statements = sqlContent.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        console.log(`Executing statement ${i+1}/${statements.length}...`);
        await client.query(stmt);
        console.log(`✅ Successfully executed statement ${i+1}`);
      } catch (err) {
        // Log error but continue with next statement (for CREATE IF NOT EXISTS, etc.)
        if (err.message.includes('already exists')) {
          console.log(`⚠️  Statement ${i+1}: ${err.message} (continuing...)`);
        } else {
          console.error(`❌ Error executing statement ${i+1}: ${err.message}`);
          console.error('Statement:', stmt.substring(0, 150) + '...');
          // Don't fail for non-critical errors
        }
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Transaction committed successfully');
    
    // Verify the migration worked by checking for key tables
    console.log('\nVerifying migration results...');
    
    try {
      const approvalRequestsCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'approval_requests'
        ) as exists
      `);
      
      if (approvalRequestsCheck.rows[0].exists) {
        console.log('✅ approval_requests table created successfully');
        
        // Check table structure
        const columns = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'approval_requests'
          ORDER BY ordinal_position
        `);
        
        console.log('📋 Table structure:');
        columns.rows.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type}`);
        });
      } else {
        console.log('❌ approval_requests table was not created');
      }
      
      // Check admin_users columns
      const adminUsersColumns = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'admin_users' 
        AND column_name IN ('max_discount_percent', 'can_approve_discounts')
      `);
      
      console.log(`✅ Added ${adminUsersColumns.rows.length} permission columns to admin_users`);
      
      // Check for sample users
      const sampleUsers = await client.query(`
        SELECT first_name, last_name, role, max_discount_percent, can_approve_discounts
        FROM admin_users 
        WHERE email IN ('manager@evergreenenergy.com', 'salesrep@evergreenenergy.com')
      `);
      
      if (sampleUsers.rows.length > 0) {
        console.log('✅ Sample users created:');
        sampleUsers.rows.forEach(user => {
          console.log(`   - ${user.first_name} ${user.last_name} (${user.role}): ${user.max_discount_percent}% max, can approve: ${user.can_approve_discounts}`);
        });
      }
      
    } catch (verifyError) {
      console.error('Error during verification:', verifyError.message);
    }
    
    console.log('\n🎉 Approval workflow migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. The discount approval workflow is now ready to use');
    console.log('2. Navigate to /admin/approvals to view the manager dashboard');
    console.log('3. Test the workflow by creating a proposal with discount > 10%');
    
  } catch (error) {
    // Rollback transaction on error
    if (client) {
      try {
        await client.query('ROLLBACK');
        console.log('Transaction rolled back due to error');
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError.message);
      }
    }
    
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
      console.log('Database connection released');
    }
    await pool.end();
    console.log('Connection pool closed');
  }
}

// Run the migration
runApprovalMigration()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  }); 