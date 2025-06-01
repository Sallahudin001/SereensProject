const { executeQuery } = require('./lib/db.js');

async function demonstrateNewActivityLogging() {
  console.log('🎬 Demonstrating New Activity Logging System');
  console.log('===============================================\n');

  try {
    // Scenario 1: User creates a proposal
    console.log('📝 Scenario 1: Creating a proposal');
    const proposalActivity = await executeQuery(`
      SELECT log_activity(
        'create_proposal',
        'proposal',
        'user_clerk_12345',
        'John Smith (Sales Rep)',
        'proposal',
        1,
        'PRO-2025-001',
        1,
        NULL,
        NULL,
        '{"customer_name": "ABC Corporation", "total_amount": 15000, "services": ["roofing", "windows"]}'::jsonb,
        NULL,
        '{"status": "draft", "total": 15000}'::jsonb,
        'Created new proposal PRO-2025-001 for ABC Corporation'
      ) as activity_id
    `);
    console.log(`✅ Logged proposal creation with ID: ${proposalActivity[0].activity_id}\n`);

    // Scenario 2: User requests a discount that exceeds their limit
    console.log('💰 Scenario 2: Requesting discount approval');
    const discountRequest = await executeQuery(`
      SELECT log_activity(
        'request_discount',
        'approval',
        'user_clerk_12345',
        'John Smith (Sales Rep)',
        'approval_request',
        1,
        'PRO-2025-001-discount-15%',
        1,
        1,
        NULL,
        '{"original_amount": 15000, "requested_amount": 12750, "discount_percent": 15, "reason": "Competitive pricing needed to close deal"}'::jsonb,
        '{"discount": 0}'::jsonb,
        '{"discount": 2250, "status": "pending_approval"}'::jsonb,
        'Requested 15% discount for proposal PRO-2025-001 - exceeds user limit of 10%'
      ) as activity_id
    `);
    console.log(`✅ Logged discount request with ID: ${discountRequest[0].activity_id}\n`);

    // Scenario 3: Manager approves the discount
    console.log('✅ Scenario 3: Manager approves discount');
    const discountApproval = await executeQuery(`
      SELECT log_activity(
        'approve_discount',
        'approval',
        'admin_clerk_67890',
        'Sarah Johnson (Sales Manager)',
        'approval_request',
        1,
        'PRO-2025-001-discount-approved',
        1,
        1,
        2,
        '{"approved_amount": 12750, "discount_percent": 15, "approval_notes": "Approved for strategic customer"}'::jsonb,
        '{"status": "pending"}'::jsonb,
        '{"status": "approved", "approved_by": 2, "approved_at": "2025-01-15T10:30:00Z"}'::jsonb,
        'Approved 15% discount for proposal PRO-2025-001',
        'success',
        '192.168.1.10',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ) as activity_id
    `);
    console.log(`✅ Logged discount approval with ID: ${discountApproval[0].activity_id}\n`);

    // Scenario 4: Admin updates user permissions
    console.log('🔒 Scenario 4: Admin updates user permissions');
    const permissionUpdate = await executeQuery(`
      SELECT log_activity(
        'update_permissions',
        'user',
        'admin_clerk_99999',
        'Mike Wilson (Administrator)',
        'admin_user',
        3,
        'john.smith@company.com',
        NULL,
        NULL,
        3,
        '{"changed_fields": ["max_discount_percent", "can_approve_discounts"], "reason": "Promotion to senior sales rep"}'::jsonb,
        '{"max_discount_percent": 10, "can_approve_discounts": false}'::jsonb,
        '{"max_discount_percent": 15, "can_approve_discounts": true}'::jsonb,
        'Updated permissions for John Smith - increased discount limit to 15%'
      ) as activity_id
    `);
    console.log(`✅ Logged permission update with ID: ${permissionUpdate[0].activity_id}\n`);

    // Scenario 5: Customer views the proposal
    console.log('👀 Scenario 5: Customer views proposal');
    const proposalView = await executeQuery(`
      SELECT log_activity(
        'view_proposal',
        'proposal',
        'customer_email_abc@corp.com',
        'Customer (ABC Corporation)',
        'proposal',
        1,
        'PRO-2025-001',
        1,
        NULL,
        NULL,
        '{"view_method": "email_link", "device": "mobile", "location": "external"}'::jsonb,
        '{"status": "sent"}'::jsonb,
        '{"status": "viewed", "viewed_at": "2025-01-15T14:45:00Z"}'::jsonb,
        'Proposal PRO-2025-001 viewed by customer via email link'
      ) as activity_id
    `);
    console.log(`✅ Logged proposal view with ID: ${proposalView[0].activity_id}\n`);

    // Scenario 6: System automatically backs up data
    console.log('🔄 Scenario 6: System performs automatic backup');
    const systemBackup = await executeQuery(`
      SELECT log_activity(
        'automated_backup',
        'system',
        'system',
        'System Scheduler',
        'system_setting',
        NULL,
        'daily_backup_routine',
        NULL,
        NULL,
        NULL,
        '{"backup_type": "incremental", "tables_backed_up": 15, "size_mb": 125.7, "duration_seconds": 42}'::jsonb,
        NULL,
        '{"last_backup": "2025-01-15T02:00:00Z", "status": "completed"}'::jsonb,
        'Daily incremental backup completed successfully'
      ) as activity_id
    `);
    console.log(`✅ Logged system backup with ID: ${systemBackup[0].activity_id}\n`);

    // Scenario 7: Failed authentication attempt
    console.log('🚨 Scenario 7: Failed login attempt');
    const failedLogin = await executeQuery(`
      SELECT log_activity(
        'failed_login',
        'security',
        'unknown_user@suspicious.com',
        'Unknown User',
        'user',
        NULL,
        'failed_authentication',
        NULL,
        NULL,
        NULL,
        '{"failure_reason": "invalid_password", "attempts_count": 3, "account_locked": true}'::jsonb,
        NULL,
        NULL,
        'Failed login attempt - too many invalid password attempts',
        'failed',
        '198.51.100.42',
        'Mozilla/5.0 (suspicious user agent)'
      ) as activity_id
    `);
    console.log(`✅ Logged security event with ID: ${failedLogin[0].activity_id}\n`);

    // Now let's query the data using the enriched view
    console.log('📊 Recent Activity Report (using enriched view)');
    console.log('==============================================');
    
    const recentActivities = await executeQuery(`
      SELECT 
        action,
        action_category,
        actor_name,
        description,
        proposal_number,
        customer_name,
        status,
        created_at,
        metadata->>'total_amount' as amount,
        metadata->>'discount_percent' as discount_percent
      FROM activity_log_with_details 
      WHERE created_at > NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    recentActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.action} (${activity.action_category})`);
      console.log(`   Actor: ${activity.actor_name}`);
      console.log(`   Description: ${activity.description}`);
      if (activity.proposal_number) {
        console.log(`   Proposal: ${activity.proposal_number} for ${activity.customer_name || 'N/A'}`);
      }
      if (activity.amount) {
        console.log(`   Amount: $${parseFloat(activity.amount).toLocaleString()}`);
      }
      if (activity.discount_percent) {
        console.log(`   Discount: ${activity.discount_percent}%`);
      }
      console.log(`   Status: ${activity.status}`);
      console.log(`   Time: ${new Date(activity.created_at).toLocaleString()}\n`);
    });

    // Show activity breakdown by category
    console.log('📈 Activity Breakdown by Category');
    console.log('================================');
    
    const categoryBreakdown = await executeQuery(`
      SELECT 
        action_category,
        COUNT(*) as total_activities,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        MAX(created_at) as latest_activity
      FROM activity_log 
      GROUP BY action_category 
      ORDER BY total_activities DESC
    `);

    categoryBreakdown.forEach(cat => {
      console.log(`${cat.action_category.toUpperCase()}: ${cat.total_activities} activities`);
      console.log(`   Success: ${cat.successful} | Failed: ${cat.failed}`);
      console.log(`   Latest: ${new Date(cat.latest_activity).toLocaleString()}\n`);
    });

    // Test foreign key relationships
    console.log('🔗 Testing Foreign Key Relationships');
    console.log('===================================');
    
    const proposalActivities = await executeQuery(`
      SELECT 
        al.action,
        al.actor_name,
        al.description,
        p.proposal_number,
        p.status as proposal_status,
        c.name as customer_name
      FROM activity_log al
      JOIN proposals p ON al.proposal_id = p.id
      JOIN customers c ON p.customer_id = c.id
      WHERE al.action_category = 'proposal'
      ORDER BY al.created_at DESC
      LIMIT 5
    `);

    console.log('Proposal-related activities with full context:');
    proposalActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.action} by ${activity.actor_name}`);
      console.log(`   Proposal: ${activity.proposal_number} (${activity.proposal_status})`);
      console.log(`   Customer: ${activity.customer_name}`);
      console.log(`   Description: ${activity.description}\n`);
    });

    console.log('🎉 Demonstration completed successfully!');
    console.log('\n✨ Key Features Demonstrated:');
    console.log('   ✅ Comprehensive activity tracking across all system areas');
    console.log('   ✅ Structured categorization (proposal, approval, user, system, security)');
    console.log('   ✅ Rich metadata storage with before/after state tracking');
    console.log('   ✅ Proper foreign key relationships with related entities');
    console.log('   ✅ Security auditing with IP addresses and user agents');
    console.log('   ✅ Enriched reporting views for easy data analysis');
    console.log('   ✅ Data integrity constraints and validation');
    console.log('   ✅ Performance-optimized with 13 indexes');

  } catch (error) {
    console.error('❌ Demonstration failed:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
  }
}

demonstrateNewActivityLogging(); 