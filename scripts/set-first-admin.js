// This is a one-time script to set the first admin user
// Usage: node scripts/set-first-admin.js USER_ID
// You'll need to have CLERK_SECRET_KEY in your environment variables

require('dotenv').config();
const fetch = require('node-fetch');

async function setFirstAdmin() {
  try {
    const userId = process.argv[2];
    
    if (!userId) {
      console.error('Error: User ID is required');
      console.log('Usage: node scripts/set-first-admin.js USER_ID');
      process.exit(1);
    }
    
    if (!process.env.CLERK_SECRET_KEY) {
      console.error('Error: CLERK_SECRET_KEY environment variable is required');
      process.exit(1);
    }
    
    console.log(`Setting user ${userId} as admin...`);
    
    // Call Clerk API directly using fetch
    const clerkUrl = `https://api.clerk.com/v1/users/${userId}/metadata`;
    const response = await fetch(clerkUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
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

setFirstAdmin(); 