// Simple standalone script to set admin role using built-in https
// Usage: node scripts/set-admin-https.js USER_ID CLERK_SECRET_KEY
//Usage: md /c node scripts/set-admin-https.js user_2xC1AlGEe1JB4BjJ9bkSkT16rQZ sk_test_vSDKgoySK1e2QBfThqJfZKym4j8YIIbnzYHjNJE5WV

const https = require('https');

async function setAdminRole() {
  try {
    const userId = process.argv[2];
    const secretKey = process.argv[3];
    
    if (!userId || !secretKey) {
      console.error('Error: Both USER_ID and CLERK_SECRET_KEY are required');
      console.log('Usage: node scripts/set-admin-https.js USER_ID CLERK_SECRET_KEY');
      process.exit(1);
    }
    
    console.log(`Setting user ${userId} as admin...`);
    
    // Prepare request data
    const data = JSON.stringify({
      public_metadata: {
        role: 'admin'
      }
    });
    
    // Set up the request options
    const options = {
      hostname: 'api.clerk.com',
      port: 443,
      path: `/v1/users/${userId}/metadata`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    // Make the request
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`Success! User ${userId} is now an admin.`);
          console.log('They can now access the admin panel and set other users as admins.');
        } else {
          console.error('Clerk API error:', responseData);
          process.exit(1);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error making request:', error);
      process.exit(1);
    });
    
    // Send the request
    req.write(data);
    req.end();
  } catch (error) {
    console.error('Error setting admin role:', error);
    process.exit(1);
  }
}

setAdminRole(); 