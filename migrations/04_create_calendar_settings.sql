-- Create calendar_settings table for user preferences

CREATE TABLE IF NOT EXISTS calendar_settings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    default_appointment_duration INTEGER DEFAULT 60,
    reminder_advance_minutes INTEGER DEFAULT 15,
    work_start_time TIME DEFAULT '09:00:00',
    work_end_time TIME DEFAULT '17:00:00',
    work_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
    auto_create_reminders BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_calendar_settings_user FOREIGN KEY (user_id) REFERENCES users(clerk_id) ON DELETE CASCADE
); 