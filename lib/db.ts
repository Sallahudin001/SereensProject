import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

// Helper function to execute raw SQL queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    // Use sql.query for parameterized queries
    const result = await sql.query(query, params)
    return result
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export { sql }
