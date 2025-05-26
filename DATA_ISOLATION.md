# Data Isolation Implementation Guide

This guide explains how to implement data isolation in the application, ensuring that:
- Regular users can only see the data they have created
- Admin users can see all data in the system

## Overview

The implementation uses the Clerk user ID (clerk_id) to associate records with users. Each table that requires user-specific access has a `user_id` column that stores the Clerk ID of the creating user.

## Implementation Steps

### 1. Database Schema Updates

1. **Run the migration scripts** to add `user_id` columns to the appropriate tables:

```bash
node scripts/apply-migrations.js
```

This will:
- Add `user_id` column to the `proposals` table
- Add `user_id` column to the `customers` table

2. **Assign existing records** to an admin user:

```bash
node scripts/assign-users.js
```

This assigns all existing records (without a user_id) to the first admin user in the system.

### 2. Data Fetching with Role-Based Access

The application now enforces role-based access control by:

- Using the `applyUserFilter()` function to filter database queries based on user role
- Admin users can see all data (no filtering)
- Regular users can only see their own data (filtered by user_id)

### 3. Creating New Records

When creating new records, the system now:
- Automatically assigns the current user's Clerk ID to the `user_id` column
- For proposals, customers, and other user-specific data

## Key Files Modified

1. **API Routes**:
   - `/app/api/proposals/route.ts`
   - `/app/api/customers/route.ts`
   - `/app/api/dashboard/route.ts`

2. **Create Actions**:
   - `/app/actions/proposal-actions.ts`

3. **Authentication Utilities**:
   - `/lib/auth-utils.ts`

4. **Migration Scripts**:
   - `/migrations/add_user_id_to_proposals.sql`
   - `/migrations/add_user_id_to_customers.sql`
   - `/scripts/apply-migrations.js`
   - `/scripts/assign-users.js`

## Testing the Implementation

1. **Admin User Flow**:
   - Log in as an admin user
   - Verify that you can see all proposals, customers, and dashboard data

2. **Regular User Flow**:
   - Log in as a regular user
   - Verify that no data appears initially
   - Create a new proposal and customer
   - Verify that only the newly created data appears in lists and dashboard

## Troubleshooting

If users still see all data:

1. Check that the migrations ran successfully
2. Verify that the `user_id` columns in tables contain the correct Clerk IDs
3. Check that the API routes are properly using the `applyUserFilter()` function
4. Ensure the proposal creation process sets the `user_id` correctly 