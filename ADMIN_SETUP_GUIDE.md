# Admin Account Setup Guide

This guide will walk you through setting up admin access for your Evergreen Energy application.

## Prerequisites

1. You need to have a Clerk account set up.
2. Make sure you have the required environment variables in your `.env` file:
   ```
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

## Step 1: Register a Standard User Account

First, you need to register a standard user account that will be promoted to admin:

1. Go to your application's sign-up page
2. Register a new user account with your email and password
3. Verify your email if required

## Step 2: Get Your User ID

After registering, you need to find your Clerk User ID:

1. Go to your [Clerk Dashboard](https://dashboard.clerk.dev)
2. Select your application
3. Navigate to the "Users" section in the left sidebar
4. Find your user in the list and click on it
5. Copy your User ID from the user details page (it will look like `user_xxxxxxxxxxxxxxxxx`)

## Step 3: Set Up Your First Admin User

Run the admin setup script with your User ID:

```bash
# Install node-fetch if not already installed
npm install node-fetch

# Run the admin setup script
npm run admin:setup your_user_id
```

For example:
```bash
npm run admin:setup user_2Q3xLTgmJkrp9ynkE4r5n6NzQWP
```

If successful, you'll see a confirmation message:
```
Setting user user_2Q3xLTgmJkrp9ynkE4r5n6NzQWP as admin...
Success! User user_2Q3xLTgmJkrp9ynkE4r5n6NzQWP is now an admin.
They can now access the admin panel and set other users as admins.
```

## Step 4: Access the Admin Panel

After setting yourself as an admin:

1. Log in to your application with your admin credentials
2. Access the admin panel directly at `/admin`
3. You should now have full access to the admin features

## Step 5: Setting Additional Admin Users (Optional)

Once you have admin access, you can set additional users as admins:

1. Have the user register a normal account first
2. Get their User ID from the Clerk Dashboard
3. Make an API request to set them as admin:

```
POST /api/admin/set-admin-role
{
  "targetUserId": "user_id_to_promote"
}
```

## Troubleshooting

If you encounter any issues:

1. **Middleware Error**: Make sure your middleware.ts file is properly configured to handle admin routes
2. **Role Not Updating**: Check that you're using the correct User ID and that your CLERK_SECRET_KEY is valid
3. **Access Denied**: Ensure you've completed the steps above and that the user metadata has been updated with the admin role

## Security Notes

- The admin role is stored in the user's public metadata in Clerk
- Admin routes are protected at multiple levels:
  - Server-side via middleware
  - Client-side via the AdminGuard component
- Admin API endpoints verify the user has admin privileges before executing 