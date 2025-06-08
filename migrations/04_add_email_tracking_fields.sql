-- Add email tracking fields to calendar tables
-- This migration adds fields to track when email notifications are sent

-- Add email tracking to reminders table
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS email_notification_enabled BOOLEAN DEFAULT true;

-- Add email tracking to appointments table  
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS customer_email_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS email_notification_enabled BOOLEAN DEFAULT true;

-- Add indexes for better performance on email queries
CREATE INDEX IF NOT EXISTS idx_reminders_email_sent_at ON reminders(email_sent_at);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date_status ON reminders(due_date, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_appointments_email_sent_at ON appointments(customer_email_sent_at);

-- Log the update
INSERT INTO activity_log (
    action, 
    action_category,
    description,
    actor_type,
    actor_id,
    metadata
) VALUES (
    'add_email_tracking',
    'system',
    'Added email tracking fields to calendar tables',
    'system',
    'migration',
    '{"tables": ["reminders", "appointments"], "fields": ["email_sent_at", "email_notification_enabled"]}'
);

COMMENT ON COLUMN reminders.email_sent_at IS 'Timestamp when email notification was last sent for this reminder';
COMMENT ON COLUMN reminders.email_notification_enabled IS 'Whether email notifications are enabled for this reminder';
COMMENT ON COLUMN appointments.customer_email_sent_at IS 'Timestamp when customer notification email was sent';
COMMENT ON COLUMN appointments.email_notification_enabled IS 'Whether email notifications are enabled for this appointment'; 