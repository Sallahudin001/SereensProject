-- Update calendar tables to use clerk_id instead of integer user_id

-- First, clear any invalid user_id references in appointments
UPDATE appointments SET user_id = NULL WHERE user_id NOT IN (SELECT id::text FROM admin_users);

-- Update appointments table
ALTER TABLE appointments 
DROP CONSTRAINT IF EXISTS appointments_user_id_fkey;

ALTER TABLE appointments 
ALTER COLUMN user_id TYPE VARCHAR(255);

-- Add appointment type and meeting notes BEFORE adding the foreign key
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(50) DEFAULT 'consultation';

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS meeting_notes TEXT;

-- Now add the foreign key constraint (after clearing invalid data)
ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_user 
FOREIGN KEY (user_id) REFERENCES users(clerk_id) ON DELETE SET NULL; 