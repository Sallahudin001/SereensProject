"use server"

import { executeQuery } from "@/lib/db"

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
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error: error.message }
  }
}

async function sendWithResend(data: EmailData) {
  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
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
export async function formatDate(date: Date | string): string {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

// Function to format currency
export async function formatCurrency(amount: number): string {
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
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Proposal from EverGreen Energy Proposals</title>
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
            color: #e11d48;
          }
          .scope-section {
            background-color: #f8f9fa;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
          }
          .service-name {
            font-weight: bold;
            margin-bottom: 10px;
          }
          .pricing {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
          }
          .pricing-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .total-row {
            font-weight: bold;
            border-top: 1px solid #ddd;
            padding-top: 5px;
            margin-top: 5px;
          }
          .monthly-payment {
            color: #e11d48;
          }
          .cta-button {
            display: inline-block;
            background-color: #e11d48;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          .contact-info {
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>Professional Home Improvement Proposal</div>
          </div>
          
          <div class="content">
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
                        .map((line) => `<p>${line}</p>`)
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
            
            <div style="text-align: center;">
              <a href="${proposalUrl}" class="cta-button">View, Sign & Pay Online</a>
            </div>
            
            <div style="margin-top: 30px;">
              <p>Thank you for considering Evergreen Energy Upgrades for your home improvement needs. To proceed with this proposal, please click the button above to review the complete details, sign electronically, and make your deposit payment.</p>
              <p>This proposal is valid for 30 days from the date of issue. If you have any questions, please don't hesitate to contact your project manager.</p>
            </div>
          </div>
          
          <div class="footer">
            <div class="contact-info">
              <p>📧 info@evergreenenergyupgrades.com</p>
              <p>📞 (408) 555-1234</p>
              <p>www.evergreenenergyupgrades.com</p>
            </div>
            <p>© 2023 Evergreen Energy Upgrades. All rights reserved.</p>
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
      subject: `Your Proposal #${proposal.proposal_number} from EverGreen Energy Proposals`,
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

      // Log the activity
      await executeQuery(
        `
        INSERT INTO activity_log (proposal_id, user_id, action, details)
        VALUES ($1, $2, $3, $4)
        `,
        [proposalId, "system", "send_proposal_email", JSON.stringify({ to: proposal.customer_email })],
      )
    }

    return result
  } catch (error) {
    console.error("Error sending proposal email:", error)
    return { success: false, error: error.message }
  }
}
