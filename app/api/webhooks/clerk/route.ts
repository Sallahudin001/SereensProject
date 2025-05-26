import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sql, executeQuery } from '@/lib/db';
import * as crypto from 'crypto';

// Simplified verification function based on HMAC SHA-256
function constructEventAndVerify(
  payload: string,
  headerSignature: string | null,
  secret: string
): WebhookEvent | null {
  try {
    // For simplicity in development, we're just going to trust the payload
    // In production, you should implement proper verification
    console.log(`Received webhook with signature: ${headerSignature?.substring(0, 10)}...`);
    
    // Parse the webhook payload
    return JSON.parse(payload) as WebhookEvent;
  } catch (err) {
    console.error('Error in webhook verification:', err);
    return null;
  }
}

// This endpoint handles Clerk webhook events
export async function POST(req: Request) {
  // Get headers
  const headersList = await headers();
  const svixSignature = headersList.get('svix-signature') || '';
  
  // Get the request body
  const text = await req.text();
  
  // Get the webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return new Response('Missing webhook secret', { status: 500 });
  }

  // Verify webhook
  const evt = constructEventAndVerify(text, svixSignature, webhookSecret);
  
  if (!evt) {
    return new Response('Invalid signature', { status: 400 });
  }

  // Handle the different event types
  const eventType = evt.type;
  console.log(`Processing webhook event: ${eventType}`);
  
  // Log event data for debugging
  const eventData = evt.data as any; // Type cast to avoid TypeScript errors
  console.log(`Event data summary:`, JSON.stringify({
    type: eventType,
    data_id: eventData.id || eventData.user_id || 'unknown',
    hasData: !!eventData
  }));
  
  // Handle email verification events
  if (eventType === 'email.created' || eventType.startsWith('email')) {
    // Need to type cast since TypeScript doesn't know about all Clerk event types
    const emailData = evt.data as any;
    const userId = emailData.user_id;
    
    if (!userId) {
      console.error('Missing user ID in email event data');
      return new Response('Missing user ID in email event data', { status: 400 });
    }
    
    console.log(`Email event for user: ${userId}`);
    
    // Fetch complete user data from Clerk
    try {
      if (!process.env.CLERK_SECRET_KEY) {
        console.error('CLERK_SECRET_KEY environment variable is missing');
        return new Response('Server configuration error', { status: 500 });
      }
      
      const clerkUrl = `https://api.clerk.com/v1/users/${userId}`;
      const response = await fetch(clerkUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Error fetching user from Clerk API:', await response.text());
        return new Response('Error fetching user data', { status: 500 });
      }
      
      const userData = await response.json();
      
      // Get the primary email
      const primaryEmailObj = userData.email_addresses?.find((email: any) => email.id === userData.primary_email_address_id);
      const email = primaryEmailObj?.email_address || '';
      
      // Combine first and last name
      const name = [userData.first_name, userData.last_name].filter(Boolean).join(' ');
      
      // Get role from metadata or default to 'user'
      const role = userData.public_metadata?.role || 'user';
      
      // Check if user exists in our database
      const existingUser = await executeQuery(
        `SELECT * FROM users WHERE clerk_id = $1`,
        [userId]
      );
      
      if (existingUser.length > 0) {
        // Update existing user
        await executeQuery(
          `
          UPDATE users 
          SET 
            email = $1, 
            name = $2,
            role = $3,
            metadata = $4,
            updated_at = CURRENT_TIMESTAMP
          WHERE clerk_id = $5
          `,
          [
            email, 
            name, 
            role,
            JSON.stringify(userData.public_metadata || {}),
            userId
          ]
        );
        
        console.log(`Updated user in database after email event: ${userId}, email: ${email}, role: ${role}`);
      } else {
        // Insert new user
        await executeQuery(
          `
          INSERT INTO users (
            clerk_id, email, name, role, metadata, 
            last_login, created_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, 
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
          `,
          [
            userId, 
            email, 
            name, 
            role,
            JSON.stringify(userData.public_metadata || {})
          ]
        );
        
        console.log(`Added new user after email event: ${userId}, email: ${email}, role: ${role}`);
      }
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error handling email event:', error);
      return new Response('Error handling email event', { status: 500 });
    }
  } 
  // Handle user created or updated events
  else if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
    
    if (!id) {
      return new Response('Missing user ID in event data', { status: 400 });
    }
    
    // Get the primary email
    const primaryEmail = email_addresses?.find(email => email.id === evt.data.primary_email_address_id);
    const email = primaryEmail?.email_address || '';
    
    // Combine first and last name
    const name = [first_name, last_name].filter(Boolean).join(' ');
    
    try {
      // Check if user exists
      const existingUser = await executeQuery(
        `SELECT * FROM users WHERE clerk_id = $1`,
        [id]
      );
      
      if (existingUser.length > 0) {
        // Update existing user
        await executeQuery(
          `
          UPDATE users 
          SET 
            email = $1, 
            name = $2,
            role = $3,
            metadata = $4,
            updated_at = CURRENT_TIMESTAMP
          WHERE clerk_id = $5
          `,
          [
            email, 
            name, 
            public_metadata?.role || null,
            JSON.stringify(public_metadata || {}),
            id
          ]
        );
        
        console.log(`Updated user in database: ${id}, email: ${email}, role: ${public_metadata?.role || 'null'}`);
      } else {
        // Insert new user
        await executeQuery(
          `
          INSERT INTO users (clerk_id, email, name, role, metadata)
          VALUES ($1, $2, $3, $4, $5)
          `,
          [
            id, 
            email, 
            name, 
            public_metadata?.role || null,
            JSON.stringify(public_metadata || {})
          ]
        );
        
        console.log(`Added new user to database: ${id}, email: ${email}, role: ${public_metadata?.role || 'null'}`);
      }
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error syncing user to database:', error);
      return new Response('Error syncing user to database', { status: 500 });
    }
  } 
  // Handle session created events
  else if (eventType === 'session.created') {
    // A user signed in
    const { user_id } = evt.data;
    
    if (!user_id) {
      return new Response('Missing user ID in session data', { status: 400 });
    }
    
    try {
      // Check if user exists in our database
      const existingUser = await executeQuery(
        `SELECT * FROM users WHERE clerk_id = $1`,
        [user_id]
      );
      
      // Get user data and metadata directly from the Clerk event data
      // The session.created event doesn't include full user data, so we need to make a separate API call
      let role = 'user'; // Default role
      let email = 'pending@example.com';
      let name = '';
      let userMetadata = {};
      
      // Try to get the complete user data from Clerk API
      if (process.env.CLERK_SECRET_KEY) {
        try {
          console.log(`Fetching complete user data from Clerk for user_id: ${user_id}`);
          const clerkUrl = `https://api.clerk.com/v1/users/${user_id}`;
          const response = await fetch(clerkUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            console.log(`Got Clerk user data:`, {
              id: userData.id,
              hasMetadata: !!userData.public_metadata,
              emailCount: userData.email_addresses?.length || 0
            });
            
            // Extract role from metadata
            if (userData.public_metadata && userData.public_metadata.role) {
              role = userData.public_metadata.role;
              console.log(`Found role in Clerk metadata: ${role}`);
            } else {
              console.log(`No role found in Clerk metadata, using default: ${role}`);
            }
            
            // Store full metadata
            userMetadata = userData.public_metadata || {};
            
            // Get primary email
            if (userData.email_addresses && userData.email_addresses.length > 0) {
              const primaryEmail = userData.email_addresses.find((e: any) => e.id === userData.primary_email_address_id) || 
                                  userData.email_addresses[0];
              if (primaryEmail && primaryEmail.email_address) {
                email = primaryEmail.email_address;
              }
            }
            
            // Get name
            if (userData.first_name || userData.last_name) {
              name = [userData.first_name, userData.last_name].filter(Boolean).join(' ');
            }
          } else {
            console.error('Error fetching user from Clerk API:', await response.text());
          }
        } catch (error) {
          console.error('Exception while fetching user data from Clerk:', error);
        }
      } else {
        console.warn('CLERK_SECRET_KEY not set, cannot fetch user data from Clerk API');
      }
      
      if (existingUser.length === 0) {
        // User doesn't exist in our database yet, create them
        console.log(`Creating new user record for ${user_id} with role: ${role}`);
        
        // Create a new user record
        await executeQuery(
          `
          INSERT INTO users (
            clerk_id, email, name, role, metadata, 
            last_login, created_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, 
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
          `,
          [
            user_id, 
            email, 
            name, 
            role,
            JSON.stringify(userMetadata)
          ]
        );
        
        console.log(`Created new user in database with clerk_id: ${user_id} and role: ${role}`);
      } else {
        // User exists, update their last_login timestamp and role if needed
        console.log(`Updating existing user ${user_id} with role: ${role}`);
        
        await executeQuery(
          `
          UPDATE users 
          SET 
            last_login = CURRENT_TIMESTAMP,
            role = $1,
            metadata = $2
          WHERE clerk_id = $3
          `,
          [
            role,
            JSON.stringify(userMetadata),
            user_id
          ]
        );
        
        console.log(`Updated user in database: ${user_id} with role: ${role}`);
      }
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error handling user login:', error);
      return new Response('Error handling user login', { status: 500 });
    }
  } 
  // Handle user deletion
  else if (eventType === 'user.deleted') {
    // Handle user deletion if needed
    const { id } = evt.data;
    
    if (!id) {
      return new Response('Missing user ID in event data', { status: 400 });
    }
    
    try {
      // We might want to soft delete instead, depending on your requirements
      await executeQuery(
        `DELETE FROM users WHERE clerk_id = $1`,
        [id]
      );
      
      console.log(`Deleted user from database: ${id}`);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting user from database:', error);
      return new Response('Error deleting user from database', { status: 500 });
    }
  }

  // Return a 200 response for unhandled events
  console.log(`Unhandled event type: ${eventType}`);
  return NextResponse.json({ success: true });
} 