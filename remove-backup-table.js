const { executeQuery } = require('./lib/db.js');

async function removeBackupTable() {
  try {
    console.log('Removing activity_log_backup table...');
    await executeQuery('DROP TABLE IF EXISTS activity_log_backup CASCADE');
    console.log('✅ Backup table removed successfully.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

removeBackupTable(); 