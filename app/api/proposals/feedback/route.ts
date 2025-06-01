import { executeQuery, sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

interface FeedbackBody {
  proposalId: number | string;
  reason: string;
  feedback?: string;
}

// Function to ensure table exists
async function ensureTableExists() {
  try {
    // Check if table exists
    const tableExists = await sql.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'proposal_feedback'
      );
    `);
    
    if (!tableExists[0].exists) {
      console.log("Creating proposal_feedback table...");
      // Create table if it doesn't exist
      await sql.query(`
        CREATE TABLE IF NOT EXISTS proposal_feedback (
          id SERIAL PRIMARY KEY,
          proposal_id INTEGER NOT NULL,
          reason VARCHAR(255) NOT NULL,
          feedback TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (proposal_id) REFERENCES proposals(id)
        );
      `);
      console.log("proposal_feedback table created successfully");
    }
    return true;
  } catch (error) {
    console.error("Error ensuring table exists:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure table exists before proceeding
    const tableCreated = await ensureTableExists();
    if (!tableCreated) {
      return NextResponse.json(
        { success: false, error: "Could not create required database table" },
        { status: 500 }
      );
    }
  
    const body = await request.json() as FeedbackBody;
    const { proposalId, reason, feedback } = body;

    if (!proposalId || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert proposalId to number if it's a string
    const proposalIdNumber = typeof proposalId === 'string' ? parseInt(proposalId, 10) : proposalId;

    // Validate if proposalId is a valid number
    if (isNaN(proposalIdNumber)) {
      return NextResponse.json(
        { success: false, error: "Invalid proposal ID" },
        { status: 400 }
      );
    }

    // Save feedback to database
    try {
      await executeQuery(
        `
        INSERT INTO proposal_feedback (proposal_id, reason, feedback)
        VALUES ($1, $2, $3)
        `,
        [proposalIdNumber, reason, feedback || ""]
      );
    } catch (dbError) {
      console.error("Database error saving feedback:", dbError);
      return NextResponse.json(
        { success: false, error: "Database error while saving feedback" },
        { status: 500 }
      );
    }

    // Log the activity
    try {
      await executeQuery(
        `
        INSERT INTO activity_log (
          action, action_category, actor_id, 
          proposal_id, metadata
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          "provide_rejection_feedback", 
          "proposal", 
          "customer", 
          proposalIdNumber, 
          JSON.stringify({ reason, feedback })
        ]
      );
    } catch (logError) {
      // Don't fail the whole operation if logging fails
      console.error("Error logging feedback activity:", logError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving proposal feedback:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save feedback", details: String(error) },
      { status: 500 }
    );
  }
} 