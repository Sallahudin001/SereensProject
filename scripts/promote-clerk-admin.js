// Simple script to promote a user to admin in Clerk
// Usage: node scripts/promote-clerk-admin.js USER_CLERK_ID

const { clerkClient } = require('@clerk/clerk-sdk-node');

async function promoteToAdmin() {
  try {
    const clerkUserId = process.argv[2];
    
    if (!clerkUserId) {
      console.error('Error: Clerk User ID is required');
      console.log('Usage: node scripts/promote-clerk-admin.js YOUR_CLERK_USER_ID');
      console.log('');
      console.log('You can find your Clerk User ID by:');
      console.log('1. Going to Clerk Dashboard > Users');
      console.log('2. Or checking browser dev tools > console and looking for current user ID');
      process.exit(1);
    }
    
    console.log('🔧 Promoting user to admin in Clerk:', clerkUserId);
    
    // Get current user data
    const user = await clerkClient.users.getUser(clerkUserId);
    console.log('Current user:', user.emailAddresses[0]?.emailAddress);
    
    // Update user metadata to include admin role
    await clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        ...user.publicMetadata,
        role: 'admin'
      }
    });
    
    console.log('✅ Successfully promoted user to admin!');
    console.log('🔄 Please refresh your browser to see the changes');
    
  } catch (error) {
    console.error('❌ Error promoting user to admin:', error.message);
    console.log('');
    console.log('Make sure:');
    console.log('1. Your CLERK_SECRET_KEY is set in .env.local');
    console.log('2. The Clerk User ID is correct');
  }
}

// Run if called directly
if (require.main === module) {
  promoteToAdmin();
}

module.exports = { promoteToAdmin }; 