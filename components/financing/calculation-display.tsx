"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, AlertCircle, Calculator, DollarSign } from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FinancingCalculationDisplayProps {
  className?: string
}

export function FinancingCalculationDisplay({ className }: FinancingCalculationDisplayProps) {
  const [projectTotal, setProjectTotal] = useState(10000)
  const [paymentFactor, setPaymentFactor] = useState(1.20)
  const [merchantFee, setMerchantFee] = useState(6.0)
  
  const monthlyPayment = projectTotal * (paymentFactor / 100)
  const dealerFeeAmount = projectTotal * (merchantFee / 100)
  const fundingAmount = projectTotal - dealerFeeAmount
  
  return (
    <Card className={`${className} w-full`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Financing Calculation Guide
        </CardTitle>
        <CardDescription>
          Understanding how financing calculations work
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="formula" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="formula">Calculation Formula</TabsTrigger>
            <TabsTrigger value="merchant-fee">Merchant Fee</TabsTrigger>
          </TabsList>
          
          <TabsContent value="formula" className="w-full">
            <div className="space-y-4 w-full">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 w-full">
                <div className="font-semibold text-center text-amber-900">
                  Project total × Payment Factor = Monthly Payment
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label>Project Total</Label>
                  <div className="relative w-full">
                    <DollarSign className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <Input 
                      type="number"
                      className="pl-8 w-full"
                      value={projectTotal}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setProjectTotal(isNaN(value) ? 0 : value);
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-1">
                    <Label>Payment Factor</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="w-72">
                          <p>The payment factor is a percentage value used to calculate the monthly payment.</p>
                          <p className="mt-1">For example, a payment factor of 1.20% means you multiply the project total by 0.0120 to get the monthly payment.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative w-full">
                    <Input 
                      type="number"
                      step="0.01"
                      className="pr-8 w-full"
                      value={paymentFactor}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setPaymentFactor(isNaN(value) ? 0 : value);
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
                
                <div className="space-y-2 w-full">
                  <Label>Monthly Payment</Label>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-md flex items-center justify-center h-10 font-semibold text-emerald-700 w-full">
                    ${monthlyPayment.toFixed(2)}/mo
                  </div>
                </div>
              </div>
              
              <div className="flex items-start mt-4 w-full">
                <Info className="h-4 w-4 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Example:</span> For a $10,000 project with a payment factor of 1.20%, the monthly payment would be $10,000 × (1.20 ÷ 100) = $120.00 per month.
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="merchant-fee" className="w-full">
            <div className="space-y-4 w-full">
              <Alert className="bg-yellow-50 border-yellow-200 w-full">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="font-bold">Important Note:</div>
                  <div>The merchant fee is visible to the rep/admin, but NOT to the customer.</div>
                </AlertDescription>
              </Alert>
              
              <div className="text-center font-medium p-3 bg-amber-50 border border-amber-200 rounded-md w-full">
                They take the dealer fee right off the project total before they fund us the money
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                <div className="space-y-2 w-full">
                  <Label>Project Total</Label>
                  <div className="relative w-full">
                    <DollarSign className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <Input 
                      type="number"
                      className="pl-8 w-full"
                      value={projectTotal}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setProjectTotal(isNaN(value) ? 0 : value);
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-1">
                    <Label>Merchant Fee</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="w-72">
                          <p>The merchant fee is a percentage deducted from the project total before funding.</p>
                          <p className="mt-1">This fee varies by financing plan and affects your profit margin.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative w-full">
                    <Input 
                      type="number"
                      step="0.1"
                      className="pr-8 w-full"
                      value={merchantFee}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setMerchantFee(isNaN(value) ? 0 : value);
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
                
                <div className="space-y-2 w-full">
                  <Label>Merchant Fee Amount</Label>
                  <div className="bg-red-50 border border-red-200 rounded-md flex items-center justify-center h-10 font-semibold text-red-700 w-full">
                    -${dealerFeeAmount.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md w-full">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Project Total:</span>
                  <span>${projectTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-red-600">
                  <span className="font-medium">Merchant Fee ({merchantFee}%):</span>
                  <span>-${dealerFeeAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300 font-semibold">
                  <span>Amount Funded to You:</span>
                  <span className="text-green-600">${fundingAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 w-full">
                <p>When setting your prices, remember to account for the merchant fee to maintain your desired profit margins.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 