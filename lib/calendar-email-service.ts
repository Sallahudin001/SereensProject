"use server"

import nodemailer from 'nodemailer'
import { executeQuery } from "@/lib/db"
import { getUserDetailsFromClerk } from "@/lib/user-utils"

interface AppointmentEmailData {
  customerEmail: string
  customerName: string
  repName: string
  repEmail: string // Added rep email for dynamic sender
  appointmentTitle: string
  appointmentDate: string
  appointmentTime: string
  location?: string
  appointmentType: string
  description?: string
}

interface ReminderEmailData {
  repEmail: string
  repName: string
  reminderTitle: string
  dueDate: string
  customerName?: string
  customerEmail?: string // Added for dynamic recipient
  description?: string
  priority: string
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
 * Send email with dynamic sender and recipient using direct nodemailer
 */
async function sendDynamicEmail(options: DynamicEmailOptions) {
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

    // Dynamic email options with rep as sender
    const mailOptions = {
      from: `"${options.fromName}" <${options.fromEmail}>`, // Dynamic sender
      replyTo: options.fromEmail, // Rep's email for replies
      to: options.toEmail, // Dynamic recipient
      cc: options.ccEmail || process.env.EMAIL_RECIPIENT, // Optional CC
      subject: options.subject,
      html: options.html
    }

    console.log(`📧 Sending email from ${options.fromEmail} to ${options.toEmail}`)

    // Verify SMTP configuration and send
    await transporter.verify()
    const info = await transporter.sendMail(mailOptions)

    console.log('Dynamic email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending dynamic email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    }
  }
}

/**
 * Send email notification to customer when appointment is scheduled
 * Email appears to come from the specific rep who scheduled it
 */
export async function sendAppointmentNotificationToCustomer(data: AppointmentEmailData) {
  try {
    const html = generateAppointmentEmailHtml(data)
    
    const result = await sendDynamicEmail({
      fromEmail: data.repEmail,
      fromName: data.repName,
      toEmail: data.customerEmail,
      subject: `Appointment Scheduled: ${data.appointmentTitle}`,
      html: html
    })

    if (result.success) {
      console.log(`📧 Appointment notification sent from ${data.repEmail} to customer: ${data.customerEmail}`)
    }
    return result
  } catch (error) {
    console.error("Error sending appointment notification to customer:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Send email notification to rep when reminder is due
 * For reminders, system sends to rep (could also be from another rep if specified)
 */
export async function sendReminderNotificationToRep(data: ReminderEmailData) {
  try {
    const html = generateReminderEmailHtml(data)
    
    // For reminders, use system email as sender (or could be from manager/system)
    const result = await sendDynamicEmail({
      fromEmail: process.env.EMAIL_USER || data.repEmail,
      fromName: "Evergreen Energy System",
      toEmail: data.repEmail,
      subject: `Reminder: ${data.reminderTitle}`,
      html: html
    })

    if (result.success) {
      console.log(`📧 Reminder notification sent to rep: ${data.repEmail}`)
    }
    return result
  } catch (error) {
    console.error("Error sending reminder notification to rep:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Send custom email between rep and customer with full dynamic control
 */
export async function sendCustomEmail(options: {
  repEmail: string
  repName: string
  customerEmail: string
  customerName: string
  subject: string
  message: string
  ccSystemEmail?: boolean
}) {
  try {
    const html = generateCustomEmailHtml({
      customerName: options.customerName,
      repName: options.repName,
      message: options.message
    })
    
    const result = await sendDynamicEmail({
      fromEmail: options.repEmail,
      fromName: options.repName,
      toEmail: options.customerEmail,
      subject: options.subject,
      html: html,
      ccEmail: options.ccSystemEmail ? process.env.EMAIL_RECIPIENT : undefined
    })

    if (result.success) {
      console.log(`📧 Custom email sent from ${options.repEmail} to ${options.customerEmail}`)
    }
    return result
  } catch (error) {
    console.error("Error sending custom email:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Process due reminders and send email notifications to reps
 */
export async function processDueRemindersAndSendEmails() {
  try {
    console.log("🔔 Processing due reminders for email notifications...")
    
    // Get reminders that are due or overdue and haven't been notified via email yet
    const dueReminders = await executeQuery(`
      SELECT 
        r.*,
        c.name as customer_name,
        c.email as customer_email,
        u.name as user_name,
        u.email as user_email,
        u.clerk_id
      FROM reminders r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN users u ON r.user_id = u.clerk_id
      WHERE r.status = 'pending'
      AND r.due_date <= CURRENT_TIMESTAMP + INTERVAL '15 minutes'
      AND (r.email_sent_at IS NULL OR r.email_sent_at < r.due_date - INTERVAL '1 hour')
      ORDER BY r.due_date ASC
    `)

    console.log(`Found ${dueReminders.length} due reminders to process`)

    let emailsSent = 0
    let emailErrors = 0

    for (const reminder of dueReminders) {
      try {
        // Get user details from Clerk if email is not in our users table
        let repEmail = reminder.user_email
        let repName = reminder.user_name

        if (!repEmail && reminder.clerk_id) {
          const userDetails = await getUserDetailsFromClerk([reminder.clerk_id])
          const userDetail = userDetails[reminder.clerk_id]
          if (userDetail) {
            repEmail = userDetail.email
            repName = userDetail.name
          }
        }

        if (!repEmail || repEmail === 'no-email@example.com') {
          console.log(`⚠️ Skipping reminder ${reminder.id} - no valid email for user ${reminder.clerk_id}`)
          continue
        }

        // Prepare reminder email data with customer email for dynamic functionality
        const reminderEmailData: ReminderEmailData = {
          repEmail,
          repName: repName || 'Team Member',
          reminderTitle: reminder.title,
          dueDate: reminder.due_date,
          customerName: reminder.customer_name,
          customerEmail: reminder.customer_email,
          description: reminder.description,
          priority: reminder.priority
        }

        // Send email notification
        const emailResult = await sendReminderNotificationToRep(reminderEmailData)

        if (emailResult.success) {
          // Update reminder to mark email as sent
          await executeQuery(`
            UPDATE reminders 
            SET email_sent_at = CURRENT_TIMESTAMP 
            WHERE id = $1
          `, [reminder.id])

          emailsSent++
          console.log(`✅ Email sent for reminder ${reminder.id} to ${repEmail}`)
        } else {
          emailErrors++
          const errorMessage = 'error' in emailResult ? emailResult.error : 'Unknown error'
          console.error(`❌ Failed to send email for reminder ${reminder.id}:`, errorMessage)
        }
      } catch (reminderError) {
        emailErrors++
        console.error(`❌ Error processing reminder ${reminder.id}:`, reminderError)
      }
    }

    console.log(`📊 Email processing complete: ${emailsSent} sent, ${emailErrors} errors`)
    return { success: true, emailsSent, emailErrors }
  } catch (error) {
    console.error("Error processing due reminders:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Generate HTML for appointment notification email to customer
 */
function generateAppointmentEmailHtml(data: AppointmentEmailData): string {
  const appointmentDateTime = new Date(data.appointmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Scheduled - Evergreen Energy Upgrades</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          border-bottom: 3px solid #e11d48;
        }
        .logo {
          color: #e11d48;
          font-size: 24px;
          font-weight: bold;
        }
        .content {
          padding: 20px 0;
        }
        .appointment-details {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .detail-label {
          font-weight: bold;
          color: #e11d48;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        .rep-contact {
          background-color: #e7f3ff;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #0066cc;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Evergreen Energy Upgrades</div>
          <h2 style="margin: 10px 0; color: #333;">Appointment Scheduled</h2>
        </div>
        
        <div class="content">
          <p>Hello ${data.customerName},</p>
          
          <p>Your appointment has been scheduled with our team. Here are the details:</p>
          
          <div class="appointment-details">
            <div class="detail-row">
              <span class="detail-label">Appointment:</span>
              <span>${data.appointmentTitle}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span>${appointmentDateTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span>${data.appointmentTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type:</span>
              <span>${data.appointmentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </div>
            ${data.location ? `
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span>${data.location}</span>
            </div>
            ` : ''}
            ${data.description ? `
            <div class="detail-row">
              <span class="detail-label">Notes:</span>
              <span>${data.description}</span>
            </div>
            ` : ''}
          </div>

          <div class="rep-contact">
            <h3 style="margin: 0 0 10px 0; color: #0066cc;">Your Representative</h3>
            <p style="margin: 5px 0;"><strong>${data.repName}</strong></p>
            <p style="margin: 5px 0;">Email: <a href="mailto:${data.repEmail}">${data.repEmail}</a></p>
            <p style="margin: 5px 0; font-size: 14px; color: #666;">
              You can reply directly to this email to contact ${data.repName.split(' ')[0]}.
            </p>
          </div>
          
          <p>If you need to reschedule or have any questions about your appointment, please reply to this email or contact ${data.repName} directly.</p>
          
          <p>We look forward to meeting with you!</p>
          
          <p>Best regards,<br>
          ${data.repName}<br>
          Evergreen Energy Upgrades</p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Evergreen Energy Upgrades. All rights reserved.</p>
          <p>This email was sent by ${data.repName}. You can reply directly to reach them.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate HTML for reminder notification email to rep
 */
function generateReminderEmailHtml(data: ReminderEmailData): string {
  const dueDateTime = new Date(data.dueDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  const priorityColor = data.priority === 'urgent' ? '#dc2626' : 
                       data.priority === 'high' ? '#ea580c' : 
                       data.priority === 'medium' ? '#d97706' : '#65a30d'

  const now = new Date()
  const due = new Date(data.dueDate)
  const isOverdue = due < now
  const urgencyText = isOverdue ? 'OVERDUE' : 'DUE SOON'
  const urgencyColor = isOverdue ? '#dc2626' : '#ea580c'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reminder: ${data.reminderTitle}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: ${urgencyColor};
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .urgency-badge {
          background-color: ${urgencyColor};
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        .content {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 0 0 8px 8px;
        }
        .reminder-details {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid ${priorityColor};
        }
        .detail-row {
          margin-bottom: 10px;
          padding: 8px 0;
        }
        .detail-label {
          font-weight: bold;
          color: #555;
          display: inline-block;
          width: 120px;
        }
        .priority-badge {
          background-color: ${priorityColor};
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .customer-contact {
          background-color: #e7f3ff;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #0066cc;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div style="margin-bottom: 10px;">
            <span class="urgency-badge">${urgencyText}</span>
          </div>
          <h2 style="margin: 0;">Reminder Notification</h2>
        </div>
        
        <div class="content">
          <p>Hello ${data.repName},</p>
          
          <p>You have a reminder that is ${isOverdue ? 'overdue' : 'due soon'}:</p>
          
          <div class="reminder-details">
            <div class="detail-row">
              <span class="detail-label">Reminder:</span>
              <span style="font-weight: bold;">${data.reminderTitle}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Due Date:</span>
              <span style="color: ${urgencyColor}; font-weight: bold;">${dueDateTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Priority:</span>
              <span class="priority-badge">${data.priority}</span>
            </div>
            ${data.description ? `
            <div class="detail-row">
              <span class="detail-label">Description:</span>
              <span>${data.description}</span>
            </div>
            ` : ''}
          </div>

          ${data.customerName && data.customerEmail ? `
          <div class="customer-contact">
            <h3 style="margin: 0 0 10px 0; color: #0066cc;">Related Customer</h3>
            <p style="margin: 5px 0;"><strong>${data.customerName}</strong></p>
            <p style="margin: 5px 0;">Email: <a href="mailto:${data.customerEmail}">${data.customerEmail}</a></p>
          </div>
          ` : ''}
          
          <p>Please log into your calendar dashboard to mark this reminder as complete or take the necessary action.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/calendar" 
               style="display: inline-block; background-color: #e11d48; color: white; padding: 12px 25px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Open Calendar Dashboard
            </a>
          </div>
          
          <p>Best regards,<br>
          Evergreen Energy Upgrades System</p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Evergreen Energy Upgrades. All rights reserved.</p>
          <p>This is an automated reminder notification.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate HTML for custom email between rep and customer
 */
function generateCustomEmailHtml(data: {
  customerName: string
  repName: string
  message: string
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Message from ${data.repName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          border-bottom: 3px solid #e11d48;
        }
        .logo {
          color: #e11d48;
          font-size: 24px;
          font-weight: bold;
        }
        .content {
          padding: 20px 0;
        }
        .message-content {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #0066cc;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Evergreen Energy Upgrades</div>
          <h2 style="margin: 10px 0; color: #333;">Message from ${data.repName}</h2>
        </div>
        
        <div class="content">
          <p>Hello ${data.customerName},</p>
          
          <div class="message-content">
            ${data.message.split('\n').map(line => `<p>${line}</p>`).join('')}
          </div>
          
          <p>You can reply directly to this email to reach me.</p>
          
          <p>Best regards,<br>
          ${data.repName}<br>
          Evergreen Energy Upgrades</p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Evergreen Energy Upgrades. All rights reserved.</p>
          <p>This email was sent by ${data.repName}. You can reply directly to reach them.</p>
        </div>
      </div>
    </body>
    </html>
  `
}