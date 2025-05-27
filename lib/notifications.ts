import { executeQuery } from './db'

export interface NotificationData {
  requestId: number
  requestorName: string
  proposalId: number
  requestType: string
  requestedValue: number
  discountPercent: number
  userMaxPercent: number
  managerEmail: string
  managerName: string
}

export interface ApprovalNotificationData {
  requestId: number
  proposalId: number
  proposalNumber?: string
  requestType: string
  originalValue: number
  requestedValue: number
  status: string
  approverName: string
  requestorEmail: string
  requestorName: string
  notes?: string
}

// In a real application, this would integrate with email services, push notifications, etc.
export class NotificationService {
  
  // Send notification to manager about new approval request
  static async notifyManagerOfApprovalRequest(data: NotificationData) {
    try {
      // Log notification to database
      await executeQuery(`
        INSERT INTO notifications (
          user_id, type, title, message, data, created_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      `, [
        data.requestId, // Using requestId as user_id for now - should be manager's user ID
        'approval_request',
        'Discount Approval Required',
        `${data.requestorName} has requested a ${data.discountPercent}% discount approval for Proposal #${data.proposalId}`,
        JSON.stringify(data)
      ])

      // In production, send email notification
      console.log('📧 Email notification sent to manager:', {
        to: data.managerEmail,
        subject: `Discount Approval Required - ${data.discountPercent}%`,
        message: `${data.requestorName} has requested approval for a ${data.discountPercent}% discount on Proposal #${data.proposalId}. 
                 This exceeds their ${data.userMaxPercent}% limit.
                 
                 Requested discount: $${data.requestedValue}
                 
                 Please review and approve/reject this request in the admin dashboard.`
      })

      return { success: true }
    } catch (error) {
      console.error('Error sending manager notification:', error)
      return { success: false, error }
    }
  }

  // Notify requestor about approval/rejection decision
  static async notifyRequestorOfDecision(data: ApprovalNotificationData) {
    try {
      const title = data.status === 'approved' ? 'Discount Approved' : 'Discount Rejected'
      const message = data.status === 'approved' 
        ? `Your discount request for Proposal #${data.proposalNumber || data.proposalId} has been approved.`
        : `Your discount request for Proposal #${data.proposalNumber || data.proposalId} has been rejected. ${data.notes ? 'Reason: ' + data.notes : ''}`

      // Log notification to database
      await executeQuery(`
        INSERT INTO notifications (
          user_id, type, title, message, data, created_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      `, [
        data.requestId, // Using request ID as user ID for now
        `approval_${data.status}`,
        title,
        message,
        JSON.stringify(data)
      ])

      // In production, send email notification
      console.log('📧 Email notification sent to requestor:', {
        to: data.requestorEmail,
        subject: title,
        message: `${message}
                 
                 Original Value: $${data.originalValue}
                 ${data.status === 'approved' ? 'Approved' : 'Requested'} Value: $${data.requestedValue}
                 ${data.notes ? '\nNotes: ' + data.notes : ''}`
      })

      return { success: true }
    } catch (error) {
      console.error('Error sending requestor notification:', error)
      return { success: false, error }
    }
  }

  // Get unread notifications for a user
  static async getUnreadNotifications(userId: number) {
    try {
      const notifications = await executeQuery(`
        SELECT * FROM notifications 
        WHERE user_id = $1 AND read_at IS NULL 
        ORDER BY created_at DESC
      `, [userId])

      return notifications
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: number) {
    try {
      await executeQuery(`
        UPDATE notifications 
        SET read_at = CURRENT_TIMESTAMP 
        WHERE id = $1
      `, [notificationId])

      return { success: true }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return { success: false, error }
    }
  }

  // Real-time notification broadcasting (would use WebSockets in production)
  static async broadcastApprovalUpdate(requestId: number, status: string, data: any) {
    console.log('🔔 Broadcasting approval update:', {
      requestId,
      status,
      timestamp: new Date().toISOString(),
      data
    })

    // In production, this would use WebSockets or Server-Sent Events
    // to notify all connected clients about the update
    
    return { success: true }
  }

  // Get pending approvals count for dashboard
  static async getPendingApprovalsCount(managerId?: number) {
    try {
      let query = `
        SELECT COUNT(*) as count 
        FROM approval_requests 
        WHERE status = 'pending'
      `
      const params: any[] = []

      if (managerId) {
        query += ` AND approver_id = $1`
        params.push(managerId)
      }

      const result = await executeQuery(query, params)
      return result[0]?.count || 0
    } catch (error) {
      console.error('Error getting pending approvals count:', error)
      return 0
    }
  }
}

// Database schema for notifications (for reference)
export const NOTIFICATIONS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
  CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
`

export default NotificationService 