const { executeQuery } = require('./lib/db.js');

async function runMigration() {
  console.log('🚀 Starting Activity Log Migration...');
  
  try {
    // Step 1: Backup existing data
    console.log('\n📋 Step 1: Backing up existing activity_log data...');
    try {
      const backupResult = await executeQuery(`
        CREATE TABLE IF NOT EXISTS activity_log_backup AS 
        SELECT * FROM activity_log
      `);
      console.log('✅ Created backup table: activity_log_backup');
      
      // Count backed up records
      const countResult = await executeQuery('SELECT COUNT(*) as count FROM activity_log_backup');
      console.log(`   Backed up ${countResult[0].count} records`);
    } catch (error) {
      console.log('⚠️  Backup failed:', error.message);
    }
    
    // Step 2: Drop existing table
    console.log('\n🗑️  Step 2: Dropping existing activity_log table...');
    await executeQuery('DROP TABLE IF EXISTS activity_log CASCADE');
    console.log('✅ Dropped old activity_log table');
    
    // Step 3: Create new table
    console.log('\n🏗️  Step 3: Creating new activity_log table...');
    await executeQuery(`
      CREATE TABLE activity_log (
          id BIGSERIAL PRIMARY KEY,
          
          -- Core action information
          action VARCHAR(100) NOT NULL,
          action_category VARCHAR(50) NOT NULL,
          description TEXT,
          
          -- Actor information (who performed the action)
          actor_type VARCHAR(20) NOT NULL DEFAULT 'user',
          actor_id VARCHAR(100) NOT NULL,
          actor_name VARCHAR(255),
          
          -- Target information (what was acted upon)
          target_type VARCHAR(50),
          target_id INTEGER,
          target_identifier VARCHAR(255),
          
          -- Entity relationships with proper foreign keys
          proposal_id INTEGER REFERENCES proposals(id) ON DELETE SET NULL,
          approval_request_id INTEGER REFERENCES approval_requests(id) ON DELETE SET NULL,
          admin_user_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
          
          -- Structured data storage
          metadata JSONB NOT NULL DEFAULT '{}',
          before_state JSONB,
          after_state JSONB,
          
          -- Audit trail information
          status VARCHAR(20) DEFAULT 'success',
          error_message TEXT,
          ip_address INET,
          user_agent TEXT,
          
          -- Timestamps
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          
          -- Constraints
          CONSTRAINT valid_action_category CHECK (action_category IN (
              'proposal', 'approval', 'user', 'system', 'pricing', 'financing', 'authentication', 'security'
          )),
          CONSTRAINT valid_actor_type CHECK (actor_type IN ('user', 'admin', 'system', 'customer')),
          CONSTRAINT valid_status CHECK (status IN ('success', 'failed', 'pending', 'cancelled', 'warning')),
          CONSTRAINT valid_target_type CHECK (target_type IN (
              'proposal', 'user', 'admin_user', 'approval_request', 'pricing_item', 
              'financing_plan', 'customer', 'contract', 'system_setting', 'permission'
          ))
      )
    `);
    console.log('✅ Created new activity_log table with comprehensive schema');
    
    // Verify table was created properly
    const tableCheck = await executeQuery(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'activity_log' 
      ORDER BY ordinal_position
    `);
    console.log(`   Table created with ${tableCheck.length} columns`);
    
    // Step 4: Create indexes
    console.log('\n📊 Step 4: Creating optimized indexes...');
    const indexes = [
      'CREATE INDEX idx_activity_log_action ON activity_log(action)',
      'CREATE INDEX idx_activity_log_action_category ON activity_log(action_category)',
      'CREATE INDEX idx_activity_log_actor_id ON activity_log(actor_id)',
      'CREATE INDEX idx_activity_log_target_type_id ON activity_log(target_type, target_id)',
      'CREATE INDEX idx_activity_log_proposal_id ON activity_log(proposal_id)',
      'CREATE INDEX idx_activity_log_approval_request_id ON activity_log(approval_request_id)',
      'CREATE INDEX idx_activity_log_admin_user_id ON activity_log(admin_user_id)',
      'CREATE INDEX idx_activity_log_created_at ON activity_log(created_at)',
      'CREATE INDEX idx_activity_log_status ON activity_log(status)',
      'CREATE INDEX idx_activity_log_actor_name ON activity_log(actor_name)',
      'CREATE INDEX idx_activity_log_metadata ON activity_log USING GIN(metadata)',
      'CREATE INDEX idx_activity_log_before_state ON activity_log USING GIN(before_state)',
      'CREATE INDEX idx_activity_log_after_state ON activity_log USING GIN(after_state)'
    ];
    
    for (let i = 0; i < indexes.length; i++) {
      await executeQuery(indexes[i]);
      console.log(`   ✅ Created index ${i + 1}/${indexes.length}`);
    }
    console.log(`✅ Created all ${indexes.length} indexes for optimal performance`);
    
    // Step 5: Create reporting view
    console.log('\n📈 Step 5: Creating activity_log_with_details view...');
    await executeQuery(`
      CREATE OR REPLACE VIEW activity_log_with_details AS
      SELECT 
          al.*,
          p.proposal_number,
          p.status as proposal_status,
          c.name as customer_name,
          ar.request_type as approval_type,
          ar.status as approval_status,
          au.first_name || ' ' || au.last_name as admin_user_name,
          au.role as admin_user_role,
          u.name as user_name,
          u.email as user_email
      FROM activity_log al
      LEFT JOIN proposals p ON al.proposal_id = p.id
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN approval_requests ar ON al.approval_request_id = ar.id
      LEFT JOIN admin_users au ON al.admin_user_id = au.id
      LEFT JOIN users u ON al.actor_id = u.clerk_id
    `);
    console.log('✅ Created enriched reporting view');
    
    // Step 6: Create timestamp update trigger
    console.log('\n⏰ Step 6: Creating automatic timestamp update trigger...');
    await executeQuery(`
      CREATE OR REPLACE FUNCTION update_activity_log_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('   ✅ Created timestamp function');
    
    await executeQuery(`
      CREATE TRIGGER tr_activity_log_update_timestamp
          BEFORE UPDATE ON activity_log
          FOR EACH ROW
          EXECUTE FUNCTION update_activity_log_timestamp()
    `);
    console.log('   ✅ Created timestamp trigger');
    
    // Step 7: Create logging function
    console.log('\n🔧 Step 7: Creating standardized log_activity function...');
    await executeQuery(`
      CREATE OR REPLACE FUNCTION log_activity(
          p_action VARCHAR(100),
          p_action_category VARCHAR(50),
          p_actor_id VARCHAR(100),
          p_actor_name VARCHAR(255) DEFAULT NULL,
          p_target_type VARCHAR(50) DEFAULT NULL,
          p_target_id INTEGER DEFAULT NULL,
          p_target_identifier VARCHAR(255) DEFAULT NULL,
          p_proposal_id INTEGER DEFAULT NULL,
          p_approval_request_id INTEGER DEFAULT NULL,
          p_admin_user_id INTEGER DEFAULT NULL,
          p_metadata JSONB DEFAULT '{}',
          p_before_state JSONB DEFAULT NULL,
          p_after_state JSONB DEFAULT NULL,
          p_description TEXT DEFAULT NULL,
          p_status VARCHAR(20) DEFAULT 'success',
          p_ip_address INET DEFAULT NULL,
          p_user_agent TEXT DEFAULT NULL
      ) RETURNS BIGINT AS $$
      DECLARE
          activity_id BIGINT;
          actor_type_val VARCHAR(20) := 'user';
      BEGIN
          -- Determine actor type
          IF p_actor_id = 'system' THEN
              actor_type_val := 'system';
          ELSIF p_admin_user_id IS NOT NULL THEN
              actor_type_val := 'admin';
          END IF;
          
          -- Insert activity log record
          INSERT INTO activity_log (
              action, action_category, description,
              actor_type, actor_id, actor_name,
              target_type, target_id, target_identifier,
              proposal_id, approval_request_id, admin_user_id,
              metadata, before_state, after_state,
              status, ip_address, user_agent
          ) VALUES (
              p_action, p_action_category, p_description,
              actor_type_val, p_actor_id, p_actor_name,
              p_target_type, p_target_id, p_target_identifier,
              p_proposal_id, p_approval_request_id, p_admin_user_id,
              p_metadata, p_before_state, p_after_state,
              p_status, p_ip_address, p_user_agent
          ) RETURNING id INTO activity_id;
          
          RETURN activity_id;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('✅ Created standardized logging function');
    
    // Step 8: Test the system
    console.log('\n🧪 Step 8: Testing the new logging system...');
    const testResult = await executeQuery(`
      SELECT log_activity(
        'test_migration', 'system', 'system', 'Migration Test',
        'system_setting', NULL, 'migration_test',
        NULL, NULL, NULL,
        '{"test": true, "migration_version": "v2.0"}'::jsonb, 
        NULL, NULL,
        'Testing the new comprehensive activity log system after migration'
      ) as activity_id
    `);
    
    console.log(`✅ Test activity logged with ID: ${testResult[0].activity_id}`);
    
    // Test another activity to verify proposal relationships
    const proposalTest = await executeQuery(`
      SELECT log_activity(
        'test_proposal_activity', 'proposal', 'user123', 'Test User',
        'proposal', 1, 'TEST-001',
        1, NULL, NULL,
        '{"test": true, "proposal_number": "TEST-001"}'::jsonb, 
        NULL, NULL,
        'Testing proposal-related activity logging'
      ) as activity_id
    `);
    
    console.log(`✅ Test proposal activity logged with ID: ${proposalTest[0].activity_id}`);
    
    // Verify final structure
    console.log('\n🔍 Step 9: Verifying final table structure...');
    const finalColumns = await executeQuery(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'activity_log' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 New activity_log columns:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Test the enriched view
    const activities = await executeQuery(`
      SELECT action, action_category, actor_name, description, created_at
      FROM activity_log 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('\n📋 Recent activities:');
    activities.forEach(activity => {
      console.log(`  - ${activity.action} (${activity.action_category}) by ${activity.actor_name || activity.actor_id}`);
    });
    
    console.log('\n🎉 Activity Log Migration Completed Successfully!');
    console.log('\n✨ New Features Available:');
    console.log('   - Comprehensive relational integrity with proper foreign keys');
    console.log('   - Structured action categories: proposal, approval, user, system, pricing, financing, authentication, security');
    console.log('   - Before/after state tracking for complete audit trails');
    console.log('   - IP address and user agent tracking for security auditing');
    console.log('   - Standardized log_activity() function for consistent logging');
    console.log('   - Enriched reporting view with related entity details');
    console.log('   - Optimized indexes for fast querying and reporting');
    console.log('   - Automatic timestamp management with triggers');
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run the migration
runMigration().then(success => {
  if (success) {
    console.log('\n🚀 Migration completed successfully! You can now use the new activity logging system.');
    process.exit(0);
  } else {
    console.log('\n💥 Migration failed! Please check the errors above.');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
}); 