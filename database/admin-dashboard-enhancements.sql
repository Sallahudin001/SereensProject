-- Admin Dashboard Enhancement Database Schema
-- This script adds necessary fields and constraints for the enhanced admin dashboard

-- Add lead_source column to customers table for better tracking
ALTER TABLE customers ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50) DEFAULT 'unknown';

-- Add status column to customers table for pipeline management
ALTER TABLE customers ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'lead';

-- Add last_contact_date to customers for tracking interactions
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE;

-- Add notes column to customers for admin notes
ALTER TABLE customers ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add customer status constraint
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_status_check;
ALTER TABLE customers ADD CONSTRAINT customers_status_check 
CHECK (status IN (
  'lead',
  'qualified', 
  'proposal_sent',
  'negotiating',
  'signed',
  'completed',
  'lost',
  'inactive'
));

-- Add lead source constraint
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_lead_source_check;
ALTER TABLE customers ADD CONSTRAINT customers_lead_source_check 
CHECK (lead_source IN (
  'website',
  'referral',
  'cold_call',
  'advertisement',
  'social_media',
  'trade_show',
  'partner',
  'unknown',
  'other'
));

-- Add viewed_at column to proposals for tracking when proposals are viewed
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP WITH TIME ZONE;

-- Add sent_at column to proposals for tracking when proposals are sent
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;

-- Add signed_at column to proposals for tracking when proposals are signed
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better query performance on admin dashboard
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_lead_source ON customers(lead_source);
CREATE INDEX IF NOT EXISTS idx_customers_last_contact_date ON customers(last_contact_date);
CREATE INDEX IF NOT EXISTS idx_proposals_viewed_at ON proposals(viewed_at);
CREATE INDEX IF NOT EXISTS idx_proposals_sent_at ON proposals(sent_at);
CREATE INDEX IF NOT EXISTS idx_proposals_signed_at ON proposals(signed_at);

-- Create composite indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_customers_status_created ON customers(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_status_total ON proposals(status, total DESC);

-- Create admin dashboard metrics view for performance
CREATE OR REPLACE VIEW admin_dashboard_metrics AS
SELECT 
  -- Customer metrics
  COUNT(DISTINCT c.id) as total_customers,
  COUNT(DISTINCT CASE WHEN c.status NOT IN ('lost', 'inactive') THEN c.id END) as active_customers,
  COUNT(DISTINCT CASE WHEN c.created_at >= date_trunc('month', CURRENT_DATE) THEN c.id END) as new_customers_this_month,
  
  -- Proposal metrics  
  COUNT(DISTINCT p.id) as total_proposals,
  SUM(CASE WHEN p.status IN ('signed', 'completed') THEN p.total ELSE 0 END) as total_signed_value,
  AVG(CASE WHEN p.status IN ('signed', 'completed') THEN p.total END) as avg_signed_value,
  COUNT(DISTINCT CASE WHEN p.status IN ('signed', 'completed') THEN p.id END) as signed_proposals,
  
  -- Conversion metrics
  CASE 
    WHEN COUNT(DISTINCT p.id) > 0 THEN 
      ROUND((COUNT(DISTINCT CASE WHEN p.status IN ('signed', 'completed') THEN p.id END)::decimal / COUNT(DISTINCT p.id)) * 100, 2)
    ELSE 0 
  END as overall_conversion_rate
FROM 
  customers c
LEFT JOIN 
  proposals p ON c.id = p.customer_id;

-- Add customer lifecycle tracking
CREATE TABLE IF NOT EXISTS customer_interactions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL, -- email, call, meeting, proposal, etc.
  interaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  outcome VARCHAR(50), -- positive, negative, neutral, follow_up_needed
  next_action VARCHAR(255),
  next_action_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add interaction type constraint
ALTER TABLE customer_interactions ADD CONSTRAINT customer_interactions_type_check 
CHECK (interaction_type IN (
  'email',
  'phone_call', 
  'in_person_meeting',
  'virtual_meeting',
  'proposal_sent',
  'proposal_viewed',
  'proposal_signed',
  'follow_up',
  'site_visit',
  'contract_signing',
  'installation',
  'other'
));

-- Add outcome constraint
ALTER TABLE customer_interactions ADD CONSTRAINT customer_interactions_outcome_check 
CHECK (outcome IN (
  'positive',
  'negative', 
  'neutral',
  'follow_up_needed',
  'closed_won',
  'closed_lost',
  'no_response'
));

-- Create indexes for customer interactions
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer_id ON customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_user_id ON customer_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_date ON customer_interactions(interaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_type ON customer_interactions(interaction_type);

-- Update existing data with reasonable defaults
UPDATE customers SET 
  status = CASE 
    WHEN id IN (
      SELECT DISTINCT customer_id 
      FROM proposals 
      WHERE status IN ('signed', 'completed')
    ) THEN 'completed'
    WHEN id IN (
      SELECT DISTINCT customer_id 
      FROM proposals 
      WHERE status = 'sent'
    ) THEN 'proposal_sent'
    WHEN id IN (
      SELECT DISTINCT customer_id 
      FROM proposals
    ) THEN 'qualified'
    ELSE 'lead'
  END,
  lead_source = 'unknown'
WHERE status IS NULL OR lead_source IS NULL;

-- Add comment for documentation
COMMENT ON TABLE customer_interactions IS 'Tracks all interactions between sales reps and customers for comprehensive admin visibility';
COMMENT ON VIEW admin_dashboard_metrics IS 'Pre-calculated metrics for admin dashboard performance';

-- Create function to automatically update customer status based on proposals
CREATE OR REPLACE FUNCTION update_customer_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update customer status based on latest proposal status
  UPDATE customers 
  SET 
    status = CASE 
      WHEN NEW.status IN ('signed', 'completed') THEN 'signed'
      WHEN NEW.status = 'sent' THEN 'proposal_sent'
      WHEN NEW.status IN ('viewed', 'ready_to_send') THEN 'qualified'
      ELSE status -- Keep existing status for drafts
    END,
    last_contact_date = CASE
      WHEN NEW.status = 'sent' THEN NEW.sent_at
      WHEN NEW.status = 'viewed' THEN NEW.viewed_at  
      WHEN NEW.status IN ('signed', 'completed') THEN NEW.signed_at
      ELSE last_contact_date
    END
  WHERE id = NEW.customer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update customer status
DROP TRIGGER IF EXISTS trigger_update_customer_status ON proposals;
CREATE TRIGGER trigger_update_customer_status
  AFTER UPDATE OF status ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_status(); 