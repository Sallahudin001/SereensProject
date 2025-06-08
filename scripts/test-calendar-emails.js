// Script to test calendar email functionality
const { executeQuery } = require('../lib/db');

async function testCalendarEmails() {
  console.log('🧪 Testing calendar email functionality...\n');
  
  try {
    // Test 1: Check if email tracking fields exist
    console.log('1. Checking email tracking fields...');
    
    const reminderFields = await executeQuery(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'reminders' 
      AND column_name IN ('email_sent_at', 'email_notification_enabled')
      ORDER BY column_name
    `);
    
    const appointmentFields = await executeQuery(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
      AND column_name IN ('customer_email_sent_at', 'email_notification_enabled')
      ORDER BY column_name
    `);
    
    console.log('✅ Reminder email fields:', reminderFields.length);
    reminderFields.forEach(field => {
      console.log(`   - ${field.column_name}: ${field.data_type}`);
    });
    
    console.log('✅ Appointment email fields:', appointmentFields.length);
    appointmentFields.forEach(field => {
      console.log(`   - ${field.column_name}: ${field.data_type}`);
    });
    
    // Test 2: Check for due reminders
    console.log('\n2. Checking for due reminders...');
    
    const dueReminders = await executeQuery(`
      SELECT 
        r.id,
        r.title,
        r.due_date,
        r.status,
        r.priority,
        r.email_sent_at,
        c.name as customer_name,
        c.email as customer_email
      FROM reminders r
      LEFT JOIN customers c ON r.customer_id = c.id
      WHERE r.status = 'pending'
      AND r.due_date <= CURRENT_TIMESTAMP + INTERVAL '1 hour'
      ORDER BY r.due_date ASC
      LIMIT 5
    `);
    
    console.log(`📋 Found ${dueReminders.length} due reminders:`);
    dueReminders.forEach(reminder => {
      const dueDate = new Date(reminder.due_date).toLocaleString();
      const emailSent = reminder.email_sent_at ? '✅ Sent' : '❌ Not sent';
      console.log(`   - ${reminder.title} (Due: ${dueDate}) ${emailSent}`);
    });
    
    // Test 3: Check recent appointments with customer emails
    console.log('\n3. Checking recent appointments with customers...');
    
    const recentAppointments = await executeQuery(`
      SELECT 
        a.id,
        a.title,
        a.start_time,
        a.customer_email_sent_at,
        c.name as customer_name,
        c.email as customer_email
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      WHERE a.created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
      AND c.email IS NOT NULL
      ORDER BY a.created_at DESC
      LIMIT 5
    `);
    
    console.log(`📋 Found ${recentAppointments.length} recent appointments with customers:`);
    recentAppointments.forEach(appointment => {
      const startTime = new Date(appointment.start_time).toLocaleString();
      const emailSent = appointment.customer_email_sent_at ? '✅ Sent' : '❌ Not sent';
      console.log(`   - ${appointment.title} (${startTime}) ${emailSent}`);
    });
    
    // Test 4: Email statistics
    console.log('\n4. Email notification statistics...');
    
    const emailStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_reminders,
        COUNT(CASE WHEN email_sent_at IS NOT NULL THEN 1 END) as reminder_emails_sent,
        COUNT(CASE WHEN due_date <= CURRENT_TIMESTAMP AND status = 'pending' THEN 1 END) as overdue_pending,
        COUNT(CASE WHEN due_date <= CURRENT_TIMESTAMP + INTERVAL '15 minutes' AND status = 'pending' AND email_sent_at IS NULL THEN 1 END) as pending_email_notifications
      FROM reminders
    `);
    
    const appointmentStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN customer_id IS NOT NULL THEN 1 END) as appointments_with_customers,
        COUNT(CASE WHEN customer_email_sent_at IS NOT NULL THEN 1 END) as customer_emails_sent
      FROM appointments
    `);
    
    console.log('📊 Reminder Statistics:');
    const rStats = emailStats[0];
    console.log(`   - Total reminders: ${rStats.total_reminders}`);
    console.log(`   - Emails sent: ${rStats.reminder_emails_sent}`);
    console.log(`   - Overdue pending: ${rStats.overdue_pending}`);
    console.log(`   - Pending notifications: ${rStats.pending_email_notifications}`);
    
    console.log('📊 Appointment Statistics:');
    const aStats = appointmentStats[0];
    console.log(`   - Total appointments: ${aStats.total_appointments}`);
    console.log(`   - With customers: ${aStats.appointments_with_customers}`);
    console.log(`   - Customer emails sent: ${aStats.customer_emails_sent}`);
    
    console.log('\n✅ Calendar email functionality test completed!');
    console.log('\n📧 Email Notifications Setup:');
    console.log('   - Customer notifications: Sent when appointments are scheduled');
    console.log('   - Rep notifications: Sent when reminders are due');
    console.log('   - Cron endpoint: /api/cron/reminder-notifications');
    console.log('   - Manual trigger: /api/calendar/reminders/send-notifications');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testCalendarEmails(); 