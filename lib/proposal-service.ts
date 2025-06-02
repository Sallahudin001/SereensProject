import { executeQuery } from "@/lib/db"
import { logProposalCreation } from "@/lib/activity-logger"

// Define proposal statuses
export const ProposalStatus = {
  DRAFT: "draft",
  DRAFT_IN_PROGRESS: "draft_in_progress", 
  DRAFT_COMPLETE: "draft_complete",
  DRAFT_DISCOUNT_REVIEW: "draft_discount_review",
  READY_TO_SEND: "ready_to_send",
  SENT: "sent",
  VIEWED: "viewed",
  SIGNED: "signed",
  COMPLETED: "completed",
  REJECTED: "rejected"
}

// Interface for proposal data
export interface ProposalData {
  id?: string
  customer: {
    name: string
    email: string
    phone?: string
    address?: string
  }
  services: string[]
  products: Record<string, any>
  pricing: {
    subtotal: number
    discount: number
    total: number
    monthlyPayment: number
    financingTerm?: number
    interestRate?: number
    financingPlanId?: number
    financingPlanName?: string
    merchantFee?: number
    financingNotes?: string
  }
  status?: string
  selectedOffers?: number[]
}

export class ProposalService {
  /**
   * Find an existing draft proposal for a customer
   */
  static async findExistingDraftProposal(customerEmail: string): Promise<any | null> {
    try {
      const result = await executeQuery(
        `
        SELECT p.id, p.proposal_number
        FROM proposals p
        JOIN customers c ON p.customer_id = c.id
        WHERE c.email = $1
        AND p.created_at > NOW() - INTERVAL '24 hours'
        AND p.status IN ('draft', 'draft_in_progress', 'draft_complete', 'draft_discount_review')
        ORDER BY p.created_at DESC
        LIMIT 1
        `,
        [customerEmail]
      )
      
      return result.length > 0 ? result[0] : null
    } catch (error) {
      console.error('Error finding existing proposal:', error)
      return null
    }
  }

  /**
   * Check if a proposal can be updated (not in a final state)
   */
  static async canUpdateProposal(proposalId: string): Promise<boolean> {
    try {
      const result = await executeQuery(
        `
        SELECT status FROM proposals 
        WHERE id = $1 
        AND status NOT IN ('signed', 'completed', 'rejected')
        `,
        [proposalId]
      )
      
      return result.length > 0
    } catch (error) {
      console.error('Error checking proposal status:', error)
      return false
    }
  }

  /**
   * Update proposal status with validation
   */
  static async updateProposalStatus(proposalId: string, newStatus: string): Promise<boolean> {
    try {
      // Validate status transition
      const currentStatusResult = await executeQuery(
        `SELECT status FROM proposals WHERE id = $1`,
        [proposalId]
      )
      
      if (currentStatusResult.length === 0) {
        console.error('Proposal not found:', proposalId)
        return false
      }
      
      const currentStatus = currentStatusResult[0].status
      
      // Don't allow updating completed/signed/rejected proposals
      if (['signed', 'completed', 'rejected'].includes(currentStatus)) {
        console.error(`Cannot update proposal in ${currentStatus} state`)
        return false
      }
      
      // Update the status
      await executeQuery(
        `
        UPDATE proposals 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        `,
        [newStatus, proposalId]
      )
      
      return true
    } catch (error) {
      console.error('Error updating proposal status:', error)
      return false
    }
  }

  /**
   * Get proposal lock status (prevents concurrent edits)
   */
  static async isProposalLocked(proposalId: string): Promise<boolean> {
    try {
      const result = await executeQuery(
        `
        SELECT 
          CASE 
            WHEN status IN ('sent', 'viewed', 'signed', 'completed', 'rejected') THEN true
            WHEN updated_at > NOW() - INTERVAL '5 seconds' THEN true
            ELSE false
          END as is_locked
        FROM proposals 
        WHERE id = $1
        `,
        [proposalId]
      )
      
      return result.length > 0 && result[0].is_locked
    } catch (error) {
      console.error('Error checking proposal lock:', error)
      return true // Default to locked for safety
    }
  }

  /**
   * Clean up old draft proposals
   */
  static async cleanupOldDrafts(customerEmail: string, keepProposalId?: string): Promise<void> {
    try {
      let query = `
        UPDATE proposals p
        SET status = 'abandoned'
        FROM customers c
        WHERE p.customer_id = c.id
        AND c.email = $1
        AND p.created_at < NOW() - INTERVAL '7 days'
        AND p.status IN ('draft', 'draft_in_progress')
      `
      
      const params = [customerEmail]
      
      if (keepProposalId) {
        query += ` AND p.id != $2`
        params.push(keepProposalId)
      }
      
      await executeQuery(query, params)
    } catch (error) {
      console.error('Error cleaning up old drafts:', error)
    }
  }

  /**
   * Request discount approval without creating a new proposal
   */
  static async requestDiscountApproval(
    proposalId: string,
    requestorId: string,
    requestedDiscount: number,
    originalDiscount: number,
    discountPercent: number,
    notes?: string
  ): Promise<{ success: boolean; requestId?: number; error?: string }> {
    try {
      // Verify proposal exists
      const proposalCheck = await executeQuery(
        `SELECT id FROM proposals WHERE id = $1`,
        [proposalId]
      )
      
      if (proposalCheck.length === 0) {
        return { success: false, error: 'Proposal not found' }
      }
      
      // Create approval request
      const result = await executeQuery(
        `
        INSERT INTO approval_requests (
          proposal_id, requestor_id, request_type,
          original_value, requested_value, notes, status
        )
        VALUES ($1, $2, 'discount', $3, $4, $5, 'pending')
        RETURNING id
        `,
        [proposalId, requestorId, originalDiscount, requestedDiscount, notes || '']
      )
      
      // Update proposal with pending approval request
      await executeQuery(
        `
        UPDATE proposals
        SET pending_approval_request_id = $1,
            updated_at = NOW()
        WHERE id = $2
        `,
        [result[0].id, proposalId]
      )
      
      return { success: true, requestId: result[0].id }
    } catch (error) {
      console.error('Error creating discount approval request:', error)
      return { success: false, error: 'Failed to create approval request' }
    }
  }
} 