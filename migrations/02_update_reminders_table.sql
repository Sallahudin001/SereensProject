-- Update reminders table to use clerk_id and add additional fields

-- Update user_id to varchar for clerk_id
ALTER TABLE reminders 
DROP CONSTRAINT IF EXISTS reminders_user_id_fkey;

ALTER TABLE reminders 
ALTER COLUMN user_id TYPE VARCHAR(255);

ALTER TABLE reminders 
ADD CONSTRAINT fk_reminders_user 
FOREIGN KEY (user_id) REFERENCES users(clerk_id) ON DELETE SET NULL;

-- Add proposal_id reference for proposal-specific reminders
ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS proposal_id INTEGER;

ALTER TABLE reminders 
ADD CONSTRAINT fk_reminders_proposal 
FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL;

-- Add reminder type and completed_at fields
ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS reminder_type VARCHAR(50) DEFAULT 'follow_up';

ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE; 