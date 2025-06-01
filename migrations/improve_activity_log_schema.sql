-- Migration to improve activity_log schema with better entity references
-- This adds additional reference columns and improves type safety

-- First, check if the table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activity_log') THEN
    -- Create the table with improved schema if it doesn't exist
    CREATE TABLE activity_log (
      id SERIAL PRIMARY KEY,
      action VARCHAR(100) NOT NULL,
      user_id VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      proposal_id INTEGER,
      user_reference_id VARCHAR(100),
      entity_id INTEGER,
      details JSONB NOT NULL DEFAULT '{}'::jsonb,
      status VARCHAR(20) DEFAULT 'success',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL
    );
    
    -- Create indexes
    CREATE INDEX idx_activity_log_action ON activity_log(action);
    CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
    CREATE INDEX idx_activity_log_entity_type ON activity_log(entity_type);
    CREATE INDEX idx_activity_log_proposal_id ON activity_log(proposal_id);
    CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);
    CREATE INDEX idx_activity_log_entity_id ON activity_log(entity_id);
    CREATE INDEX idx_activity_log_user_reference_id ON activity_log(user_reference_id);
    
    RAISE NOTICE 'Created new activity_log table with improved schema';
  ELSE
    -- Table exists, so alter it to add the new columns if they don't exist
    
    -- Add entity_type column
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_name = 'activity_log' AND column_name = 'entity_type') THEN
      ALTER TABLE activity_log ADD COLUMN entity_type VARCHAR(50) DEFAULT 'none' NOT NULL;
      RAISE NOTICE 'Added entity_type column to activity_log';
    END IF;
    
    -- Add user_reference_id column
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_name = 'activity_log' AND column_name = 'user_reference_id') THEN
      ALTER TABLE activity_log ADD COLUMN user_reference_id VARCHAR(100);
      RAISE NOTICE 'Added user_reference_id column to activity_log';
    END IF;
    
    -- Add entity_id column
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_name = 'activity_log' AND column_name = 'entity_id') THEN
      ALTER TABLE activity_log ADD COLUMN entity_id INTEGER;
      RAISE NOTICE 'Added entity_id column to activity_log';
    END IF;
    
    -- Add status column
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_name = 'activity_log' AND column_name = 'status') THEN
      ALTER TABLE activity_log ADD COLUMN status VARCHAR(20) DEFAULT 'success';
      RAISE NOTICE 'Added status column to activity_log';
    END IF;
    
    -- Create any missing indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_activity_log_entity_type') THEN
      CREATE INDEX idx_activity_log_entity_type ON activity_log(entity_type);
      RAISE NOTICE 'Created entity_type index';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_activity_log_entity_id') THEN
      CREATE INDEX idx_activity_log_entity_id ON activity_log(entity_id);
      RAISE NOTICE 'Created entity_id index';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_activity_log_user_reference_id') THEN
      CREATE INDEX idx_activity_log_user_reference_id ON activity_log(user_reference_id);
      RAISE NOTICE 'Created user_reference_id index';
    END IF;
  END IF;
END $$;

-- Add check constraint to ensure entity_type is one of the allowed values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'activity_log_entity_type_check'
  ) THEN
    ALTER TABLE activity_log ADD CONSTRAINT activity_log_entity_type_check
      CHECK (entity_type IN ('proposal', 'user', 'pricing', 'financing', 'approval', 'system', 'none'));
    RAISE NOTICE 'Added check constraint for entity_type';
  END IF;
END $$;

-- Add comment to explain the schema
COMMENT ON TABLE activity_log IS 'Stores all system activity with improved entity references';
COMMENT ON COLUMN activity_log.entity_type IS 'Type of entity this activity relates to (proposal, user, pricing, etc.)';
COMMENT ON COLUMN activity_log.entity_id IS 'Generic ID reference to the entity in its respective table';
COMMENT ON COLUMN activity_log.user_reference_id IS 'Reference to a user when the activity is about a user other than the actor';
COMMENT ON COLUMN activity_log.status IS 'Status of the activity (success, failed, pending)';

-- Update existing records to set the entity_type based on the action
-- Only run this if we have records without entity_type set
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM activity_log WHERE entity_type = 'none' OR entity_type IS NULL LIMIT 1
  ) THEN
    -- Set entity_type based on action prefix or pattern
    UPDATE activity_log SET entity_type = 'proposal' 
    WHERE action LIKE 'create_proposal' OR action LIKE 'update_status_%';
    
    UPDATE activity_log SET entity_type = 'user' 
    WHERE action = 'update_permissions';
    
    UPDATE activity_log SET entity_type = 'pricing' 
    WHERE action = 'update_pricing_table';
    
    UPDATE activity_log SET entity_type = 'financing' 
    WHERE action = 'update_financing_table';
    
    UPDATE activity_log SET entity_type = 'approval' 
    WHERE action IN ('request_discount', 'approved_discount', 'rejected_discount');
    
    -- Also try to extract and populate entity_id from details
    UPDATE activity_log SET entity_id = (details->>'planId')::integer 
    WHERE entity_type = 'financing' AND entity_id IS NULL AND details->>'planId' IS NOT NULL;
    
    UPDATE activity_log SET entity_id = (details->>'itemId')::integer 
    WHERE entity_type = 'pricing' AND entity_id IS NULL AND details->>'itemId' IS NOT NULL;
    
    -- Set user_reference_id for user-related activities
    UPDATE activity_log SET user_reference_id = details->>'targetUserId' 
    WHERE entity_type = 'user' AND user_reference_id IS NULL AND details->>'targetUserId' IS NOT NULL;
    
    RAISE NOTICE 'Updated existing activity log records with entity types and references';
  END IF;
END $$;

SELECT
  "id",
  "action",
  "action_category",
  "description",
  "actor_type",
  "clerk_id",
  "actor_name",
  "target_type",
  "target_id",
  "target_identifier",
  "proposal_id",
  "approval_request_id",
  "admin_user_id",
  "metadata",
  "before_state",
  "after_state",
  "status",
  "created_at"
FROM
  "activity_log"
ORDER BY
  "activity_log"."id"
LIMIT
  50 