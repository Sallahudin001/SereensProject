import { executeQuery } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// This API route handles updating a proposal to "viewed" status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get ID from params
    const id = params.id

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Proposal ID is required" },
        { status: 400 }
      )
    }

    // Update proposal status to viewed
    await executeQuery(
      `
      UPDATE proposals
      SET status = 'viewed', viewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'sent'
      `,
      [id]
    )

    // Log the activity
    await executeQuery(
      `
      INSERT INTO activity_log (proposal_id, user_id, action, details)
      VALUES ($1, $2, $3, $4)
      `,
      [id, "customer", "view_proposal", JSON.stringify({ method: "api" })]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating proposal status:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update proposal status" },
      { status: 500 }
    )
  }
} 