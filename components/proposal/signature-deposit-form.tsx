"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Check, DollarSign, AlertTriangle, Info, FileText, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { createProposal, markProposalAsSent } from "@/app/actions/proposal-actions"

interface SignatureDepositFormProps {
  formData: any
}

export default function SignatureDepositForm({ formData }: SignatureDepositFormProps) {
  const [signatureMethod, setSignatureMethod] = useState("email")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [proposalId, setProposalId] = useState("")
  const [createdDate, setCreatedDate] = useState("")

  // Generate proposal ID and date on client side to prevent hydration mismatch
  useEffect(() => {
    if (!formData.proposalNumber) {
      setProposalId(`PRO-${Math.floor(10000 + Math.random() * 90000)}`)
    } else {
      setProposalId(formData.proposalNumber)
    }
    setCreatedDate(new Date().toLocaleDateString())
  }, [formData.proposalNumber])

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

      // Only create/update the proposal if we have valid data
      if (proposalId) {
        // Update the existing proposal with the latest data and mark it ready to send
        const updateResult = await createProposal({
          ...formData,
          id: proposalId,
          status: "ready_to_send" // Update status to indicate it's ready to send
        })

        if (!updateResult.success) {
          toast({
            title: "Error",
            description: updateResult.error || "Failed to update proposal",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
        
        // Ensure we use the same proposal ID
        proposalId = updateResult.proposalId
      } else {
        // If somehow we don't have a proposal ID yet, create one
        console.warn("No proposal ID found at final step - creating new proposal")
        const saveResult = await createProposal({
          ...formData,
          status: "ready_to_send"
        })

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
      }

      // Send the proposal via email
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
      }

      // Update proposal status to 'sent' using the server action
      const updateResult = await markProposalAsSent(proposalId.toString());
      
      if (!updateResult.success) {
        console.error("Failed to mark proposal as sent:", updateResult.error);
      }

      toast({
        title: "Proposal sent successfully",
        description: "The proposal has been saved and sent to the customer via email.",
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

  if (isComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-2 border-green-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-2">Proposal Sent Successfully!</h2>
            <p className="text-green-700 mb-4">
              Your proposal has been delivered to {formData.customer.email}
            </p>
            <Button 
              onClick={() => setIsComplete(false)} 
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              Send Another Proposal
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-emerald-100 rounded-full">
            <FileText className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Proposal Finalization</h2>
            <p className="text-lg text-gray-600">Ready to send to your customer</p>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
            <p className="text-emerald-800 font-medium">
              ✨ Your proposal is complete and ready to be sent for customer signature and payment processing.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Proposal Summary */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Customer & Project Details */}
        <Card className="border-2 border-blue-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-6">
            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <div className="p-2 bg-blue-500 rounded-full">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              Customer Information
            </h3>
            <p className="text-blue-700 text-sm mt-1">
              Project details and contact information
            </p>
          </div>
          
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Customer Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Customer Name</Label>
                  <p className="text-gray-900 font-medium mt-1">{formData.customer.name || "Not provided"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</Label>
                  <p className="text-gray-900 font-medium mt-1">{formData.customer.phone || "Not provided"}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-900 font-medium">{formData.customer.email || "Not provided"}</p>
                  {formData.customer.email ? (
                    <div className="p-1 bg-green-100 rounded-full">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                  ) : (
                    <div className="p-1 bg-red-100 rounded-full">
                      <AlertTriangle className="h-3 w-3 text-red-600" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Project Address</Label>
                <p className="text-gray-900 font-medium mt-1">{formData.customer.address || "Not provided"}</p>
              </div>

              {/* Proposal Metadata */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Proposal ID</Label>
                    <p className="text-gray-900 font-mono mt-1">{proposalId}</p>
                  </div>
                <div>
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Created</Label>
                    <p className="text-gray-900 mt-1">{createdDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services & Financial Summary */}
        <Card className="border-2 border-emerald-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200 p-6">
            <h3 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
              <div className="p-2 bg-emerald-500 rounded-full">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Project Summary
            </h3>
            <p className="text-emerald-700 text-sm mt-1">
              Selected services and pricing breakdown
            </p>
          </div>
          
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Selected Services */}
                <div>
                <Label className="text-sm font-semibold text-gray-900 mb-3 block">Selected Services</Label>
                <div className="space-y-2">
                    {formData.services.map((service: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                      <div className="p-1 bg-emerald-500 rounded-full">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-emerald-900 font-medium">
                        {service.charAt(0).toUpperCase() + service.slice(1).replace("-", " & ")}
                      </span>
                      <span className="ml-auto text-emerald-700 text-sm">✓ Included</span>
                    </div>
                    ))}
                </div>
              </div>

              {/* Enhanced Financial Summary */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <Label className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  Financial Summary
                </Label>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Project Subtotal</span>
                    <span className="text-gray-900 font-medium text-lg">
                      ${(formData.pricing.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                  
                  {formData.pricing.discount && formData.pricing.discount > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 flex items-center gap-1">
                        <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        Applied Discount
                      </span>
                      <span className="text-red-600 font-medium text-lg">
                        -${formData.pricing.discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total Project Cost</span>
                      <span className="text-3xl font-bold text-emerald-600">
                        ${(formData.pricing.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {formData.pricing.monthlyPayment && formData.pricing.monthlyPayment > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-4">
                <div className="flex justify-between items-center">
                        <div>
                          <span className="text-blue-900 font-semibold">Financing Available</span>
                          {formData.pricing.financingPlanName && (
                            <p className="text-sm text-blue-700 mt-1">
                              {formData.pricing.financingPlanName}
                            </p>
                          )}
                </div>
                        <span className="text-blue-600 font-bold text-xl">
                          ${formData.pricing.monthlyPayment.toFixed(2)}/mo
                  </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Delivery Method */}
      <Card className="border-2 border-blue-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-6">
          <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
            <div className="p-2 bg-blue-500 rounded-full">
              <Mail className="h-5 w-5 text-white" />
            </div>
            Proposal Delivery
          </h3>
          <p className="text-blue-700 text-sm mt-1">
            Secure email delivery with customer portal access
          </p>
        </div>

        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
            <div className="flex-1">
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">Email Delivery</h4>
                    <p className="text-blue-800 text-sm mb-4">
                      Professional email with secure proposal link, review portal, and e-signature capabilities.
                    </p>
                    
                    {formData.customer.email ? (
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-gray-900">Ready to Send</span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          <span className="font-medium">Recipient:</span> {formData.customer.email}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                          <span className="font-semibold text-amber-900">Email Required</span>
                        </div>
                        <p className="text-amber-800 text-sm">
                          Please provide customer email in the Customer Information section.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5 text-slate-600" />
                  What's Included
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-slate-700">Professional proposal PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-slate-700">Secure customer portal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-slate-700">Electronic signature capture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-slate-700">Integrated payment processing</span>
                  </div>
              <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-slate-700">Real-time status notifications</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </CardContent>
        </Card>

      {/* Enhanced Action Section */}
      <Card className="border-2 border-gray-200 shadow-lg overflow-hidden">
        <CardContent className="p-8">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Ready to Send Proposal</h3>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Everything looks great! Click the button below to send this professional proposal to your customer for signature and payment.
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
          <Button
            onClick={handleSendProposal}
            disabled={isSubmitting || !formData.customer.email}
                  className="w-full py-6 text-xl font-semibold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Sending Proposal...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Mail className="h-6 w-6" />
                      <span>Send Proposal for Signature</span>
                    </div>
            )}
          </Button>
                
                {!formData.customer.email && (
                  <div className="text-center text-amber-700 text-sm mt-3 bg-amber-50 rounded-lg p-3 border border-amber-200">
                    ⚠️ Customer email address is required to send the proposal
                  </div>
        )}
      </div>

              {/* Quick Action Tips */}
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-slate-600" />
                  💡 Before Sending
                </h4>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="text-slate-700 font-medium">Double-check customer email</span>
                        <p className="text-slate-600">Ensure the email address is correct and active</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="text-slate-700 font-medium">Review all pricing</span>
                        <p className="text-slate-600">Verify totals and financing options are accurate</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="text-slate-700 font-medium">Confirm project details</span>
                        <p className="text-slate-600">Make sure all services and specifications are correct</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="text-slate-700 font-medium">Set expectations</span>
                        <p className="text-slate-600">Consider calling the customer to let them know it's coming</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
