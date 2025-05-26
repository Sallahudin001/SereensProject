-- Create proposal_feedback table
CREATE TABLE IF NOT EXISTS proposal_feedback (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER NOT NULL,
  reason VARCHAR(255) NOT NULL,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id)
); 