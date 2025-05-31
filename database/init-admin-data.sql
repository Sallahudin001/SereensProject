-- Initialize Admin System Data
-- This script sets up default roles and permissions for the admin dashboard

-- Insert default permissions
INSERT INTO permissions (name, description, created_at, updated_at) VALUES
  ('view_all', 'View all data in the system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('edit_all', 'Edit all data in the system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('manage_users', 'Add, edit, and delete users', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('users:read', 'View users', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('users:write', 'Manage users', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('manage_pricing', 'Update pricing information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pricing:read', 'View pricing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pricing:write', 'Update pricing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('products:read', 'View products', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('products:write', 'Create/edit products', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('manage_contracts', 'Create and edit contract templates', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('view_customers', 'View customer information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('edit_customers', 'Edit customer information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('create_proposals', 'Create new proposals', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('view_reports', 'View reports and analytics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('approve_discounts', 'Approve discount requests', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('settings:read', 'View system settings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('settings:write', 'Edit system settings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Insert default roles
INSERT INTO roles (name, description, created_at, updated_at) VALUES
  ('Administrator', 'Full system access with all permissions', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Sales Manager', 'Manages sales team and proposals', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Sales Representative', 'Creates and manages proposals', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Support', 'Customer support and basic system access', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to Administrator role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Administrator'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to Sales Manager role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
JOIN permissions p ON p.name IN (
  'view_all',
  'users:read',
  'pricing:read',
  'pricing:write',
  'products:read',
  'view_customers',
  'edit_customers',
  'create_proposals',
  'view_reports',
  'approve_discounts'
)
WHERE r.name = 'Sales Manager'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to Sales Representative role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
JOIN permissions p ON p.name IN (
  'pricing:read',
  'products:read',
  'view_customers',
  'edit_customers',
  'create_proposals'
)
WHERE r.name = 'Sales Representative'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to Support role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
JOIN permissions p ON p.name IN (
  'view_customers',
  'view_reports'
)
WHERE r.name = 'Support'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create a default admin user if none exists
-- Note: Replace 'your-clerk-id' with actual Clerk user ID
INSERT INTO admin_users (
  clerk_id, 
  role_id, 
  first_name, 
  last_name, 
  email, 
  is_active, 
  max_discount_percent,
  can_approve_discounts,
  created_at, 
  updated_at
)
SELECT 
  'admin-default',
  r.id,
  'System',
  'Administrator',
  'admin@company.com',
  true,
  100.0,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM roles r
WHERE r.name = 'Administrator'
AND NOT EXISTS (
  SELECT 1 FROM admin_users WHERE email = 'admin@company.com'
);

-- Update existing admin_users to have proper discount permissions if columns exist
UPDATE admin_users SET 
  max_discount_percent = CASE 
    WHEN role_id = (SELECT id FROM roles WHERE name = 'Administrator') THEN 100.0
    WHEN role_id = (SELECT id FROM roles WHERE name = 'Sales Manager') THEN 25.0
    WHEN role_id = (SELECT id FROM roles WHERE name = 'Sales Representative') THEN 10.0
    ELSE 0.0
  END,
  can_approve_discounts = CASE 
    WHEN role_id IN (
      SELECT id FROM roles WHERE name IN ('Administrator', 'Sales Manager')
    ) THEN true
    ELSE false
  END
WHERE max_discount_percent IS NULL OR can_approve_discounts IS NULL; 