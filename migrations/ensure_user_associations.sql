-- Ensure user associations are properly set up for RBAC

-- 1. Ensure customers table has user_id column
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_customers_user'
    ) THEN
        ALTER TABLE customers
        ADD CONSTRAINT fk_customers_user
        FOREIGN KEY (user_id) REFERENCES users(clerk_id)
        ON DELETE SET NULL;
    END IF;
END$$;

-- 2. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- 3. Ensure proposals table has user_id column with proper constraint
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_proposals_user'
    ) THEN
        ALTER TABLE proposals
        ADD CONSTRAINT fk_proposals_user
        FOREIGN KEY (user_id) REFERENCES users(clerk_id)
        ON DELETE SET NULL;
    END IF;
END$$;

-- 4. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON proposals(user_id);

-- 5. Update existing customers to associate with proposal creators (one-time migration)
-- This links orphaned customers to the users who created proposals for them
UPDATE customers c
SET user_id = p.user_id
FROM (
    SELECT DISTINCT ON (customer_id) 
        customer_id, 
        user_id
    FROM proposals
    WHERE user_id IS NOT NULL
    ORDER BY customer_id, created_at ASC
) p
WHERE c.id = p.customer_id
AND c.user_id IS NULL;

-- 6. Create a view for user-specific metrics (helpful for dashboards)
CREATE OR REPLACE VIEW user_metrics AS
SELECT 
    u.clerk_id as user_id,
    u.name as user_name,
    u.role as user_role,
    COUNT(DISTINCT p.id) as total_proposals,
    COUNT(DISTINCT p.customer_id) as total_customers,
    COUNT(DISTINCT CASE WHEN p.status IN ('signed', 'completed') THEN p.id END) as signed_proposals,
    COALESCE(SUM(CASE WHEN p.status IN ('signed', 'completed') THEN p.total END), 0) as total_revenue,
    CASE 
        WHEN COUNT(DISTINCT p.id) > 0 THEN 
            ROUND((COUNT(DISTINCT CASE WHEN p.status IN ('signed', 'completed') THEN p.id END) * 100.0 / COUNT(DISTINCT p.id))::numeric, 1)
        ELSE 0 
    END as conversion_rate
FROM users u
LEFT JOIN proposals p ON u.clerk_id = p.user_id
GROUP BY u.clerk_id, u.name, u.role;

-- 7. Add role check constraint to users table
ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'user')); 