import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// Direct migration endpoint without file dependencies
export async function GET(req: NextRequest) {
  try {
    // Add columns directly
    await executeQuery(`
      ALTER TABLE proposals
      ADD COLUMN IF NOT EXISTS financing_plan_id INTEGER;
    `);
    
    await executeQuery(`
      ALTER TABLE proposals
      ADD COLUMN IF NOT EXISTS financing_plan_name VARCHAR(255);
    `);
    
    await executeQuery(`
      ALTER TABLE proposals
      ADD COLUMN IF NOT EXISTS merchant_fee DECIMAL(10,2);
    `);
    
    await executeQuery(`
      ALTER TABLE proposals
      ADD COLUMN IF NOT EXISTS financing_notes TEXT;
    `);
    
    // Create index
    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_proposals_financing_plan ON proposals(financing_plan_id);
    `);
    
    return NextResponse.json(
      { success: true, message: "Migration completed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error running migration:", error);
    return NextResponse.json(
      { error: "Failed to run migration", details: error },
      { status: 500 }
    );
  }
} 