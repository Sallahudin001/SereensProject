// Script to test calendar appointment creation
const fetch = require('node-fetch');

async function testAppointmentCreation() {
  console.log('🔄 Testing calendar appointment creation...');
  
  try {
    const response = await fetch('http://localhost:3000/api/calendar/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Appointment After Fix',
        description: 'Testing appointment creation after fixing activity log constraint',
        start_time: '2023-06-15T10:00:00Z',
        end_time: '2023-06-15T11:00:00Z',
        customer_id: 1,
        location: 'Office',
        appointment_type: 'consultation'
      }),
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Appointment created successfully! Activity log constraint fix worked.');
    } else {
      console.log('❌ Appointment creation failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error testing appointment creation:', error);
  }
}

// Run the test
testAppointmentCreation(); 