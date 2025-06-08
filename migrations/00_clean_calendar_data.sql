-- Clean existing calendar data to start fresh

-- Remove all existing appointments and reminders to avoid foreign key issues
TRUNCATE TABLE appointments CASCADE;
TRUNCATE TABLE reminders CASCADE;
TRUNCATE TABLE follow_ups CASCADE;

-- Drop existing foreign key constraints that might cause issues
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_user_id_fkey;
ALTER TABLE reminders DROP CONSTRAINT IF EXISTS reminders_user_id_fkey;
ALTER TABLE follow_ups DROP CONSTRAINT IF EXISTS follow_ups_user_id_fkey; 