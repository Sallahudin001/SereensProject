"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PricingBreakdownForm from "@/components/proposal/pricing-breakdown-form"
import { Button } from "@/components/ui/button"
import { Info, Wrench, ShieldCheck, WrenchIcon, RefreshCw } from "lucide-react"

export default function TestDiscountPage() {
  const [pricingData, setPricingData] = useState({
    subtotal: 25000,
    discount: 1965, // Bundle discount for roofing + hvac
    total: 23035,
    monthlyPayment: 0,
    showLineItems: true,
    financingTerm: 60,
    interestRate: 5.99,
    financingPlanId: undefined,
    financingPlanName: "",
    merchantFee: 0,
    financingNotes: ""
  })

  const [selectedServices, setSelectedServices] = useState(["roofing", "hvac"])
  const [userId, setUserId] = useState<number | undefined>(1)
  const [proposalId, setProposalId] = useState<number | undefined>(1)
  const [debugLogs, setDebugLogs] = useState<string[]>([])

  const addDebugLog = (message: string) => {
    setDebugLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev])
  }

  const updatePricingData = (data: any) => {
    console.log('Pricing data updated:', data)
    setPricingData(prev => ({ ...prev, ...data }))
    addDebugLog(`Pricing updated: ${JSON.stringify(data, null, 2)}`)
  }

  const resetToDefaults = () => {
    setPricingData({
      subtotal: 25000,
      discount: 1965, // Bundle discount for roofing + hvac
      total: 23035,
      monthlyPayment: 0,
      showLineItems: true,
      financingTerm: 60,
      interestRate: 5.99,
      financingPlanId: undefined,
      financingPlanName: "",
      merchantFee: 0,
      financingNotes: ""
    })
    setSelectedServices(["roofing", "hvac"])
    setUserId(1)
    setProposalId(1)
    addDebugLog("Reset to defaults")
  }

  const testBundleDiscount = () => {
    setSelectedServices(["roofing", "hvac", "windows-doors"])
    addDebugLog("Testing with roofing + hvac + windows bundle")
  }

  const testNoDiscount = () => {
    setSelectedServices(["roofing"])
    addDebugLog("Testing with just roofing (no bundle discount)")
  }

  const testAsManager = () => {
    setUserId(2) // Use manager ID (ID 2)
    addDebugLog("Switched to manager user (ID: 2)")
  }

  const testAsRep = () => {
    setUserId(1) // Use rep ID (ID 1)
    addDebugLog("Switched to sales rep user (ID: 1)")
  }

  const testNewProposal = () => {
    setProposalId(undefined)
    addDebugLog("Testing as new proposal (no proposal ID)")
  }

  const testExistingProposal = () => {
    setProposalId(1)
    addDebugLog("Testing with existing proposal ID: 1")
  }

  const clearLogs = () => {
    setDebugLogs([])
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            Discount Approval System Test Page
          </CardTitle>
          <CardDescription>
            This page tests the discount approval workflow and bundle discount functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="test-panel" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="test-panel">Test Panel</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="debug">Debug Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="test-panel" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Card className="shadow-md">
                    <CardHeader className="bg-blue-50 pb-2">
                      <CardTitle className="text-lg text-blue-800">Test Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">User Type</h3>
                          <div className="flex gap-2">
                            <Button size="sm" variant={userId === 1 ? "default" : "outline"} onClick={testAsRep}>
                              Test as Sales Rep
                            </Button>
                            <Button size="sm" variant={userId === 2 ? "default" : "outline"} onClick={testAsManager}>
                              Test as Manager
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-2">Services/Bundle</h3>
                          <div className="flex gap-2">
                            <Button size="sm" variant={selectedServices.length > 1 ? "default" : "outline"} onClick={testBundleDiscount}>
                              Test Bundle
                            </Button>
                            <Button size="sm" variant={selectedServices.length === 1 ? "default" : "outline"} onClick={testNoDiscount}>
                              Single Service
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-2">Proposal Status</h3>
                          <div className="flex gap-2">
                            <Button size="sm" variant={proposalId !== undefined ? "default" : "outline"} onClick={testExistingProposal}>
                              Existing Proposal
                            </Button>
                            <Button size="sm" variant={proposalId === undefined ? "default" : "outline"} onClick={testNewProposal}>
                              New Proposal
                            </Button>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <Button variant="outline" onClick={resetToDefaults} className="w-full">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset to Defaults
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className="shadow-md">
                    <CardHeader className="bg-green-50 pb-2">
                      <CardTitle className="text-lg text-green-800">Current Config</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-3 gap-2 py-1 border-b">
                          <div className="font-medium">User ID:</div>
                          <div className="col-span-2">{userId}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-1 border-b">
                          <div className="font-medium">User Type:</div>
                          <div className="col-span-2">{userId === 1 ? "Sales Rep" : "Manager"}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-1 border-b">
                          <div className="font-medium">Proposal ID:</div>
                          <div className="col-span-2">{proposalId ?? "New (undefined)"}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-1 border-b">
                          <div className="font-medium">Services:</div>
                          <div className="col-span-2">{selectedServices.join(", ")}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-1 border-b">
                          <div className="font-medium">Subtotal:</div>
                          <div className="col-span-2">${pricingData.subtotal.toFixed(2)}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-1 border-b">
                          <div className="font-medium">Discount:</div>
                          <div className="col-span-2">${pricingData.discount.toFixed(2)} ({((pricingData.discount / pricingData.subtotal) * 100).toFixed(1)}%)</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-1 border-b">
                          <div className="font-medium">Total:</div>
                          <div className="col-span-2">${pricingData.total.toFixed(2)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Card className="shadow-md">
                <CardHeader className="bg-gray-50 pb-2">
                  <CardTitle className="text-lg">Pricing Form Component</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <PricingBreakdownForm
                    services={selectedServices}
                    products={{}}
                    data={pricingData}
                    updateData={updatePricingData}
                    proposalId={proposalId}
                    userId={userId}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="instructions">
              <Card>
                <CardHeader className="bg-amber-50">
                  <CardTitle className="text-amber-800">Testing Instructions</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-base">Issue #1: Discount Field Not Editable with Bundle</h3>
                      <ol className="list-decimal ml-5 mt-2 space-y-2 text-sm">
                        <li>Use the "Test Bundle" button to select multiple services</li>
                        <li>Try to edit the discount field - it should now be editable</li>
                        <li>When edited, a "Reset to Bundle" button should appear</li>
                        <li>Click "Reset to Bundle" to return to the automatic discount</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-base">Issue #2: Approval Requests Not Being Sent</h3>
                      <ol className="list-decimal ml-5 mt-2 space-y-2 text-sm">
                        <li>Click "Test as Sales Rep" to ensure you're testing as a rep</li>
                        <li>Try entering a large discount amount (e.g., $5000) that exceeds the rep's limit</li>
                        <li>You should see an approval dialog appear</li>
                        <li>Add some notes and click "Request Approval"</li>
                        <li>The request should be sent successfully</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-base">Issue #3: Testing with New Proposals</h3>
                      <ol className="list-decimal ml-5 mt-2 space-y-2 text-sm">
                        <li>Click "New Proposal" to test with an undefined proposal ID</li>
                        <li>Try to submit a discount that requires approval</li>
                        <li>The system should handle this correctly without errors</li>
                      </ol>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <h4 className="font-medium text-blue-800">Expected Behavior:</h4>
                      <ul className="list-disc ml-5 mt-2 space-y-1 text-sm text-blue-700">
                        <li>Sales rep discount limit: 10%</li>
                        <li>Manager discount limit: 25%</li>
                        <li>Bundle discount for roofing + HVAC: $1,965</li>
                        <li>Bundle discount for roofing + windows: 5% of combined value</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="debug">
              <Card>
                <CardHeader className="bg-gray-50 flex flex-row items-center justify-between">
                  <CardTitle className="text-gray-800">Debug Logs</CardTitle>
                  <Button variant="outline" size="sm" onClick={clearLogs}>Clear Logs</Button>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-md h-96 overflow-y-auto">
                    {debugLogs.length === 0 ? (
                      <div className="text-gray-500 italic">No logs yet. Try making some changes.</div>
                    ) : (
                      <div className="space-y-1">
                        {debugLogs.map((log, index) => (
                          <div key={index}>{log}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 