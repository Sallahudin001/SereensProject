# Role-Based Access Control (RBAC) Implementation Guide

## Overview

This document describes the comprehensive RBAC implementation for the Evergreen Energy CRM system. The implementation ensures that:

- **Admin users** have unrestricted access to all data
- **Regular users** can only access data they created or that was assigned to them

## Architecture

### 1. Database Schema

All tables that require user association have a `user_id` column that references the `clerk_id` in the `users` table:

```sql
-- Users table (source of truth for roles)
users:
  - clerk_id (VARCHAR, PRIMARY KEY)
  - role (VARCHAR) - 'admin' or 'user'
  - email, name, etc.

-- Tables with user associations
proposals:
  - user_id (VARCHAR) - references users(clerk_id)
  
customers:
  - user_id (VARCHAR) - references users(clerk_id)
```

### 2. Backend Implementation

#### Core RBAC Module (`lib/rbac.ts`)

The central RBAC module provides:

```typescript
// Get RBAC context for current user
getRBACContext(): Promise<RBACContext>

// Require authentication
requireAuth(): Promise<RBACContext>

// Require admin role
requireAdmin(): Promise<RBACContext>

// Apply RBAC filtering to SQL queries
applyRBACFilter(query, params, context): { query, params }
```

#### API Endpoints

All API endpoints follow this pattern:

```typescript
// 1. Get RBAC context
const context = await getRBACContext();
if (!context) {
  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}

// 2. Build query
const query = `SELECT * FROM table_name`;

// 3. Apply RBAC filter
const { query: filtered, params } = applyRBACFilter(query, [], context);

// 4. Execute filtered query
const results = await executeQuery(filtered, params);
```

### 3. Frontend Implementation

#### RBAC Hook (`hooks/use-rbac.tsx`)

Provides client-side RBAC functionality:

```typescript
const rbac = useRBAC();

// Check permissions
if (rbac.canView('proposals')) { /* ... */ }
if (rbac.canEdit('customers')) { /* ... */ }
if (rbac.isAdmin) { /* ... */ }
```

#### RBAC Component Wrapper

```tsx
<RBAC resource="proposals" action="edit">
  <Button>Edit Proposal</Button>
</RBAC>

<RBAC requireAdmin>
  <AdminDashboard />
</RBAC>
```

### 4. Middleware Protection

The `middleware.ts` file protects admin routes:

```typescript
// Protects /admin/* and /api/admin/*
// Returns 403 for non-admin users
```

## Updated API Endpoints

### Dashboard Metrics (`/api/dashboard`)
- **Admin**: Shows all proposals, customers, and metrics
- **User**: Shows only their own data

### Proposals (`/api/proposals`)
- **Admin**: Returns all proposals
- **User**: Returns only proposals where `user_id = clerk_id`

### Customers (`/api/customers`)
- **Admin**: Returns all customers
- **User**: Returns only customers linked to their proposals

### Reports (`/api/reports`)
- **Admin**: Shows all data in charts and metrics
- **User**: Shows only their own data in charts and metrics

## Database Migration

Run the following migration to ensure proper user associations:

```bash
psql -U your_user -d your_database -f migrations/ensure_user_associations.sql
```

This migration:
1. Adds `user_id` columns to `customers` and `proposals` tables
2. Creates foreign key constraints
3. Adds indexes for performance
4. Creates a `user_metrics` view for easy dashboard queries

## Best Practices

### 1. Always Use RBAC Context

```typescript
// ❌ Don't do this
const { userId } = await auth();
const query = userId ? `WHERE user_id = $1` : '';

// ✅ Do this
const context = await getRBACContext();
const { query, params } = applyRBACFilter(baseQuery, [], context);
```

### 2. Consistent Error Handling

```typescript
if (!context) {
  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}

if (requiresAdmin && !context.isAdmin) {
  return NextResponse.json({ error: "Admin access required" }, { status: 403 });
}
```

### 3. Frontend Permission Checks

```tsx
// Always check permissions before showing UI elements
{rbac.canCreate('proposals') && (
  <Button onClick={createProposal}>New Proposal</Button>
)}

// Use RBAC wrapper for cleaner code
<RBAC resource="proposals" action="create">
  <Button onClick={createProposal}>New Proposal</Button>
</RBAC>
```

### 4. Audit Trail

All actions are logged with the user's `clerk_id` for audit purposes.

## Testing RBAC

### 1. Create Test Users

```sql
-- Create admin user
UPDATE users SET role = 'admin' WHERE clerk_id = 'your_admin_clerk_id';

-- Create regular user
UPDATE users SET role = 'user' WHERE clerk_id = 'your_user_clerk_id';
```

### 2. Test Scenarios

1. **Admin Access**:
   - Can view all proposals
   - Can see all customers
   - Dashboard shows total system metrics

2. **User Access**:
   - Can only view their own proposals
   - Can only see customers they've created proposals for
   - Dashboard shows only their metrics

## Troubleshooting

### Issue: User sees no data
- Check if `user_id` is properly set on their records
- Verify the user's `clerk_id` is in the `users` table
- Ensure the user's role is set correctly

### Issue: Admin can't access admin routes
- Verify the user's role is set to 'admin' in the database
- Check Clerk metadata is synced
- Clear browser cache and re-authenticate

## Security Considerations

1. **Never trust client-side checks alone** - Always verify permissions on the backend
2. **Use parameterized queries** - The RBAC system uses parameterized queries to prevent SQL injection
3. **Audit all actions** - Log who did what and when
4. **Principle of least privilege** - Users start with minimal permissions

## Future Enhancements

1. **Role Management UI** - Admin interface to manage user roles
2. **Fine-grained permissions** - Beyond admin/user roles
3. **Team-based access** - Share data within teams
4. **Temporary permissions** - Grant time-limited access 