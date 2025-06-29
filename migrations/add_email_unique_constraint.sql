-- Add unique constraint to email column in users table
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Log migration
INSERT INTO migrations (name, applied_at) 
VALUES ('add_email_unique_constraint', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING; 