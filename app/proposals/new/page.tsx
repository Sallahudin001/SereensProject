"use client"

import { useState, useCallback, memo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import CustomerInfoForm from "@/components/proposal/customer-info-form"
import ScopeOfWorkForm from "@/components/proposal/scope-of-work-form"
import ProductSelectionForm from "@/components/proposal/product-selection-form"
import PricingBreakdownForm from "@/components/proposal/pricing-breakdown-form"
import SignatureDepositForm from "@/components/proposal/signature-deposit-form"
import ProposalStepper from "@/components/proposal/proposal-stepper"
import RepOfferSelector from "@/components/proposal/rep-offer-selector"
import { createProposal, getProposalById } from "@/app/actions/proposal-actions"
import { toast } from "@/hooks/use-toast"

// Define interfaces for typesafety
interface CustomerInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
}

interface PricingData {
  subtotal: number;
  discount: number;
  total: number;
  monthlyPayment: number;
  showLineItems: boolean;
  financingPlanId?: number;
  financingPlanName?: string;
  merchantFee?: number;
  financingNotes?: string;
}

interface ProposalFormData {
  customer: CustomerInfo;
  services: string[];
  products: Record<string, any>;
  pricing: PricingData;
  selectedOffers: number[];
  id?: string;
  proposalNumber?: string;
}

// Memoize the form components to prevent unnecessary re-renders
const MemoizedCustomerInfoForm = memo(CustomerInfoForm)
const MemoizedScopeOfWorkForm = memo(ScopeOfWorkForm)
const MemoizedProductSelectionForm = memo(ProductSelectionForm)
const MemoizedPricingBreakdownForm = memo(PricingBreakdownForm)
const MemoizedSignatureDepositForm = memo(SignatureDepositForm)

export default function NewProposalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const proposalId = searchParams.get("id")
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [formData, setFormData] = useState<ProposalFormData>({
    customer: {
      name: "",
      address: "",
      email: "",
      phone: "",
    },
    services: [],
    products: {},
    pricing: {
      subtotal: 0,
      discount: 0,
      total: 0,
      monthlyPayment: 0,
      showLineItems: true,
      financingPlanId: undefined,
      financingPlanName: "",
      merchantFee: 0,
    },
    selectedOffers: [],
  })

  // Fetch current user and pre-fill form if editing an existing proposal
  useEffect(() => {
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

    async function fetchProposal() {
      if (proposalId) {
        const proposal = await getProposalById(proposalId)
        if (proposal) {
          setFormData({
            customer: proposal.customer,
            services: proposal.services,
            products: proposal.products,
            pricing: proposal.pricing,
            selectedOffers: [],
            id: proposal.id,
            proposalNumber: proposal.proposalNumber,
          })
        }
      }
    }

    fetchCurrentUser()
    fetchProposal()
  }, [proposalId])

  const steps = [
    { id: "customer-info", label: "Customer Info" },
    { id: "scope-of-work", label: "Scope of Work" },
    { id: "product-selection", label: "Product Selection" },
    { id: "offer-selection", label: "Sales Offers" },
    { id: "pricing-breakdown", label: "Pricing Breakdown" },
    { id: "signature-deposit", label: "Signature & Deposit" },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Update the handleSubmit function to handle the case where we're sending a proposal directly
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Validate required fields
      if (!formData.customer.name || !formData.customer.email) {
        toast({
          title: "Missing information",
          description: "Please provide customer name and email",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (formData.services.length === 0) {
        toast({
          title: "No services selected",
          description: "Please select at least one service",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Submit the proposal to the database
      const result = await createProposal(formData)

      if (result.success) {
        toast({
          title: "Proposal created",
          description: `Proposal ${result.proposalNumber} has been created successfully`,
        })

        // Update the formData with the new proposal ID
        setFormData((prev) => ({
          ...prev,
          id: result.proposalId,
          proposalNumber: result.proposalNumber,
        }))

        // If we're on the last step, don't redirect
        if (currentStep < steps.length - 1) {
          router.push("/dashboard")
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create proposal",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting proposal:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Use useCallback with stable references to prevent unnecessary re-renders
  const updateCustomer = useCallback((data: Partial<CustomerInfo>) => {
    setFormData((prev) => {
      if (JSON.stringify(prev.customer) === JSON.stringify(data)) {
        return prev // No change
      }
      return { ...prev, customer: { ...prev.customer, ...data } }
    })
  }, [])

  const updateServices = useCallback((data: string[]) => {
    setFormData((prev) => {
      if (JSON.stringify(prev.services) === JSON.stringify(data)) {
        return prev // No change
      }
      return { ...prev, services: data }
    })
  }, [])

  const updateProducts = useCallback((data: Record<string, any>) => {
    setFormData((prev) => {
      if (JSON.stringify(prev.products) === JSON.stringify(data)) {
        return prev // No change
      }
      return { ...prev, products: data }
    })
  }, [])

  const updatePricing = useCallback((data: Partial<PricingData>) => {
    setFormData((prev) => {
      if (JSON.stringify(prev.pricing) === JSON.stringify(data)) {
        return prev // No change
      }
      return { ...prev, pricing: { ...prev.pricing, ...data } }
    })
  }, [])

  const updateSelectedOffers = useCallback((data: number[]) => {
    setFormData((prev) => {
      if (JSON.stringify(prev.selectedOffers) === JSON.stringify(data)) {
        return prev // No change
      }
      return { ...prev, selectedOffers: data }
    })
  }, [])

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Proposal</h1>
        <p className="text-gray-500">Generate a detailed sales proposal for your customer</p>
      </div>

      <Card className="mb-6 overflow-hidden border-0 shadow-md">
        <CardContent className="pt-6 pb-4">
          <ProposalStepper steps={steps} currentStep={currentStep} />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-rose-50 to-white border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-rose-100 text-rose-600 font-medium">
              {currentStep + 1}
            </div>
            <div>
              <CardTitle>{steps[currentStep].label}</CardTitle>
              <CardDescription>
                {currentStep === 0 && "Enter customer details to personalize the proposal"}
                {currentStep === 1 && "Select services to include in the customer's project scope"}
                {currentStep === 2 && "Choose specific products and options for each selected service"}
                {currentStep === 3 && "Select time-sensitive offers to create urgency and boost close rates"}
                {currentStep === 4 && "Set pricing details and configure payment options"}
                {currentStep === 5 && "Review and finalize the proposal for signature"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          {/* Use full width for all sections */}
          <div className="w-full">
            {currentStep === 0 && <MemoizedCustomerInfoForm data={formData.customer} updateData={updateCustomer} />}
            {currentStep === 1 && <MemoizedScopeOfWorkForm data={formData.services} updateData={updateServices} />}
            {currentStep === 2 && (
              <MemoizedProductSelectionForm
                services={formData.services}
                data={formData.products}
                updateData={updateProducts}
              />
            )}
            {currentStep === 3 && (
              <RepOfferSelector
                services={formData.services}
                selectedOffers={formData.selectedOffers}
                onOffersChange={updateSelectedOffers}
              />
            )}
            {currentStep === 4 && (
              <MemoizedPricingBreakdownForm
                services={formData.services}
                products={formData.products}
                data={formData.pricing}
                updateData={updatePricing}
                proposalId={formData.id ? parseInt(formData.id) : undefined}
                userId={currentUser?.id}
                customerData={formData.customer}
                fullFormData={formData}
              />
            )}
            {currentStep === 5 && <MemoizedSignatureDepositForm formData={formData} />}

            <div className="flex justify-between mt-10">
              <Button 
                variant="outline" 
                onClick={handlePrevious} 
                disabled={currentStep === 0}
                className="px-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button 
                  onClick={handleNext} 
                  className="bg-rose-600 hover:bg-rose-700 px-6"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Creating Proposal
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" /> 
                      Complete Proposal
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Simple progress indicator */}
            <div className="flex justify-start mt-8 text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length} • {Math.round((currentStep / (steps.length - 1)) * 100)}% Complete
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
