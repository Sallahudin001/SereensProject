"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check, Mail, MessageSquare, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { createProposal, markProposalAsSent } from "@/app/actions/proposal-actions"

interface SignatureDepositFormProps {
  formData: any
}

export default function SignatureDepositForm({ formData }: SignatureDepositFormProps) {
  const [signatureMethod, setSignatureMethod] = useState("email")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleSendProposal = async () => {
    try {
      setIsSubmitting(true)

      // Get the base URL for the proposal link
      const baseUrl = window.location.origin

      let proposalId = formData.id

      // Validate customer contact info is available
      if (signatureMethod === "email" && !formData.customer.email) {
        toast({
          title: "Missing Email",
          description: "Customer email is required to send the proposal by email.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (signatureMethod === "sms" && !formData.customer.phone) {
        toast({
          title: "Missing Phone Number",
          description: "Customer phone number is required to send the proposal by SMS.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Always save the proposal first to ensure we have the latest data
      const saveResult = await createProposal(formData)

      if (!saveResult.success) {
        toast({
          title: "Error",
          description: saveResult.error || "Failed to save proposal",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      proposalId = saveResult.proposalId

      // Send the proposal based on selected method
      if (signatureMethod === "email") {
        // Send the proposal email using the API route
        const response = await fetch('/api/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.customer.email,
            name: formData.customer.name,
            proposalId: proposalId.toString(),
            proposalNumber: formData.proposalNumber || `PRO-${Math.floor(10000 + Math.random() * 90000)}`,
            message: 'Your proposal is ready for review. Please click the button below to view and sign your proposal.',
            phone: formData.customer.phone || undefined,
          }),
        });

        const result = await response.json();
        
        if (!result.success) {
          toast({
            title: "Failed to send proposal",
            description: result.error || "An error occurred while sending the proposal.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      } else if (signatureMethod === "sms") {
        // Send the proposal via SMS using the Vonage API
        const response = await fetch('/api/sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: formData.customer.phone,
            name: formData.customer.name,
            proposalId: proposalId.toString(),
            proposalNumber: formData.proposalNumber || `PRO-${Math.floor(10000 + Math.random() * 90000)}`,
            message: `Your proposal #${formData.proposalNumber || 'New'} from Evergreen Energy Upgrades is ready for review. View and sign here: ${baseUrl}/proposals/view/${proposalId}`,
          }),
        });

        const result = await response.json();
        
        if (!result.success) {
          toast({
            title: "Failed to send SMS",
            description: result.error || "An error occurred while sending the SMS.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      }

      // Update proposal status to 'sent' using the server action
      const updateResult = await markProposalAsSent(proposalId.toString());
      
      if (!updateResult.success) {
        console.error("Failed to mark proposal as sent:", updateResult.error);
      }

      toast({
        title: "Proposal sent successfully",
        description: `The proposal has been saved and sent to the customer via ${signatureMethod === "email" ? "email" : "SMS"}.`,
      })
      setIsComplete(true)
    } catch (error) {
      console.error("Error sending proposal:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending the proposal.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Proposal Summary</h3>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                  <p className="font-medium">{formData.customer.name || "N/A"}</p>
                  <p className="text-sm text-gray-600">{formData.customer.address || "N/A"}</p>
                  <p className="text-sm text-gray-600">{formData.customer.email || "N/A"}</p>
                  <p className="text-sm text-gray-600">{formData.customer.phone || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Services</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.services.map((service: string, index: number) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {service.charAt(0).toUpperCase() + service.slice(1).replace("-", " & ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-bold text-xl">${formData.pricing.total?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-600">Monthly Payment</span>
                  <span className="text-rose-600 font-medium">
                    ${formData.pricing.monthlyPayment?.toFixed(2) || "0.00"}/mo
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Delivery Method</h3>
        <RadioGroup
          value={signatureMethod}
          onValueChange={setSignatureMethod}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card className={`cursor-pointer border ${signatureMethod === "email" ? "border-rose-600" : ""}`}>
            <CardContent className="p-4 flex items-start gap-3">
              <RadioGroupItem
                value="email"
                id="method-email"
                className={signatureMethod === "email" ? "text-rose-600" : ""}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="method-email" className="font-medium cursor-pointer">
                    Email
                  </Label>
                </div>
                <p className="text-sm text-gray-500 mt-1">Send via email for signature</p>
                {formData.customer.email && (
                  <p className="text-sm font-medium mt-1">Will be sent to: {formData.customer.email}</p>
                )}
                {!formData.customer.email && (
                  <p className="text-sm text-amber-600 mt-1">No customer email provided in Customer Info</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer border ${signatureMethod === "sms" ? "border-rose-600" : ""}`}>
            <CardContent className="p-4 flex items-start gap-3">
              <RadioGroupItem
                value="sms"
                id="method-sms"
                className={signatureMethod === "sms" ? "text-rose-600" : ""}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="method-sms" className="font-medium cursor-pointer">
                    SMS
                  </Label>
                </div>
                <p className="text-sm text-gray-500 mt-1">Send via text message</p>
                {formData.customer.phone && (
                  <p className="text-sm font-medium mt-1">Will be sent to: {formData.customer.phone}</p>
                )}
                {!formData.customer.phone && (
                  <p className="text-sm text-amber-600 mt-1">No customer phone number provided in Customer Info</p>
                )}
              </div>
            </CardContent>
          </Card>
        </RadioGroup>
      </div>

      <div className="pt-4">
        {isComplete ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
            <Check className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-green-800">Proposal Sent Successfully!</h3>
            <p className="text-green-600">
              The customer will receive the proposal shortly and can review, sign, and submit payment.
            </p>
          </div>
        ) : (
          <Button
            onClick={handleSendProposal}
            disabled={isSubmitting || (signatureMethod === "email" && !formData.customer.email) || (signatureMethod === "sms" && !formData.customer.phone)}
            className="w-full bg-rose-600 hover:bg-rose-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Proposal for Signature"
            )}
          </Button>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
        <h3 className="text-lg font-medium text-blue-800">What happens next?</h3>
        <p className="text-blue-600 mt-2">
          After sending the proposal, your customer will receive a link to view, sign, and make a deposit. The payment
          options will be presented to them at that time.
        </p>
      </div>
    </div>
  )
}
