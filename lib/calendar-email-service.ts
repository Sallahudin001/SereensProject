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
      fromName: "Evergreen Home System",
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
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Appointment Scheduled - Evergreen Home Upgrades</title>
      <style>
        /* Reset and base styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          background-color: #f9fafb;
          margin: 0;
          padding: 0;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        
        /* Container styles */
        .email-wrapper {
          width: 100%;
          background-color: #f9fafb;
          padding: 32px 0;
          min-height: 100vh;
        }
        .email-container {
          max-width: 672px;
          width: 100%;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }
        
        /* Header styles */
        .email-header {
          background-color: #059669;
          padding: 40px 32px;
          text-align: center;
          color: white;
        }
        .logo-container {
          margin-bottom: 24px;
        }
        .logo {
          height: 80px;
          margin: 0 auto;
          background-color: white;
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header-title {
          font-size: 30px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .header-subtitle {
          font-size: 18px;
          color: #a7f3d0;
        }
        
        /* Content styles */
        .email-content {
          padding: 40px 32px;
        }
        .greeting {
          font-size: 20px;
          color: #1f2937;
          margin-bottom: 24px;
        }
        .intro-text {
          font-size: 18px;
          color: #374151;
          margin-bottom: 32px;
          line-height: 1.75;
        }
        
        /* Appointment details card */
        .appointment-card {
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          margin: 32px 0;
          overflow: hidden;
        }
        .appointment-header {
          background-color: #f9fafb;
          padding: 16px 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        .appointment-header h3 {
          font-weight: 700;
          color: #1f2937;
          font-size: 18px;
        }
        .appointment-details {
          padding: 24px;
        }
        .appointment-table {
          width: 100%;
        }
        .appointment-row {
          border-bottom: 1px solid #f3f4f6;
        }
        .appointment-row:last-child {
          border-bottom: none;
        }
        .appointment-row td {
          padding: 16px 0;
          vertical-align: top;
        }
        .appointment-label {
          color: #6b7280;
          font-weight: 500;
          width: 128px;
        }
        .appointment-value {
          color: #1f2937;
          font-weight: 600;
        }
        
        /* Rep contact section */
        .rep-contact {
          background-color: #ecfdf5;
          border: 1px solid #d1fae5;
          border-radius: 8px;
          padding: 24px;
          margin: 32px 0;
        }
        .rep-contact h3 {
          font-weight: 700;
          color: #065f46;
          margin-bottom: 16px;
          font-size: 18px;
        }
        .rep-name {
          color: #065f46;
          font-weight: 600;
          font-size: 18px;
          margin-bottom: 8px;
        }
        .rep-info {
          color: #047857;
          margin-bottom: 8px;
        }
        .rep-info:last-of-type {
          margin-bottom: 16px;
        }
        .rep-email {
          color: #059669;
          text-decoration: none;
          font-weight: 500;
        }
        .rep-email:hover {
          text-decoration: underline;
        }
        .rep-note {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #d1fae5;
          font-size: 14px;
          color: #059669;
        }
        
        /* Footer */
        .email-footer {
          background-color: #f3f4f6;
          padding: 32px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .contact-info {
          color: #374151;
          margin-bottom: 16px;
          line-height: 1.5;
        }
        .contact-info div {
          margin-bottom: 4px;
        }
        .contact-icon {
          color: #059669;
          font-weight: 600;
        }
        .copyright {
          color: #6b7280;
          font-size: 14px;
          padding-top: 16px;
          border-top: 1px solid #d1d5db;
        }
        
        /* Responsive design */
        @media only screen and (max-width: 600px) {
          .email-wrapper { padding: 16px 0; }
          .email-container { margin: 0 16px; border-radius: 8px; }
          .email-header { padding: 32px 24px; }
          .email-content { padding: 32px 24px; }
          .header-title { font-size: 24px; }
          .logo { height: 64px; }
          .appointment-details { padding: 20px; }
          .rep-contact { padding: 20px; }
          .appointment-row td {
            display: block;
            padding: 8px 0;
          }
          .appointment-label {
            width: auto;
            margin-bottom: 4px;
          }
        }
        
        @media only screen and (max-width: 480px) {
          .email-container { margin: 0 8px; }
          .email-header { padding: 24px 16px; }
          .email-content { padding: 24px 16px; }
          .email-footer { padding: 24px 16px; }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          <div class="email-header">
                      <div class="logo-container">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/newlogo-lG9O9KzH8xKviah766GIp8QX9w9Ggu.png" alt="Evergreen Home Upgrades" class="logo" />
            </div>
            <h1 class="header-title">Appointment Scheduled</h1>
            <p class="header-subtitle">Your appointment has been confirmed</p>
          </div>
          
          <div class="email-content">
            <div class="greeting">Hello ${data.customerName},</div>
            
            <div class="intro-text">
              Your appointment with Evergreen Home Upgrades has been successfully scheduled. Here are the details:
            </div>
            
            <div class="appointment-card">
              <div class="appointment-header">
                <h3>📅 Appointment Details</h3>
              </div>
              <div class="appointment-details">
                <table class="appointment-table">
                  <tbody>
                    <tr class="appointment-row">
                      <td class="appointment-label">Appointment:</td>
                      <td class="appointment-value">${data.appointmentTitle}</td>
                    </tr>
                    <tr class="appointment-row">
                      <td class="appointment-label">Date:</td>
                      <td class="appointment-value">${appointmentDateTime}</td>
                    </tr>
                    <tr class="appointment-row">
                      <td class="appointment-label">Time:</td>
                      <td class="appointment-value">${data.appointmentTime}</td>
                    </tr>
                    <tr class="appointment-row">
                      <td class="appointment-label">Type:</td>
                      <td class="appointment-value">${data.appointmentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                    </tr>
                    ${data.location ? `
                    <tr class="appointment-row">
                      <td class="appointment-label">Location:</td>
                      <td class="appointment-value">${data.location}</td>
                    </tr>
                    ` : ''}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div class="rep-contact">
              <h3>👨‍💼 Your Representative</h3>
              <div class="rep-name">${data.repName}</div>
              <div class="rep-info">📧 Email: <a href="mailto:${data.repEmail}" class="rep-email">${data.repEmail}</a></div>
              <div class="rep-info">📞 Phone: (408) 333-9831</div>
              <div class="rep-note">
                💬 You can reply directly to this email to contact ${data.repName} with any questions.
              </div>
            </div>
            
            <p style="color: #374151; line-height: 1.75; margin-bottom: 16px;">
              If you need to reschedule or have any questions, please don't hesitate to contact us at least 24 hours in advance.
            </p>
            
            <p style="color: #374151; line-height: 1.75;">
              Thank you for choosing Evergreen Home Upgrades for your home improvement needs.
            </p>
          </div>
          
          <div class="email-footer">
            <div class="contact-info">
              <div><strong class="contact-icon">📧</strong> info@evergreenenergy.io</div>
              <div><strong class="contact-icon">📞</strong> (408) 333-9831</div>
              <div><strong class="contact-icon">🌐</strong> www.evergreenenergy.io</div>
            </div>
            <div class="copyright">
              © ${new Date().getFullYear()} Evergreen Home Upgrades. All rights reserved.<br>
              This email was sent by ${data.repName}. You can reply directly to reach them.
            </div>
          </div>
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
                       data.priority === 'medium' ? '#d97706' : '#059669'

  const now = new Date()
  const due = new Date(data.dueDate)
  const isOverdue = due < now
  const urgencyText = isOverdue ? 'OVERDUE' : 'DUE SOON'
  const urgencyColor = isOverdue ? '#dc2626' : '#059669'

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
          background-color: #dcfce7;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #059669;
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
            <h3 style="margin: 0 0 10px 0; color: #059669;">Related Customer</h3>
            <p style="margin: 5px 0;"><strong>${data.customerName}</strong></p>
            <p style="margin: 5px 0;">Email: <a href="mailto:${data.customerEmail}">${data.customerEmail}</a></p>
          </div>
          ` : ''}
          
          <p>Please log into your calendar dashboard to mark this reminder as complete or take the necessary action.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/calendar" 
               style="display: inline-block; background-color: #059669; color: white; padding: 12px 25px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Open Calendar Dashboard
            </a>
          </div>
          
          <p>Best regards,<br>
          Evergreen Home Upgrades System</p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Evergreen Home Upgrades. All rights reserved.</p>
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
          border-bottom: 3px solid #059669;
        }
        .logo {
          text-align: center;
          margin-bottom: 15px;
        }
        .content {
          padding: 20px 0;
        }
        .message-content {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #059669;
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
          <div class="logo"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/newlogo-lG9O9KzH8xKviah766GIp8QX9w9Ggu.png" alt="Evergreen Home Upgrades" style="height: 60px;" /></div>
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
          Evergreen Home Upgrades</p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Evergreen Home Upgrades. All rights reserved.</p>
          <p>This email was sent by ${data.repName}. You can reply directly to reach them.</p>
        </div>
      </div>
    </body>
    </html>
  `
}