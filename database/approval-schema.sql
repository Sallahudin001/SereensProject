-- Approval Requests Table
CREATE TABLE IF NOT EXISTS approval_requests (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER NOT NULL,
  requestor_id INTEGER NOT NULL,
  approver_id INTEGER,
  request_type VARCHAR(50) NOT NULL,
  original_value DECIMAL(12,2) NOT NULL,
  requested_value DECIMAL(12,2) NOT NULL,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
  FOREIGN KEY (requestor_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Add discount approval permissions to admin_users if not already exists
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS max_discount_percent DECIMAL(5,2) DEFAULT 10.0;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS can_approve_discounts BOOLEAN DEFAULT FALSE;

-- Activity Log Table (if not already exists)
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_approval_requests_proposal_id ON approval_requests(proposal_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requestor_id ON approval_requests(requestor_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_approver_id ON approval_requests(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_created_at ON approval_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_proposal_id ON activity_log(proposal_id); 