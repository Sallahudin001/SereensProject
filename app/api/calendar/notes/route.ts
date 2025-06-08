import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getCurrentUserId, isAdmin } from "@/lib/auth-utils"
import { getRBACContext } from "@/lib/rbac"

// GET /api/calendar/notes - Get pipeline notes for customers
export async function GET(request: NextRequest) {
  try {
    const context = await getRBACContext()
    
    if (!context) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const noteType = searchParams.get('noteType')
    const hasFollowUp = searchParams.get('hasFollowUp')
    const limit = searchParams.get('limit')

    let query = `
      SELECT 
        pn.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        u.name as user_name,
        r.status as reminder_status,
        r.due_date as reminder_due_date,
        CASE 
          WHEN pn.follow_up_date IS NOT NULL AND pn.follow_up_date < NOW() THEN 'overdue'
          WHEN pn.follow_up_date IS NOT NULL AND pn.follow_up_date <= NOW() + INTERVAL '1 day' THEN 'due_soon'
          WHEN pn.follow_up_date IS NOT NULL THEN 'scheduled'
          ELSE 'no_followup'
        END as follow_up_status
      FROM pipeline_notes pn
      LEFT JOIN customers c ON pn.customer_id = c.id
      LEFT JOIN users u ON pn.user_id = u.clerk_id
      LEFT JOIN reminders r ON pn.reminder_id = r.id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1

    // Apply user-based filtering (RBAC) - users can only see their own notes
    if (!context.isAdmin) {
      query += ` AND pn.user_id = $${paramIndex}`
      params.push(context.userId)
      paramIndex++
    }

    // Apply customer filtering (most common use case)
    if (customerId) {
      query += ` AND pn.customer_id = $${paramIndex}`
      params.push(parseInt(customerId))
      paramIndex++
    }

    // Apply note type filtering
    if (noteType) {
      query += ` AND pn.note_type = $${paramIndex}`
      params.push(noteType)
      paramIndex++
    }

    // Filter notes with follow-up dates
    if (hasFollowUp === 'true') {
      query += ` AND pn.follow_up_date IS NOT NULL`
    } else if (hasFollowUp === 'false') {
      query += ` AND pn.follow_up_date IS NULL`
    }

    query += ` ORDER BY pn.created_at DESC`

    // Apply limit
    if (limit) {
      query += ` LIMIT $${paramIndex}`
      params.push(parseInt(limit))
    }

    const notes = await executeQuery(query, params)

    return NextResponse.json({ 
      success: true, 
      notes,
      userRole: context.role 
    })
  } catch (error) {
    console.error("Error fetching pipeline notes:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch pipeline notes" 
    }, { status: 500 })
  }
}

// POST /api/calendar/notes - Create a new pipeline note (CLIENT'S MAIN REQUIREMENT)
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const {
      customer_id,
      note_text,
      note_type = 'general',
      follow_up_date,  // This is the key field the client requested
      is_private = false,
      auto_create_reminder = true  // Automatically create reminder if follow_up_date is set
    } = body

    // Validate required fields
    if (!customer_id || !note_text) {
      return NextResponse.json({ 
        success: false, 
        error: "customer_id and note_text are required" 
      }, { status: 400 })
    }

    // Verify customer exists and user has access to it
    const customerCheck = await executeQuery(`
      SELECT c.* FROM customers c 
      WHERE c.id = $1 
      ${!await isAdmin() ? 'AND c.user_id = $2' : ''}
    `, !await isAdmin() ? [customer_id, userId] : [customer_id])

    if (customerCheck.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Customer not found or access denied" 
      }, { status: 404 })
    }

    const customer = customerCheck[0]
    let reminder_id = null

    // AUTO-CREATE REMINDER IF FOLLOW-UP DATE IS SET (Client's specific request)
    if (follow_up_date && auto_create_reminder) {
      try {
        const reminderResult = await executeQuery(`
          INSERT INTO reminders (
            title, description, due_date, user_id, customer_id, 
            reminder_type, priority, status
          ) VALUES ($1, $2, $3, $4, $5, 'follow_up', 'medium', 'pending')
          RETURNING id
        `, [
          `Follow up with ${customer.name}`,
          `Follow-up note: ${note_text.substring(0, 100)}${note_text.length > 100 ? '...' : ''}`,
          follow_up_date,
          userId,
          customer_id
        ])
        
        reminder_id = reminderResult[0].id
        console.log(`✅ Auto-created reminder ${reminder_id} for follow-up`)
      } catch (reminderError) {
        console.error("Failed to create auto-reminder:", reminderError)
        // Continue without reminder - don't fail the note creation
      }
    }

    // Create the pipeline note
    const result = await executeQuery(`
      INSERT INTO pipeline_notes (
        customer_id, user_id, note_text, note_type, 
        follow_up_date, is_private, reminder_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      customer_id, userId, note_text, note_type,
      follow_up_date, is_private, reminder_id
    ])

    const note = result[0]

    // Log activity
    try {
      await executeQuery(`
        INSERT INTO activity_log (
          action, action_category, description, actor_type, actor_id, 
          target_type, target_id, metadata, created_at
        ) VALUES (
          'pipeline_note_added', 'note', 
          'Added pipeline note for ' || $1, 'user', $2,
          'customer', $3, $4, CURRENT_TIMESTAMP
        )
      `, [
        customer.name, userId, customer_id,
        JSON.stringify({ 
          note_id: note.id, 
          note_type, 
          has_follow_up: !!follow_up_date,
          follow_up_date,
          reminder_id 
        })
      ])
    } catch (logError) {
      console.error("Failed to log note activity:", logError)
    }

    // Return the note with customer details
    const noteWithDetails = await executeQuery(`
      SELECT 
        pn.*,
        c.name as customer_name,
        c.email as customer_email,
        r.status as reminder_status
      FROM pipeline_notes pn
      LEFT JOIN customers c ON pn.customer_id = c.id
      LEFT JOIN reminders r ON pn.reminder_id = r.id
      WHERE pn.id = $1
    `, [note.id])

    return NextResponse.json({ 
      success: true, 
      note: noteWithDetails[0],
      reminder_created: !!reminder_id,
      reminder_id,
      message: follow_up_date 
        ? "Note saved and reminder created successfully" 
        : "Note saved successfully"
    })
  } catch (error) {
    console.error("Error creating pipeline note:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create pipeline note" 
    }, { status: 500 })
  }
} 