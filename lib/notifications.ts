import { executeQuery } from './db'
import nodemailer from 'nodemailer'

export interface NotificationData {
  requestId: number
  requestorName: string
  requestorEmail: string
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

interface DynamicEmailOptions {
  fromEmail: string
  fromName: string
  toEmail: string
  subject: string
  html: string
  ccEmail?: string
}

/**
 * Send email with dynamic sender using direct nodemailer
 */
async function sendDynamicApprovalEmail(options: DynamicEmailOptions) {
  try {
    // Validate environment variables (system email for authentication)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email configuration missing');
      throw new Error('Email service not configured properly')
    }

    // Create email transporter (authenticate with system email)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    })

    // Dynamic email options with requestor as sender
    const mailOptions = {
      from: `"${options.fromName}" <${options.fromEmail}>`, // Dynamic sender
      replyTo: options.fromEmail, // Requestor's email for replies
      to: options.toEmail, // Dynamic recipient
      cc: options.ccEmail || process.env.EMAIL_RECIPIENT, // Optional CC
      subject: options.subject,
      html: options.html
    }

    console.log(`📧 Sending approval email from ${options.fromEmail} to ${options.toEmail}`)

    // Verify SMTP configuration and send
    await transporter.verify()
    const info = await transporter.sendMail(mailOptions)

    console.log('Approval email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending dynamic approval email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    }
  }
}

// Updated notification service with dynamic email sending
export class NotificationService {
  
  // Send notification to admin about new approval request
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

      // Get all admin users who should receive approval emails
      const adminUsers = await executeQuery(`
        SELECT email, name FROM users WHERE role = 'admin' AND email IS NOT NULL
      `);

      if (adminUsers.length === 0) {
        console.log('⚠️  No admin users found to send approval email to');
        return { success: false, error: 'No admin users found' };
      }

      // Send email to all admin users with requestor as sender
      const emailPromises = adminUsers.map(async (admin) => {
        const emailHtml = this.generateApprovalRequestEmailHtml({
          requestorName: data.requestorName,
          proposalId: data.proposalId,
          discountPercent: data.discountPercent,
          userMaxPercent: data.userMaxPercent,
          requestedValue: data.requestedValue,
          adminName: admin.name
        });

        return await sendDynamicApprovalEmail({
          fromEmail: data.requestorEmail,
          fromName: data.requestorName,
          toEmail: admin.email,
          subject: `Discount Approval Required - ${data.discountPercent}%`,
          html: emailHtml
        });
      });

      const emailResults = await Promise.all(emailPromises);
      
      // Check if at least one email was sent successfully
      const successfulEmails = emailResults.filter(result => result.success);
      
      if (successfulEmails.length > 0) {
        console.log(`📧 Approval request emails sent to ${successfulEmails.length} admin(s) from ${data.requestorEmail}`);
        return { success: true, emailsSent: successfulEmails.length };
      } else {
        console.error('❌ Failed to send approval request emails to any admin');
        return { success: false, error: 'Failed to send emails to admins' };
      }

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

      // Send actual email to requestor from system/admin
      if (data.requestorEmail) {
        const emailHtml = this.generateApprovalDecisionEmailHtml({
          requestorName: data.requestorName,
          proposalNumber: data.proposalNumber || data.proposalId.toString(),
          status: data.status,
          originalValue: data.originalValue,
          requestedValue: data.requestedValue,
          approverName: data.approverName,
          notes: data.notes
        });

        const emailResult = await sendDynamicApprovalEmail({
          fromEmail: process.env.EMAIL_USER || 'admin@evergreenenergy.com',
          fromName: 'Evergreen Home Upgrades Admin Team',
          toEmail: data.requestorEmail,
          subject: title,
          html: emailHtml
        });

        if (emailResult.success) {
          console.log(`📧 Decision notification sent to requestor: ${data.requestorEmail}`);
        } else {
          console.error(`❌ Failed to send decision notification to requestor: ${data.requestorEmail}`);
        }

        return emailResult;
      }

      return { success: true }
    } catch (error) {
      console.error('Error sending requestor notification:', error)
      return { success: false, error }
    }
  }

  // Generate HTML for approval request email to admin
  private static generateApprovalRequestEmailHtml(data: {
    requestorName: string;
    proposalId: number;
    discountPercent: number;
    userMaxPercent: number;
    requestedValue: number;
    adminName: string;
  }): string {
    const discountExcess = data.discountPercent - data.userMaxPercent;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Discount Approval Required</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f0fdf4;
            margin: 0;
            padding: 20px;
          }
          .email-container {
            max-width: 650px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid #dcfce7;
          }
          .email-header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
            position: relative;
          }
          .email-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          }
          .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            position: relative;
            z-index: 1;
          }
          .email-header .subtitle {
            margin: 8px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          .email-content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 24px;
            color: #374151;
          }
          .urgent-banner {
            background: linear-gradient(45deg, #fef3c7, #fde68a);
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 24px 0;
            text-align: center;
            color: #92400e;
            font-weight: 600;
          }
          .urgent-banner .icon {
            font-size: 24px;
            margin-right: 8px;
          }
          .approval-details {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 2px solid #059669;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            position: relative;
          }
          .approval-details::before {
            content: '📋';
            position: absolute;
            top: -12px;
            left: 20px;
            background: #059669;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
          }
          .approval-details h3 {
            margin: 0 0 20px 0;
            color: #047857;
            font-size: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px 0;
            border-bottom: 1px solid #e5e5e5;
          }
          .detail-label {
            font-weight: 600;
            color: #374151;
          }
          .detail-value {
            color: #6b7280;
          }
          .action-section {
            background: #f8fafc;
            border-radius: 8px;
            padding: 24px;
            margin: 32px 0;
            text-align: center;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: white !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            margin: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
            border: none;
          }
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
          }
          .cta-secondary {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
          }
          .action-note {
            margin-top: 20px;
            padding: 16px;
            background: #ecfdf5;
            border-left: 4px solid #059669;
            border-radius: 4px;
            font-size: 14px;
            color: #047857;
          }
          .footer {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            padding: 24px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
          }
          .footer .company-name {
            color: #059669;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 8px;
          }
          @media (max-width: 600px) {
            .email-content {
              padding: 24px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sereenh-04.png" alt="Evergreen Home Upgrades" style="height: 60px; margin-bottom: 16px;" />
            <h1>Discount Approval Required</h1>
            <div class="subtitle">Administrative Action Needed</div>
          </div>
          
          <div class="email-content">
            <div class="greeting">Hello ${data.adminName},</div>
            
            <div class="urgent-banner">
              <span class="icon">⚠️</span>
              A discount request exceeding authorized limits requires your immediate review
            </div>
            
            <p>A new discount approval request has been submitted by <strong>${data.requestorName}</strong> that exceeds their authorized discount limit and requires administrative approval.</p>
            
            <div class="approval-details">
              <h3>📊 Request Summary</h3>
              <div class="detail-row">
                <span class="detail-label">Sales Representative:</span>
                <span class="detail-value">${data.requestorName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Proposal ID:</span>
                <span class="detail-value">#${data.proposalId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Authorized Limit:</span>
                <span class="detail-value">${data.userMaxPercent}%</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Requested Discount:</span>
                <span class="detail-value" style="color: #dc2626; font-weight: 600;">${data.discountPercent}%</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Discount Amount:</span>
                <span class="detail-value" style="color: #059669; font-weight: 600;">$${parseFloat(data.requestedValue.toString()).toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Exceeds Limit By:</span>
                <span class="detail-value" style="color: #dc2626; font-weight: 600;">${discountExcess.toFixed(1)}%</span>
              </div>
            </div>
            
            <div class="action-section">
              <h3 style="margin-top: 0; color: #1f2937;">Review & Decide</h3>
              <p style="color: #6b7280; margin-bottom: 24px;">Click below to review the full proposal details and make your decision</p>
              
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/approvals" class="cta-button">
                Review Request
              </a>
              
              <div class="action-note">
                <strong>💡 Pro Tip:</strong> You can reply directly to this email to communicate with ${data.requestorName} before making your decision.
              </div>
            </div>
            
            <p style="color: #6b7280; font-style: italic; text-align: center; margin-top: 32px;">
              This request will remain pending until you approve or reject it in the admin dashboard.
            </p>
          </div>
          
          <div class="footer">
            <div class="company-name">Evergreen Home Upgrades</div>
            <p>This is an automated notification from our approval system</p>
            <p>Reply to this email to contact the sales representative directly</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate HTML for approval decision email to requestor
  private static generateApprovalDecisionEmailHtml(data: {
    requestorName: string;
    proposalNumber: string;
    status: string;
    originalValue: number;
    requestedValue: number;
    approverName: string;
    notes?: string;
  }): string {
    const isApproved = data.status === 'approved';
    const statusColor = '#059669'; // Always use green for consistency
    const statusText = isApproved ? 'Approved' : 'Rejected';
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Discount Request ${statusText}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .email-header {
            background-color: ${statusColor};
            padding: 30px;
            text-align: center;
            color: white;
          }
          .email-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }
          .email-content {
            padding: 30px;
          }
          .status-details {
            background-color: ${isApproved ? '#f0fdf4' : '#fef2f2'};
            border-left: 4px solid ${statusColor};
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .status-details h3 {
            margin-top: 0;
            color: ${statusColor};
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px 0;
            border-bottom: 1px solid #e5e5e5;
          }
          .detail-label {
            font-weight: 600;
            color: #374151;
          }
          .detail-value {
            color: #6b7280;
          }
          .notes-section {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sereenh-04.png" alt="Evergreen Home Upgrades" style="height: 60px; margin-bottom: 16px;" />
            <h1>Discount Request ${statusText}</h1>
          </div>
          
          <div class="email-content">
            <p>Hello ${data.requestorName},</p>
            
            <p>Your discount request for Proposal #${data.proposalNumber} has been <strong>${data.status}</strong> by ${data.approverName}.</p>
            
            <div class="status-details">
              <h3>Request Details</h3>
              <div class="detail-row">
                <span class="detail-label">Proposal:</span>
                <span class="detail-value">#${data.proposalNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Original Value:</span>
                <span class="detail-value">$${parseFloat(data.originalValue.toString()).toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Requested Value:</span>
                <span class="detail-value">$${parseFloat(data.requestedValue.toString()).toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Reviewed by:</span>
                <span class="detail-value">${data.approverName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value" style="color: ${statusColor}; font-weight: 600;">${statusText.toUpperCase()}</span>
              </div>
            </div>
            
            ${data.notes ? `
              <div class="notes-section">
                <h4 style="margin-top: 0;">Notes from Approver:</h4>
                <p style="margin-bottom: 0;">${data.notes}</p>
              </div>
            ` : ''}
            
            <p>${isApproved 
              ? 'You can now proceed with this proposal using the approved discount amount.' 
              : 'Please review the pricing and submit a new request if needed.'
            }</p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from Evergreen Home Upgrades</p>
            <p>Please do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `;
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