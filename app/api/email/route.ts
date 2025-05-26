import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

interface EmailRequestBody {
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
      from: `"Evergreen Energy Upgrades" <${process.env.EMAIL_USER}>`,
      to: email,
      cc: process.env.EMAIL_RECIPIENT,
      subject: `Your Proposal #${proposalNumber} from Evergreen Energy Upgrades`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 30px; background-color: #f8f9fa; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #333;">Your Proposal is Ready</h2>
          </div>
          
          <p>Hello ${name},</p>
          
          <p>Your proposal <strong>#${proposalNumber}</strong> from Evergreen Energy Upgrades is ready for your review.</p>
          
          <p>${message || 'Please click the button below to view, sign, and make your deposit payment to secure your project.'}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${proposalUrl}" style="background-color: #e11d48; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Your Proposal</a>
          </div>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Thank you for choosing Evergreen Energy Upgrades for your home improvement needs.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 14px; color: #666;">
            <p>© ${new Date().getFullYear()} Evergreen Energy Upgrades. All rights reserved.</p>
          </div>
        </div>
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