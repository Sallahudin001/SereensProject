# Admin Access Setup

This document provides instructions for setting up and managing admin access in the application.

## Initial Admin Setup

1. First, make sure you have a Clerk account set up and configured with the application.

2. Register a user account that will become the first admin.

3. Find the user ID in Clerk Dashboard. You can find this under the "Users" section in your Clerk dashboard.

4. Set up the required environment variables:
   ```
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

5. Run the admin setup script with the user ID:
   ```
   npm run admin:setup YOUR_USER_ID
   ```

6. After running this script, the specified user will have admin privileges.

## Accessing the Admin Panel

The admin panel is accessible at `/admin` and requires admin authentication.

- Regular users trying to access the admin panel will be redirected to the admin login page.
- Only users with the admin role can successfully log in to the admin panel.
- The middleware checks for admin permissions on all routes starting with `/admin`.

## Setting Additional Admin Users

Once you have at least one admin user, you can set additional users as admins through the API:

```
POST /api/admin/set-admin-role
{
  "targetUserId": "user_id_to_promote"
}
```

This API request must be made by an existing admin user.

## Admin Roles and Permissions

Admins have the following permissions:
- Full access to the admin panel
- Ability to manage users and set their roles
- Access to all admin-only features

## Security Considerations

- Admin access is secured at the middleware level.
- The admin role is stored in Clerk's user metadata.
- All admin routes are protected both on the server and client side.
- Admin-specific API endpoints verify admin status before executing. 