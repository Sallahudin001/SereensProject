// Script to update roles for all existing users
// Usage: node scripts/update-existing-roles.js CLERK_SECRET_KEY

require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { executeQuery } = require('../lib/db');

async function updateExistingRoles() {
  try {
    const secretKey = process.argv[2] || process.env.CLERK_SECRET_KEY;
    
    if (!secretKey) {
      console.error('Error: CLERK_SECRET_KEY is required');
      console.log('Usage: node scripts/update-existing-roles.js CLERK_SECRET_KEY');
      process.exit(1);
    }
    
    console.log('Fetching all users from database...');
    
    // Get all users from database
    const users = await executeQuery(`
      SELECT id, clerk_id, email, role FROM users
    `);
    
    console.log(`Found ${users.length} users in database.`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // Process each user
    for (const user of users) {
      try {
        console.log(`Processing user ${user.email} (${user.clerk_id})...`);
        
        // Get user data from Clerk
        const clerkUrl = `https://api.clerk.com/v1/users/${user.clerk_id}`;
        const response = await fetch(clerkUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.error(`Error fetching user ${user.clerk_id} from Clerk:`, await response.text());
          errorCount++;
          continue;
        }
        
        const userData = await response.json();
        const role = userData.public_metadata?.role || 'user';
        
        console.log(`User ${user.email}: Current role in DB: ${user.role || 'null'}, Clerk role: ${role}`);
        
        // Update role in database
        if (user.role !== role) {
          await executeQuery(`
            UPDATE users 
            SET role = $1, updated_at = CURRENT_TIMESTAMP
            WHERE clerk_id = $2
          `, [role, user.clerk_id]);
          
          console.log(`Updated role for ${user.email} from ${user.role || 'null'} to ${role}`);
          updatedCount++;
        } else {
          console.log(`Role already matches for ${user.email}`);
        }
      } catch (error) {
        console.error(`Error processing user ${user.clerk_id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`Total users: ${users.length}`);
    console.log(`Updated users: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('Error updating user roles:', error);
    process.exit(1);
  }
}

updateExistingRoles(); 