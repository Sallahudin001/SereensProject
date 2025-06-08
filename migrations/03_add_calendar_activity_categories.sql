-- Add calendar-related categories to the activity_log table
-- This migration fixes the "violates check constraint valid_action_category" error

-- First, drop the existing constraint
ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS valid_action_category;

-- Re-create the constraint with additional calendar categories
ALTER TABLE activity_log ADD CONSTRAINT valid_action_category CHECK (
    action_category IN (
        'proposal', 'approval', 'user', 'system', 'pricing', 'financing', 
        'authentication', 'security', 
        -- New calendar categories
        'appointment', 'reminder', 'note', 'calendar'
    )
);

-- Log the update
INSERT INTO activity_log (
    action, 
    action_category,
    description,
    actor_type,
    actor_id,
    metadata
) VALUES (
    'update_schema',
    'system',
    'Updated activity_log constraint to include calendar categories',
    'system',
    'system',
    '{}'
); 