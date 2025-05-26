"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, AlertCircle, Calculator, Sparkles, TrendingUp } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import FinancingSelector from "./financing-selector"
import { motion, AnimatePresence } from "framer-motion"


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
}

interface PricingBreakdownFormProps {
  services: string[]
  products: any
  data: Partial<PricingData>
  updateData: (data: Partial<PricingData>) => void
}

function PricingBreakdownForm({ services, products, data, updateData }: PricingBreakdownFormProps) {
  // Use a ref to track if we've already updated the parent
  const hasUpdatedRef = useRef(false)
  const [financingPlans, setFinancingPlans] = useState<FinancingPlan[]>([])
  const [loading, setLoading] = useState(false)

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
      financingNotes: data.financingNotes
    }
  })

  // Fetch financing plans from API
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

    fetchFinancingPlans()
  }, [])
  
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
  function calculateMonthlyPaymentWithFactor(total: number, paymentFactor: number): number {
    return total * (paymentFactor / 100)
  }

  // Calculate monthly payment using standard amortization formula (fallback)
  function calculateMonthlyPayment(total: number, term: number, rate: number): number {
    if (term === 0 || rate === 0) return 0
    const monthlyRate = rate / 100 / 12
    if (monthlyRate === 0) return total / term
    const numerator = total * monthlyRate * Math.pow(1 + monthlyRate, term)
    const denominator = Math.pow(1 + monthlyRate, term) - 1
    return denominator === 0 ? 0 : numerator / denominator
  }

  // Handle user input changes
  const handleChange = useCallback((field: keyof PricingData, value: any) => {
    setFormData((prev) => {
      // If the value hasn't changed, don't update state
      if (prev[field] === value) return prev

      const newData = { ...prev, [field]: value }

      // Recalculate total and monthly payment when relevant fields change
      if (field === "subtotal" || field === "discount") {
        const total = field === "subtotal" ? value - prev.discount : prev.subtotal - value
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
          financingNotes: selectedPlan.notes
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
    const newDiscount = calculateDiscount(services)

    // Only update if values have actually changed significantly
    if (Math.abs(formData.subtotal - newSubtotal) > 0.01 || Math.abs(formData.discount - newDiscount) > 0.01) {
      const newTotal = newSubtotal - newDiscount
      
      setFormData((prev) => {
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
  }, [services, formData.subtotal, formData.discount, financingPlans])



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
              <span className="text-gray-600 font-medium">Base Discount</span>
              <div className="relative w-36">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  value={formData.discount.toFixed(2)}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value) || 0
                    handleChange("discount", value)
                  }}
                  className="pl-8 text-right font-medium"
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
              setFormData(prev => ({
                ...prev,
                financingPlanId: plan.id,
                financingPlanName: `${plan.provider} - ${plan.plan_name}`,
                interestRate: plan.interest_rate,
                financingTerm: plan.term_months,
                merchantFee: plan.merchant_fee,
                monthlyPayment: monthlyPayment,
                financingNotes: plan.notes
              }))
              hasUpdatedRef.current = false
            }
          }}
          className="shadow-sm"
        />
        
        {formData.financingPlanId && (
          <div className="flex justify-center mt-4 text-sm text-gray-500">
            <p>Selected plan: <span className="font-medium">{formData.financingPlanName}</span></p>
                </div>
        )}
      </div>
    </div>
  )
}

// Export a memoized version to prevent unnecessary re-renders
export default PricingBreakdownForm
