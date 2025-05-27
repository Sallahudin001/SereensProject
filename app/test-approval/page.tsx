"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PricingBreakdownForm from "@/components/proposal/pricing-breakdown-form"

export default function TestApprovalPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [pricingData, setPricingData] = useState({
    subtotal: 25000,
    discount: 0,
    total: 25000,
    monthlyPayment: 0,
    showLineItems: true,
    financingTerm: 60,
    interestRate: 5.99,
    financingPlanId: undefined,
    financingPlanName: "",
    merchantFee: 0,
    financingNotes: ""
  })

  const updatePricingData = (data: any) => {
    setPricingData(prev => ({ ...prev, ...data }))
  }

  useEffect(() => {
    // Fetch current user on component mount
    async function fetchCurrentUser() {
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getCurrentUser' })
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setCurrentUser(data.user)
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error)
      }
    }

    fetchCurrentUser()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Test Discount Approval System
          </CardTitle>
          <div className="text-sm text-gray-600">
            {currentUser ? (
              <div className="space-y-1">
                <p><strong>Current User:</strong> {currentUser.name} ({currentUser.role})</p>
                <p><strong>Max Discount:</strong> {currentUser.maxDiscountPercent}%</p>
                <p><strong>Can Approve:</strong> {currentUser.canApproveDiscounts ? 'Yes' : 'No'}</p>
              </div>
            ) : (
              <p>Loading user information...</p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Testing Instructions:</h3>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Try entering a discount amount greater than your limit (e.g., $3000+ for 10% limit)</li>
                <li>You should see an approval dialog appear</li>
                <li>Submit the approval request with optional notes</li>
                <li>Check the manager dashboard at <code>/admin/approvals</code> to approve/reject</li>
              </ol>
            </div>

            <PricingBreakdownForm
              services={["roofing", "hvac"]}
              products={{}}
              data={pricingData}
              updateData={updatePricingData}
              proposalId={1}
              userId={currentUser?.id}
            />

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Current Pricing State:</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(pricingData, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 