-- Add user_id column to customers table if it doesn't already exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);

-- Add foreign key constraint
ALTER TABLE customers
ADD CONSTRAINT fk_customers_user
FOREIGN KEY (user_id) REFERENCES users(clerk_id)
ON DELETE SET NULL; 