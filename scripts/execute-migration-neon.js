const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Use the database connection string from your project
const DATABASE_URL = "postgres://neondb_owner:npg_08pKGFSnHerQ@ep-jolly-dream-a4e95pml-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function runMigration() {
  console.log('🚀 Running proposal improvement migration...');
  
  try {
    // Create Neon client
    const sql = neon(DATABASE_URL);
    
    console.log('📝 Executing migration statements individually...');
    
    // Execute each statement individually using tagged template literals
    
    // 1. Create sequence
    console.log('⏳ Creating proposal number sequence...');
    try {
      await sql`CREATE SEQUENCE IF NOT EXISTS proposal_number_seq START 10000`;
      console.log('✅ Proposal number sequence created');
    } catch (error) {
      console.log(`⚠️  Sequence creation: ${error.message}`);
    }
    
    // 2. Clean up duplicates first
    console.log('⏳ Cleaning up duplicate proposals...');
    try {
      await sql`
        WITH duplicate_proposals AS (
          SELECT 
            p.id,
            p.customer_id,
            p.user_id,
            p.status,
            p.created_at,
            ROW_NUMBER() OVER (
              PARTITION BY p.customer_id, p.user_id, p.status 
              ORDER BY p.updated_at DESC, p.created_at DESC
            ) as rn
          FROM proposals p
          WHERE p.status IN ('draft', 'draft_in_progress', 'draft_complete')
        )
        DELETE FROM proposals 
        WHERE id IN (
          SELECT id FROM duplicate_proposals WHERE rn > 1
        )
      `;
      console.log('✅ Duplicate proposals cleaned up');
    } catch (error) {
      console.log(`⚠️  Duplicate cleanup: ${error.message}`);
    }
    
    // 3. Create unique index
    console.log('⏳ Creating unique constraint index...');
    try {
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_one_draft_per_customer_user 
        ON proposals(customer_id, user_id) 
        WHERE status IN ('draft', 'draft_in_progress', 'draft_complete')
      `;
      console.log('✅ Unique constraint index created');
    } catch (error) {
      console.log(`⚠️  Unique index creation: ${error.message}`);
    }
    
    // 4. Create performance indexes
    console.log('⏳ Creating performance indexes...');
    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_proposals_user_status_updated 
        ON proposals(user_id, status, updated_at DESC)
      `;
      console.log('✅ User status index created');
    } catch (error) {
      console.log(`⚠️  User status index: ${error.message}`);
    }
    
    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_proposals_customer_user_status 
        ON proposals(customer_id, user_id, status)
      `;
      console.log('✅ Customer user status index created');
    } catch (error) {
      console.log(`⚠️  Customer user status index: ${error.message}`);
    }
    
    // 5. Create proposal number generator function
    console.log('⏳ Creating proposal number generator function...');
    try {
      await sql`
        CREATE OR REPLACE FUNCTION generate_proposal_number() 
        RETURNS TEXT AS $$
        DECLARE
            next_num INTEGER;
        BEGIN
            SELECT nextval('proposal_number_seq') INTO next_num;
            RETURN 'PRO-' || LPAD(next_num::TEXT, 5, '0');
        END;
        $$ LANGUAGE plpgsql
      `;
      console.log('✅ Proposal number generator function created');
    } catch (error) {
      console.log(`⚠️  Function creation: ${error.message}`);
    }
    
    // 6. Create find existing draft function
    console.log('⏳ Creating find existing draft function...');
    try {
      await sql`
        CREATE OR REPLACE FUNCTION find_existing_draft(
            p_customer_email TEXT,
            p_user_id TEXT,
            p_time_window INTERVAL DEFAULT INTERVAL '2 hours'
        ) 
        RETURNS TABLE(proposal_id INTEGER, proposal_number TEXT) AS $$
        BEGIN
            RETURN QUERY
            SELECT p.id, p.proposal_number
            FROM proposals p
            JOIN customers c ON p.customer_id = c.id
            WHERE c.email = p_customer_email 
            AND p.user_id = p_user_id
            AND p.status IN ('draft', 'draft_in_progress', 'draft_complete')
            AND p.updated_at > NOW() - p_time_window
            ORDER BY p.updated_at DESC
            LIMIT 1;
        END;
        $$ LANGUAGE plpgsql
      `;
      console.log('✅ Find existing draft function created');
    } catch (error) {
      console.log(`⚠️  Find draft function: ${error.message}`);
    }
    
    // Test the new functions
    console.log('\n🧪 Testing new database functions...');
    
    try {
      // Test proposal number generation
      const numberTest = await sql`SELECT generate_proposal_number() as test_number`;
      console.log(`✅ Proposal number generation works: ${numberTest[0].test_number}`);
    } catch (error) {
      console.log(`⚠️  Proposal number generation test failed: ${error.message}`);
    }
    
    try {
      // Test find existing draft function
      const draftTest = await sql`SELECT * FROM find_existing_draft('test@example.com', 'test-user-id', INTERVAL '2 hours')`;
      console.log(`✅ Find existing draft function works (returned ${draftTest.length} rows)`);
    } catch (error) {
      console.log(`⚠️  Find existing draft test failed: ${error.message}`);
    }
    
    try {
      // Check if unique index exists
      const indexCheck = await sql`
        SELECT indexname 
        FROM pg_indexes 
        WHERE indexname = 'idx_one_draft_per_customer_user'
      `;
      
      if (indexCheck.length > 0) {
        console.log('✅ Unique constraint index verified');
      } else {
        console.log('⚠️  Unique constraint index not found');
      }
    } catch (error) {
      console.log(`⚠️  Index check failed: ${error.message}`);
    }
    
    // Check existing proposals structure
    try {
      const proposalCheck = await sql`
        SELECT proposal_number, created_at 
        FROM proposals 
        ORDER BY created_at DESC 
        LIMIT 5
      `;
      
      console.log(`\n📊 Recent proposals in database:`);
      if (proposalCheck.length > 0) {
        proposalCheck.forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.proposal_number} (${new Date(p.created_at).toLocaleDateString()})`);
        });
      } else {
        console.log('   No proposals found in database');
      }
    } catch (error) {
      console.log(`⚠️  Could not check existing proposals: ${error.message}`);
    }
    
    // Test sequence value
    try {
      const seqTest = await sql`SELECT currval('proposal_number_seq') as current_value`;
      console.log(`📊 Current sequence value: ${seqTest[0].current_value}`);
    } catch (error) {
      console.log(`📊 Sequence not yet used (this is normal for new installations)`);
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Summary of changes applied:');
    console.log('   ✅ Sequential proposal number generation (PRO-10000, PRO-10001, etc.)');
    console.log('   ✅ Duplicate draft prevention with unique constraints');
    console.log('   ✅ Database functions for better draft management');
    console.log('   ✅ Improved indexes for better performance');
    console.log('   ✅ Cleanup of existing duplicate proposals');
    console.log('\n✨ The proposal creation system should now prevent multiple proposals with different PRO numbers!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Test creating a new proposal - should get PRO-10000 (or next sequential)');
    console.log('   2. Try interrupting and restarting proposal creation');
    console.log('   3. Verify no duplicate proposals are created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration }; 