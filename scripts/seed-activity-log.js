// Script to seed sample activity logs for TESTING PURPOSES ONLY
// This should not be used in production environments as it generates synthetic data
// Use the normal activity logger mechanisms for real production data
const { executeQuery } = require('../lib/db.js');

async function seedActivityLog() {
  console.log('⚠️  TESTING ONLY: Seeding activity log with sample data');
  console.log('⚠️  This script is for development and testing environments only');
  console.log('⚠️  In production, use the activity-logger.ts module for real activity logging\n');
  
  try {
    // Get a sample proposal ID for demo purposes
    const proposals = await executeQuery(`
      SELECT id, proposal_number FROM proposals LIMIT 1
    `);
    
    const proposalId = proposals.length > 0 ? proposals[0].id : null;
    const proposalNumber = proposals.length > 0 ? proposals[0].proposal_number : 'PRO-12345';
    
    if (!proposalId) {
      console.warn('⚠️  Warning: No proposals found in the database. Using placeholder values.');
    }
    
    // Get sample admin user for demo purposes
    const users = await executeQuery(`
      SELECT id, first_name, last_name FROM admin_users LIMIT 1
    `);
    
    const userId = users.length > 0 ? users[0].id : 'system';
    const userName = users.length > 0 ? `${users[0].first_name} ${users[0].last_name}` : 'System Admin';
    
    if (!users.length) {
      console.warn('⚠️  Warning: No admin users found in the database. Using system user.');
    }
    
    // Confirm before clearing existing logs
    console.log('⚠️  This will clear existing activity logs. Press Ctrl+C to cancel...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Clear existing activity log if it exists
    await executeQuery(`
      TRUNCATE TABLE activity_log CASCADE
    `);
    
    console.log('Inserting sample activity logs...');
    
    // Sample logs for all required actions
    const activityLogs = [
      // User permission changes
      {
        proposal_id: null,
        actor_id: userId,
        action: 'update_permissions',
        action_category: 'user',
        details: JSON.stringify({
          targetUserId: 'user123',
          targetUserName: 'Jane Smith',
          permissionsChanged: { role: 'admin', canApproveDiscounts: true },
          oldPermissions: { role: 'user', canApproveDiscounts: false }
        })
      },
      // Proposal creation
      {
        proposal_id: proposalId,
        actor_id: userId,
        action: 'create_proposal',
        action_category: 'proposal',
        details: JSON.stringify({
          proposalNumber,
          customerName: 'John Doe',
          services: ['Roofing', 'HVAC']
        })
      },
      // Discount request
      {
        proposal_id: proposalId,
        actor_id: userId,
        action: 'request_discount',
        action_category: 'approval',
        details: JSON.stringify({
          proposalNumber,
          originalValue: 5000,
          requestedValue: 4500,
          discountPercent: 10,
          reason: 'Competitive matching'
        })
      },
      // Discount approval
      {
        proposal_id: proposalId,
        actor_id: userId,
        action: 'approved_discount',
        action_category: 'approval',
        details: JSON.stringify({
          proposalNumber,
          originalValue: 5000,
          requestedValue: 4500,
          notes: 'Approved for valued customer'
        })
      },
      // Pricing table update
      {
        proposal_id: null,
        actor_id: userId,
        action: 'update_pricing_table',
        action_category: 'pricing',
        details: JSON.stringify({
          category: 'Roofing',
          action: 'update',
          itemsCount: 5,
          rateName: 'Premium Roof Installation'
        })
      },
      // Financing table update
      {
        proposal_id: null,
        actor_id: userId,
        action: 'update_financing_table',
        action_category: 'financing',
        details: JSON.stringify({
          planId: 123,
          planNumber: 'FIN-001',
          planName: 'Special 0% Financing',
          provider: 'EasyFinance',
          changeType: 'update'
        })
      },
      // Proposal sent
      {
        proposal_id: proposalId,
        actor_id: userId,
        action: 'update_status_sent',
        action_category: 'proposal',
        details: JSON.stringify({
          proposalNumber,
          sentTo: 'customer@example.com'
        })
      },
      // Proposal viewed
      {
        proposal_id: proposalId,
        actor_id: 'system',
        action: 'update_status_viewed',
        action_category: 'proposal',
        details: JSON.stringify({
          proposalNumber,
          viewedAt: new Date().toISOString()
        })
      },
      // Proposal signed
      {
        proposal_id: proposalId,
        actor_id: 'system',
        action: 'update_status_signed',
        action_category: 'proposal',
        details: JSON.stringify({
          proposalNumber,
          signedAt: new Date().toISOString(),
          customerIP: '192.168.1.1'
        })
      }
    ];
    
    // Insert each activity log with different timestamps
    for (let i = 0; i < activityLogs.length; i++) {
      const log = activityLogs[i];
      const hoursAgo = i * 2; // Each log is 2 hours apart
      
      await executeQuery(`
        INSERT INTO activity_log (proposal_id, actor_id, action, action_category, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '${hoursAgo} hours')
      `, [log.proposal_id, log.actor_id, log.action, log.action_category, log.details]);
      
      console.log(`  ✅ Added: ${log.action}`);
    }
    
    console.log(`\n✅ Successfully seeded ${activityLogs.length} test activity logs`);
    console.log('⚠️  Remember: This data is synthetic and for testing only!');
    
  } catch (error) {
    console.error('❌ Error seeding activity log:', error);
    process.exit(1);
  }
}

// Execute the seed function
seedActivityLog(); 