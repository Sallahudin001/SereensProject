"use server";

import { executeQuery } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Ensure user exists in database
export async function ensureUserInDatabase() {
  try {
    const session = await auth();
    const userId = session?.userId ?? undefined;
    
    if (!userId) {
      console.log("No user ID found in auth context");
      return { success: false, error: "Not authenticated" };
    }
    
    console.log("Ensuring user in database for user ID:", userId);
    
    try {
      // Check if user exists in our database
      console.log("Checking if user exists in database...");
      const existingUser = await executeQuery(
        `SELECT * FROM users WHERE clerk_id = $1`,
        [userId]
      );
      
      console.log("Database query result:", existingUser.length > 0 ? "User exists" : "User doesn't exist");
      
      if (existingUser.length === 0) {
        // Get the current user from Clerk to access more properties
        console.log("Fetching user details from Clerk...");
        const user = await currentUser();
        
        if (!user) {
          console.log("Could not retrieve user details from Clerk");
          // Still create a basic record with just the clerk_id
          console.log("Creating basic user record...");
          await executeQuery(
            `
            INSERT INTO users (clerk_id, email, last_login)
            VALUES ($1, 'pending@example.com', CURRENT_TIMESTAMP)
            ON CONFLICT (clerk_id) DO NOTHING
            `,
            [userId]
          );
          console.log("Basic user record created successfully");
        } else {
          // Get primary email
          const email = user.emailAddresses[0]?.emailAddress || 'pending@example.com';
          
          // Get name
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';
          const name = [firstName, lastName].filter(Boolean).join(' ');
          
          // Get role from metadata if available
          const role = user.publicMetadata?.role as string | undefined;
          
          console.log("Creating user record with full details...");
          console.log("User data:", { email, name, role });
          
          try {
            // Create record with full user details
            await executeQuery(
              `
              INSERT INTO users (
                clerk_id, email, name, role, metadata, last_login, created_at, updated_at
              )
              VALUES (
                $1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
              )
              ON CONFLICT (clerk_id) DO NOTHING
              `,
              [
                userId, 
                email, 
                name, 
                role || null, 
                JSON.stringify(user.publicMetadata || {})
              ]
            );
            console.log("Full user record created successfully");
          } catch (insertError) {
            console.error("Error inserting user record:", insertError);
            // Try with minimal data as fallback
            console.log("Trying minimal insert as fallback...");
            await executeQuery(
              `
              INSERT INTO users (clerk_id, email, last_login)
              VALUES ($1, $2, CURRENT_TIMESTAMP)
              ON CONFLICT (clerk_id) DO NOTHING
              `,
              [userId, email]
            );
          }
        }
        
        console.log(`Created new user record for: ${userId}`);
      } else {
        // Update last_login timestamp
        console.log("Updating last_login for existing user...");
        await executeQuery(
          `
          UPDATE users 
          SET last_login = CURRENT_TIMESTAMP
          WHERE clerk_id = $1
          `,
          [userId]
        );
        
        console.log(`Updated last_login for user: ${userId}`);
      }
      
      return { success: true, userId };
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      return { success: false, error: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}` };
    }
  } catch (error) {
    console.error("Error ensuring user in database:", error);
    return { success: false, error: `Failed to process user: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// Get current user from database
export async function getCurrentUser() {
  try {
    const session = await auth();
    const userId = session?.userId ?? undefined;
    
    if (!userId) {
      return null;
    }
    
    const users = await executeQuery(
      `SELECT * FROM users WHERE clerk_id = $1`,
      [userId]
    );
    
    if (users.length === 0) {
      // Try to ensure the user exists
      await ensureUserInDatabase();
      
      // Try fetching again
      const retryUsers = await executeQuery(
        `SELECT * FROM users WHERE clerk_id = $1`,
        [userId]
      );
      
      return retryUsers.length > 0 ? retryUsers[0] : null;
    }
    
    return users[0];
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
} 