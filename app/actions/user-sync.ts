"use server";

import { executeQuery } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Direct function to ensure a user is saved to the database
 * This is a simplified version with minimal error handling
 */
export async function syncUserToDatabase() {
  try {
    // Get user ID from auth
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }
    
    // Log important information
    console.log("DIRECT SYNC: Starting sync for user", userId);
    
    // First - check if table exists and create it if it doesn't
    try {
      // Check if the users table exists
      const tableCheck = await executeQuery(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        ) as exists
      `);
      
      // If no result or table doesn't exist
      if (!tableCheck[0]?.exists) {
        console.log("DIRECT SYNC: Users table doesn't exist, creating it");
        
        // Create the users table
        await executeQuery(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            clerk_id VARCHAR(255) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL,
            name VARCHAR(255),
            role VARCHAR(50),
            metadata JSONB,
            last_login TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        console.log("DIRECT SYNC: Users table created successfully");
      }
    } catch (tableError) {
      console.error("DIRECT SYNC: Error checking/creating table:", tableError);
      // Continue anyway - the table might already exist
    }
    
    // Second - try to get user information from Clerk
    const user = await currentUser();
    let email = 'unknown@example.com';
    let name = '';
    
    if (user) {
      // Get email
      if (user.emailAddresses && user.emailAddresses.length > 0) {
        email = user.emailAddresses[0].emailAddress;
      }
      
      // Get name
      if (user.firstName || user.lastName) {
        name = [user.firstName, user.lastName].filter(Boolean).join(' ');
      }
    }
    
    // Third - add or update the user with minimum required data
    try {
      // Use a simplified upsert operation
      await executeQuery(`
        INSERT INTO users (clerk_id, email, name, last_login)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (clerk_id) 
        DO UPDATE SET 
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          last_login = CURRENT_TIMESTAMP
      `, [userId, email, name]);
      
      console.log("DIRECT SYNC: User successfully saved to database:", userId);
      
      return { success: true, userId, email };
    } catch (insertError) {
      console.error("DIRECT SYNC: Error saving user:", insertError);
      return { success: false, error: "Failed to save user to database" };
    }
  } catch (error) {
    console.error("DIRECT SYNC: Main sync error:", error);
    return { success: false, error: "Error in user sync process" };
  }
} 