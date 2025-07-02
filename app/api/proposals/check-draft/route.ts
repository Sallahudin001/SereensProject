import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { findExistingDraftProposal } from "@/app/actions/proposal-actions"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerEmail = searchParams.get('email')
    
    if (!customerEmail) {
      return NextResponse.json({ 
        success: false, 
        error: "Customer email is required" 
      }, { status: 400 })
    }

    // Find existing draft for this customer and user
    const existingDraft = await findExistingDraftProposal(customerEmail, userId)
    
    if (existingDraft) {
      return NextResponse.json({
        success: true,
        found: true,
        draft: {
          id: existingDraft.proposal_id,
          proposalNumber: existingDraft.proposal_number
        }
      })
    } else {
      return NextResponse.json({
        success: true,
        found: false,
        draft: null
      })
    }
  } catch (error) {
    console.error("Error checking for existing draft:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to check for existing draft" 
    }, { status: 500 })
  }
} 