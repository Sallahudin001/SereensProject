import { NextRequest, NextResponse } from 'next/server';
import { Vonage } from '@vonage/server-sdk';

// Use environment variables for API credentials
const VONAGE_SENDER = 'Evergreen';

interface SMSRequestBody {
  phone: string;
  name: string;
  proposalId: string;
  proposalNumber: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get origin for CORS
    const origin = request.headers.get('origin') || '';
    console.log(`Request origin: ${origin}`);
    
    // Allow all origins for development purposes
    // You can restrict this in production if needed

    // Parse request body
    const body = await request.json() as SMSRequestBody;
    const { phone, name, proposalId, proposalNumber, message } = body;
    
    console.log(`Received SMS request:`, {
      name,
      proposalId,
      proposalNumber
    });

    // Validate required fields
    if (!phone || !name || !proposalId || !proposalNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Phone validation and E.164 formatting
    // Remove all non-digit characters
    let cleanedPhone = phone.replace(/\D/g, '');
    
    // Check if the number already has a country code
    // This is a simple heuristic - we assume numbers longer than 10 digits 
    // already have a country code, and numbers that start with
    // common country codes (1, 44, 91, 92, etc.) already have a country code
    if (cleanedPhone.length === 10 && !cleanedPhone.startsWith('1') && 
        !cleanedPhone.startsWith('44') && !cleanedPhone.startsWith('91') && 
        !cleanedPhone.startsWith('92')) {
      // Assuming this is a US number without country code
      cleanedPhone = '1' + cleanedPhone;
    }
    
    // Verify we have a valid international number
    if (cleanedPhone.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number with country code' },
        { status: 400 }
      );
    }

    console.log(`Phone number formatted for SMS`);

    // Get API credentials from environment variables
    const apiKey = process.env.VONAGE_API_KEY;
    const apiSecret = process.env.VONAGE_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('Vonage API credentials missing');
      return NextResponse.json(
        { error: 'SMS service not configured properly. Missing API credentials.' },
        { status: 500 }
      );
    }

    try {
      // Generate proposal URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'https://yourdomain.com';
      const proposalUrl = `${baseUrl}/proposals/view/${proposalId}`;

      // Create SMS text message
      const defaultMessage = `Hello ${name}, your proposal #${proposalNumber} from Evergreen Home Upgrades is ready. View and sign here: ${proposalUrl}`;
      const smsText = message || defaultMessage;

      console.log(`Preparing to send SMS from ${VONAGE_SENDER}`);
      
      // Prepare request data
      const requestData = {
        api_key: apiKey,
        api_secret: apiSecret,
        to: cleanedPhone,
        from: VONAGE_SENDER,
        text: smsText,
      };
      
      console.log('Sending request to Vonage API');
      
      // Use fetch directly to call Vonage API instead of SDK to avoid TypeScript issues
      const response = await fetch('https://rest.nexmo.com/sms/json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      console.log(`SMS API response (status ${response.status})`);

      // Check if all messages were sent successfully
      if (result.messages && result.messages.length > 0) {
        const allSuccess = result.messages.every((msg: any) => msg.status === '0');

        if (allSuccess) {
          return NextResponse.json({ 
            success: true,
            messages: result.messages 
          });
        } else {
          // Some messages failed to send
          return NextResponse.json({ 
            success: false,
            error: 'Some SMS messages failed to send',
            details: result.messages
          }, { status: 500 });
        }
      } else {
        return NextResponse.json({
          success: false,
          error: 'Invalid response from SMS API',
        }, { status: 500 });
      }
    } catch (smsError) {
      console.error('Vonage SMS Error:', smsError);
      return NextResponse.json(
        { error: 'Failed to send SMS. Please check Vonage configuration.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send SMS. Please try again later.' },
      { status: 500 }
    );
  }
} 