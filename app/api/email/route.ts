import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

interface EmailRequestBody {
  //hello
  email: string;
  name: string;
  proposalId: string;
  proposalNumber: string;
  message?: string;
  phone?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check for allowed origins if needed
    const origin = request.headers.get('origin');
    // Add localhost:3003 to allowed origins for development
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_BASE_URL, 
      'http://localhost:3000',
      'http://localhost:3003'
    ];
    
    console.log('Request origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    
    // In development, be more lenient with origin checking
    if (process.env.NODE_ENV === 'production' && origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { error: 'Unauthorized origin' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json() as EmailRequestBody;
    const { email, name, proposalId, proposalNumber, message, phone } = body;

    console.log('Email request details:', { email, name, proposalId, proposalNumber });

    // Validate required fields
    if (!email || !name || !proposalId || !proposalNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email configuration missing');
      return NextResponse.json(
        { error: 'Email service not configured properly' },
        { status: 500 }
      );
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Generate proposal URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'https://yourdomain.com';
    const proposalUrl = `${baseUrl}/proposals/view/${proposalId}`;

    // Email options
    const mailOptions = {
      from: `"Evergreen Home Upgrades" <${process.env.EMAIL_USER}>`,
      to: email,
      cc: process.env.EMAIL_RECIPIENT,
      subject: `Your Proposal #${proposalNumber} from Evergreen Home Upgrades`,
      html: `
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
            
            /* Message card */
            .message-card {
              background-color: #f9fafb;
              border-left: 4px solid #059669;
              border-top-right-radius: 8px;
              border-bottom-right-radius: 8px;
              padding: 24px;
              margin: 32px 0;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            }
            .message-card p {
              color: #374151;
              line-height: 1.75;
              margin: 0;
            }
            
            /* CTA Button */
            .cta-section {
              text-align: center;
              margin: 40px 0;
            }
            .cta-button {
              display: inline-block;
              background-color: #059669;
              color: #ffffff !important;
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
              color: #ffffff !important;
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
              .message-card { padding: 20px; }
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
                  <img src="/sereenh-04.png" alt="Evergreen Home Upgrades" class="logo" />
                </div>
                <h1 class="header-title">Your Proposal is Ready</h1>
                <p class="header-subtitle">Professional Home Improvement Proposal</p>
              </div>
              
              <div class="email-content">
                <div class="greeting">Hello ${name},</div>
                
                <div class="intro-text">
                  Your proposal <strong class="proposal-number">#${proposalNumber}</strong> from Evergreen Home Upgrades is ready for your review.
                </div>
                
                <div class="intro-text-secondary">
                  We've carefully prepared a comprehensive proposal tailored to your home improvement needs.
                </div>
                
                <div class="message-card">
                  <p>${message || 'Please click the button below to view, sign, and make your deposit payment to secure your project.'}</p>
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
                  <div><strong class="contact-icon">📧</strong> info@evergreenenergy.io</div>
                  <div><strong class="contact-icon">📞</strong> (408) 333-9831</div>
                  <div><strong class="contact-icon">🌐</strong> www.evergreenenergy.io</div>
                </div>
                <div class="copyright">
                  © ${new Date().getFullYear()} Evergreen Home Upgrades. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      // Verify SMTP configuration is valid before sending
      await transporter.verify();

      // Send email
      const info = await transporter.sendMail(mailOptions);

      console.log('Email sent successfully:', info.messageId);

      return NextResponse.json({ 
        success: true, 
        messageId: info.messageId 
      });
    } catch (emailError) {
      console.error('SMTP Error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email. Please check SMTP configuration.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
} 