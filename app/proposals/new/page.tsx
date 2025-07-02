"use client"

import { useState, useCallback, memo, useEffect, useMemo, useRef } from "react"
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
import EnhancedRepOfferSelector from "@/components/proposal/enhanced-rep-offer-selector"
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
  repFirstName: string;
  repLastName: string;
  repPhone: string;
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

interface CustomizedOffer {
  originalOfferId: number;
  name: string;
  description: string;
  discount_amount?: number;
  discount_percentage?: number;
  free_product_service?: string;
  expiration_value?: number;
  expiration_type: string;
}

interface ProposalFormData {
  customer: CustomerInfo;
  services: string[];
  products: Record<string, any>;
  pricing: PricingData;
  selectedOffers: number[];
  customizedOffers: CustomizedOffer[];
  id?: string;
  proposalNumber?: string;
}

// Storage keys for localStorage
const STORAGE_KEYS = {
  FORM_DATA: 'proposal_form_draft',
  CURRENT_STEP: 'proposal_current_step', 
  DRAFT_ID: 'proposal_draft_id',
  TIMESTAMP: 'proposal_draft_timestamp'
}

// Draft storage interface
interface DraftData {
  formData: ProposalFormData;
  currentStep: number;
  draftProposalId: string | null;
  timestamp: number;
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null;
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

// Helper function to check if form data is valid for creating a draft
const isValidForDraft = (formData: ProposalFormData): boolean => {
  return !!(
    formData.customer.name &&
    formData.customer.email &&
    formData.customer.name.trim() !== "" &&
    formData.customer.email.trim() !== ""
  );
}

// Helper functions for localStorage management
const saveDraftToStorage = (formData: ProposalFormData, currentStep: number, draftProposalId: string | null) => {
  const draftData: DraftData = {
    formData,
    currentStep,
    draftProposalId,
    timestamp: Date.now()
  }
  
  try {
    localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(draftData))
  } catch (error) {
    console.error('Error saving draft to localStorage:', error)
    // If quota exceeded, try to clear old data and retry
    if (error instanceof DOMException && error.code === 22) {
      console.warn('localStorage quota exceeded, clearing old drafts...')
      clearDraftFromStorage()
      try {
        localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(draftData))
      } catch (retryError) {
        console.error('Failed to save draft even after clearing:', retryError)
      }
    }
  }
}

const loadDraftFromStorage = (): DraftData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.FORM_DATA)
    if (!saved) return null
    
    const draftData: DraftData = JSON.parse(saved)
    
    // Check if draft is recent (less than 7 days)
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    if (Date.now() - draftData.timestamp > maxAge) {
      localStorage.removeItem(STORAGE_KEYS.FORM_DATA)
      return null
    }
    
    return draftData
  } catch (error) {
    console.error('Error loading draft from localStorage:', error)
    localStorage.removeItem(STORAGE_KEYS.FORM_DATA)
    return null
  }
}

const clearDraftFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.FORM_DATA)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP)
    localStorage.removeItem(STORAGE_KEYS.DRAFT_ID)
    localStorage.removeItem(STORAGE_KEYS.TIMESTAMP)
  } catch (error) {
    console.error('Error clearing draft from localStorage:', error)
  }
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
  const [isDraftRestored, setIsDraftRestored] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  const [draftState, setDraftState] = useState({
    proposalId: null as string | null,
    proposalNumber: null as string | null,
    isExistingDraft: false,
    lastChecked: null as Date | null
  })
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [formData, setFormData] = useState<ProposalFormData>({
    customer: {
      name: "",
      address: "",
      email: "",
      phone: "",
      repFirstName: "",
      repLastName: "",
      repPhone: "",
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
    customizedOffers: [],
  })

  // Check for existing draft when customer email changes
  useEffect(() => {
    if (formData.customer.email && formData.customer.email.trim() !== "" && !isDraftRestored && !proposalId) {
      checkForExistingDraft()
    }
  }, [formData.customer.email, isDraftRestored, proposalId])

  // Function to check for existing draft
  const checkForExistingDraft = async () => {
    try {
      const response = await fetch(`/api/proposals/check-draft?email=${encodeURIComponent(formData.customer.email)}`)
      const data = await response.json()
      
      if (data.success && data.found) {
        setDraftState(prev => ({
          ...prev,
          proposalId: data.draft.id,
          proposalNumber: data.draft.proposalNumber,
          isExistingDraft: true,
          lastChecked: new Date()
        }))
        console.log(`Found existing draft: ${data.draft.proposalNumber}`)
      }
    } catch (error) {
      console.error('Error checking for existing draft:', error)
    }
  }

  // Function to create new draft
  const createNewDraft = async (formData: ProposalFormData) => {
    try {
      setIsSavingDraft(true)
      const result = await createProposal({
        ...formData,
        status: "draft_in_progress"
      })
      
      if (result.success) {
        setDraftState(prev => ({
          ...prev,
          proposalId: result.proposalId,
          proposalNumber: result.proposalNumber,
          isExistingDraft: false
        }))
        setFormData(prev => ({
          ...prev,
          id: result.proposalId,
          proposalNumber: result.proposalNumber
        }))
        console.log(`Created new draft: ${result.proposalNumber}`)
      }
    } catch (error) {
      console.error('Error creating new draft:', error)
    } finally {
      setIsSavingDraft(false)
    }
  }

  // Function to update existing draft
  const updateExistingDraft = async (proposalId: string, formData: ProposalFormData) => {
    try {
      setIsSavingDraft(true)
      const result = await createProposal({
        ...formData,
        id: proposalId,
        status: currentStep === steps.length - 1 ? "draft_complete" : "draft_in_progress"
      })
      
      if (result.success) {
        console.log(`Updated existing draft: ${result.proposalNumber}`)
      }
    } catch (error) {
      console.error('Error updating existing draft:', error)
    } finally {
      setIsSavingDraft(false)
    }
  }

  // Debounced auto-save function
  const debouncedSave = useMemo(
    () => debounce(async (formData: ProposalFormData, currentStep: number) => {
      if (isValidForDraft(formData)) {
        if (draftState.proposalId) {
          // Update existing draft
          await updateExistingDraft(draftState.proposalId, formData)
        } else {
          // Create new draft
          await createNewDraft(formData)
        }
      }
      // Always save to localStorage as backup
      saveDraftToStorage(formData, currentStep, draftState.proposalId)
      setLastSavedTime(new Date())
    }, 2000),
    [draftState.proposalId]
  )

  // Auto-save form data whenever it changes
  useEffect(() => {
    if (formData.customer.name || formData.customer.email || formData.services.length > 0 || currentStep > 0) {
      debouncedSave(formData, currentStep)
    }
  }, [formData, currentStep, debouncedSave])

  // Restore draft data on page load (only if not editing an existing proposal)
  useEffect(() => {
    if (!proposalId && !isDraftRestored) {
      const savedDraft = loadDraftFromStorage()
      
      if (savedDraft) {
        // Only restore if we don't already have data (prevents overwriting URL-loaded proposals)
        const hasExistingData = formData.customer.name || formData.customer.email || formData.services.length > 0
        
        if (!hasExistingData) {
          setFormData(savedDraft.formData)
          setCurrentStep(savedDraft.currentStep)
          setDraftProposalId(savedDraft.draftProposalId)
          setIsDraftRestored(true)
          
          // Show user notification about restored data
          toast({
            title: "Draft Restored",
            description: "Your previous work has been restored. You can continue where you left off.",
            className: "bg-blue-50 border-blue-200"
          })
        }
      }
      
      setIsDraftRestored(true)
    }
  }, [proposalId, isDraftRestored, formData.customer.name, formData.customer.email, formData.services.length])

  // Save draft before user leaves the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Save any pending changes before the page unloads
      if (formData.customer.name || formData.customer.email || formData.services.length > 0 || currentStep > 0) {
        saveDraftToStorage(formData, currentStep, draftProposalId)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [formData, currentStep, draftProposalId])

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
            customer: {
              name: proposal.customer?.name || "",
              email: proposal.customer?.email || "",
              phone: proposal.customer?.phone || "",
              address: proposal.customer?.address || "",
              repFirstName: (proposal as any).rep_first_name || "",
              repLastName: (proposal as any).rep_last_name || "",
              repPhone: (proposal as any).rep_phone || "",
            },
            services: proposal.services,
            products: proposal.products,
            pricing: proposal.pricing,
            selectedOffers: [],
            customizedOffers: [],
            id: proposal.id,
            proposalNumber: proposal.proposalNumber,
          })
          // Set the draft proposal ID if editing
          setDraftProposalId(proposal.id)
          
          // Clear any localStorage draft when loading an existing proposal
          clearDraftFromStorage()
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

  // Simplified function to create or update a draft proposal
  const createOrUpdateDraftProposal = async (skipValidation = false) => {
    try {
      // Skip saving if we don't have valid data and validation is required
      if (!skipValidation && !isValidForDraft(formData)) {
        return null
      }

      setIsSavingDraft(true)

      // Use the improved draft logic
      if (draftState.proposalId) {
        // Update existing draft
        await updateExistingDraft(draftState.proposalId, formData)
        return {
          success: true,
          proposalId: draftState.proposalId,
          proposalNumber: draftState.proposalNumber,
          isDuplicate: draftState.isExistingDraft
        }
      } else {
        // Create new draft
        await createNewDraft(formData)
        return {
          success: true,
          proposalId: draftState.proposalId,
          proposalNumber: draftState.proposalNumber,
          isDuplicate: false
        }
      }
    } catch (error) {
      console.error("Error in createOrUpdateDraftProposal:", error)
      return {
        success: false,
        error: "Failed to save proposal"
      }
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
      if (draftState.proposalId) {
        try {
          const response = await fetch(`/api/proposals/${draftState.proposalId}`)
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
        // Clear localStorage draft on successful submission
        clearDraftFromStorage()
        
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

  const updateSelectedOffers = useCallback((offerIds: number[], customizedOffers?: CustomizedOffer[]) => {
    setFormData((prev) => {
      const hasOffersChanged = JSON.stringify(prev.selectedOffers) !== JSON.stringify(offerIds)
      const hasCustomizedChanged = JSON.stringify(prev.customizedOffers) !== JSON.stringify(customizedOffers || [])
      
      if (!hasOffersChanged && !hasCustomizedChanged) {
        return prev // No change
      }
      return { 
        ...prev, 
        selectedOffers: offerIds,
        customizedOffers: customizedOffers || []
      }
    })
  }, [])

  // Function to clear draft and start fresh
  const clearDraftAndStartFresh = useCallback(() => {
    clearDraftFromStorage()
    setFormData({
      customer: {
        name: "",
        address: "",
        email: "",
        phone: "",
        repFirstName: "",
        repLastName: "",
        repPhone: "",
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
      customizedOffers: [],
    })
    setCurrentStep(0)
    setDraftProposalId(null)
    setLastSavedTime(null)
    setIsDraftRestored(false)
    toast({
      title: "Draft Cleared",
      description: "Starting fresh with a new proposal.",
      className: "bg-orange-50 border-orange-200"
    })
  }, [])

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6">
        {/* Header Card */}
        <Card className="shadow-xl rounded-xl overflow-hidden bg-white border-0">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
              <div>
                <CardTitle className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center">
                  <Plus className="w-8 h-8 mr-3" />
                  Create New Proposal
                </CardTitle>
                <p className="text-green-100 text-sm sm:text-base">
                  Generate a detailed sales proposal for your customer
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="mb-6 overflow-hidden border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-gray-800">Proposal Progress</CardTitle>
              {/* Draft status indicator */}
              <div className="flex items-center gap-3">
                {draftState.proposalId && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                      {draftState.proposalNumber}
                    </div>
                    {draftState.isExistingDraft && (
                      <span className="text-amber-600 text-xs">Continuing existing draft</span>
                    )}
                  </div>
                )}
                {lastSavedTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Auto-saved {lastSavedTime.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>
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
                <EnhancedRepOfferSelector
                  services={formData.services}
                  selectedOffers={formData.selectedOffers}
                  customizedOffers={formData.customizedOffers}
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
                        Create Proposal
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
                {draftState.proposalId && (
                  <p className="text-xs text-emerald-600 text-center mt-1">
                    {draftState.isExistingDraft ? 'Updating' : 'Draft saved'}: {draftState.proposalNumber}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
