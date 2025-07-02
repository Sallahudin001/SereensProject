const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  console.log('🚀 Running proposal improvement migration...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', 'improve_proposal_creation.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolons to handle multiple statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        await pool.query(statement);
        console.log(`✅ Statement ${i + 1} completed successfully`);
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        console.error(`Statement was: ${statement.substring(0, 100)}...`);
        // Continue with other statements unless it's a critical error
        if (error.message.includes('does not exist') || error.message.includes('already exists')) {
          console.log(`⚠️  Non-critical error, continuing...`);
        } else {
          throw error;
        }
      }
    }
    
    // Test the new functions
    console.log('\n🧪 Testing new database functions...');
    
    // Test proposal number generation
    const numberTest = await pool.query('SELECT generate_proposal_number() as test_number');
    console.log(`✅ Proposal number generation works: ${numberTest.rows[0].test_number}`);
    
    // Test find existing draft function
    const draftTest = await pool.query("SELECT * FROM find_existing_draft('test@example.com', 'test-user-id')");
    console.log(`✅ Find existing draft function works (returned ${draftTest.rows.length} rows)`);
    
    // Check if unique index exists
    const indexCheck = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE indexname = 'idx_one_draft_per_customer_user'
    `);
    
    if (indexCheck.rows.length > 0) {
      console.log('✅ Unique constraint index created successfully');
    } else {
      console.log('⚠️  Unique constraint index may not have been created');
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('   • Sequential proposal number generation (PRO-10000, PRO-10001, etc.)');
    console.log('   • Duplicate draft prevention with unique constraints');
    console.log('   • Database functions for better draft management');
    console.log('   • Improved indexes for better performance');
    console.log('\n✨ The proposal creation system should now prevent multiple proposals with different PRO numbers!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Handle command line execution
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration }; 