-- Create pipeline_notes table for customer-specific notes (client's main requirement)

CREATE TABLE IF NOT EXISTS pipeline_notes (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    note_text TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'general',
    follow_up_date TIMESTAMP WITH TIME ZONE,
    is_private BOOLEAN DEFAULT false,
    reminder_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pipeline_notes_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    CONSTRAINT fk_pipeline_notes_user FOREIGN KEY (user_id) REFERENCES users(clerk_id) ON DELETE CASCADE,
    CONSTRAINT fk_pipeline_notes_reminder FOREIGN KEY (reminder_id) REFERENCES reminders(id) ON DELETE SET NULL
); 