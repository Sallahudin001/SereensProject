const { executeQuery } = require('./lib/db.js');

async function deleteActivityLoggingSystem() {
  console.log('🔴 Starting Activity Logging System Deletion...');

  try {
    // Step 1: Drop the reporting view first (it depends on the table)
    console.log('\n🔹 Step 1: Dropping activity_log_with_details view...');
    await executeQuery(`DROP VIEW IF EXISTS activity_log_with_details CASCADE`);
    console.log('✅ View removed');

    // Step 2: Drop the logging function
    console.log('\n🔹 Step 2: Dropping log_activity function...');
    await executeQuery(`DROP FUNCTION IF EXISTS log_activity CASCADE`);
    console.log('✅ Logging function removed');

    // Step 3: Drop any triggers associated with activity_log
    console.log('\n🔹 Step 3: Dropping related triggers and functions...');
    
    // First drop the trigger
    await executeQuery(`
      DROP TRIGGER IF EXISTS tr_activity_log_update_timestamp ON activity_log
    `);
    
    // Then drop the trigger function
    await executeQuery(`
      DROP FUNCTION IF EXISTS update_activity_log_timestamp CASCADE
    `);
    console.log('✅ Triggers and supporting functions removed');

    // Step 4: Drop the activity_log table
    console.log('\n🔹 Step 4: Dropping activity_log table...');
    await executeQuery(`DROP TABLE IF EXISTS activity_log CASCADE`);
    console.log('✅ Activity log table removed');

    // Check if the backup table exists
    const backupExists = await executeQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'activity_log_backup'
      ) AS exists
    `);

    if (backupExists[0].exists) {
      console.log('\n❓ Backup table (activity_log_backup) exists.');
      console.log('   This table contains a backup of your activity log data before the migration.');
      console.log('   It can be safely kept for reference or removed if no longer needed.');
    }

    // Verify all objects have been removed
    console.log('\n🔍 Verifying deletion...');
    
    const remainingObjects = await executeQuery(`
      SELECT 
        table_name 
      FROM 
        information_schema.tables 
      WHERE 
        table_name LIKE 'activity_log%'
        AND table_schema = 'public'
    `);

    if (remainingObjects.length > 0 && !remainingObjects.some(obj => obj.table_name === 'activity_log_backup')) {
      console.log('⚠️  Warning: Some activity_log related objects still exist:');
      remainingObjects.forEach(obj => {
        console.log(`   - ${obj.table_name}`);
      });
    } else if (remainingObjects.length === 0 || 
              (remainingObjects.length === 1 && remainingObjects[0].table_name === 'activity_log_backup')) {
      console.log('✅ All activity logging system objects successfully removed');
    }

    console.log('\n🎯 Activity Logging System Deletion Complete!');
    console.log('   The activity logging functionality has been removed from the database.');
    console.log('   You should also consider:');
    console.log('   1. Removing the activity-logger-v2.ts file from your codebase');
    console.log('   2. Updating any code that references the logging functions');
    
    if (backupExists[0].exists) {
      console.log('\n💡 To remove the backup table as well, run:');
      console.log('   DROP TABLE activity_log_backup;');
    }

    return true;
  } catch (error) {
    console.error('❌ Error deleting activity logging system:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Execute the deletion
deleteActivityLoggingSystem().then(success => {
  if (success) {
    console.log('\n👍 Cleanup completed successfully.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Cleanup encountered errors. Some objects may remain.');
    process.exit(1);
  }
}); 