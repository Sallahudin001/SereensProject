"use client"

import { useState, useCallback, memo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Check, Loader2, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import CustomerInfoForm from "@/components/proposal/customer-info-form"
import ScopeOfWorkForm from "@/components/proposal/scope-of-work-form"
import ProductSelectionForm from "@/components/proposal/product-selection-form"
import PricingBreakdownForm from "@/components/proposal/pricing-breakdown-form"
import SignatureDepositForm from "@/components/proposal/signature-deposit-form"
import ProposalStepper from "@/components/proposal/proposal-stepper"
import RepOfferSelector from "@/components/proposal/rep-offer-selector"
import { createProposal, getProposalById } from "@/app/actions/proposal-actions"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { motion } from "framer-motion"

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
  const proposalId = searchParams ? searchParams.get("id") : null
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [draftProposalId, setDraftProposalId] = useState<string | null>(null)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isCustomerInfoValid, setIsCustomerInfoValid] = useState(false)
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
          // Set the draft proposal ID if editing
          setDraftProposalId(proposal.id)
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
    { id: "finalize", label: "Finalize" },
  ]

  // Function to create or update a draft proposal
  const createOrUpdateDraftProposal = async (skipValidation = false) => {
    try {
      // Skip saving if we're on the first step and have no meaningful data
      if (!skipValidation && currentStep === 0 && (!formData.customer.name || !formData.customer.email)) {
        return null
      }

      setIsSavingDraft(true)

      // If we already have a draft ID, include it in the form data to update instead of create
      const dataToSave = {
        ...formData,
        id: draftProposalId || formData.id || undefined,
        status: currentStep === steps.length - 1 ? "draft_complete" : "draft_in_progress"
      }

      const result = await createProposal(dataToSave)

      if (result.success) {
        // Store the proposal ID for future updates
        if (!draftProposalId) {
          setDraftProposalId(result.proposalId)
          setFormData(prev => ({
            ...prev,
            id: result.proposalId,
            proposalNumber: result.proposalNumber
          }))
        }
        return result
      } else {
        console.error('Failed to save draft:', result.error)
        return null
      }
    } catch (error) {
      console.error("Error saving draft proposal:", error)
      return null
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleNext = async () => {
    // Prevent navigation from customer info step if validation fails
    if (currentStep === 0 && !isCustomerInfoValid) {
      toast({
        title: "Please complete customer information",
        description: "All customer fields must be filled out with valid information before proceeding.",
        variant: "destructive",
      })
      return
    }

    if (currentStep < steps.length - 1) {
      // Save draft before proceeding to next step (only after customer info is filled)
      if (currentStep >= 0 && formData.customer.name && formData.customer.email) {
        await createOrUpdateDraftProposal()
      }
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
      // Immediately disable the button to prevent double clicks
      setIsSubmitting(true)

      // If we have a draft proposal ID, check its current status
      if (draftProposalId) {
        try {
          const response = await fetch(`/api/proposals/${draftProposalId}`)
          if (response.ok) {
            const proposalData = await response.json()
            if (proposalData.status === 'sent' || proposalData.status === 'signed' || proposalData.status === 'completed') {
              toast({
                title: "Proposal already sent",
                description: `This proposal has already been sent to the customer.`,
              })
              router.push("/dashboard")
              return
            }
          }
        } catch (error) {
          console.error("Error checking proposal status:", error)
        }
      }

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

      // Create or update the proposal with completed status
      const result = await createOrUpdateDraftProposal(true)

      if (result && result.success) {
        // Message varies if it was a duplicate prevention
        const message = result.isDuplicate 
          ? "Using existing proposal to prevent duplication"
          : `Proposal ${result.proposalNumber} has been created successfully`
        
        toast({
          title: "Proposal created",
          description: message,
        })

        // Always redirect immediately after creation to prevent repeated submissions
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: result?.error || "Failed to create proposal",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-slate-200">
      <DashboardLayout>
        <div className="h-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="h-full flex flex-col"
          >
            <Card className="shadow-2xl rounded-xl overflow-hidden bg-white mb-8 mx-4 xl:mx-8 flex-1">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 sm:p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <CardTitle className="text-3xl sm:text-4xl font-bold flex items-center">
                        <Plus className="w-8 h-8 mr-3" />
                        Create New Proposal
                      </CardTitle>
                      <CardDescription className="text-green-100 text-sm sm:text-base">
                        Generate a detailed sales proposal for your customer
                      </CardDescription>
                    </div>
                  </div>
                </motion.div>
              </CardHeader>

              <CardContent className="p-6 sm:p-8 flex-1 flex flex-col">
                <Card className="mb-6 overflow-hidden border-none shadow-md">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
                    <CardTitle className="text-gray-800">Proposal Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 pb-4">
                    <ProposalStepper steps={steps} currentStep={currentStep} />
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md flex-1 flex flex-col">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 font-medium">
                        {currentStep + 1}
                      </div>
                      <div>
                        <CardTitle className="text-emerald-800">{steps[currentStep].label}</CardTitle>
                        <CardDescription className="text-emerald-600">
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
                  <CardContent className="pt-8 flex-1 flex flex-col">
                    {/* Use full width for all sections */}
                    <div className="w-full flex-1">
                      {currentStep === 0 && <MemoizedCustomerInfoForm data={formData.customer} updateData={updateCustomer} onValidationChange={setIsCustomerInfoValid} />}
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
                          proposalId={draftProposalId ? parseInt(draftProposalId) : formData.id ? parseInt(formData.id) : undefined}
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
                          className="px-6 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>

                        {currentStep < steps.length - 1 ? (
                          <Button 
                            onClick={handleNext} 
                            className={`px-6 ${
                              currentStep === 0 && !isCustomerInfoValid 
                                ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
                                : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                            disabled={isSavingDraft || (currentStep === 0 && !isCustomerInfoValid)}
                          >
                            {isSavingDraft ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                Saving...
                              </>
                            ) : currentStep === 0 && !isCustomerInfoValid ? (
                              <>
                                Complete Required Fields <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            ) : (
                              <>
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
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

                      {/* Progress indicator */}
                      <div className="mt-10 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Step {currentStep + 1} of {steps.length}</span>
                          <span>{Math.round((currentStep / (steps.length - 1)) * 100)}% Complete</span>
                        </div>
                        <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2 [&>div]:bg-emerald-600" />
                        {draftProposalId && (
                          <p className="text-xs text-emerald-600 text-center mt-1">
                            Draft saved: {formData.proposalNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </div>
  )
}
