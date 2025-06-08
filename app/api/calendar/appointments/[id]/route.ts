import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getCurrentUserId, isAdmin } from "@/lib/auth-utils"

// GET /api/calendar/appointments/[id] - Get specific appointment
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const userId = await getCurrentUserId()
    const admin = await isAdmin()
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

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
      WHERE a.id = $1
    `
    
    const params = [id]

    // Non-admin users can only see their own appointments
    if (!admin) {
      query += ` AND a.user_id = $2`
      params.push(userId)
    }

    const result = await executeQuery(query, params)

    if (result.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Appointment not found" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      appointment: result[0] 
    })
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch appointment" 
    }, { status: 500 })
  }
}

// PUT /api/calendar/appointments/[id] - Update appointment
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const userId = await getCurrentUserId()
    const admin = await isAdmin()
    
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
      appointment_type,
      meeting_notes,
      status
    } = body

    // First, check if appointment exists and user has permission
    let checkQuery = `SELECT * FROM appointments WHERE id = $1`
    const checkParams = [id]

    if (!admin) {
      checkQuery += ` AND user_id = $2`
      checkParams.push(userId)
    }

    const existingAppointment = await executeQuery(checkQuery, checkParams)

    if (existingAppointment.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Appointment not found or access denied" 
      }, { status: 404 })
    }

    // Validate time if provided
    if (start_time && end_time && new Date(start_time) >= new Date(end_time)) {
      return NextResponse.json({ 
        success: false, 
        error: "Start time must be before end time" 
      }, { status: 400 })
    }

    // Check for conflicts if time is being changed
    if (start_time && end_time) {
      const conflictQuery = `
        SELECT id, title FROM appointments 
        WHERE user_id = $1 
        AND id != $2
        AND status NOT IN ('cancelled', 'completed')
        AND (
          (start_time <= $3 AND end_time > $3) OR 
          (start_time < $4 AND end_time >= $4) OR 
          (start_time >= $3 AND end_time <= $4)
        )
      `
      
      const conflicts = await executeQuery(conflictQuery, [
        existingAppointment[0].user_id, id, start_time, end_time
      ])
      
      if (conflicts.length > 0) {
        return NextResponse.json({ 
          success: false, 
          error: "Time slot conflicts with existing appointment",
          conflicts 
        }, { status: 409 })
      }
    }

    // Build update query dynamically
    const updateFields = []
    const updateParams = []
    let paramIndex = 1

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex}`)
      updateParams.push(title)
      paramIndex++
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex}`)
      updateParams.push(description)
      paramIndex++
    }

    if (start_time !== undefined) {
      updateFields.push(`start_time = $${paramIndex}`)
      updateParams.push(start_time)
      paramIndex++
    }

    if (end_time !== undefined) {
      updateFields.push(`end_time = $${paramIndex}`)
      updateParams.push(end_time)
      paramIndex++
    }

    if (customer_id !== undefined) {
      updateFields.push(`customer_id = $${paramIndex}`)
      updateParams.push(customer_id)
      paramIndex++
    }

    if (location !== undefined) {
      updateFields.push(`location = $${paramIndex}`)
      updateParams.push(location)
      paramIndex++
    }

    if (appointment_type !== undefined) {
      updateFields.push(`appointment_type = $${paramIndex}`)
      updateParams.push(appointment_type)
      paramIndex++
    }

    if (meeting_notes !== undefined) {
      updateFields.push(`meeting_notes = $${paramIndex}`)
      updateParams.push(meeting_notes)
      paramIndex++
    }

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`)
      updateParams.push(status)
      paramIndex++
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)

    if (updateFields.length === 1) { // Only updated_at was added
      return NextResponse.json({ 
        success: false, 
        error: "No fields to update" 
      }, { status: 400 })
    }

    updateParams.push(id)
    const updateQuery = `
      UPDATE appointments 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await executeQuery(updateQuery, updateParams)
    const updatedAppointment = result[0]

    // Log activity
    if (updatedAppointment.customer_id) {
      try {
        await executeQuery(`
          INSERT INTO activity_log (
            action, action_category, description, actor_type, actor_id, 
            target_type, target_id, metadata, created_at
          ) VALUES (
            'appointment_updated', 'appointment', 
            'Updated appointment: ' || $1, 'user', $2,
            'customer', $3, $4, CURRENT_TIMESTAMP
          )
        `, [
          updatedAppointment.title, userId, updatedAppointment.customer_id,
          JSON.stringify({ appointment_id: id, changes: body })
        ])
      } catch (logError) {
        console.error("Failed to log appointment update:", logError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      appointment: updatedAppointment,
      message: "Appointment updated successfully" 
    })
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update appointment" 
    }, { status: 500 })
  }
}

// DELETE /api/calendar/appointments/[id] - Delete appointment
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const userId = await getCurrentUserId()
    const admin = await isAdmin()
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Check if appointment exists and user has permission
    let checkQuery = `SELECT * FROM appointments WHERE id = $1`
    const checkParams = [id]

    if (!admin) {
      checkQuery += ` AND user_id = $2`
      checkParams.push(userId)
    }

    const existingAppointment = await executeQuery(checkQuery, checkParams)

    if (existingAppointment.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Appointment not found or access denied" 
      }, { status: 404 })
    }

    const appointment = existingAppointment[0]

    // Delete the appointment
    await executeQuery(`DELETE FROM appointments WHERE id = $1`, [id])

    // Log activity
    if (appointment.customer_id) {
      try {
        await executeQuery(`
          INSERT INTO activity_log (
            action, action_category, description, actor_type, actor_id, 
            target_type, target_id, metadata, created_at
          ) VALUES (
            'appointment_deleted', 'appointment', 
            'Deleted appointment: ' || $1, 'user', $2,
            'customer', $3, $4, CURRENT_TIMESTAMP
          )
        `, [
          appointment.title, userId, appointment.customer_id,
          JSON.stringify({ appointment_id: id, deleted_appointment: appointment })
        ])
      } catch (logError) {
        console.error("Failed to log appointment deletion:", logError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Appointment deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete appointment" 
    }, { status: 500 })
  }
} 