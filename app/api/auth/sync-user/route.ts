import { NextRequest, NextResponse } from "next/server";
import { ensureUserInDatabase } from "@/app/actions/user-actions";
import { auth } from "@clerk/nextjs/server";
import { executeQuery } from "@/lib/db";

// First, let's create a test function to verify database connectivity
async function testDatabaseConnection() {
  try {
    const result = await executeQuery(`SELECT NOW() as time`);
    return { 
      success: true, 
      message: `Database connection successful: ${result[0]?.time || 'unknown'}` 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("API: Starting user sync process");
    
    // First test database connection
    const dbTest = await testDatabaseConnection();
    console.log("API: Database connection test:", dbTest);
    
    if (!dbTest.success) {
      return NextResponse.json(
        { success: false, error: dbTest.message },
        { status: 500 }
      );
    }
    
    // Get the current user from auth
    let session;
    try {
      console.log("API: Getting Clerk auth session");
      session = await auth();
      console.log("API: Auth session obtained:", session ? "Session exists" : "No session");
    } catch (error) {
      console.error("API: Auth error:", error);
      // If the error is that Clerk middleware isn't detected, we can still proceed
      // by getting the userId from the request headers or cookies
      return NextResponse.json(
        { 
          success: false, 
          error: `Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}` 
        },
        { status: 500 }
      );
    }
    
    if (!session?.userId) {
      console.log("API: No userId in session");
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    console.log("API: Found userId in session:", session.userId);
    
    // Ensure user exists in the database
    console.log("API: Calling ensureUserInDatabase function");
    const result = await ensureUserInDatabase();
    
    if (!result.success) {
      console.error("API: ensureUserInDatabase failed:", result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    
    // Verify the user was actually created or updated
    try {
      console.log("API: Verifying user was stored in database");
      const verifyUser = await executeQuery(
        `SELECT id, clerk_id, email, last_login FROM users WHERE clerk_id = $1`,
        [session.userId]
      );
      
      if (verifyUser.length === 0) {
        console.error("API: User still not found in database after sync attempt");
        return NextResponse.json(
          { success: false, error: "Failed to store user in database" },
          { status: 500 }
        );
      }
      
      console.log("API: User verified in database:", verifyUser[0]);
      return NextResponse.json({ 
        success: true, 
        message: "User synced successfully",
        user: {
          id: verifyUser[0].id,
          clerk_id: verifyUser[0].clerk_id,
          email: verifyUser[0].email,
          last_login: verifyUser[0].last_login
        }
      });
    } catch (verifyError) {
      console.error("API: Error verifying user:", verifyError);
      // Still return success since the initial operation succeeded
      return NextResponse.json({ 
        success: true, 
        message: "User sync completed but verification failed",
        error: verifyError instanceof Error ? verifyError.message : "Unknown error"
      });
    }
  } catch (error) {
    console.error("API: Error syncing user:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to sync user: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
} 