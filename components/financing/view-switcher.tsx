"use client"

import { useState } from "react"
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { EyeOff, Users, User, DollarSign, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

interface ViewSwitcherProps {
  projectTotal: number
  monthlyPayment: number
  merchantFee: number
  className?: string
}

export function ViewSwitcher({ 
  projectTotal, 
  monthlyPayment, 
  merchantFee,
  className 
}: ViewSwitcherProps) {
  const [showCustomerView, setShowCustomerView] = useState(false)
  
  // Calculate merchant fee amount
  const merchantFeeAmount = projectTotal * (merchantFee / 100)
  const fundingAmount = projectTotal - merchantFeeAmount
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              {showCustomerView ? <User className="h-5 w-5" /> : <Users className="h-5 w-5" />}
              {showCustomerView ? "Customer View" : "Admin View"}
            </CardTitle>
            <CardDescription>
              {showCustomerView 
                ? "What the customer will see in the proposal" 
                : "Complete view with merchant fees and funding details"}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="view-switcher" className="text-sm cursor-pointer">
              Show customer view
            </Label>
            <Switch
              id="view-switcher"
              checked={showCustomerView}
              onCheckedChange={setShowCustomerView}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "border rounded-md transition-all",
          showCustomerView ? "bg-white" : "bg-gray-50"
        )}>
          <div className="p-4 border-b">
            <div className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Financing Details
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Project Total</div>
                <div className="text-lg font-semibold">${projectTotal.toFixed(2)}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Monthly Payment</div>
                <div className="text-lg font-semibold text-emerald-600">${monthlyPayment.toFixed(2)}/mo</div>
              </div>
            </div>
            
            {!showCustomerView && (
              <>
                <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between items-center text-red-600">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">Merchant Fee ({merchantFee}%)</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This fee is deducted from the funding amount but not shown to customers.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span>-${merchantFeeAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center font-medium pt-1">
                  <span>Amount Funded</span>
                  <span className="text-green-600">${fundingAmount.toFixed(2)}</span>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-100 rounded px-3 py-2 text-sm text-yellow-800 flex items-start gap-2 mt-2">
                  <EyeOff className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    The merchant fee and funding amount are <strong>not visible</strong> to the customer in proposals.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="text-sm text-muted-foreground">
          Toggle the view to see what customers will see in their proposal.
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowCustomerView(!showCustomerView)}
          className="flex items-center gap-2"
        >
          {showCustomerView ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
          {showCustomerView ? "Switch to Admin View" : "Switch to Customer View"}
        </Button>
      </CardFooter>
    </Card>
  )
} 