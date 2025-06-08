import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getCurrentUserId, isAdmin } from "@/lib/auth-utils"
import { getRBACContext } from "@/lib/rbac"
import { sendAppointmentNotificationToCustomer } from "@/lib/calendar-email-service"
import { getUserDetailsFromClerk } from "@/lib/user-utils"

// GET /api/calendar/appointments - Get appointments for the current user
export async function GET(request: NextRequest) {
  try {
    const context = await getRBACContext()
    
    if (!context) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const customerId = searchParams.get('customerId')

    let query = `
      SELECT 
        a.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        u.name as user_name
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN users u ON a.user_id = u.clerk_id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramIndex = 1

    // Apply user-based filtering (RBAC)
    if (!context.isAdmin) {
      query += ` AND a.user_id = $${paramIndex}`
      params.push(context.userId)
      paramIndex++
    }

    // Apply date range filtering
    if (startDate) {
      query += ` AND a.start_time >= $${paramIndex}`
      params.push(startDate)
      paramIndex++
    }

    if (endDate) {
      query += ` AND a.start_time <= $${paramIndex}`
      params.push(endDate)
      paramIndex++
    }

    // Apply customer filtering
    if (customerId) {
      query += ` AND a.customer_id = $${paramIndex}`
      params.push(parseInt(customerId))
      paramIndex++
    }

    query += ` ORDER BY a.start_time ASC`

    const appointments = await executeQuery(query, params)

    return NextResponse.json({ 
      success: true, 
      appointments,
      userRole: context.role 
    })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch appointments" 
    }, { status: 500 })
  }
}

// POST /api/calendar/appointments - Create a new appointment
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
      start_time,
      end_time,
      customer_id,
      location,
      appointment_type = 'consultation',
      meeting_notes
    } = body

    // Validate required fields
    if (!title || !start_time || !end_time) {
      return NextResponse.json({ 
        success: false, 
        error: "Title, start_time, and end_time are required" 
      }, { status: 400 })
    }

    // Validate that start_time is before end_time
    if (new Date(start_time) >= new Date(end_time)) {
      return NextResponse.json({ 
        success: false, 
        error: "Start time must be before end time" 
      }, { status: 400 })
    }

    // Check for scheduling conflicts
    const conflictQuery = `
      SELECT id, title FROM appointments 
      WHERE user_id = $1 
      AND status NOT IN ('cancelled', 'completed')
      AND (
        (start_time <= $2 AND end_time > $2) OR 
        (start_time < $3 AND end_time >= $3) OR 
        (start_time >= $2 AND end_time <= $3)
      )
    `
    
    const conflicts = await executeQuery(conflictQuery, [userId, start_time, end_time])
    
    if (conflicts.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Time slot conflicts with existing appointment",
        conflicts 
      }, { status: 409 })
    }

    // Create the appointment
    const result = await executeQuery(`
      INSERT INTO appointments (
        title, description, start_time, end_time, customer_id, user_id, 
        location, appointment_type, meeting_notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'scheduled')
      RETURNING *
    `, [
      title, description, start_time, end_time, customer_id, userId,
      location, appointment_type, meeting_notes
    ])

    const appointment = result[0]

    // If customer_id is provided, log activity and send email notification
    if (customer_id) {
      try {
        await executeQuery(`
          INSERT INTO activity_log (
            action, action_category, description, actor_type, actor_id, 
            target_type, target_id, metadata, created_at
          ) VALUES (
            'appointment_scheduled', 'appointment', 
            'Scheduled appointment: ' || $1, 'user', $2,
            'customer', $3, $4, CURRENT_TIMESTAMP
          )
        `, [
          title, userId, customer_id, 
          JSON.stringify({ appointment_id: appointment.id, appointment_type })
        ])
      } catch (logError) {
        console.error("Failed to log appointment activity:", logError)
        // Continue even if logging fails
      }

      // Send email notification to customer
      try {
        // Get customer details
        const customerResult = await executeQuery(`
          SELECT name, email FROM customers WHERE id = $1
        `, [customer_id])

        if (customerResult.length > 0 && customerResult[0].email) {
          const customer = customerResult[0]
          
          // Get rep details from Clerk
          const repDetails = await getUserDetailsFromClerk([userId])
          const repDetail = repDetails[userId]
          const repName = repDetail?.name || 'Your Representative'
          const repEmail = repDetail?.email || process.env.EMAIL_USER || 'noreply@evergreenenergy.com'

          // Format appointment date and time
          const startDate = new Date(start_time)
          const appointmentDate = startDate.toISOString().split('T')[0]
          const appointmentTime = startDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })

          // Send customer notification email
          const emailResult = await sendAppointmentNotificationToCustomer({
            customerEmail: customer.email,
            customerName: customer.name,
            repName,
            repEmail,
            appointmentTitle: title,
            appointmentDate,
            appointmentTime,
            location: location || '',
            appointmentType: appointment_type,
            description: description || ''
          })

          if (emailResult.success) {
            // Update appointment to mark email as sent
            await executeQuery(`
              UPDATE appointments 
              SET customer_email_sent_at = CURRENT_TIMESTAMP 
              WHERE id = $1
            `, [appointment.id])
            
            console.log(`📧 Customer notification sent for appointment ${appointment.id}`)
          } else {
            console.error(`Failed to send customer notification for appointment ${appointment.id}:`, 'error' in emailResult ? emailResult.error : 'Unknown error')
          }
        }
      } catch (emailError) {
        console.error("Error sending customer notification:", emailError)
        // Continue even if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      appointment,
      message: "Appointment scheduled successfully" 
    })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create appointment" 
    }, { status: 500 })
  }
} 