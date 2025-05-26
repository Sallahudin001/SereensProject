"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

interface PlanDetailsCardProps {
  plan: FinancingPlan
  className?: string
}

export function PlanDetailsCard({ plan, className }: PlanDetailsCardProps) {
  if (!plan) return null;
  
  // Function to determine if plan has deferred interest
  const hasDeferredInterest = () => {
    return plan.notes?.toLowerCase().includes('deferred interest') ||
           plan.plan_number === '4158' ||  // Specific check for Plan 4158 mentioned in the image
           plan.notes?.toLowerCase().includes('promo period');
  }
  
  // Function to determine if plan has special requirements
  const hasSpecialRequirements = () => {
    return plan.notes?.toLowerCase().includes('check') || 
           plan.notes?.toLowerCase().includes('greensky app') ||
           plan.notes?.toLowerCase().includes('minimum');
  }

  // Function to determine if we should show a pop-up note for this plan
  const hasPopUpNote = () => {
    // Here we can check for Plan 1519 as shown in the image or any other plan with popup notes
    return plan.plan_number === '1519' || 
           plan.notes?.toLowerCase().includes('pop up');
  }
  
  // Safe number values
  const paymentFactor = Number(plan.payment_factor) || 0;
  const merchantFee = Number(plan.merchant_fee) || 0;
  const interestRate = Number(plan.interest_rate) || 0;
  const termMonths = Number(plan.term_months) || 0;
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              {plan.provider} - Plan {plan.plan_number}
              {plan.is_active && 
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Active</Badge>
              }
            </CardTitle>
            <CardDescription>
              {plan.plan_name}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 w-fit">
            {interestRate}% APR for {termMonths} months
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">Payment Factor</div>
            <div className="text-lg font-semibold">{paymentFactor}%</div>
            <div className="text-xs text-muted-foreground">
              Used to calculate monthly payments
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">Merchant Fee</div>
            <div className="text-lg font-semibold">{merchantFee}%</div>
            <div className="text-xs text-muted-foreground">
              Deducted from the project total before funding
            </div>
          </div>
        </div>
        
        {hasDeferredInterest() && (
          <Alert className="mt-4 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <span className="font-semibold">Deferred Interest:</span> Interest is waived if amount financed is paid in full within promotional period. Full payment required before end of promotional period to avoid accrued interest.
            </AlertDescription>
          </Alert>
        )}
        
        {hasSpecialRequirements() && (
          <Alert className="mt-4 bg-purple-50 border-purple-200">
            <AlertCircle className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <span className="font-semibold">Special Requirement:</span> Check minimum monthly payment in the {plan.provider} app before finalizing.
            </AlertDescription>
          </Alert>
        )}
        
        {hasPopUpNote() && (
          <Alert className="mt-4 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <span className="font-semibold">Important:</span> Show a pop up when they use this rate. Check minimum monthly payment in the {plan.provider} app.
            </AlertDescription>
          </Alert>
        )}
        
        {plan.notes && !hasDeferredInterest() && !hasSpecialRequirements() && !hasPopUpNote() && (
          <div className="mt-4 text-sm border-t pt-3">
            <div className="font-medium mb-1">Additional Notes:</div>
            <div className="text-muted-foreground whitespace-pre-line">{plan.notes}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 