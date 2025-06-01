const { executeQuery } = require('./lib/db.js');
const fs = require('fs');

async function runMigration() {
  try {
    console.log('🚀 Starting Activity Log Migration...');
    
    // Read the migration file
    const migrationSQL = fs.readFileSync('migrations/redesign_activity_log.sql', 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      if (statement.includes('RAISE NOTICE')) {
        // Handle DO blocks specially
        try {
          const result = await executeQuery(statement);
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          console.log(`⚠️  Statement ${i + 1} notice: ${error.message}`);
        }
      } else {
        try {
          await executeQuery(statement);
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
          throw error;
        }
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
    // Verify the new table structure
    console.log('\n🔍 Verifying new table structure...');
    const columns = await executeQuery(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'activity_log' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nNew activity_log columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Test the log_activity function
    console.log('\n🧪 Testing log_activity function...');
    const testResult = await executeQuery(`
      SELECT log_activity(
        'test_migration', 'system', 'system', 'Migration Test',
        'system_setting', NULL, 'migration_test',
        NULL, NULL, NULL,
        '{"test": true}'::jsonb, NULL, NULL,
        'Testing the new activity log system after migration'
      ) as activity_id
    `);
    
    console.log(`✅ Test activity logged with ID: ${testResult[0].activity_id}`);
    
    // Check if the view works
    console.log('\n📊 Testing activity_log_with_details view...');
    const viewTest = await executeQuery(`
      SELECT COUNT(*) as total_activities 
      FROM activity_log_with_details
    `);
    
    console.log(`✅ Activity log view working - ${viewTest[0].total_activities} total activities`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 