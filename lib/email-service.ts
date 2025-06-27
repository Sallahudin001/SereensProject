"use server"

import { executeQuery } from "@/lib/db"
import { logProposalSentWithClerkId } from '@/lib/activity-logger';

interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail(data: EmailData) {
  try {
    // Check if we have the required environment variables
    if (!process.env.EMAIL_FROM) {
      throw new Error("EMAIL_FROM environment variable is not set")
    }

    // If using Resend
    if (process.env.RESEND_API_KEY) {
      return await sendWithResend(data)
    }

    // If using SMTP
    if (process.env.SMTP_HOST && process.env.SMTP_USER && (process.env.SMTP_PASSWORD || process.env.SMTP_PASS)) {
      return await sendWithSMTP(data)
    }

    throw new Error("No email service configuration found")
  } catch (error: unknown) {
    console.error("Error sending email:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

async function sendWithResend(data: EmailData) {
  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // EMAIL_FROM is checked in the parent function
    const emailFrom = process.env.EMAIL_FROM as string;

    const result = await resend.emails.send({
      from: emailFrom,
      to: data.to,
      subject: data.subject,
      html: data.html,
    })

    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("Error sending with Resend:", error)
    throw error
  }
}

async function sendWithSMTP(data: EmailData) {
  try {
    const nodemailer = await import("nodemailer")

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
      },
    })

    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.to,
      subject: data.subject,
      html: data.html,
    })

    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending with SMTP:", error)
    throw error
  }
}

// Function to format a date
export async function formatDate(date: Date | string): Promise<string> {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

// Function to format currency
export async function formatCurrency(amount: number): Promise<string> {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Generate proposal email HTML
export async function generateProposalEmailHtml(proposalId: string, baseUrl: string): Promise<string> {
  try {
    // Get proposal details
    const proposalResult = await executeQuery(
      `
      SELECT 
        p.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address
      FROM 
        proposals p
      JOIN 
        customers c ON p.customer_id = c.id
      WHERE 
        p.id = $1
    `,
      [proposalId],
    )

    if (proposalResult.length === 0) {
      throw new Error("Proposal not found")
    }

    const proposal = proposalResult[0]

    // Get services for this proposal
    const servicesResult = await executeQuery(
      `
      SELECT 
        s.name,
        s.display_name
      FROM 
        proposal_services ps
      JOIN 
        services s ON ps.service_id = s.id
      WHERE 
        ps.proposal_id = $1
    `,
      [proposalId],
    )

    // Get products for this proposal
    const productsResult = await executeQuery(
      `
      SELECT 
        p.service_id,
        s.name as service_name,
        p.product_data,
        p.scope_notes
      FROM 
        products p
      JOIN 
        services s ON p.service_id = s.id
      WHERE 
        p.proposal_id = $1
    `,
      [proposalId],
    )

    // Format the proposal data
    const proposalData = {
      id: proposal.id,
      proposalNumber: proposal.proposal_number,
      customer: {
        name: proposal.customer_name,
        email: proposal.customer_email,
        phone: proposal.customer_phone,
        address: proposal.customer_address,
      },
      services: servicesResult.map((s) => s.name),
      serviceNames: servicesResult.map((s) => s.display_name),
      products: productsResult.reduce((acc, product) => {
        acc[product.service_name] = {
          ...product.product_data,
          scopeNotes: product.scope_notes,
        }
        return acc
      }, {}),
      pricing: {
        subtotal: Number.parseFloat(proposal.subtotal),
        discount: Number.parseFloat(proposal.discount),
        total: Number.parseFloat(proposal.total),
        monthlyPayment: Number.parseFloat(proposal.monthly_payment) || 0,
        financingTerm: proposal.financing_term || 60,
        interestRate: Number.parseFloat(proposal.interest_rate) || 5.99,
      },
      status: proposal.status,
      createdAt: proposal.created_at,
    }

    // Generate the proposal view URL
    const proposalUrl = `${baseUrl}/proposals/view/${proposalId}`

    // Generate HTML for the email
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Your Proposal from Evergreen Home Upgrades</title>
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
            margin-bottom: 24px;
            line-height: 1.75;
          }
          .intro-text-secondary {
            color: #374151;
            margin-bottom: 32px;
            line-height: 1.75;
          }
          .proposal-number {
            color: #059669;
            font-weight: 600;
          }
          .customer-info {
            margin-bottom: 20px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #059669;
          }
          .scope-section {
            background-color: #f8fafc;
            border-left: 4px solid #059669;
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
            padding: 24px;
            margin: 32px 0;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          }
          .service-name {
            font-weight: bold;
            margin-bottom: 10px;
          }
          .pricing {
            margin: 20px 0;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .pricing-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
          }
          .total-row {
            font-weight: bold;
            border-top: 2px solid #10b981;
            padding-top: 10px;
            margin-top: 10px;
            font-size: 16px;
          }
          .monthly-payment {
            color: #059669;
            font-weight: bold;
          }
          
          /* CTA Button */
          .cta-section {
            text-align: center;
            margin: 40px 0;
          }
          .cta-button {
            display: inline-block;
            background-color: #059669;
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 18px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: all 0.2s;
          }
          .cta-button:hover {
            background-color: #047857;
            transform: translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }
          
          /* Next steps section */
          .next-steps {
            background-color: #ecfdf5;
            border: 1px solid #d1fae5;
            border-radius: 8px;
            padding: 24px;
            margin: 32px 0;
          }
          .next-steps h3 {
            font-weight: 700;
            color: #065f46;
            margin-bottom: 16px;
            font-size: 18px;
          }
          .step-item {
            display: flex;
            align-items: center;
            color: #374151;
            margin-bottom: 8px;
          }
          .step-item:last-child {
            margin-bottom: 0;
          }
          .step-checkmark {
            color: #059669;
            margin-right: 12px;
            font-weight: bold;
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
            .scope-section { padding: 20px; }
            .cta-button { padding: 14px 32px; font-size: 16px; }
            .next-steps { padding: 20px; }
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
              <h1 class="header-title">Your Proposal is Ready</h1>
              <p class="header-subtitle">Professional Home Improvement Proposal</p>
            </div>
            
            <div class="email-content">
              <div class="greeting">Hello ${proposalData.customer.name},</div>
              
              <div class="intro-text">
                Your proposal <strong class="proposal-number">#${proposalData.proposalNumber}</strong> from Evergreen Home Upgrades is ready for your review.
              </div>
              
              <div class="intro-text-secondary">
                We've carefully prepared a comprehensive proposal tailored to your home improvement needs.
              </div>
              
              <div class="customer-info">
                <p><strong>Homeowner:</strong> ${proposalData.customer.name}</p>
                <p><strong>Address:</strong> ${proposalData.customer.address || "N/A"}</p>
                <p><strong>Proposal Date:</strong> ${await formatDate(proposalData.createdAt)}</p>
                <p><strong>Project Manager:</strong> Jaime Sanchez (Phone number: 408-555-1234)</p>
              </div>
            
            <div class="section">
              ${proposalData.services
                .map((service) => {
                  const productData = proposalData.products[service]
                  if (!productData) return ""

                  const serviceHtml = `
                  <div class="scope-section">
                    <div class="section-title">Scope of Work – ${service.charAt(0).toUpperCase() + service.slice(1).replace("-", " & ")}</div>
                    <div class="service-content">
                      ${productData.scopeNotes
                        .split("\n")
                        .map((line: string) => `<p>${line}</p>`)
                        .join("")}
                    </div>
                  </div>
                `

                  return serviceHtml
                })
                .join("")}
            </div>
            
            <div class="pricing">
              <div class="section-title">Pricing Information</div>
              <div class="pricing-row">
                <span>Subtotal:</span>
                <span>${await formatCurrency(proposalData.pricing.subtotal)}</span>
              </div>
              <div class="pricing-row">
                <span>Discount:</span>
                <span>-${await formatCurrency(proposalData.pricing.discount)}</span>
              </div>
              <div class="pricing-row total-row">
                <span>Project Total:</span>
                <span>${await formatCurrency(proposalData.pricing.total)}</span>
              </div>
              <div class="pricing-row monthly-payment">
                <span>Estimated Monthly Payment (${proposalData.pricing.financingTerm} Months @ ${proposalData.pricing.interestRate}%):</span>
                <span>${await formatCurrency(proposalData.pricing.monthlyPayment)}/month</span>
              </div>
              
              ${
                proposalData.pricing.discount > 0
                  ? `
                <p><strong>Combo Bonus Applied:</strong> ${await formatCurrency(proposalData.pricing.discount)} off for bundling multiple services</p>
              `
                  : ""
              }
            </div>
            
            <div class="cta-section">
              <a href="${proposalUrl}" class="cta-button">View Your Proposal</a>
            </div>
            
            <div class="next-steps">
              <h3>What's Next:</h3>
              <div class="step-item">
                <span class="step-checkmark">✓</span>
                Review your detailed proposal online
              </div>
              <div class="step-item">
                <span class="step-checkmark">✓</span>
                Ask any questions you may have
              </div>
              <div class="step-item">
                <span class="step-checkmark">✓</span>
                Sign electronically when ready
              </div>
              <div class="step-item">
                <span class="step-checkmark">✓</span>
                Make your deposit to secure your project
              </div>
            </div>
            
            <p style="color: #374151; line-height: 1.75; margin-bottom: 16px;">
              If you have any questions, please don't hesitate to contact us.
            </p>
            
            <p style="color: #374151; line-height: 1.75;">
              Thank you for choosing Evergreen Home Upgrades for your home improvement needs.
            </p>
          </div>
          
          <div class="email-footer">
            <div class="contact-info">
              <div><strong class="contact-icon">📧</strong> info@evergreenenergyupgrades.com</div>
              <div><strong class="contact-icon">📞</strong> Cell: (408) 826-7377 | Office: (408) 333-9831</div>
              <div><strong class="contact-icon">🌐</strong> www.evergreenenergyupgrades.com</div>
            </div>
            <div class="copyright">
              © ${new Date().getFullYear()} Evergreen Home Upgrades. All rights reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    return html
  } catch (error) {
    console.error("Error generating proposal email HTML:", error)
    throw error
  }
}

// Send proposal email
// Update the sendProposalEmail function to handle the case where we're sending an email for a newly created proposal
export async function sendProposalEmail(proposalId: string, baseUrl: string) {
  try {
    // Get proposal details to get customer email
    const proposalResult = await executeQuery(
      `
      SELECT 
        p.proposal_number,
        c.name as customer_name,
        c.email as customer_email
      FROM 
        proposals p
      JOIN 
        customers c ON p.customer_id = c.id
      WHERE 
        p.id = $1
    `,
      [proposalId],
    )

    if (proposalResult.length === 0) {
      throw new Error("Proposal not found")
    }

    const proposal = proposalResult[0]

    // Generate email HTML
    const html = await generateProposalEmailHtml(proposalId, baseUrl)

    // Send the email
    const result = await sendEmail({
      to: proposal.customer_email,
      subject: `Your Proposal #${proposal.proposal_number} from Evergreen Home Proposals`,
      html,
    })

    // If email sent successfully, update proposal status to 'sent'
    if (result.success) {
      await executeQuery(
        `
        UPDATE proposals
        SET status = 'sent', sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [proposalId],
      )

      // Log the activity - this correctly uses actor_id column in the activity_log table
      await executeQuery(
        `
        INSERT INTO activity_log (
          action, action_category, actor_id, 
          proposal_id, metadata
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          "send_proposal_email", 
          "proposal", 
          "system", 
          proposalId, 
          JSON.stringify({ to: proposal.customer_email })
        ]
      );

      // Get the user who sent the proposal from the proposals table
      const proposalUser = await executeQuery(
        `SELECT user_id FROM proposals WHERE id = $1`, 
        [proposalId]
      );

      const userId = proposalUser[0]?.user_id || 'system';

      // Log the proposal sent activity with clerk_id
      await logProposalSentWithClerkId(
        userId, // Sender's clerk_id
        parseInt(proposalId),
        proposal.proposal_number,
        proposal.customer_email,
        proposal.customer_name
      );
    }

    return result
  } catch (error: unknown) {
    console.error("Error sending proposal email:", error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
