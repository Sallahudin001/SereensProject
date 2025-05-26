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
    // Parse request body
    const body = await request.json() as EmailRequestBody;
    const { email, name, proposalId, proposalNumber, message, phone } = body;

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
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
    const proposalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/proposals/view/${proposalId}`;

    // Email options
    const mailOptions = {
      from: `"Evergreen Energy Upgrades" <${process.env.EMAIL_USER}>`,
      to: email,
      cc: process.env.EMAIL_RECIPIENT,
      subject: `Your Proposal #${proposalNumber} from Evergreen Energy Upgrades`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px; background-color: #f8f9fa; margin-bottom: 20px;">
            <img src="${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/evergreen.png" alt="Evergreen Energy Upgrades Logo" style="height: 80px; width: auto; margin-bottom: 10px;">
            <h2 style="margin: 0; color: #333;">Your Proposal is Ready</h2>
          </div>
          
          <p>Hello ${name},</p>
          
          <p>Your proposal #${proposalNumber} from Evergreen Energy Upgrades is ready for your review.</p>
          
          <p>${message || 'Please click the button below to view, sign, and make your deposit payment to secure your project.'}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${proposalUrl}" style="background-color: #e11d48; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Your Proposal</a>
          </div>
          
          <p>If you have any questions, please don't hesitate to contact us${phone ? ` at ${phone}` : ''}.</p>
          
          <p>Thank you for choosing Evergreen Energy Upgrades for your home improvement needs.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 14px; color: #666;">
            <p>© ${new Date().getFullYear()} Evergreen Energy Upgrades. All rights reserved.</p>
          </div>
        </div>
      `
    };

    // Verify SMTP configuration is valid before sending
    await transporter.verify();

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}