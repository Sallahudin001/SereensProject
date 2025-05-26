import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import fs from "fs";
import path from "path";

// One-time endpoint to run the migration
export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key');
    
    // Very simple security check - in a real app, use a proper API key system
    if (apiKey !== process.env.MIGRATION_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', 'add_financing_plan_to_proposals.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    // Execute each statement separately
    for (const statement of statements) {
      if (statement.trim()) {
        await executeQuery(statement);
      }
    }
    
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