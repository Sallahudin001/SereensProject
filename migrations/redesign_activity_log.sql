-- =====================================================================
-- SMART ACTIVITY LOGGING SYSTEM MIGRATION
-- This migration replaces the existing activity_log table with a new
-- comprehensive, relational logging system
-- =====================================================================

-- Step 1: Backup existing activity_log data (optional - comment out if not needed)
CREATE TABLE IF NOT EXISTS activity_log_backup AS 
SELECT * FROM activity_log;

-- Step 2: Drop the existing activity_log table and all related constraints
DROP TABLE IF EXISTS activity_log CASCADE;

-- Step 3: Create the new comprehensive activity_log table
CREATE TABLE activity_log (
    id BIGSERIAL PRIMARY KEY,
    
    -- Core action information
    action VARCHAR(100) NOT NULL,
    action_category VARCHAR(50) NOT NULL, -- proposal, approval, user, system, pricing, financing
    description TEXT,
    
    -- Actor information (who performed the action)
    actor_type VARCHAR(20) NOT NULL DEFAULT 'user', -- user, system, admin
    actor_id VARCHAR(100) NOT NULL, -- clerk_id or 'system'
    actor_name VARCHAR(255),
    
    -- Target information (what was acted upon)
    target_type VARCHAR(50), -- proposal, user, approval_request, pricing_item, financing_plan
    target_id INTEGER,
    target_identifier VARCHAR(255), -- Human-readable identifier (proposal_number, user_email, etc.)
    
    -- Entity relationships with proper foreign keys
    proposal_id INTEGER REFERENCES proposals(id) ON DELETE SET NULL,
    approval_request_id INTEGER REFERENCES approval_requests(id) ON DELETE SET NULL,
    admin_user_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
    
    -- Structured data storage
    metadata JSONB NOT NULL DEFAULT '{}',
    before_state JSONB, -- State before the action
    after_state JSONB,  -- State after the action
    
    -- Audit trail information
    status VARCHAR(20) DEFAULT 'success', -- success, failed, pending, cancelled
    error_message TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_action_category CHECK (action_category IN (
        'proposal', 'approval', 'user', 'system', 'pricing', 'financing', 'authentication', 'security'
    )),
    CONSTRAINT valid_actor_type CHECK (actor_type IN ('user', 'admin', 'system', 'customer')),
    CONSTRAINT valid_status CHECK (status IN ('success', 'failed', 'pending', 'cancelled', 'warning')),
    CONSTRAINT valid_target_type CHECK (target_type IN (
        'proposal', 'user', 'admin_user', 'approval_request', 'pricing_item', 
        'financing_plan', 'customer', 'contract', 'system_setting', 'permission'
    ))
);

-- Step 4: Create comprehensive indexes for optimal query performance
CREATE INDEX idx_activity_log_action ON activity_log(action);
CREATE INDEX idx_activity_log_action_category ON activity_log(action_category);
CREATE INDEX idx_activity_log_actor_id ON activity_log(actor_id);
CREATE INDEX idx_activity_log_target_type_id ON activity_log(target_type, target_id);
CREATE INDEX idx_activity_log_proposal_id ON activity_log(proposal_id);
CREATE INDEX idx_activity_log_approval_request_id ON activity_log(approval_request_id);
CREATE INDEX idx_activity_log_admin_user_id ON activity_log(admin_user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);
CREATE INDEX idx_activity_log_status ON activity_log(status);
CREATE INDEX idx_activity_log_actor_name ON activity_log(actor_name);

-- GIN index for JSONB columns for fast JSON queries
CREATE INDEX idx_activity_log_metadata ON activity_log USING GIN(metadata);
CREATE INDEX idx_activity_log_before_state ON activity_log USING GIN(before_state);
CREATE INDEX idx_activity_log_after_state ON activity_log USING GIN(after_state);

-- Step 5: Create a view for easy activity reporting
CREATE OR REPLACE VIEW activity_log_with_details AS
SELECT 
    al.*,
    p.proposal_number,
    p.status as proposal_status,
    c.name as customer_name,
    ar.request_type as approval_type,
    ar.status as approval_status,
    au.first_name || ' ' || au.last_name as admin_user_name,
    au.role as admin_user_role,
    u.name as user_name,
    u.email as user_email
FROM activity_log al
LEFT JOIN proposals p ON al.proposal_id = p.id
LEFT JOIN customers c ON p.customer_id = c.id
LEFT JOIN approval_requests ar ON al.approval_request_id = ar.id
LEFT JOIN admin_users au ON al.admin_user_id = au.id
LEFT JOIN users u ON al.actor_id = u.clerk_id;

-- Step 6: Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_activity_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER tr_activity_log_update_timestamp
    BEFORE UPDATE ON activity_log
    FOR EACH ROW
    EXECUTE FUNCTION update_activity_log_timestamp();

-- Step 7: Create function for standardized activity logging
CREATE OR REPLACE FUNCTION log_activity(
    p_action VARCHAR(100),
    p_action_category VARCHAR(50),
    p_actor_id VARCHAR(100),
    p_actor_name VARCHAR(255) DEFAULT NULL,
    p_target_type VARCHAR(50) DEFAULT NULL,
    p_target_id INTEGER DEFAULT NULL,
    p_target_identifier VARCHAR(255) DEFAULT NULL,
    p_proposal_id INTEGER DEFAULT NULL,
    p_approval_request_id INTEGER DEFAULT NULL,
    p_admin_user_id INTEGER DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_before_state JSONB DEFAULT NULL,
    p_after_state JSONB DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_status VARCHAR(20) DEFAULT 'success',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
    activity_id BIGINT;
    actor_type_val VARCHAR(20) := 'user';
BEGIN
    -- Determine actor type
    IF p_actor_id = 'system' THEN
        actor_type_val := 'system';
    ELSIF p_admin_user_id IS NOT NULL THEN
        actor_type_val := 'admin';
    END IF;
    
    -- Insert activity log record
    INSERT INTO activity_log (
        action, action_category, description,
        actor_type, actor_id, actor_name,
        target_type, target_id, target_identifier,
        proposal_id, approval_request_id, admin_user_id,
        metadata, before_state, after_state,
        status, ip_address, user_agent
    ) VALUES (
        p_action, p_action_category, p_description,
        actor_type_val, p_actor_id, p_actor_name,
        p_target_type, p_target_id, p_target_identifier,
        p_proposal_id, p_approval_request_id, p_admin_user_id,
        p_metadata, p_before_state, p_after_state,
        p_status, p_ip_address, p_user_agent
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Add helpful comments
COMMENT ON TABLE activity_log IS 'Comprehensive activity logging system that tracks all user and system actions with proper relational integrity';
COMMENT ON COLUMN activity_log.action IS 'Specific action performed (e.g., create_proposal, approve_discount, update_permissions)';
COMMENT ON COLUMN activity_log.action_category IS 'High-level category of the action for easier filtering and reporting';
COMMENT ON COLUMN activity_log.actor_id IS 'ID of the user or system that performed the action (clerk_id for users, "system" for automated actions)';
COMMENT ON COLUMN activity_log.target_type IS 'Type of entity that was acted upon';
COMMENT ON COLUMN activity_log.target_id IS 'Specific ID of the target entity in its respective table';
COMMENT ON COLUMN activity_log.target_identifier IS 'Human-readable identifier for the target (e.g., proposal_number, email)';
COMMENT ON COLUMN activity_log.metadata IS 'Additional structured data relevant to the specific action';
COMMENT ON COLUMN activity_log.before_state IS 'JSON snapshot of relevant data before the action';
COMMENT ON COLUMN activity_log.after_state IS 'JSON snapshot of relevant data after the action';
COMMENT ON VIEW activity_log_with_details IS 'Enriched view of activity log with related entity details for easier reporting';
COMMENT ON FUNCTION log_activity IS 'Standardized function for logging activities with proper data validation and defaults';

-- Step 9: Grant appropriate permissions
GRANT SELECT ON activity_log TO PUBLIC;
GRANT INSERT ON activity_log TO PUBLIC;
GRANT USAGE ON SEQUENCE activity_log_id_seq TO PUBLIC;
GRANT SELECT ON activity_log_with_details TO PUBLIC;

-- Notify completion
DO $$
BEGIN
    RAISE NOTICE '✅ Activity Log System Migration Completed Successfully!';
    RAISE NOTICE '   - Old activity_log table backed up as activity_log_backup';
    RAISE NOTICE '   - New comprehensive activity_log table created';
    RAISE NOTICE '   - Proper foreign key constraints established';
    RAISE NOTICE '   - Optimized indexes created for performance';
    RAISE NOTICE '   - Helper function log_activity() available for use';
    RAISE NOTICE '   - View activity_log_with_details created for reporting';
END $$; 