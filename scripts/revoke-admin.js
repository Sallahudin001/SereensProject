// Script to revoke admin rights from a user
// Usage: node scripts/revoke-admin.js USER_ID CLERK_SECRET_KEY

const https = require('https');

async function revokeAdminRole() {
  try {
    const userId = process.argv[2];
    const secretKey = process.argv[3];
    
    if (!userId || !secretKey) {
      console.error('Error: Both USER_ID and CLERK_SECRET_KEY are required');
      console.log('Usage: node scripts/revoke-admin.js USER_ID CLERK_SECRET_KEY');
      process.exit(1);
    }
    
    console.log(`Revoking admin rights from user ${userId}...`);
    
    // Prepare request data - set role to null or a non-admin value
    const data = JSON.stringify({
      public_metadata: {
        role: null  // Setting to null removes the role
      }
    });
    
    // Set up the request options
    const options = {
      hostname: 'api.clerk.dev',
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
          console.log(`Success! Admin rights have been revoked from user ${userId}.`);
          console.log('The user no longer has access to the admin panel.');
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
    console.error('Error revoking admin role:', error);
    process.exit(1);
  }
}

revokeAdminRole();