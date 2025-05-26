// Simple standalone script to set admin role
// Usage: node scripts/set-admin-direct.js USER_ID CLERK_SECRET_KEY

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function setAdminRole() {
  try {
    const userId = process.argv[2];
    const secretKey = process.argv[3];
    
    if (!userId || !secretKey) {
      console.error('Error: Both USER_ID and CLERK_SECRET_KEY are required');
      console.log('Usage: node scripts/set-admin-direct.js USER_ID CLERK_SECRET_KEY');
      process.exit(1);
    }
    
    console.log(`Setting user ${userId} as admin...`);
    
    // Call Clerk API directly using fetch
    const clerkUrl = `https://api.clerk.com/v1/users/${userId}/metadata`;
    const response = await fetch(clerkUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_metadata: {
          role: 'admin'
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Clerk API error:', errorData);
      process.exit(1);
    }
    
    console.log(`Success! User ${userId} is now an admin.`);
    console.log('They can now access the admin panel and set other users as admins.');
  } catch (error) {
    console.error('Error setting admin role:', error);
    process.exit(1);
  }
}

setAdminRole(); 