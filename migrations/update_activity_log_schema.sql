-- Update activity_log table to allow null proposal_id for non-proposal activities
ALTER TABLE activity_log ALTER COLUMN proposal_id DROP NOT NULL;

-- Recreate the foreign key with the correct constraint
ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_proposal_id_fkey;
ALTER TABLE activity_log ADD CONSTRAINT activity_log_proposal_id_fkey 
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE;

-- Add an index for created_at to optimize queries by date
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- Update comment
COMMENT ON TABLE activity_log IS 'Stores all system activity including user actions, proposal events, and configuration changes'; 