"use client"

import { useState, useEffect } from "react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calculator, DollarSign, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

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

interface FinancingSelectorProps {
  projectTotal: number
  onFinancingChange: (plan: FinancingPlan | null, monthlyPayment: number) => void
  className?: string
  uniqueId?: string
}

export default function FinancingSelector({ 
  projectTotal, 
  onFinancingChange,
  className,
  uniqueId = 'default'
}: FinancingSelectorProps) {
  const [financingPlans, setFinancingPlans] = useState<FinancingPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<FinancingPlan | null>(null)
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [netAmount, setNetAmount] = useState(projectTotal)
  const [loading, setLoading] = useState(true)

  // Fetch financing plans
  useEffect(() => {
    async function fetchFinancingPlans() {
      setLoading(true)
      try {
        const response = await fetch('/api/financing/plans')
        if (!response.ok) throw new Error('Failed to fetch financing plans')
        const plans = await response.json()
        // Only show active plans
        const activePlans = plans.filter((plan: FinancingPlan) => plan.is_active)
        
        // Deduplicate plans
        const uniqueKey = (plan: FinancingPlan) => 
          `${plan.provider}-${plan.plan_number}-${plan.payment_factor}`
        
        const uniquePlans = Array.from(
          new Map(activePlans.map((plan: FinancingPlan) => 
            [uniqueKey(plan), plan]
          )).values()
        ) as FinancingPlan[];
        
        uniquePlans.sort((a, b) => a.provider.localeCompare(b.provider) || a.payment_factor - b.payment_factor);
        
        setFinancingPlans(uniquePlans)
        
        // Set default plan if any exists
        if (uniquePlans.length > 0) {
          const defaultPlan = uniquePlans.find(
            (p: FinancingPlan) => p.plan_number === '1519' || p.plan_number === '4158'
          ) || uniquePlans[0]
          setSelectedPlan(defaultPlan)
          calculatePaymentAndFees(defaultPlan, projectTotal)
        }
      } catch (error) {
        console.error('Error fetching financing plans:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFinancingPlans()
  }, [projectTotal]) // Add projectTotal dependency to rerun when it changes
  
  // Recalculate when project total changes
  useEffect(() => {
    if (selectedPlan) {
      calculatePaymentAndFees(selectedPlan, projectTotal)
    }
  }, [projectTotal, selectedPlan])
  
  // Calculate monthly payment and net amount after merchant fee
  const calculatePaymentAndFees = (plan: FinancingPlan, total: number) => {
    const payment = total * (plan.payment_factor / 100)
    const merchantFeeAmount = total * (plan.merchant_fee / 100)
    const net = total - merchantFeeAmount
    
    setMonthlyPayment(payment)
    setNetAmount(net)
    
    // Pass up to parent component - include payment_factor for consistent calculations
    onFinancingChange(plan, payment)
  }
  
  const handlePlanChange = (planId: string) => {
    const plan = financingPlans.find(p => p.id === Number(planId))
    if (plan) {
      setSelectedPlan(plan)
      calculatePaymentAndFees(plan, projectTotal)
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor={`financing-plan-${uniqueId}`}>Financing Plan</Label>
            <Select 
              value={selectedPlan?.id?.toString() || ""}
              onValueChange={handlePlanChange}
              disabled={loading}
            >
              <SelectTrigger id={`financing-plan-${uniqueId}`}>
                <SelectValue placeholder="Select a financing plan" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Loading plans...</SelectItem>
                ) : financingPlans.length > 0 ? (
                  financingPlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.provider} - {plan.plan_name} ({plan.payment_factor}%)
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No financing plans available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`project-total-${uniqueId}`}>Project Total</Label>
            <div className="relative">
              <DollarSign className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <Input
                id={`project-total-${uniqueId}`}
                type="text"
                className="pl-8"
                value={projectTotal.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
                disabled
              />
            </div>
          </div>
        </div>
        
        {selectedPlan && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Interest Rate</div>
                <div className="font-semibold">{selectedPlan.interest_rate}% APR</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Term</div>
                <div className="font-semibold">{selectedPlan.term_months} months</div>
              </div>
              
              <div className="space-y-1 flex items-center gap-1">
                <div>
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    Merchant Fee
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Only visible to you. Not shown to customers.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="font-semibold text-red-600">{selectedPlan.merchant_fee}%</div>
                </div>
              </div>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Monthly Payment</div>
                  <div className="text-2xl font-bold text-emerald-600">${monthlyPayment.toFixed(2)}/mo</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Merchant Fee Amount</div>
                  <div className="text-xl font-bold text-red-600">
                    -${(projectTotal * selectedPlan.merchant_fee / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Net Amount: <span className="font-semibold">${netAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedPlan.notes && (
              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  {selectedPlan.notes}
                </AlertDescription>
              </Alert>
            )}
            
            {selectedPlan.provider === "Homerun PACE" && (
              <Alert variant="default" className="bg-amber-50 border-amber-200">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Check Homerun portal for actual monthly payment calculations.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
} 