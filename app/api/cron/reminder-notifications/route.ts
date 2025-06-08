import { NextRequest, NextResponse } from "next/server"
import { processDueRemindersAndSendEmails } from "@/lib/calendar-email-service"

// This endpoint can be called by a cron service (like Vercel Cron, GitHub Actions, etc.)
// POST /api/cron/reminder-notifications
export async function POST(request: NextRequest) {
  try {
    // Verify the cron request (optional security measure)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.log('⚠️ Unauthorized cron attempt')
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 })
    }

    console.log("🔄 Cron job started: Processing due reminder notifications...")

    // Process due reminders and send emails
    const result = await processDueRemindersAndSendEmails()

    if (result.success) {
      console.log(`✅ Cron job completed: ${result.emailsSent} emails sent, ${result.emailErrors} errors`)
      
      return NextResponse.json({
        success: true,
        message: "Reminder notification cron completed",
        stats: {
          emailsSent: result.emailsSent,
          emailErrors: result.emailErrors,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      console.error("❌ Cron job failed:", result.error)
      
      return NextResponse.json({
        success: false,
        error: "Cron job failed to process notifications",
        details: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ Cron job error:", error)
    return NextResponse.json({
      success: false,
      error: "Cron job encountered an error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Reminder notification cron endpoint is healthy",
    timestamp: new Date().toISOString()
  })
} 