"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, AlertCircle, Calculator, Sparkles, TrendingUp, ShieldCheck, Clock, CheckCircle, XCircle, Plus, Percent, DollarSign, UserMinus, AlertTriangle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import FinancingSelector from "./financing-selector"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/hooks/use-toast"
import { createProposal } from "@/app/actions/proposal-actions"
import { 
  calculateMonthlyPaymentWithFactor, 
  calculateMonthlyPayment,
  calculateTotalWithAdjustments,
  formatCurrency
} from "@/lib/financial-utils"

// Define discount types interface
interface DiscountType {
  id: string
  name: string
  defaultAmount: number
  category: string
  isEnabled: boolean
  amount: number
  percentageValue: number
  priority: number
  isSystemGenerated?: boolean
}

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

interface CustomAdder {
  id?: number
  product_category: string
  description: string
  cost: number
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
  pricingOverride: boolean
  pricingBreakdown: Record<string, any>
  customAdders: CustomAdder[]
  discountTypes: DiscountType[]
  discountLog: { timestamp: number, userId: number, discountType: string, previousValue: number, newValue: number }[]
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

// Define default discount types with their values and enhanced properties
const DEFAULT_DISCOUNT_TYPES: DiscountType[] = [
  { id: 'military', name: 'Military Discount', defaultAmount: 500, category: 'Customer Type', isEnabled: false, amount: 0, percentageValue: 0, priority: 1 },
  { id: 'senior', name: 'Senior Discount', defaultAmount: 500, category: 'Customer Type', isEnabled: false, amount: 0, percentageValue: 0, priority: 1 },
  { id: 'disability', name: 'Disability Discount', defaultAmount: 500, category: 'Customer Type', isEnabled: false, amount: 0, percentageValue: 0, priority: 1 },
  { id: 'education', name: 'Education/Teacher Discount', defaultAmount: 500, category: 'Customer Type', isEnabled: false, amount: 0, percentageValue: 0, priority: 1 },
  { id: 'repeat', name: 'Repeat Customer Discount', defaultAmount: 750, category: 'Loyalty', isEnabled: false, amount: 0, percentageValue: 0, priority: 2 },
  { id: 'bundle-two', name: 'Two-Product Bundle Discount', defaultAmount: 1000, category: 'Bundle', isEnabled: false, amount: 0, percentageValue: 0, isSystemGenerated: true, priority: 3 },
  { id: 'bundle-three', name: 'Three-or-More Product Bundle Discount', defaultAmount: 1750, category: 'Bundle', isEnabled: false, amount: 0, percentageValue: 0, isSystemGenerated: true, priority: 3 },
  { id: 'auto-bundle', name: 'Service Bundle Discount', defaultAmount: 0, category: 'Bundle', isEnabled: false, amount: 0, percentageValue: 0, isSystemGenerated: true, priority: 4 }
]

function PricingBreakdownForm({ services, products, data, updateData, proposalId, userId, customerData, fullFormData }: PricingBreakdownFormProps) {
  // Use a ref to track if we've already updated the parent
  const hasUpdatedRef = useRef(false)
  // Add a ref to prevent concurrent discount updates
  const isUpdatingDiscount = useRef(false)
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
  
  // New state to track if total discount field was directly edited (vs individual discounts)
  const [totalDiscountFieldEdited, setTotalDiscountFieldEdited] = useState(false)
  
  // Custom adder state
  const [newCustomAdder, setNewCustomAdder] = useState<CustomAdder>({
    product_category: '',
    description: '',
    cost: 0
  })
  const [showAddAdderForm, setShowAddAdderForm] = useState<string | null>(null)
  
  // Debug tracking
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({})

  // Discount management UI state
  const [activeDiscountTab, setActiveDiscountTab] = useState<string>("dollar")
  const [selectedDiscountForEdit, setSelectedDiscountForEdit] = useState<string | null>(null)

  // Calculate initial values only once
  const initialSubtotal = useRef(calculateSubtotal(services, data?.customAdders))
  const initialDiscount = useRef(calculateDiscount(services))

  // Initialize state with proper initial values
  const [formData, setFormData] = useState<PricingData>(() => {
    const subtotal = data.subtotal !== undefined ? data.subtotal : initialSubtotal.current
    const discount = data.discount !== undefined ? data.discount : initialDiscount.current
    const total = subtotal - discount
    const term = data.financingTerm || 60
    const rate = data.interestRate || 5.99
    const discountTypes = data.discountTypes || DEFAULT_DISCOUNT_TYPES.map(type => ({...type}))

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
      paymentFactor: data.paymentFactor,
      pricingOverride: data.pricingOverride !== undefined ? data.pricingOverride : false,
      pricingBreakdown: data.pricingBreakdown || {},
      customAdders: data.customAdders || [],
      discountTypes: discountTypes,
      discountLog: data.discountLog || []
    }
  })

  // Real-time sync effect - ensures all calculated values stay in sync
  useEffect(() => {
    // Prevent infinite update loops by checking for concurrent updates
    if (hasUpdatedRef.current || isUpdatingDiscount.current) return;

    // Skip calculation if using override
    if (formData.pricingOverride) return;

    const total = formData.subtotal - formData.discount;
    
    // Check if total needs to be updated and the difference is significant
    // Only update if the difference is more than a penny to avoid rounding issues
    if (Math.abs(total - formData.total) > 0.01) {
      isUpdatingDiscount.current = true;
      
      // Use setTimeout to avoid rapid consecutive updates
      setTimeout(() => {
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
        
        // Mark that we need to update the parent, but with a delay to prevent cascading updates
        setTimeout(() => {
          hasUpdatedRef.current = false;
          isUpdatingDiscount.current = false;
        }, 50);
      }, 100);
    }
  }, [formData.subtotal, formData.discount, formData.financingPlanId, financingPlans, formData.pricingOverride, formData.total]);

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

  // Calculate subtotal based on services and custom adders
  function calculateSubtotal(serviceList: string[], customAdders?: CustomAdder[]): number {
    let subtotal = 0
    
    // Get product prices from the products object if available
    if (products) {
      // Use the product-specific pricing instead of hard-coded values
      if (serviceList.includes("roofing") && products.roofing) {
        const roofPrice = parseFloat(products.roofing.totalPrice) || 0
        const gutterPrice = parseFloat(products.roofing.gutterPrice) || 0
        const downspoutPrice = parseFloat(products.roofing.downspoutPrice) || 0
        subtotal += roofPrice + gutterPrice + downspoutPrice
      }
      
      if (serviceList.includes("hvac") && products.hvac) {
        const systemCost = parseFloat(products.hvac.systemCost) || 0
        const ductworkCost = parseFloat(products.hvac.ductworkCost) || 0
        subtotal += systemCost + ductworkCost
      }
      
      if (serviceList.includes("windows-doors") && products["windows-doors"]) {
        const windowsPrice = parseFloat(products["windows-doors"].windowPrice) || 0
        const doorPrices = products["windows-doors"].doorPrices || {}
        const doorTotal = Object.values(doorPrices).reduce((sum: number, price: any) => 
          sum + (parseFloat(String(price)) || 0), 0)
        subtotal += windowsPrice + doorTotal
      }
      
      if (serviceList.includes("garage-doors") && products["garage-doors"]) {
        const basePrice = parseFloat(products["garage-doors"].totalPrice) || 0
        const addonPrices = products["garage-doors"].addonPrices || {}
        const addonTotal = Object.values(addonPrices).reduce((sum: number, price: any) => 
          sum + (parseFloat(String(price)) || 0), 0)
        subtotal += basePrice + addonTotal
      }
      
      if (serviceList.includes("paint") && products.paint) {
        // Use the product's totalPrice if available
        subtotal += parseFloat(products.paint.totalPrice) || 0;
      }
    }
    
    // Add custom adders if any exist
    if (customAdders?.length) {
      subtotal += customAdders.reduce((sum, adder) => sum + adder.cost, 0)
    }
    
    return subtotal
  }

  // Calculate discount based on services
  function calculateDiscount(serviceList: string[]): number {
    let discount = 0
    
    // Don't calculate discount if no products are available
    if (!products) return discount
    
    // Calculate bundle discounts based on selected services and their actual prices
    if (serviceList.includes("roofing") && serviceList.includes("windows-doors")) {
      const roofPrice = products.roofing ? 
        (parseFloat(products.roofing.totalPrice) || 0) + 
        (parseFloat(products.roofing.gutterPrice) || 0) + 
        (parseFloat(products.roofing.downspoutPrice) || 0) : 0
      const windowsDoorsPrice = products["windows-doors"] ? 
        (parseFloat(products["windows-doors"].windowPrice) || 0) + 
        Object.values(products["windows-doors"].doorPrices || {}).reduce((sum: number, price: any) => 
          sum + (parseFloat(String(price)) || 0), 0) : 0
      
      // Apply 5% discount to the combined roofing and windows-doors price
      discount += 0.05 * (roofPrice + windowsDoorsPrice)
    }
    
    if (serviceList.includes("hvac") && serviceList.length > 1) {
      const hvacPrice = products.hvac ? 
        (parseFloat(products.hvac.systemCost) || 0) + 
        (parseFloat(products.hvac.ductworkCost) || 0) : 0
      
      // Apply 3% discount to HVAC when bundled with other services
      discount += 0.03 * hvacPrice
    }
    
    return discount
  }

  // Calculate the total discount amount from all enabled discount types with priority handling
  function calculateTotalDiscountsFromTypes(): number {
    // Group discounts by priority and handle conflicts
    const enabledDiscounts = formData.discountTypes.filter(discount => discount.isEnabled);
    
    // Sort by priority (higher priority = later in array = takes precedence)
    const sortedDiscounts = enabledDiscounts.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    
    return sortedDiscounts.reduce((total, discount) => total + discount.amount, 0);
  }

  // Enhanced discount calculation that properly manages bundle discounts
  function calculateAndApplyBundleDiscount(serviceList: string[]): void {
    if (!products || serviceList.length < 2) {
      // Clear any existing auto-bundle discount
      setFormData(prev => ({
        ...prev,
        discountTypes: prev.discountTypes.map(type => 
          type.id === 'auto-bundle' ? { ...type, isEnabled: false, amount: 0 } : type
        )
      }));
      return;
    }

    const bundleDiscount = calculateDiscount(serviceList);
    
    if (bundleDiscount > 0) {
      setFormData(prev => {
        const updatedDiscountTypes = prev.discountTypes.map(type => {
          if (type.id === 'auto-bundle') {
            return { 
              ...type, 
              isEnabled: true, 
              amount: bundleDiscount,
              percentageValue: prev.subtotal > 0 ? (bundleDiscount / prev.subtotal) * 100 : 0
            };
          }
          return type;
        });

        // Calculate total discount including the new bundle discount
        const totalDiscount = updatedDiscountTypes
          .filter(d => d.isEnabled)
          .reduce((sum, d) => sum + d.amount, 0);

        return {
          ...prev,
          discountTypes: updatedDiscountTypes,
          discount: totalDiscount
        };
      });
    }
  }

  // New function to resolve conflicts between different discount types
  function resolveDiscountConflicts(discountTypes: DiscountType[], changedDiscountId: string): DiscountType[] {
    const changedDiscount = discountTypes.find(d => d.id === changedDiscountId);
    if (!changedDiscount) return discountTypes;

    // Rule 1: Only one customer type discount can be active
    if (changedDiscount.category === 'Customer Type' && changedDiscount.isEnabled) {
      return discountTypes.map(type => {
        if (type.category === 'Customer Type' && type.id !== changedDiscountId) {
          return { ...type, isEnabled: false, amount: 0 };
        }
        return type;
      });
    }

    // Rule 2: Bundle discounts are mutually exclusive (except auto-bundle)
    if (changedDiscount.category === 'Bundle' && changedDiscount.isEnabled && !changedDiscount.isSystemGenerated) {
      return discountTypes.map(type => {
        if (type.category === 'Bundle' && type.id !== changedDiscountId && !type.isSystemGenerated) {
          return { ...type, isEnabled: false, amount: 0 };
        }
        return type;
      });
    }

    return discountTypes;
  }

  // Helper function to sync discount systems and recalculate totals
  const syncDiscountSystems = useCallback((newDiscountAmount: number, updatedDiscountTypes?: DiscountType[]) => {
    setFormData(prev => {
      const newSubtotal = prev.subtotal;
      const newTotal = newSubtotal - newDiscountAmount;
      
      // Calculate new monthly payment
      let newMonthlyPayment = prev.monthlyPayment;
      if (prev.financingPlanId) {
        const selectedPlan = financingPlans.find(plan => plan.id === prev.financingPlanId);
        if (selectedPlan) {
          newMonthlyPayment = calculateMonthlyPaymentWithFactor(newTotal, selectedPlan.payment_factor);
        } else {
          newMonthlyPayment = calculateMonthlyPayment(newTotal, prev.financingTerm, prev.interestRate);
        }
      } else {
        newMonthlyPayment = calculateMonthlyPayment(newTotal, prev.financingTerm, prev.interestRate);
      }
      
      return {
        ...prev,
        discount: newDiscountAmount,
        total: newTotal,
        monthlyPayment: newMonthlyPayment,
        ...(updatedDiscountTypes && { discountTypes: updatedDiscountTypes })
      };
    });
    
    // Mark that we need to update the parent
    hasUpdatedRef.current = false;
  }, [financingPlans]);

  // Helper function to calculate discount percentage based on services subtotal (not including custom adders)
  const calculateDiscountPercentage = useCallback((discountAmount: number) => {
    const servicesSubtotal = calculateSubtotal(services, []); // No custom adders
    return servicesSubtotal > 0 ? (discountAmount / servicesSubtotal) * 100 : 0;
  }, [services]);

  // Handle toggling a discount type on or off
  const handleToggleDiscountType = (discountId: string, isEnabled: boolean) => {
    // Prevent concurrent discount updates to avoid state thrashing
    if (isUpdatingDiscount.current) return;
    isUpdatingDiscount.current = true;

    // Update the discount types array
    const updatedDiscountTypes = formData.discountTypes.map(discount => {
      if (discount.id === discountId) {
        // If enabling, set the amount to default; if disabling, set to 0
        const newAmount = isEnabled ? discount.defaultAmount : 0;
        
        // Log this discount change
        const discountLog = [...formData.discountLog, {
          timestamp: Date.now(),
          userId: userId || 0,
          discountType: discount.id,
          previousValue: discount.amount,
          newValue: newAmount
        }];

        return { 
          ...discount, 
          isEnabled, 
          amount: newAmount,
          percentageValue: formData.subtotal > 0 ? (newAmount / formData.subtotal) * 100 : 0
        };
      }
      return discount;
    });

    // IMPORTANT: Only apply conflict resolution after toggling
    const resolvedDiscountTypes = resolveDiscountConflicts(updatedDiscountTypes, discountId);

    // Calculate the new total discount
    const totalDiscount = resolvedDiscountTypes
      .filter(d => d.isEnabled)
      .reduce((sum, d) => sum + d.amount, 0);

    // Update the form data with new discount types and sync main discount field
    setFormData(prev => {
      const newSubtotal = prev.subtotal;
      const newTotal = newSubtotal - totalDiscount;
      
      // Calculate new monthly payment
      let newMonthlyPayment = prev.monthlyPayment;
      if (prev.financingPlanId) {
        const selectedPlan = financingPlans.find(plan => plan.id === prev.financingPlanId);
        if (selectedPlan) {
          newMonthlyPayment = calculateMonthlyPaymentWithFactor(newTotal, selectedPlan.payment_factor);
        } else {
          newMonthlyPayment = calculateMonthlyPayment(newTotal, prev.financingTerm, prev.interestRate);
        }
      } else {
        newMonthlyPayment = calculateMonthlyPayment(newTotal, prev.financingTerm, prev.interestRate);
      }
      
      return {
        ...prev,
        discountTypes: resolvedDiscountTypes,
        discount: totalDiscount,
        total: newTotal,
        monthlyPayment: newMonthlyPayment
      };
    });

    // Simplified flag management - ONLY mark manually edited in specific cases
    // Mark discount as manually edited only when manually disabling an auto-bundle discount
    if (discountId === 'auto-bundle' && !isEnabled) {
      setDiscountManuallyEdited(true);
      setTotalDiscountFieldEdited(true);
    } 
    // Otherwise, just leave the flags alone - don't reset them
    // This prevents "fighting" between auto and manual discounts

    // Update the parent with the new data
    hasUpdatedRef.current = false;
    
    // Release the update lock after a short delay
    setTimeout(() => {
      isUpdatingDiscount.current = false;
    }, 100);
  };

  // Handle updating a discount amount (dollar value) with enhanced approval logic
  const handleUpdateDiscountAmount = (discountId: string, amount: number) => {
    // Prevent concurrent discount updates
    if (isUpdatingDiscount.current) return;
    isUpdatingDiscount.current = true;

    const discountType = formData.discountTypes.find(d => d.id === discountId);
    if (!discountType) {
      isUpdatingDiscount.current = false;
      return;
    }

    // Only mark as manually edited for non-system discounts
    // and only when changing auto-bundle discount
    if (!discountType.isSystemGenerated && discountId === 'auto-bundle') {
      setTotalDiscountFieldEdited(true);
    }

    // FIXED: Individual discount types are pre-approved by default
    // Only non-standard discounts should require approval
    const isPreApprovedDiscount = discountType.category === 'Customer Type' || 
                                discountType.category === 'Loyalty' || 
                                discountType.category === 'Bundle' ||
                                discountType.isSystemGenerated;

    // Only check permissions for non-pre-approved discounts
    // FIXED: Skip approval entirely for pre-approved discount types
    // Pre-approved types will never trigger toast messages
    if (!isPreApprovedDiscount && userPermissions) {
      const discountPercent = formData.subtotal > 0 ? (amount / formData.subtotal) * 100 : 0;
      
      if (discountPercent > userPermissions.maxDiscountPercent) {
        setPendingDiscount(amount);
        setShowApprovalDialog(true);
        
        toast({
          title: "Approval Required",
          description: `Discount of ${discountPercent.toFixed(1)}% exceeds your limit of ${userPermissions.maxDiscountPercent}%. Manager approval is required.`,
          variant: "destructive"
        });
        
        isUpdatingDiscount.current = false;
        return;
      }
    }

    // Update the discount type with new amount
    const updatedDiscountTypes = formData.discountTypes.map(discount => {
      if (discount.id === discountId) {
        return { 
          ...discount, 
          amount,
          percentageValue: formData.subtotal > 0 ? (amount / formData.subtotal) * 100 : 0
        };
      }
      return discount;
    });

    // ENHANCED: Smart conflict resolution
    const resolvedDiscountTypes = resolveDiscountConflicts(updatedDiscountTypes, discountId);
    
    // Calculate new total
    const totalDiscount = resolvedDiscountTypes
      .filter(d => d.isEnabled)
      .reduce((sum, d) => sum + d.amount, 0);

    // Update the form data with resolved discount types and sync main discount field
    setFormData(prev => {
      const newSubtotal = prev.subtotal;
      const newTotal = newSubtotal - totalDiscount;
      
      // Calculate new monthly payment
      let newMonthlyPayment = prev.monthlyPayment;
      if (prev.financingPlanId) {
        const selectedPlan = financingPlans.find(plan => plan.id === prev.financingPlanId);
        if (selectedPlan) {
          newMonthlyPayment = calculateMonthlyPaymentWithFactor(newTotal, selectedPlan.payment_factor);
        } else {
          newMonthlyPayment = calculateMonthlyPayment(newTotal, prev.financingTerm, prev.interestRate);
        }
      } else {
        newMonthlyPayment = calculateMonthlyPayment(newTotal, prev.financingTerm, prev.interestRate);
      }
      
      return {
        ...prev,
        discountTypes: resolvedDiscountTypes,
        discount: totalDiscount,
        total: newTotal,
        monthlyPayment: newMonthlyPayment,
        discountLog: [
          ...prev.discountLog,
          {
            timestamp: Date.now(),
            userId: userId || 0,
            discountType: discountId,
            previousValue: prev.discountTypes.find(d => d.id === discountId)?.amount || 0,
            newValue: amount
          }
        ]
      };
    });

    // Update the parent with the new data
    hasUpdatedRef.current = false;
    
    // Release the update lock after a short delay
    setTimeout(() => {
      isUpdatingDiscount.current = false;
    }, 100);
  };

  // Handle updating a discount percentage
  const handleUpdateDiscountPercentage = (discountId: string, percentage: number) => {
    // Calculate based on services subtotal only (no custom adders) for more consistent percentage calculations
    const servicesSubtotal = calculateSubtotal(services, []); // Empty array = no custom adders
    const amount = (percentage / 100) * servicesSubtotal;
    
    // Use the dollar amount handler
    handleUpdateDiscountAmount(discountId, amount);
  };

  // Calculate monthly payment using financing plan's payment factor
  function calculateMonthlyPaymentWithFactorLocal(total: number, paymentFactor: number): number {
    return calculateMonthlyPaymentWithFactor(total, paymentFactor);
  }

  // Calculate monthly payment using standard amortization formula (fallback)
  function calculateMonthlyPaymentLocal(total: number, term: number, rate: number): number {
    return calculateMonthlyPayment(total, term, rate);
  }

  // Enhanced manual discount handler with improved approval logic and conflict resolution
  const handleDiscountChange = useCallback(async (value: number) => {
    // Prevent concurrent discount updates to avoid state thrashing
    if (isUpdatingDiscount.current) return;
    isUpdatingDiscount.current = true;
    
    // Mark that total discount field was directly edited
    setTotalDiscountFieldEdited(true);
    // Also set the broader flag
    setDiscountManuallyEdited(true);
    
    // ENHANCED APPROVAL LOGIC: Manual discount field ALWAYS requires approval if exceeding threshold
    // This is different from individual discount types which are pre-approved
    
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
      
      // Apply the change directly rather than calling handleChange
      setFormData(prev => {
        const newTotal = prev.subtotal - value;
        
        // Calculate new monthly payment
        let newMonthlyPayment = prev.monthlyPayment;
        if (prev.financingPlanId) {
          const selectedPlan = financingPlans.find(plan => plan.id === prev.financingPlanId);
          if (selectedPlan) {
            newMonthlyPayment = calculateMonthlyPaymentWithFactor(newTotal, selectedPlan.payment_factor);
          } else {
            newMonthlyPayment = calculateMonthlyPayment(newTotal, prev.financingTerm, prev.interestRate);
          }
        } else {
          newMonthlyPayment = calculateMonthlyPayment(newTotal, prev.financingTerm, prev.interestRate);
        }
        
        return {
          ...prev,
          discount: value,
          total: newTotal,
          monthlyPayment: newMonthlyPayment
        };
      });
      
      // Release the update lock after a short delay
      setTimeout(() => {
        isUpdatingDiscount.current = false;
      }, 100);
      
      // Mark that we need to update the parent
      hasUpdatedRef.current = false;
      return
    }

    const discountPercent = formData.subtotal > 0 ? (value / formData.subtotal) * 100 : 0
    
    // Manual discount field ALWAYS requires approval if exceeding threshold (unlike individual discounts)
    if (discountPercent > userPermissions.maxDiscountPercent) {
      setPendingDiscount(value)
      setShowApprovalDialog(true)
      
      toast({
        title: "Approval Required",
        description: `Manual discount of ${discountPercent.toFixed(1)}% exceeds your limit of ${userPermissions.maxDiscountPercent}%. Manager approval is required.`,
        variant: "destructive"
      })
      
      // Release the update lock after a short delay
      setTimeout(() => {
        isUpdatingDiscount.current = false;
      }, 100);
      return
    }
    
    // ENHANCED: Preserve system-generated discounts, only clear manual ones
    const preservedDiscountTypes = formData.discountTypes.map(type => {
      if (type.isSystemGenerated) {
        // Keep system-generated discounts (like auto-bundle)
        return type;
      } else {
        // Clear manual discount types to avoid conflicts
        return {
          ...type,
          isEnabled: false,
          amount: 0
        };
      }
    });

    // Calculate the difference between manual value and system discounts
    const systemDiscountTotal = preservedDiscountTypes
      .filter(d => d.isEnabled && d.isSystemGenerated)
      .reduce((sum, d) => sum + d.amount, 0);

    const manualDiscountAmount = Math.max(0, value - systemDiscountTotal);
    
    // Apply discount normally if within threshold and update discount log
    setFormData(prev => ({
      ...prev,
      discount: value,
      discountTypes: preservedDiscountTypes,
      discountLog: [
        ...prev.discountLog,
        {
          timestamp: Date.now(),
          userId: userId || 0,
          discountType: "manual",
          previousValue: prev.discount,
          newValue: value
        }
      ]
    }))
    
    // Mark that we need to update the parent
    hasUpdatedRef.current = false
    
    // Release the update lock after a short delay
    setTimeout(() => {
      isUpdatingDiscount.current = false;
    }, 100);
  }, [formData.subtotal, userPermissions, userId])

  // Handle user input changes
  const handleChange = useCallback((field: keyof PricingData, value: any) => {
    setFormData((prev) => {
      // If the value hasn't changed, don't update state
      if (prev[field] === value) return prev

      const newData = { ...prev, [field]: value }

      // Recalculate total and monthly payment when relevant fields change
      if (field === "subtotal" || field === "discount") {
        // Simple subtotal - discount calculation (no double-subtracting)
        const subtotal = field === "subtotal" ? value : prev.subtotal;
        const discount = field === "discount" ? value : prev.discount;
        const total = subtotal - discount;
        
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
  
  // Enhanced effect to auto-apply bundle discounts
  useEffect(() => {
    // Only auto-apply bundle discounts if:
    // 1. We have multiple services
    // 2. Total discount field wasn't directly edited
    // 3. Not currently updating discounts
    if (services.length >= 2 && !totalDiscountFieldEdited && !isUpdatingDiscount.current) {
      // Use a timeout to avoid rapid consecutive updates
      setTimeout(() => {
        // Double-check we're still not in an update (safety check)
        if (!isUpdatingDiscount.current) {
          isUpdatingDiscount.current = true;
          calculateAndApplyBundleDiscount(services);
          setTimeout(() => {
            isUpdatingDiscount.current = false;
          }, 100);
        }
      }, 150);
    }
  }, [services, products, totalDiscountFieldEdited]);

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
                
                // If the proposal has discount types, update them too
                if (proposalData.pricing.discountTypes) {
                  setFormData(prev => ({
                    ...prev,
                    discountTypes: proposalData.pricing.discountTypes,
                    discount: newDiscount
                  }))
                }
                
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
  }, [proposalId, handleChange, formData.discount, formData.discountTypes])

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
      let actualProposalId = proposalId
      
      // Only create a new proposal if we don't have one yet
      if (!actualProposalId) {
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
          status: "draft_discount_review" // Special status to indicate this is for discount review
        }
        
        console.log('Saving proposal with customer data:', effectiveCustomerData)
        
        // First, save the proposal as draft to ensure we have a valid proposal ID
        console.log('Saving proposal as draft before approval request')
        const saveResult = await createProposal(entireFormData)
        
        if (!saveResult.success) {
          console.error('Failed to save proposal before approval request:', saveResult.error)
          throw new Error('Failed to save proposal before requesting approval')
        }
        
        actualProposalId = saveResult.proposalId
        console.log('Proposal saved with ID:', actualProposalId)
      } else {
        // If we already have a proposal ID, update it with the latest pricing data
        console.log('Using existing proposal ID for approval request:', actualProposalId)
        
        // Update the existing proposal with latest pricing data
        const updateData = {
          id: actualProposalId.toString(),
          customer: customerData || fullFormData?.customer || { name: "Unknown", email: "unknown@example.com" },
          services: services,
          products: products,
          pricing: formData,
          status: "draft_discount_review"
        }
        
        const updateResult = await createProposal(updateData)
        
        if (!updateResult.success) {
          console.error('Failed to update proposal:', updateResult.error)
          // Continue with the existing ID even if update fails
        }
      }
      
      // Ensure actualProposalId is defined before proceeding
      if (!actualProposalId) {
        throw new Error('Failed to obtain a valid proposal ID');
      }
      
      const discountPercent = formData.subtotal > 0 ? (pendingDiscount / formData.subtotal) * 100 : 0
      
      const requestData = {
        proposalId: actualProposalId,
        requestorId: userId,
        requestType: 'discount',
        originalValue: formData.discount,
        requestedValue: pendingDiscount,
        notes: approvalNotes,
        discountPercent: discountPercent.toFixed(1),
        userMaxPercent: userPermissions?.maxDiscountPercent || 0,
        // Include discount types information
        discountTypes: formData.discountTypes.filter(d => d.isEnabled).map(d => ({
          id: d.id,
          name: d.name,
          amount: d.amount,
          percentageValue: formData.subtotal > 0 ? (d.amount / formData.subtotal) * 100 : 0
        })),
        discountLog: formData.discountLog
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
      if (!proposalId && actualProposalId) {
        // This will be used for the UI to show the proposal is pending approval
        window.localStorage.setItem('pendingApprovalProposalId', actualProposalId.toString())
      }
      
      setPendingApprovalRequest({
        id: result.requestId,
        requestedValue: pendingDiscount,
        approverName: result.approverName,
        status: 'pending',
        proposalId: actualProposalId
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
    const newSubtotal = calculateSubtotal(services, formData?.customAdders)
    const newBundleDiscount = calculateDiscount(services)

    // Only update if values have actually changed significantly
    if (Math.abs(formData.subtotal - newSubtotal) > 0.01) {
      setFormData((prev) => {
        let newDiscount = prev.discount
        
        // Only auto-update discount if it hasn't been manually edited
        // and if we don't have any enabled individual discount types
        const hasEnabledDiscountTypes = prev.discountTypes?.some(d => d.isEnabled) || false;
        if (!discountManuallyEdited && !hasEnabledDiscountTypes) {
          newDiscount = newBundleDiscount;
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

  // Send updated data to parent component when it changes
  useEffect(() => {
    if (hasUpdatedRef.current) return;
    
    // Throttle updates to parent - only update when values actually changed
    const throttledUpdate = setTimeout(() => {
      updateData({
        subtotal: formData.subtotal,
        discount: formData.discount,
        total: formData.total,
        monthlyPayment: formData.monthlyPayment,
        showLineItems: formData.showLineItems,
        financingTerm: formData.financingTerm,
        interestRate: formData.interestRate,
        financingPlanId: formData.financingPlanId,
        financingPlanName: formData.financingPlanName,
        merchantFee: formData.merchantFee,
        financingNotes: formData.financingNotes,
        paymentFactor: formData.paymentFactor,
        pricingOverride: formData.pricingOverride,
        pricingBreakdown: formData.pricingBreakdown,
        customAdders: formData.customAdders,
        // Include discount types in the update data
        discountTypes: formData.discountTypes,
        discountLog: formData.discountLog
      });
      
      hasUpdatedRef.current = true;
    }, 300); // Small delay to prevent rapid updates
    
    return () => clearTimeout(throttledUpdate);
  }, [formData, updateData]);

  // Handle adding a custom adder
  const handleAddCustomAdder = (category: string) => {
    if (!newCustomAdder.description || newCustomAdder.cost <= 0) {
      toast({
        title: "Invalid Custom Adder",
        description: "Please provide a description and valid cost amount.",
        variant: "destructive"
      })
      return
    }
    
    const adder: CustomAdder = {
      product_category: category,
      description: newCustomAdder.description,
      cost: newCustomAdder.cost
    }
    
    setFormData(prev => {
      const updatedCustomAdders = [...(prev.customAdders || []), adder]
      
      // Recalculate subtotal with the new adder
      const newSubtotal = calculateSubtotal(services, updatedCustomAdders)
      const newTotal = newSubtotal - prev.discount
      
      // Calculate new monthly payment
      let newMonthlyPayment = prev.monthlyPayment
      if (prev.financingPlanId) {
        const selectedPlan = financingPlans.find(plan => plan.id === prev.financingPlanId)
        if (selectedPlan) {
          newMonthlyPayment = calculateMonthlyPaymentWithFactor(newTotal, selectedPlan.payment_factor)
        } else {
          newMonthlyPayment = calculateMonthlyPayment(newTotal, prev.financingTerm, prev.interestRate)
        }
      } else {
        newMonthlyPayment = calculateMonthlyPayment(newTotal, prev.financingTerm, prev.interestRate)
      }
      
      return {
        ...prev,
        customAdders: updatedCustomAdders,
        subtotal: newSubtotal,
        total: newTotal,
        monthlyPayment: newMonthlyPayment
      }
    })
    
    // Reset form
    setNewCustomAdder({
      product_category: '',
      description: '',
      cost: 0
    })
    setShowAddAdderForm(null)
    
    // Mark that we need to update the parent
    hasUpdatedRef.current = false
  }
  
  // Handle removing a custom adder
  const handleRemoveCustomAdder = (index: number) => {
    setFormData(prev => {
      const adderToRemove = prev.customAdders[index]
      const updatedCustomAdders = prev.customAdders.filter((_, i) => i !== index)
      
      // Recalculate subtotal without the removed adder
      const newSubtotal = calculateSubtotal(services, updatedCustomAdders)
      const newTotal = newSubtotal - prev.discount
      
      // Calculate new monthly payment
      let newMonthlyPayment = prev.monthlyPayment
      if (prev.financingPlanId) {
        const selectedPlan = financingPlans.find(plan => plan.id === prev.financingPlanId)
        if (selectedPlan) {
          newMonthlyPayment = calculateMonthlyPaymentWithFactor(newTotal, selectedPlan.payment_factor)
        } else {
          newMonthlyPayment = calculateMonthlyPayment(newTotal, prev.financingTerm, prev.interestRate)
        }
      } else {
        newMonthlyPayment = calculateMonthlyPayment(newTotal, prev.financingTerm, prev.interestRate)
      }
      
      return {
        ...prev,
        customAdders: updatedCustomAdders,
        subtotal: newSubtotal,
        total: newTotal,
        monthlyPayment: newMonthlyPayment
      }
    })
    
    // Mark that we need to update the parent
    hasUpdatedRef.current = false
  }
  
  // Toggle pricing override mode
  const handleToggleOverride = (enabled: boolean) => {
    setFormData(prev => {
      return {
        ...prev,
        pricingOverride: enabled
      }
    })
    
    // Mark that we need to update the parent
    hasUpdatedRef.current = false
  }

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
          {/* Pricing Override Toggle */}
          <div className="flex items-center justify-between bg-amber-50 p-3 rounded-md">
            <div className="flex items-center space-x-3">
              <Calculator className="h-5 w-5 text-amber-600" />
              <div>
                <h4 className="font-medium">Pricing Override</h4>
                <p className="text-sm text-amber-700">Manually set the total price instead of using the breakdown</p>
              </div>
            </div>
            <Switch
              checked={formData.pricingOverride}
              onCheckedChange={handleToggleOverride}
              className="data-[state=checked]:bg-amber-600"
            />
          </div>

          {/* Smart Bundle Alert */}
          {services.length > 1 && !formData.pricingOverride && (
            <Alert className="bg-green-50 border-green-200">
              <InfoIcon className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                <span className="font-medium">Bundle discount applied!</span> Combining {services.join(" and ")} saves the customer money.
              </AlertDescription>
            </Alert>
          )}

          {formData.pricingOverride ? (
            // Override mode - simple total input
            <div className="space-y-5 pt-2">
              <div className="flex justify-between items-center py-3 bg-amber-50 rounded-md px-3">
                <span className="text-gray-900 font-semibold">Override Total</span>
                <div className="relative w-36">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    value={formData.total.toFixed(2)}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value) || 0
                      handleChange("total", value)
                    }}
                    className="pl-8 text-right font-medium"
                  />
                </div>
              </div>
            </div>
          ) : (
            // Normal breakdown mode
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

              <div className="flex flex-col space-y-3">
                {/* Total discount display row */}
              <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">Total Discount</span>
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
                  {totalDiscountFieldEdited && (
                    <Badge variant="outline" className="text-xs">
                      Manual Override
                    </Badge>
                  )}
                  {totalDiscountFieldEdited && services.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const bundleDiscount = calculateDiscount(services);
                        setTotalDiscountFieldEdited(false);
                        setDiscountManuallyEdited(false);
                        handleChange("discount", bundleDiscount);
                        calculateAndApplyBundleDiscount(services);
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
                      const value = Number.parseFloat(e.target.value) || 0;
                      console.log('Discount input changed:', value);
                      handleDiscountChange(value);
                    }}
                    className={`pl-8 text-right font-medium ${totalDiscountFieldEdited ? "border-amber-300" : ""}`}
                    placeholder="0.00"
                    title="Manual discount entry - may require manager approval if exceeding your limit"
                  />
                </div>
              </div>

                {/* Enhanced Discount Management System */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    Discount Management
                                          {totalDiscountFieldEdited ? (
                      <Badge variant="outline" className="ml-2 text-xs bg-amber-50">
                        Manual Override Active
                      </Badge>
                    ) : services.length >= 2 ? (
                      <Badge variant="outline" className="ml-2 text-xs bg-green-50">
                        Auto Bundle Active
                      </Badge>
                    ) : null}
                  </h3>
                  
                  {/* Bundle Discount Status */}
                  {services.length >= 2 && (
                    <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-800">
                          🎯 Bundle discount available: ${calculateDiscount(services).toFixed(2)}
                        </span>
                        {/* Only show reset button if total field was edited manually or auto-bundle is disabled */}
                        {(totalDiscountFieldEdited || !formData.discountTypes.find(d => d.id === 'auto-bundle')?.isEnabled) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setTotalDiscountFieldEdited(false);
                              setDiscountManuallyEdited(false);
                              calculateAndApplyBundleDiscount(services);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Apply Bundle Discount
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Conflict warnings */}
                  {(() => {
                    const customerTypeDiscounts = formData.discountTypes.filter(d => 
                      d.category === 'Customer Type' && d.isEnabled
                    );
                    const bundleDiscounts = formData.discountTypes.filter(d => 
                      d.category === 'Bundle' && d.isEnabled && !d.isSystemGenerated
                    );
                    
                    return (
                      <>
                        {customerTypeDiscounts.length > 1 && (
                          <Alert className="mb-3">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Multiple Customer Discounts</AlertTitle>
                            <AlertDescription>
                              Only one customer type discount should be active. Consider combining or choosing the best option.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {bundleDiscounts.length > 1 && (
                          <Alert className="mb-3">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Multiple Bundle Discounts</AlertTitle>
                            <AlertDescription>
                              Multiple bundle discounts are active. This may result in excessive discounting.
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    );
                  })()}
                  
                  {/* Discount types accordion */}
                  <Accordion type="single" collapsible className="w-full">
                    {/* Group discounts by category */}
                    {['Customer Type', 'Loyalty', 'Bundle'].map(category => (
                      <AccordionItem value={category} key={category}>
                        <AccordionTrigger className="py-2 text-sm">
                          {category} Discounts
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {/* Display all discount types for this category */}
                            {formData.discountTypes
                              .filter(discount => discount.category === category)
                              .map(discount => (
                                <div key={discount.id} className="flex items-center justify-between rounded-md border p-2 bg-white">
                                  <div className="flex items-center gap-2">
                                    <Switch 
                                      checked={discount.isEnabled}
                                      onCheckedChange={(checked) => handleToggleDiscountType(discount.id, checked)}
                                    />
                                    <span className={discount.isEnabled ? "font-medium" : "text-gray-500"}>
                                      {discount.name}
                                    </span>
                                  </div>
                                  
                                  {discount.isEnabled && (
                                    <div>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="flex items-center gap-1"
                                          >
                                            ${discount.amount.toFixed(2)}
                                            <Percent className="h-3 w-3 text-gray-500" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Edit {discount.name}</DialogTitle>
                                          </DialogHeader>
                                          
                                          <div className="py-4">
                                            <Tabs defaultValue="dollar" value={activeDiscountTab} onValueChange={setActiveDiscountTab}>
                                              <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="dollar">
                                                  <DollarSign className="h-4 w-4 mr-1" />
                                                  Dollar Amount
                                                </TabsTrigger>
                                                <TabsTrigger value="percentage">
                                                  <Percent className="h-4 w-4 mr-1" />
                                                  Percentage
                                                </TabsTrigger>
                                              </TabsList>
                                              
                                              <TabsContent value="dollar" className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                  <Label htmlFor="discount-amount">Discount Amount ($)</Label>
                                                  <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                                    <Input
                                                      id="discount-amount"
                                                      type="number"
                                                      value={discount.amount}
                                                      onChange={(e) => handleUpdateDiscountAmount(discount.id, Number(e.target.value) || 0)}
                                                      className="pl-8"
                                                    />
                                                  </div>
                                                </div>
                                                
                                                                                <div className="text-sm text-gray-500">
                                  Equivalent to {calculateDiscountPercentage(discount.amount).toFixed(2)}% 
                                  of services cost (excluding custom additions).
                                </div>
                                                
                                                {/* Approval status indicator */}
                                                <div className="text-xs text-green-600 bg-green-50 p-2 rounded flex items-center gap-1">
                                                  <CheckCircle className="h-3 w-3" />
                                                  <span>Standard discount - no approval needed</span>
                                                </div>
                                                
                                                <div className="flex justify-between">
                                                  <Button 
                                                    variant="outline" 
                                                    onClick={() => handleUpdateDiscountAmount(discount.id, discount.defaultAmount)}
                                                  >
                                                    Reset to Default
                                                  </Button>
                                                  <DialogClose asChild>
                                                    <Button>
                                                      Apply
                                                    </Button>
                                                  </DialogClose>
                                                </div>
                                              </TabsContent>
                                              
                                              <TabsContent value="percentage" className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                  <Label htmlFor="discount-percentage">Discount Percentage (%)</Label>
                                                  <div className="relative">
                                                    <Input
                                                      id="discount-percentage"
                                                      type="number"
                                                      value={calculateDiscountPercentage(discount.amount).toFixed(2)}
                                                      onChange={(e) => handleUpdateDiscountPercentage(discount.id, Number(e.target.value) || 0)}
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                                  </div>
                                                </div>
                                                
                                                <div className="text-sm text-gray-500">
                                                  Equivalent to ${discount.amount.toFixed(2)} off the total project cost.
                                                </div>
                                                
                                                <div className="flex justify-between">
                                                  <Button 
                                                    variant="outline" 
                                                    onClick={() => {
                                                      const defaultPercent = formData.subtotal > 0 ? 
                                                        (discount.defaultAmount / formData.subtotal) * 100 : 0;
                                                      handleUpdateDiscountPercentage(discount.id, defaultPercent);
                                                    }}
                                                  >
                                                    Reset to Default
                                                  </Button>
                                                  <DialogClose asChild>
                                                    <Button>
                                                      Apply
                                                    </Button>
                                                  </DialogClose>
                                                </div>
                                              </TabsContent>
                                            </Tabs>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  {/* Discount summary */}
                  {formData.discountTypes.some(d => d.isEnabled) && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Active Discounts</h4>
                      <ul className="space-y-1">
                        {formData.discountTypes.filter(d => d.isEnabled).map(discount => (
                          <li key={discount.id} className="text-xs flex justify-between">
                            <span>{discount.name}:</span>
                            <span className="font-medium">${discount.amount.toFixed(2)}</span>
                          </li>
                        ))}
                        <li className="text-sm font-medium border-t border-blue-200 pt-1 mt-1 flex justify-between">
                          <span>Total Discounts:</span>
                          <span>${calculateTotalDiscountsFromTypes().toFixed(2)}</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Adders Section */}
              {formData.customAdders && formData.customAdders.length > 0 && (
                <div className="py-2 border-b border-dashed border-gray-200">
                  <h4 className="font-medium mb-2">Custom Adders</h4>
                  <div className="space-y-2">
                    {formData.customAdders.map((adder, index) => (
                      <div key={index} className="flex justify-between items-center py-1 pl-4 pr-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{adder.description}</p>
                          <p className="text-xs text-gray-500">{adder.product_category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${adder.cost.toFixed(2)}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveCustomAdder(index)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center py-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-md px-3">
                <span className="text-gray-900 font-semibold">Final Total</span>
                <div className="text-right">
                  <span className="text-xl font-bold">${formData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Adder Buttons */}
      {!formData.pricingOverride && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Custom Line Items</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {services.map(service => (
              <div key={service} className="relative">
                <Button
                  variant="outline"
                  className="w-full text-left flex items-center justify-between"
                  onClick={() => setShowAddAdderForm(service)}
                >
                  <span>Add {service.replace('-', ' ')} item</span>
                  <Plus className="h-4 w-4" />
                </Button>
                
                {showAddAdderForm === service && (
                  <Card className="absolute top-full left-0 z-10 w-72 mt-1 shadow-lg">
                    <CardContent className="p-3 space-y-3">
                      <h4 className="font-medium">Add Custom {service.replace('-', ' ')} Item</h4>
                      <div className="space-y-2">
                        <Label htmlFor="adder-description">Description</Label>
                        <Input
                          id="adder-description"
                          placeholder="e.g., Extra trim work"
                          value={newCustomAdder.description}
                          onChange={(e) => setNewCustomAdder({...newCustomAdder, description: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adder-cost">Cost</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            id="adder-cost"
                            placeholder="0.00"
                            type="number"
                            value={newCustomAdder.cost || ''}
                            onChange={(e) => setNewCustomAdder({...newCustomAdder, cost: parseFloat(e.target.value) || 0})}
                            className="pl-8"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowAddAdderForm(null)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleAddCustomAdder(service)}
                        >
                          Add Item
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
              ({calculateDiscountPercentage(pendingDiscount).toFixed(1)}%) 
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
            
            {/* Active discount summary if any discounts are enabled */}
            {formData.discountTypes.some(d => d.isEnabled) && (
              <div className="mt-2 bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-2">Active Discounts</h4>
                <ul className="space-y-1 text-sm">
                  {formData.discountTypes
                    .filter(d => d.isEnabled)
                    .map(discount => (
                      <li key={discount.id} className="flex justify-between">
                        <span>{discount.name}:</span>
                        <span className="font-medium">${discount.amount.toFixed(2)}</span>
                      </li>
                    ))}
                  <li className="text-sm font-medium border-t border-gray-200 pt-1 mt-1 flex justify-between">
                    <span>Total Discounts:</span>
                    <span>${calculateTotalDiscountsFromTypes().toFixed(2)}</span>
                  </li>
                </ul>
              </div>
            )}
            
            <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-800 space-y-1">
              <p><strong>Current User:</strong> {userPermissions?.name || 'Unknown'}</p>
              <p><strong>Role:</strong> {userPermissions?.role || 'Unknown'}</p>
              <p><strong>User ID:</strong> {userId || 'Not provided'}</p>
              <p><strong>Proposal ID:</strong> {proposalId || 'New proposal (pending)'}</p>
              <p><strong>Discount Limit:</strong> {userPermissions?.maxDiscountPercent || 0}%</p>
                              <p><strong>Requested Discount:</strong> {calculateDiscountPercentage(pendingDiscount).toFixed(1)}%</p>
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
