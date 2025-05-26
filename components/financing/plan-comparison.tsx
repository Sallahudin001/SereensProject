"use client"

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, ArrowRight, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"

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

interface PlanComparisonProps {
  plans: FinancingPlan[]
  className?: string
}

export function PlanComparison({ plans, className }: PlanComparisonProps) {
  const [projectAmount, setProjectAmount] = useState(10000)
  const activePlans = plans.filter(plan => plan.is_active).slice(0, 5)
  
  // Calculate the monthly payment for each plan
  const calculateMonthlyPayment = (planAmount: number, paymentFactor: number): number => {
    return planAmount * (paymentFactor / 100)
  }
  
  // Calculate the merchant fee amount for each plan
  const calculateMerchantFee = (planAmount: number, merchantFee: number): number => {
    return planAmount * (merchantFee / 100)
  }
  
  // Calculate the funding amount after merchant fee
  const calculateFundingAmount = (planAmount: number, merchantFee: number): number => {
    return planAmount - calculateMerchantFee(planAmount, merchantFee)
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Financing Plan Comparison
        </CardTitle>
        <CardDescription>
          Compare payment options across different financing plans
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 max-w-md">
          <Label htmlFor="project-amount" className="mb-2 block">Project Amount</Label>
          <div className="relative">
            <DollarSign className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              id="project-amount"
              type="number"
              min="1000"
              step="500"
              className="pl-8"
              value={projectAmount}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setProjectAmount(isNaN(value) ? 0 : value);
              }}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Payment Factor</TableHead>
                <TableHead>Monthly Payment</TableHead>
                <TableHead>Merchant Fee</TableHead>
                <TableHead>Amount Funded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activePlans.length > 0 ? (
                activePlans.map((plan) => {
                  const paymentFactor = Number(plan.payment_factor) || 0;
                  const merchantFee = Number(plan.merchant_fee) || 0;
                  
                  const monthlyPayment = calculateMonthlyPayment(projectAmount, paymentFactor);
                  const merchantFeeAmount = calculateMerchantFee(projectAmount, merchantFee);
                  const fundingAmount = calculateFundingAmount(projectAmount, merchantFee);
                  
                  return (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.plan_number}</TableCell>
                      <TableCell>{plan.provider}</TableCell>
                      <TableCell>{plan.interest_rate}%</TableCell>
                      <TableCell>{plan.term_months} mo</TableCell>
                      <TableCell>{paymentFactor}%</TableCell>
                      <TableCell className="font-semibold">${monthlyPayment.toFixed(2)}/mo</TableCell>
                      <TableCell className="text-red-600">
                        {merchantFee}%
                        <br />
                        <span className="text-xs">(-${merchantFeeAmount.toFixed(2)})</span>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">${fundingAmount.toFixed(2)}</TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No active financing plans available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-muted-foreground">
            {activePlans.length > 0 ? (
              <span>Showing {activePlans.length} active financing plans.</span>
            ) : (
              <span>No active financing plans found.</span>
            )}
          </div>
          
          <Button variant="outline" size="sm" asChild>
            <a href="#all-plans" className="flex items-center gap-2">
              View all plans
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 