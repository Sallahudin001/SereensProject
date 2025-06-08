import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getCurrentUserId, isAdmin } from "@/lib/auth-utils"
import { getRBACContext } from "@/lib/rbac"

// GET /api/calendar/reminders - Get reminders for the current user
export async function GET(request: NextRequest) {
  try {
    const context = await getRBACContext()
    
    if (!context) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const proposalId = searchParams.get('proposalId')
    const dueDate = searchParams.get('dueDate')
    const limit = searchParams.get('limit')

    let query = `
      SELECT 
        r.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        p.proposal_number,
        p.status as proposal_status,
        u.name as user_name,
        CASE 
          WHEN r.due_date < NOW() AND r.status = 'pending' THEN 'overdue'
          WHEN r.due_date <= NOW() + INTERVAL '1 hour' AND r.status = 'pending' THEN 'due_soon'
          WHEN r.due_date <= NOW() + INTERVAL '1 day' AND r.status = 'pending' THEN 'due_today'
          ELSE 'upcoming'
        END as urgency_status,
        EXTRACT(EPOCH FROM (r.due_date - NOW())) / 60 as minutes_until_due
      FROM reminders r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN proposals p ON r.proposal_id = p.id
      LEFT JOIN users u ON r.user_id = u.clerk_id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1

    // Apply user-based filtering (RBAC)
    if (!context.isAdmin) {
      query += ` AND r.user_id = $${paramIndex}`
      params.push(context.userId)
      paramIndex++
    }

    // Apply status filtering
    if (status) {
      query += ` AND r.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    // Apply customer filtering
    if (customerId) {
      query += ` AND r.customer_id = $${paramIndex}`
      params.push(parseInt(customerId))
      paramIndex++
    }

    // Apply proposal filtering
    if (proposalId) {
      query += ` AND r.proposal_id = $${paramIndex}`
      params.push(parseInt(proposalId))
      paramIndex++
    }

    // Apply due date filtering
    if (dueDate) {
      query += ` AND DATE(r.due_date) = DATE($${paramIndex})`
      params.push(dueDate)
      paramIndex++
    }

    query += ` ORDER BY r.due_date ASC`

    // Apply limit
    if (limit) {
      query += ` LIMIT $${paramIndex}`
      params.push(parseInt(limit))
    }

    const reminders = await executeQuery(query, params)

    return NextResponse.json({ 
      success: true, 
      reminders,
      userRole: context.role 
    })
  } catch (error) {
    console.error("Error fetching reminders:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch reminders" 
    }, { status: 500 })
  }
}

// POST /api/calendar/reminders - Create a new reminder
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      due_date,
      customer_id,
      proposal_id,
      appointment_id,
      reminder_type = 'follow_up',
      priority = 'medium'
    } = body

    // Validate required fields
    if (!title || !due_date) {
      return NextResponse.json({ 
        success: false, 
        error: "Title and due_date are required" 
      }, { status: 400 })
    }

    // Validate due_date is in the future
    if (new Date(due_date) <= new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: "Due date must be in the future" 
      }, { status: 400 })
    }

    // Create the reminder
    const result = await executeQuery(`
      INSERT INTO reminders (
        title, description, due_date, user_id, customer_id, proposal_id,
        appointment_id, reminder_type, priority, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING *
    `, [
      title, description, due_date, userId, customer_id, proposal_id,
      appointment_id, reminder_type, priority
    ])

    const reminder = result[0]

    // Log activity if customer or proposal is associated
    if (customer_id || proposal_id) {
      try {
        await executeQuery(`
          INSERT INTO activity_log (
            action, action_category, description, actor_type, actor_id, 
            target_type, target_id, metadata, created_at
          ) VALUES (
            'reminder_created', 'reminder', 
            'Created reminder: ' || $1, 'user', $2,
            $3, $4, $5, CURRENT_TIMESTAMP
          )
        `, [
          title, userId,
          customer_id ? 'customer' : 'proposal',
          customer_id || proposal_id,
          JSON.stringify({ 
            reminder_id: reminder.id, 
            reminder_type, 
            due_date 
          })
        ])
      } catch (logError) {
        console.error("Failed to log reminder activity:", logError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      reminder,
      message: "Reminder created successfully" 
    })
  } catch (error) {
    console.error("Error creating reminder:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create reminder" 
    }, { status: 500 })
  }
} 