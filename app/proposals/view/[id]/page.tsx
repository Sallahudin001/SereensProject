"use client"

import { useEffect, useState } from "react"
import CustomerProposalView from "@/components/customer/proposal-view"
import { getProposalById, updateProposalStatus } from "@/app/actions/proposal-actions"
import { useParams, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"

export default function ViewProposalPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [proposal, setProposal] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get mode from query params - if 'admin' is specified, use readOnly mode
  const isAdminMode = searchParams.get('mode') === 'admin'

  useEffect(() => {
    async function fetchProposal() {
      try {
        setLoading(true)
        const id = params.id

        if (!id) {
          setError("Proposal ID is required")
          setLoading(false)
          return
        }

        const proposalData = await getProposalById(id.toString())

        if (!proposalData) {
          setError("Proposal not found")
          setLoading(false)
          return
        }

        setProposal(proposalData)

        // If the proposal status is 'sent', update it to 'viewed'
        if (proposalData.status === "sent") {
          await updateProposalStatus(id.toString(), "viewed")
        }
      } catch (error) {
        console.error("Error fetching proposal:", error)
        setError("Failed to load proposal")
      } finally {
        setLoading(false)
      }
    }

    fetchProposal()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your proposal...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="bg-red-100 text-red-800 p-4 rounded-md">
            <h2 className="text-lg font-medium mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Pass readOnly prop only when in admin mode */}
        <CustomerProposalView proposal={proposal} readOnly={isAdminMode} />
      </div>
    </div>
  )
}
