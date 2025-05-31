// Master script to set up the complete activity log system
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Setting up Activity Log System...');
console.log('=================================\n');

// Function to run a script and return a promise
function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running ${scriptName}...`);
    
    const scriptProcess = spawn('node', [path.join(__dirname, scriptName)], {
      stdio: 'inherit'
    });
    
    scriptProcess.on('close', code => {
      if (code === 0) {
        console.log(`✅ ${scriptName} completed successfully`);
        resolve();
      } else {
        console.error(`❌ ${scriptName} failed with code ${code}`);
        reject(new Error(`Script ${scriptName} exited with code ${code}`));
      }
    });
    
    scriptProcess.on('error', error => {
      console.error(`❌ Error executing ${scriptName}:`, error);
      reject(error);
    });
  });
}

// Main function to run setup
async function setupActivityLog() {
  try {
    console.log('This script will set up the complete activity logging system:');
    console.log('1. Update the activity_log table schema');
    console.log('2. (Optional) Seed test data for development environments');
    console.log('\nComponents of the Activity Logging System:');
    console.log('- Database schema with activity_log table');
    console.log('- API endpoints for reading and creating logs');
    console.log('- Utility functions for logging various activities');
    console.log('- Integration with Admin Dashboard');
    console.log('\n⚠️  Ensure your database is running before continuing.\n');
    
    // Pause for 3 seconds to allow reading
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Run the schema update script
    await runScript('update-activity-log-schema.js');
    
    // Ask if the user wants to seed test data
    console.log('\nDo you want to seed test data for development/testing? (Y/n)');
    
    // This is a simple way to get user input without additional dependencies
    // For production, consider using a proper input library
    const answer = await new Promise(resolve => {
      process.stdin.resume();
      process.stdin.once('data', data => {
        const input = data.toString().trim().toLowerCase();
        process.stdin.pause();
        resolve(input === 'y' || input === 'yes' || input === '');
      });
    });
    
    if (answer) {
      await runScript('seed-activity-log.js');
    } else {
      console.log('Skipping test data seeding...');
    }
    
    console.log('\n✅ Activity Log System setup complete!');
    console.log('\nComponents installed:');
    console.log('1. Database Schema: Updated activity_log table');
    console.log('2. API: /api/admin/activity endpoints for reading and writing logs');
    console.log('3. API: /api/admin/dashboard endpoint for metrics');
    console.log('4. Utilities: lib/activity-logger.ts with specialized logging functions');
    console.log('5. UI Integration: Admin Dashboard with real-time activity feed');
    
    console.log('\nAvailable logging functions:');
    console.log('- logPermissionChange(): For user permission updates');
    console.log('- logProposalCreation(): For new proposals');
    console.log('- logProposalStatusUpdate(): For proposal status changes');
    console.log('- logDiscountRequest(): For discount requests');
    console.log('- logDiscountDecision(): For discount approvals/rejections');
    console.log('- logPricingUpdate(): For pricing table changes');
    console.log('- logFinancingUpdate(): For financing options changes');
    console.log('\nAll activity is automatically displayed in the Admin Dashboard.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Execute the setup
setupActivityLog(); 