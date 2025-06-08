import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getCurrentUserId } from "@/lib/auth-utils"
import { getRBACContext } from "@/lib/rbac"

// GET /api/calendar/reminders/due - Get due and overdue reminders for notifications
export async function GET(request: NextRequest) {
  try {
    const context = await getRBACContext()
    
    if (!context) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'now' // 'now', 'soon', 'today', 'week'

    let timeCondition = ''
    
    switch (timeframe) {
      case 'now':
        timeCondition = `r.due_date <= NOW()`
        break
      case 'soon':
        timeCondition = `r.due_date <= NOW() + INTERVAL '1 hour'`
        break
      case 'today':
        timeCondition = `r.due_date <= NOW() + INTERVAL '1 day'`
        break
      case 'week':
        timeCondition = `r.due_date <= NOW() + INTERVAL '7 days'`
        break
      default:
        timeCondition = `r.due_date <= NOW()`
    }

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
          WHEN r.due_date < NOW() THEN 'overdue'
          WHEN r.due_date <= NOW() + INTERVAL '15 minutes' THEN 'due_now'
          WHEN r.due_date <= NOW() + INTERVAL '1 hour' THEN 'due_soon'
          WHEN r.due_date <= NOW() + INTERVAL '1 day' THEN 'due_today'
          ELSE 'upcoming'
        END as urgency_level,
        EXTRACT(EPOCH FROM (NOW() - r.due_date)) / 60 as minutes_overdue,
        EXTRACT(EPOCH FROM (r.due_date - NOW())) / 60 as minutes_until_due
      FROM reminders r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN proposals p ON r.proposal_id = p.id
      LEFT JOIN users u ON r.user_id = u.clerk_id
      WHERE r.status = 'pending'
      AND ${timeCondition}
    `
    
    const params: any[] = []

    // Apply user-based filtering (users only see their own reminders)
    if (!context.isAdmin) {
      query += ` AND r.user_id = $1`
      params.push(context.userId)
    }

    query += ` ORDER BY r.due_date ASC`

    const dueReminders = await executeQuery(query, params)

    // Categorize reminders by urgency
    const categorized = {
      overdue: dueReminders.filter(r => r.urgency_level === 'overdue'),
      due_now: dueReminders.filter(r => r.urgency_level === 'due_now'),
      due_soon: dueReminders.filter(r => r.urgency_level === 'due_soon'),
      due_today: dueReminders.filter(r => r.urgency_level === 'due_today'),
      upcoming: dueReminders.filter(r => r.urgency_level === 'upcoming')
    }

    const summary = {
      total_due: dueReminders.length,
      overdue_count: categorized.overdue.length,
      due_now_count: categorized.due_now.length,
      due_soon_count: categorized.due_soon.length,
      due_today_count: categorized.due_today.length,
      highest_priority: dueReminders.find(r => r.priority === 'urgent') || 
                       dueReminders.find(r => r.priority === 'high') ||
                       dueReminders[0] || null
    }

    return NextResponse.json({ 
      success: true, 
      reminders: dueReminders,
      categorized,
      summary,
      userRole: context.role,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error fetching due reminders:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch due reminders" 
    }, { status: 500 })
  }
}

// PATCH /api/calendar/reminders/due - Bulk update reminder statuses (snooze, complete, dismiss)
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { reminder_ids, action, snooze_minutes = 60 } = body

    if (!reminder_ids || !Array.isArray(reminder_ids) || !action) {
      return NextResponse.json({ 
        success: false, 
        error: "reminder_ids array and action are required" 
      }, { status: 400 })
    }

    const validActions = ['complete', 'snooze', 'dismiss']
    if (!validActions.includes(action)) {
      return NextResponse.json({ 
        success: false, 
        error: `Action must be one of: ${validActions.join(', ')}` 
      }, { status: 400 })
    }

    let updateQuery = ''
    let updateParams: any[] = []

    switch (action) {
      case 'complete':
        updateQuery = `
          UPDATE reminders 
          SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
          WHERE id = ANY($1) AND user_id = $2 AND status = 'pending'
          RETURNING *
        `
        updateParams = [reminder_ids, userId]
        break

      case 'snooze':
        updateQuery = `
          UPDATE reminders 
          SET status = 'snoozed', due_date = due_date + INTERVAL '${snooze_minutes} minutes'
          WHERE id = ANY($1) AND user_id = $2 AND status = 'pending'
          RETURNING *
        `
        updateParams = [reminder_ids, userId]
        break

      case 'dismiss':
        updateQuery = `
          UPDATE reminders 
          SET status = 'dismissed' 
          WHERE id = ANY($1) AND user_id = $2 AND status = 'pending'
          RETURNING *
        `
        updateParams = [reminder_ids, userId]
        break
    }

    const updatedReminders = await executeQuery(updateQuery, updateParams)

    // Log activity for each updated reminder
    for (const reminder of updatedReminders) {
      try {
        await executeQuery(`
          INSERT INTO activity_log (
            action, action_category, description, actor_type, actor_id, 
            target_type, target_id, metadata, created_at
          ) VALUES (
            'reminder_${action}', 'reminder', 
            'Reminder ${action}: ' || $1, 'user', $2,
            'reminder', $3, $4, CURRENT_TIMESTAMP
          )
        `, [
          reminder.title, userId, reminder.id,
          JSON.stringify({ 
            action, 
            snooze_minutes: action === 'snooze' ? snooze_minutes : undefined,
            customer_id: reminder.customer_id 
          })
        ])
      } catch (logError) {
        console.error(`Failed to log reminder ${action}:`, logError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      updated_count: updatedReminders.length,
      updated_reminders: updatedReminders,
      message: `${updatedReminders.length} reminder(s) ${action === 'complete' ? 'completed' : action + 'd'} successfully`
    })
  } catch (error) {
    console.error(`Error updating reminders:`, error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update reminders" 
    }, { status: 500 })
  }
} 