-- Add enhanced indexes for better calendar performance

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_user_start_time ON appointments(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_date ON appointments(customer_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(appointment_type);

-- Reminders indexes
CREATE INDEX IF NOT EXISTS idx_reminders_user_due_date ON reminders(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status_due_date ON reminders(status, due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_customer_due_date ON reminders(customer_id, due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_type ON reminders(reminder_type);
CREATE INDEX IF NOT EXISTS idx_reminders_proposal ON reminders(proposal_id);

-- Pipeline notes indexes
CREATE INDEX IF NOT EXISTS idx_pipeline_notes_customer ON pipeline_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_notes_user ON pipeline_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_notes_follow_up_date ON pipeline_notes(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_pipeline_notes_type ON pipeline_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_pipeline_notes_created_at ON pipeline_notes(created_at);

-- Follow ups indexes
CREATE INDEX IF NOT EXISTS idx_follow_ups_user_date ON follow_ups(user_id, follow_up_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_customer_date ON follow_ups(customer_id, follow_up_date); 