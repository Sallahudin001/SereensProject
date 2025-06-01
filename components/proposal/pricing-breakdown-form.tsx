"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, AlertCircle, Calculator, Sparkles, TrendingUp, ShieldCheck, Clock, CheckCircle, XCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import FinancingSelector from "./financing-selector"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/hooks/use-toast"
import { createProposal } from "@/app/actions/proposal-actions"
import { 
  calculateMonthlyPaymentWithFactor, 
  calculateMonthlyPayment,
  calculateTotalWithAdjustments
} from "@/lib/financial-utils"


interface FinancingPlan {
  id: number
  plan_number: string
  provider: string
  plan_name: string
  interest_rate: number
  term_months: number
  payment_factor: number
  merchant_fee: number
  notes: string
  is_active: boolean
}

interface PricingData {
  subtotal: number
  discount: number
  total: number
  monthlyPayment: number
  showLineItems: boolean
  financingTerm: number
  interestRate: number
  financingPlanId?: number
  financingPlanName?: string
  merchantFee?: number
  financingNotes?: string
  paymentFactor?: number
}

interface PricingBreakdownFormProps {
  services: string[]
  products: any
  data: Partial<PricingData>
  updateData: (data: Partial<PricingData>) => void
  proposalId?: number
  userId?: number
  customerData?: any
  fullFormData?: any
}

function PricingBreakdownForm({ services, products, data, updateData, proposalId, userId, customerData, fullFormData }: PricingBreakdownFormProps) {
  // Use a ref to track if we've already updated the parent
  const hasUpdatedRef = useRef(false)
  const [financingPlans, setFinancingPlans] = useState<FinancingPlan[]>([])
  const [loading, setLoading] = useState(false)
  
  // User permission states
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)
  
  // Approval dialog states
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [pendingDiscount, setPendingDiscount] = useState<number>(0)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [pendingApprovalRequest, setPendingApprovalRequest] = useState<any>(null)
  const [submittingApproval, setSubmittingApproval] = useState(false)

  // Track if discount has been manually edited
  const [discountManuallyEdited, setDiscountManuallyEdited] = useState(false)
  
  // Debug tracking
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({})

  // Calculate initial values only once
  const initialSubtotal = useRef(calculateSubtotal(services))
  const initialDiscount = useRef(calculateDiscount(services))

  // Initialize state with proper initial values
  const [formData, setFormData] = useState<PricingData>(() => {
    const subtotal = data.subtotal !== undefined ? data.subtotal : initialSubtotal.current
    const discount = data.discount !== undefined ? data.discount : initialDiscount.current
    const total = subtotal - discount
    const term = data.financingTerm || 60
    const rate = data.interestRate || 5.99

    return {
      subtotal,
      discount,
      total,
      monthlyPayment: calculateMonthlyPayment(total, term, rate),
      showLineItems: data.showLineItems !== undefined ? data.showLineItems : true,
      financingTerm: term,
      interestRate: rate,
      financingPlanId: data.financingPlanId,
      financingPlanName: data.financingPlanName,
      merchantFee: data.merchantFee,
      financingNotes: data.financingNotes,
      paymentFactor: data.paymentFactor
    }
  })

  // Real-time sync effect - ensures all calculated values stay in sync
  useEffect(() => {
    // Only run after initial load
    if (hasUpdatedRef.current) return;

    const total = formData.subtotal - formData.discount;
    
    // Check if total needs to be updated
    if (total !== formData.total) {
      setFormData(prev => {
        const updatedData = { ...prev, total };
        
        // Recalculate monthly payment based on selected financing plan
        if (prev.financingPlanId) {
          const selectedPlan = financingPlans.find(plan => plan.id === prev.financingPlanId);
          if (selectedPlan) {
            updatedData.monthlyPayment = calculateMonthlyPaymentWithFactor(total, selectedPlan.payment_factor);
          } else {
            updatedData.monthlyPayment = calculateMonthlyPayment(total, prev.financingTerm, prev.interestRate);
          }
        } else {
          updatedData.monthlyPayment = calculateMonthlyPayment(total, prev.financingTerm, prev.interestRate);
        }
        
        return updatedData;
      });
    }
    
    // Don't call updateData here - it will be handled by the dedicated effect below
    hasUpdatedRef.current = false; // Set to false so the dedicated effect will run
  }, [formData.subtotal, formData.discount, formData.financingPlanId, financingPlans]);

  // Fetch financing plans and user permissions from API
  useEffect(() => {
    async function fetchFinancingPlans() {
      setLoading(true)
      try {
        const response = await fetch('/api/financing/plans')
        if (!response.ok) throw new Error('Failed to fetch financing plans')
        const plans = await response.json()
        // Only show active plans and deduplicate them
        const activePlans = plans.filter((plan: FinancingPlan) => plan.is_active)
        
        // Deduplicate plans based on plan number, provider, and payment factor
        const uniquePlans = deduplicateFinancingPlans(activePlans)
        setFinancingPlans(uniquePlans)
      } catch (error) {
        console.error('Error fetching financing plans:', error)
      } finally {
        setLoading(false)
      }
    }

    async function fetchUserPermissions() {
      if (userId) {
        console.log('Fetching user permissions for userId:', userId)
        try {
          const response = await fetch(`/api/users?userId=${userId}`)
          console.log('User permissions response status:', response.status)
          
          if (response.ok) {
            const data = await response.json()
            console.log('User permissions data:', data)
            
            if (data.success) {
              const user = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                maxDiscountPercent: data.user.maxDiscountPercent,
                canApproveDiscounts: data.user.canApproveDiscounts
              }
              console.log('Setting user permissions:', user)
              setCurrentUser(user)
              setUserPermissions(user)
              setDebugInfo((prev: Record<string, any>) => ({ ...prev, userPermissions: user }))
            } else {
              console.error('Failed to fetch user permissions:', data.error)
              // Set fallback permissions to allow testing
              const fallbackUser = {
                id: userId,
                name: 'Demo User',
                email: 'demo@test.com',
                role: 'rep',
                maxDiscountPercent: 10,
                canApproveDiscounts: false
              }
              console.log('Using fallback user permissions:', fallbackUser)
              setCurrentUser(fallbackUser)
              setUserPermissions(fallbackUser)
              setDebugInfo((prev: Record<string, any>) => ({ ...prev, userPermissions: fallbackUser, fallbackReason: 'API error: ' + data.error }))
            }
          } else {
            console.error('Failed to fetch user permissions:', response.status, response.statusText)
            // Set fallback permissions
            const fallbackUser = {
              id: userId,
              name: 'Demo User',
              email: 'demo@test.com',
              role: 'rep',
              maxDiscountPercent: 10,
              canApproveDiscounts: false
            }
            console.log('Using fallback user permissions due to API error:', fallbackUser)
            setCurrentUser(fallbackUser)
            setUserPermissions(fallbackUser)
            setDebugInfo((prev: Record<string, any>) => ({ ...prev, userPermissions: fallbackUser, fallbackReason: `API error: ${response.status} ${response.statusText}` }))
          }
        } catch (error) {
          console.error('Error fetching user permissions:', error)
          // Set fallback permissions
          const fallbackUser = {
            id: userId,
            name: 'Demo User',
            email: 'demo@test.com',
            role: 'rep',
            maxDiscountPercent: 10,
            canApproveDiscounts: false
          }
          console.log('Using fallback user permissions due to error:', fallbackUser)
          setCurrentUser(fallbackUser)
          setUserPermissions(fallbackUser)
          setDebugInfo((prev: Record<string, any>) => ({ ...prev, userPermissions: fallbackUser, fallbackReason: 'Exception: ' + String(error) }))
        }
      } else {
        console.log('No userId provided, skipping user permissions fetch')
        setDebugInfo((prev: Record<string, any>) => ({ ...prev, userPermissionsError: 'No userId provided' }))
      }
    }

    fetchFinancingPlans()
    fetchUserPermissions()
  }, [userId])
  
  // Deduplicate financing plans to avoid duplicate entries in the dropdown
  const deduplicateFinancingPlans = (plans: FinancingPlan[]) => {
    const uniquePlans = new Map<string, FinancingPlan>();
    
    plans.forEach(plan => {
      const key = `${plan.provider}-${plan.plan_number}-${plan.payment_factor}`;
      uniquePlans.set(key, plan);
    });
    
    // Sort plans by provider name and payment factor for better organization
    return Array.from(uniquePlans.values())
      .sort((a, b) => a.provider.localeCompare(b.provider) || a.payment_factor - b.payment_factor);
  };

  // Calculate subtotal based on services
  function calculateSubtotal(serviceList: string[]): number {
    let subtotal = 0
    if (serviceList.includes("roofing")) subtotal += 12500
    if (serviceList.includes("hvac")) subtotal += 8500
    if (serviceList.includes("windows-doors")) subtotal += 6800
    if (serviceList.includes("garage-doors")) subtotal += 2200
    if (serviceList.includes("paint")) subtotal += 4500
    return subtotal
  }

  // Calculate discount based on services
  function calculateDiscount(serviceList: string[]): number {
    let discount = 0
    if (serviceList.includes("roofing") && serviceList.includes("windows-doors")) {
      discount += 0.05 * (12500 + 6800)
    }
    if (serviceList.includes("hvac") && serviceList.length > 1) {
      discount += 0.03 * 8500
    }
    return discount
  }

  // Calculate monthly payment using financing plan's payment factor
  function calculateMonthlyPaymentWithFactorLocal(total: number, paymentFactor: number): number {
    return calculateMonthlyPaymentWithFactor(total, paymentFactor);
  }

  // Calculate monthly payment using standard amortization formula (fallback)
  function calculateMonthlyPaymentLocal(total: number, term: number, rate: number): number {
    return calculateMonthlyPayment(total, term, rate);
  }

  // Handle discount change with approval validation
  const handleDiscountChange = useCallback(async (value: number) => {
    // Mark that discount has been manually edited
    setDiscountManuallyEdited(true)
    
    // Always allow discount changes, but add approval logic if permissions are loaded
    if (!userPermissions) {
      // If user permissions aren't loaded, allow the change with a default limit
      const discountPercent = formData.subtotal > 0 ? (value / formData.subtotal) * 100 : 0
      if (discountPercent > 15) { // Default 15% limit when permissions unavailable
        toast({
          title: "Large Discount Applied",
          description: `Applied ${discountPercent.toFixed(1)}% discount. User permissions are loading...`,
          className: "bg-yellow-50 border-yellow-200"
        })
      }
      handleChange("discount", value)
      return
    }

    const discountPercent = formData.subtotal > 0 ? (value / formData.subtotal) * 100 : 0
    
    // Check if discount exceeds user's threshold
    if (discountPercent > userPermissions.maxDiscountPercent) {
      setPendingDiscount(value)
      setShowApprovalDialog(true)
      
      toast({
        title: "Approval Required",
        description: `Discount of ${discountPercent.toFixed(1)}% exceeds your limit of ${userPermissions.maxDiscountPercent}%. Manager approval is required.`,
        variant: "destructive"
      })
      
      return
    }
    
    // Apply discount normally if within threshold
    handleChange("discount", value)
  }, [formData.subtotal, userPermissions])

  // Handle user input changes
  const handleChange = useCallback((field: keyof PricingData, value: any) => {
    setFormData((prev) => {
      // If the value hasn't changed, don't update state
      if (prev[field] === value) return prev

      const newData = { ...prev, [field]: value }

      // Recalculate total and monthly payment when relevant fields change
      if (field === "subtotal" || field === "discount") {
        // Use the standardized calculation for total
        const total = calculateTotalWithAdjustments(
          field === "subtotal" ? value : prev.subtotal,
          0, // No additional costs
          0, // No savings
          field === "discount" ? value : prev.discount
        );
        
        newData.total = total
        
        // Use payment factor if available, otherwise use standard calculation
        if (prev.financingPlanId) {
          const selectedPlan = financingPlans.find(plan => plan.id === prev.financingPlanId)
          if (selectedPlan) {
            newData.monthlyPayment = calculateMonthlyPaymentWithFactor(total, selectedPlan.payment_factor)
          } else {
            newData.monthlyPayment = calculateMonthlyPayment(total, prev.financingTerm, prev.interestRate)
          }
        } else {
        newData.monthlyPayment = calculateMonthlyPayment(total, prev.financingTerm, prev.interestRate)
        }
      }

      return newData
    })

    // Mark that we need to update the parent
    hasUpdatedRef.current = false
  }, [financingPlans])
  
  // Check for approval request updates for this proposal
  useEffect(() => {
    async function checkApprovalStatus() {
      // Only run if we have a proposalId
      if (!proposalId) {
        // Check localStorage for pending approval proposal ID
        const pendingProposalId = window.localStorage.getItem('pendingApprovalProposalId')
        if (!pendingProposalId) return
        
        console.log('Found pending approval proposal ID in localStorage:', pendingProposalId)
      }
      
      const checkId = proposalId || window.localStorage.getItem('pendingApprovalProposalId')
      if (!checkId) return
      
      try {
        console.log('Checking approval status for proposal:', checkId)
        
        // Fetch the latest proposal data to see if approval has been processed
        const response = await fetch(`/api/proposals/${checkId}`)
        
        if (response.ok) {
          const proposalData = await response.json()
          
          // Check if there's still a pending approval request
          if (!proposalData.pendingApprovalRequestId) {
            console.log('No pending approval request found - approval was likely processed')
            
            // Clear any pending approval status
            setPendingApprovalRequest(null)
            window.localStorage.removeItem('pendingApprovalProposalId')
            
            // Check if the discount was updated
            if (proposalData.pricing && proposalData.pricing.discount) {
              const newDiscount = parseFloat(proposalData.pricing.discount)
              
              if (formData.discount !== newDiscount) {
                console.log('Discount was updated:', newDiscount)
                
                // Update the form data with the approved discount
                handleChange("discount", newDiscount)
                
                // Show a toast notification
                toast({
                  title: "Discount Approval Processed",
                  description: `Your discount request of ${newDiscount.toFixed(2)} has been approved.`,
                  className: "bg-green-50 border-green-200"
                })
              }
            }
          } else if (proposalData.pendingApprovalRequestId) {
            // There is still a pending approval
            console.log('Found pending approval request:', proposalData.pendingApprovalRequestId)
            
            // Get details of the approval request
            const requestResponse = await fetch(`/api/approval-requests/${proposalData.pendingApprovalRequestId}`)
            
            if (requestResponse.ok) {
              const requestData = await requestResponse.json()
              
              setPendingApprovalRequest({
                id: requestData.id,
                requestedValue: parseFloat(requestData.requested_value || 0),
                approverName: requestData.approver_name,
                status: requestData.status,
                proposalId: proposalData.id,
                notes: requestData.notes
              })
              
              if (requestData.status === 'rejected') {
                // The discount was rejected
                toast({
                  title: "Discount Request Rejected",
                  description: `Your discount request was not approved.${requestData.notes ? ` Note: ${requestData.notes}` : ''}`,
                  variant: "destructive"
                })
                
                // Clear the pending status
                window.localStorage.removeItem('pendingApprovalProposalId')
              } else if (requestData.status === 'approved') {
                // The discount was approved
                toast({
                  title: "Discount Request Approved",
                  description: `Your discount request of $${parseFloat(requestData.requested_value || 0).toFixed(2)} has been approved.`,
                  className: "bg-green-50 border-green-200"
                })
                
                // Clear the pending status
                window.localStorage.removeItem('pendingApprovalProposalId')
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking approval status:', error)
      }
    }
    
    checkApprovalStatus()
    
    // Also poll for updates every 10 seconds while the component is mounted
    const intervalId = setInterval(checkApprovalStatus, 10000)
    
    return () => clearInterval(intervalId)
  }, [proposalId, handleChange, formData.discount])

  // Submit approval request for discount
  const submitApprovalRequest = useCallback(async () => {
    console.log('submitApprovalRequest called with:', { proposalId, userId, pendingDiscount })
    
    if (!userId || !pendingDiscount) {
      console.error('Missing required data for approval request:', { userId, pendingDiscount })
      toast({
        title: "Error",
        description: "Missing user ID or discount amount. Please try again.",
        variant: "destructive"
      })
      return
    }
    
    setSubmittingApproval(true)
    
    try {
      // Get the parent component's data to save the entire proposal
      const fallbackCustomer = {
        name: "Draft Customer",
        email: `draft-${Date.now()}@example.com`,
        phone: "",
        address: ""
      }
      
      // Ensure we have valid customer data by checking all possible sources
      let effectiveCustomerData = fallbackCustomer
      
      if (customerData && customerData.name && customerData.email) {
        effectiveCustomerData = customerData
      } else if (fullFormData && fullFormData.customer && 
                fullFormData.customer.name && fullFormData.customer.email) {
        effectiveCustomerData = fullFormData.customer
      }
      
      const entireFormData = {
        customer: effectiveCustomerData,
        services: services,
        products: products,
        pricing: formData,
        id: proposalId ? proposalId.toString() : undefined,
      }
      
      console.log('Saving proposal with customer data:', effectiveCustomerData)
      
      // First, save the proposal as draft to ensure we have a valid proposal ID
      console.log('Saving proposal as draft before approval request')
      const saveResult = await createProposal(entireFormData)
      
      if (!saveResult.success) {
        console.error('Failed to save proposal before approval request:', saveResult.error)
        throw new Error('Failed to save proposal before requesting approval')
      }
      
      const actualProposalId = saveResult.proposalId
      console.log('Proposal saved with ID:', actualProposalId)
      
      const discountPercent = formData.subtotal > 0 ? (pendingDiscount / formData.subtotal) * 100 : 0
      
      const requestData = {
        proposalId: actualProposalId,
        requestorId: userId,
        requestType: 'discount',
        originalValue: formData.discount,
        requestedValue: pendingDiscount,
        notes: approvalNotes,
        discountPercent: discountPercent.toFixed(1),
        userMaxPercent: userPermissions?.maxDiscountPercent || 0
      }
      
      console.log('Sending approval request:', requestData)
      
      // Add to debug info
      setDebugInfo((prev: Record<string, any>) => ({ 
        ...prev, 
        approvalRequest: requestData,
        timestamp: new Date().toISOString()
      }))
      
      const response = await fetch('/api/approval-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })
      
      console.log('Approval request response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Approval request failed:', errorText)
        setDebugInfo((prev: Record<string, any>) => ({ 
          ...prev, 
          approvalRequestError: `${response.status}: ${errorText}`
        }))
        throw new Error(`Failed to submit approval request: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Approval request result:', result)
      
      // Add successful result to debug info
      setDebugInfo((prev: Record<string, any>) => ({ 
        ...prev, 
        approvalRequestResult: result
      }))
      
      // Update local proposal ID from the saved draft if we didn't have one
      if (!proposalId) {
        // This will be used for the UI to show the proposal is pending approval
        window.localStorage.setItem('pendingApprovalProposalId', actualProposalId.toString())
      }
      
      setPendingApprovalRequest({
        id: result.requestId,
        requestedValue: pendingDiscount,
        approverName: result.approverName,
        status: 'pending',
        proposalId: actualProposalId || proposalId
      })
      
      toast({
        title: "Approval Request Sent",
        description: `Your discount request has been sent to Manager for approval. The proposal has been saved as draft.`,
        className: "bg-blue-50 border-blue-200"
      })
      
      setShowApprovalDialog(false)
      setApprovalNotes("")
      
    } catch (error) {
      console.error('Error submitting approval request:', error)
      setDebugInfo((prev: Record<string, any>) => ({ 
        ...prev, 
        approvalRequestError: String(error)
      }))
      toast({
        title: "Error",
        description: `Failed to submit approval request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setSubmittingApproval(false)
    }
  }, [proposalId, userId, pendingDiscount, formData, approvalNotes, userPermissions, services, products, customerData, fullFormData])

  // Handle financing plan change
  const handleFinancingPlanChange = useCallback((planId: number) => {
    const selectedPlan = financingPlans.find(plan => plan.id === planId)
    
    if (selectedPlan) {
      setFormData(prev => {
        const monthlyPayment = calculateMonthlyPaymentWithFactor(prev.total, selectedPlan.payment_factor)
        
        return {
          ...prev,
          financingPlanId: planId,
          financingPlanName: `${selectedPlan.provider} - ${selectedPlan.plan_name}`,
          interestRate: selectedPlan.interest_rate,
          financingTerm: selectedPlan.term_months,
          merchantFee: selectedPlan.merchant_fee,
          monthlyPayment: monthlyPayment,
          financingNotes: selectedPlan.notes,
          paymentFactor: selectedPlan.payment_factor // Make sure to store payment factor for later use
        }
      })
      
      // Mark that we need to update the parent
      hasUpdatedRef.current = false
    }
  }, [financingPlans])

  // Update subtotal and discount when services change
  useEffect(() => {
    // Skip this effect on initial render
    const newSubtotal = calculateSubtotal(services)
    const newBundleDiscount = calculateDiscount(services)

    // Only update if values have actually changed significantly
    if (Math.abs(formData.subtotal - newSubtotal) > 0.01) {
      setFormData((prev) => {
        let newDiscount = prev.discount
        
        // Only auto-update discount if it hasn't been manually edited
        if (!discountManuallyEdited) {
          newDiscount = newBundleDiscount
        }
        
        const newTotal = newSubtotal - newDiscount
        
        let newMonthlyPayment = prev.monthlyPayment
        
        // Recalculate monthly payment based on the current plan or formula
        if (prev.financingPlanId) {
          const selectedPlan = financingPlans.find(plan => plan.id === prev.financingPlanId)
          if (selectedPlan) {
            newMonthlyPayment = calculateMonthlyPaymentWithFactor(newTotal, selectedPlan.payment_factor)
          }
        } else {
          newMonthlyPayment = calculateMonthlyPayment(newTotal, prev.financingTerm, prev.interestRate)
        }
        
        return {
          ...prev,
          subtotal: newSubtotal,
          discount: newDiscount,
          total: newTotal,
          monthlyPayment: newMonthlyPayment,
        }
      })

      // Mark that we need to update the parent
      hasUpdatedRef.current = false
    }
  }, [services, formData.subtotal, financingPlans, discountManuallyEdited])

  // Update parent data when formData changes
  useEffect(() => {
    if (hasUpdatedRef.current) return

    if (JSON.stringify(formData) !== JSON.stringify(data)) {
      updateData(formData)
      hasUpdatedRef.current = true
    }
  }, [formData, updateData, data])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Pricing Breakdown</h3>
        <div className="flex items-center space-x-2">
          <Label htmlFor="show-line-items" className="text-sm cursor-pointer">Show line items to customer</Label>
          <Switch
            id="show-line-items"
            checked={formData.showLineItems}
            onCheckedChange={(checked) => handleChange("showLineItems", checked)}
          />
        </div>
      </div>

      <Card className="overflow-hidden border border-gray-200 shadow-sm">
        <CardContent className="p-6 space-y-4">
          {/* Smart Bundle Alert */}
          {services.length > 1 && (
            <Alert className="bg-green-50 border-green-200">
              <InfoIcon className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                <span className="font-medium">Bundle discount applied!</span> Combining {services.join(" and ")} saves the customer money.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-5 pt-2">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <div className="relative w-36">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  value={formData.subtotal.toFixed(2)}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value) || 0
                    handleChange("subtotal", value)
                  }}
                  className="pl-8 text-right font-medium"
                />
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Base Discount</span>
                {userPermissions ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Your discount limit: {userPermissions.maxDiscountPercent}%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                    <span className="text-xs text-gray-400">Loading permissions...</span>
                  </div>
                )}
                {discountManuallyEdited && services.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const bundleDiscount = calculateDiscount(services)
                      setDiscountManuallyEdited(false)
                      handleChange("discount", bundleDiscount)
                    }}
                    className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Reset to Bundle
                  </Button>
                )}
              </div>
              <div className="relative w-36">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  value={formData.discount.toFixed(2)}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value) || 0
                    console.log('Discount input changed:', value)
                    handleDiscountChange(value)
                  }}
                  className="pl-8 text-right font-medium"
                  placeholder="0.00"
                  title="Enter discount amount"
                />
              </div>
            </div>

            <div className="flex justify-between items-center py-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-md px-3">
              <span className="text-gray-900 font-semibold">Final Total</span>
              <div className="text-right">
                <span className="text-xl font-bold">${formData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <h3 className="text-lg font-medium mb-4">Financing Options</h3>
        <FinancingSelector 
          projectTotal={formData.total}
          onFinancingChange={(plan, monthlyPayment) => {
            if (plan) {
              // Calculate net amount after merchant fee
              const merchantFeeAmount = formData.total * (plan.merchant_fee / 100);
              const netAmount = formData.total - merchantFeeAmount;
              
              setFormData(prev => {
                const updatedData = {
                ...prev,
                financingPlanId: plan.id,
                financingPlanName: `${plan.provider} - ${plan.plan_name}`,
                interestRate: plan.interest_rate,
                financingTerm: plan.term_months,
                merchantFee: plan.merchant_fee,
                monthlyPayment: monthlyPayment,
                  financingNotes: plan.notes,
                  paymentFactor: plan.payment_factor // Store payment factor for consistent calculations
                };
                
                return updatedData;
              });
              
              // Mark that we need to update the parent
              hasUpdatedRef.current = false;
            }
          }}
          className="shadow-sm"
          uniqueId="proposal-pricing-form"
        />
        
        {formData.financingPlanId && (
          <div className="flex flex-col justify-center mt-4 text-sm">
            <p className="text-center text-gray-500">Selected plan: <span className="font-medium">{formData.financingPlanName}</span></p>
            {formData.merchantFee && formData.merchantFee > 0 && (
              <div className="flex justify-between items-center mt-2 bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Merchant Fee ({formData.merchantFee}%):</span>
                <span className="text-red-600 font-medium">-${(formData.total * formData.merchantFee / 100).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pending Approval Status */}
      {pendingApprovalRequest && pendingApprovalRequest.status === 'pending' && (
        <Card className="border-blue-200 bg-blue-50 mt-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">Discount Approval Pending</h4>
                <p className="text-sm text-blue-700">
                  Discount of ${parseFloat(pendingApprovalRequest.requestedValue).toFixed(2)} sent to Manager for approval.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Status */}
      {pendingApprovalRequest && pendingApprovalRequest.status === 'approved' && (
        <Card className="border-green-200 bg-green-50 mt-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-green-900">Discount Approved</h4>
                <p className="text-sm text-green-700">
                  Requested discount of ${parseFloat(pendingApprovalRequest.requestedValue).toFixed(2)} has been approved by Manager.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected Status */}
      {pendingApprovalRequest && pendingApprovalRequest.status === 'rejected' && (
        <Card className="border-red-200 bg-red-50 mt-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-red-900">Discount Rejected</h4>
                <p className="text-sm text-red-700">
                  Requested discount of ${parseFloat(pendingApprovalRequest.requestedValue).toFixed(2)} was rejected by Manager.
                  {pendingApprovalRequest.notes && (
                    <span className="block mt-1 font-medium">Reason: {pendingApprovalRequest.notes}</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Request Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-orange-600" />
              Manager Approval Required
            </DialogTitle>
            <DialogDescription>
              The discount amount of ${pendingDiscount.toFixed(2)} 
              ({formData.subtotal > 0 ? ((pendingDiscount / formData.subtotal) * 100).toFixed(1) : 0}%) 
              exceeds your maximum discount limit of {userPermissions?.maxDiscountPercent || 0}%.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="approval-notes">
                Request Notes (Optional)
              </label>
              <Textarea
                id="approval-notes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes to justify this discount..."
                className="mt-2"
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-800 space-y-1">
              <p><strong>Current User:</strong> {userPermissions?.name || 'Unknown'}</p>
              <p><strong>Role:</strong> {userPermissions?.role || 'Unknown'}</p>
              <p><strong>User ID:</strong> {userId || 'Not provided'}</p>
              <p><strong>Proposal ID:</strong> {proposalId || 'New proposal (pending)'}</p>
              <p><strong>Discount Limit:</strong> {userPermissions?.maxDiscountPercent || 0}%</p>
              <p><strong>Requested Discount:</strong> {formData.subtotal > 0 ? ((pendingDiscount / formData.subtotal) * 100).toFixed(1) : 0}%</p>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between items-center gap-4 sm:justify-between mt-4">
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            
            <Button 
              onClick={submitApprovalRequest}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={submittingApproval}
            >
              {submittingApproval ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                  Sending...
                </>
              ) : 'Request Approval'}
            </Button>
          </DialogFooter>
          
          {pendingApprovalRequest && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <h4 className="font-medium text-green-800 mb-1">Approval Request Sent</h4>
              <p className="text-sm text-green-700">
                Request #{pendingApprovalRequest.id} sent to Manager
              </p>
              <p className="text-xs text-green-600 mt-1">
                <Clock className="h-3 w-3 inline-block mr-1" />
                Waiting for approval...
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Export a memoized version to prevent unnecessary re-renders
export default PricingBreakdownForm
