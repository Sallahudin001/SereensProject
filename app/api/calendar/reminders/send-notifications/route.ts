import { NextRequest, NextResponse } from "next/server"
import { getCurrentUserId, isAdmin } from "@/lib/auth-utils"
import { processDueRemindersAndSendEmails } from "@/lib/calendar-email-service"

// POST /api/calendar/reminders/send-notifications - Process and send reminder email notifications
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Check if user is admin (for manual trigger) or if it's a system call
    const userIsAdmin = await isAdmin()
    const { searchParams } = new URL(request.url)
    const isSystemCall = searchParams.get('system') === 'true'

    if (!userIsAdmin && !isSystemCall) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized - Admin access required" 
      }, { status: 403 })
    }

    console.log("🔔 Manual trigger: Processing due reminders for email notifications...")

    // Process due reminders and send emails
    const result = await processDueRemindersAndSendEmails()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Email notification processing completed`,
        stats: {
          emailsSent: result.emailsSent,
          emailErrors: result.emailErrors
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: "Failed to process reminder notifications",
        details: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error processing reminder notifications:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to process reminder notifications"
    }, { status: 500 })
  }
}

// GET /api/calendar/reminders/send-notifications - Get status of email notifications
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin()
    
    if (!userIsAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized - Admin access required" 
      }, { status: 403 })
    }

    // Get some basic stats about email notifications
    const { executeQuery } = await import("@/lib/db")
    
    const emailStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_reminders,
        COUNT(CASE WHEN email_sent_at IS NOT NULL THEN 1 END) as emails_sent,
        COUNT(CASE WHEN due_date <= CURRENT_TIMESTAMP AND status = 'pending' THEN 1 END) as overdue_pending,
        COUNT(CASE WHEN due_date <= CURRENT_TIMESTAMP + INTERVAL '15 minutes' AND status = 'pending' AND email_sent_at IS NULL THEN 1 END) as pending_notifications
      FROM reminders
    `)

    const appointmentStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN customer_email_sent_at IS NOT NULL THEN 1 END) as customer_emails_sent
      FROM appointments
      WHERE customer_id IS NOT NULL
    `)

    return NextResponse.json({
      success: true,
      stats: {
        reminders: emailStats[0] || {},
        appointments: appointmentStats[0] || {}
      }
    })
  } catch (error) {
    console.error("Error fetching notification stats:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch notification statistics"
    }, { status: 500 })
  }
} 