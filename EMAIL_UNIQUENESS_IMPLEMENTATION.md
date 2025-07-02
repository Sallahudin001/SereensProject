# Email Uniqueness Implementation

## Overview

This implementation adds a unique constraint to the `email` column in the `users` table to prevent multiple user accounts from being created with the same email address. This ensures data integrity and prevents potential issues with user identification and authentication.

## Changes Made

1. **Database Schema Changes**:
   - Added a UNIQUE constraint to the `email` column in the `users` table
   - Added an index for faster email lookups

2. **Migration Scripts**:
   - Created `migrations/add_email_unique_constraint.sql` for the automated migration
   - Created `database/email_unique_constraint.sql` for manual execution
   - Created `scripts/apply-email-unique-constraint.js` to apply the migration programmatically

3. **User Actions Updates**:
   - Modified `ensureUserInDatabase()` to check for existing emails before creating new users
   - Updated the logic to handle email conflicts by updating existing records

4. **Webhook Handler Updates**:
   - Updated Clerk webhook handlers to check for existing emails
   - Modified insert/update logic to handle email uniqueness constraints

## How It Works

1. **Duplicate Prevention**:
   - When a user signs up or logs in, the system checks if their email already exists in the database
   - If the email exists but with a different `clerk_id`, the system updates the existing record instead of creating a new one
   - This ensures each email is associated with only one user account

2. **Migration Safety**:
   - The migration script first checks for and resolves any duplicate emails before adding the constraint
   - For duplicates, it keeps the most recently updated record and removes others

3. **Conflict Resolution**:
   - All INSERT statements now include `ON CONFLICT (email)` clauses to handle potential conflicts
   - When conflicts occur, the system updates the existing record with the new information

## How to Apply Changes

### Option 1: Automated Migration (if database connection works)

Run the migration script:
```
node scripts/apply-email-unique-constraint.js
```

### Option 2: Manual SQL Execution (recommended)

If you're experiencing database connection issues with the automated script, you can apply the changes manually:

1. Connect to your database using your preferred SQL client (e.g., pgAdmin, DBeaver, or psql)
2. Open the SQL file: `database/email_unique_constraint.sql`
3. Execute the entire script
4. The script will:
   - Check for and resolve any duplicate emails
   - Add the unique constraint to the email column
   - Create an index for faster lookups
   - Log the migration in the migrations table

The SQL script is designed to be safe to run and will:
- Identify duplicate emails before applying the constraint
- Keep the most recently updated record for each duplicate email
- Remove the older duplicates
- Apply the constraint only after resolving conflicts

## Benefits

1. **Data Integrity**: Ensures each email is associated with only one user account
2. **User Experience**: Prevents confusion when users try to log in with an email that's associated with multiple accounts
3. **Security**: Reduces the risk of account confusion or takeover attempts
4. **Simplicity**: Makes user identification more straightforward throughout the application 