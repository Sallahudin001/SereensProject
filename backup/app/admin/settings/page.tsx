"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft,
  Save,
  Clock,
  Percent,
  DollarSign,
  BarChart,
  Mail,
  Bell
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function SettingsPage() {
  const headerSection = useScrollAnimation({ threshold: 0.1 })
  const contentSection = useScrollAnimation()
  const router = useRouter()
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "Evergreen Home Upgrades",
    companyAddress: "123 Main Street, San Jose, CA 95129",
    companyPhone: "(408) 333-9831",
    companyEmail: "info@evergreenenergy.io",
    website: "www.evergreenenergy.io",
    logoUrl: "/sereenh-04.png",
    defaultCurrency: "USD",
    timeZone: "America/Los_Angeles",
    defaultProposalValidityDays: 30,
    autoDeleteExpiredProposals: false,
    requireApprovalForLargeDiscounts: true,
    allowCustomerEdits: false,
    enableProposalComments: true,
    defaultPaymentTerms: "Net 30",
  })
  
  // Proposal settings
  const [proposalSettings, setProposalSettings] = useState({
    defaultProposalExpiration: "72", // hours
    enableUrgencyTimers: true,
    showDiscountExpiration: true,
    autoGenerateScopeNotes: true,
    highImpactUpsellSuggestions: true,
    includeBrandingInProposals: true,
    proposalNumberPrefix: "PRO-",
  })
  
  // Financial settings
  const [financialSettings, setFinancialSettings] = useState({
    defaultCurrency: "USD",
    taxRate: 8.75,
    enableTaxCalculation: true,
    defaultPaymentTerms: "Net 30",
    depositPercentage: 25,
    enableFinancingCalculator: true,
    defaultFinancingTerm: "36", // Changed from defaultFinancingTerms to match usage
    defaultInterestRate: 9.99,
    defaultMinimumDeposit: 25,
    maxDiscountWithoutApproval: 10,
    showMonthlyPayments: true,
    displayFinancingTermOptions: true,
  })
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    sendEmailOnProposalCreation: true,
    sendEmailOnProposalSigned: true,
    notifyAdminOnLargeDiscounts: true,
    emailNotifications: ["admin@evergreenenergy.io"],
  })
  
  const handleSaveSettings = () => {
    // In a real implementation, this would call an API
    toast({
      title: "Settings saved",
      description: "Your system settings have been updated successfully."
    })
  }
  
  const handleInputChange = (section: string, field: string, value: any) => {
    switch (section) {
      case "general":
        setGeneralSettings({ ...generalSettings, [field]: value })
        break
      case "proposal":
        setProposalSettings({ ...proposalSettings, [field]: value })
        break
      case "financial":
        setFinancialSettings({ ...financialSettings, [field]: value })
        break
      case "notification":
        setNotificationSettings({ ...notificationSettings, [field]: value })
        break
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        ref={headerSection.ref as any}
        initial="hidden"
        animate={headerSection.isInView ? "visible" : "hidden"}
        variants={fadeIn}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-gray-500">Configure your application-wide settings</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            className="bg-rose-600 hover:bg-rose-700" 
            onClick={handleSaveSettings}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </motion.div>

      <motion.div
        ref={contentSection.ref as any}
        initial="hidden"
        animate={contentSection.isInView ? "visible" : "hidden"}
        variants={fadeIn}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>Manage all system-wide settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full justify-start mb-6 overflow-x-auto">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="proposal">Proposal</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="notification">Notifications</TabsTrigger>
              </TabsList>
              
              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={generalSettings.companyName}
                        onChange={(e) => handleInputChange("general", "companyName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">Company Email</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={generalSettings.companyEmail}
                        onChange={(e) => handleInputChange("general", "companyEmail", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">Company Phone</Label>
                      <Input
                        id="companyPhone"
                        value={generalSettings.companyPhone}
                        onChange={(e) => handleInputChange("general", "companyPhone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input
                        id="logoUrl"
                        value={generalSettings.logoUrl}
                        onChange={(e) => handleInputChange("general", "logoUrl", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="defaultCurrency">Default Currency</Label>
                      <Select
                        value={generalSettings.defaultCurrency}
                        onValueChange={(value) => handleInputChange("general", "defaultCurrency", value)}
                      >
                        <SelectTrigger id="defaultCurrency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeZone">Time Zone</Label>
                      <Select
                        value={generalSettings.timeZone}
                        onValueChange={(value) => handleInputChange("general", "timeZone", value)}
                      >
                        <SelectTrigger id="timeZone">
                          <SelectValue placeholder="Select time zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Proposal Settings */}
              <TabsContent value="proposal" className="space-y-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="defaultProposalExpiration">Default Proposal Expiration (hours)</Label>
                      <Input
                        id="defaultProposalExpiration"
                        type="number"
                        min="1"
                        value={proposalSettings.defaultProposalExpiration}
                        onChange={(e) => handleInputChange("proposal", "defaultProposalExpiration", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proposalNumberPrefix">Proposal Number Prefix</Label>
                      <Input
                        id="proposalNumberPrefix"
                        value={proposalSettings.proposalNumberPrefix}
                        onChange={(e) => handleInputChange("proposal", "proposalNumberPrefix", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Proposal Features</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enableUrgencyTimers" className="font-medium">Enable Urgency Timers</Label>
                        <p className="text-sm text-gray-500">Show countdown timers for special offers and limited-time discounts</p>
                      </div>
                      <Switch
                        id="enableUrgencyTimers"
                        checked={proposalSettings.enableUrgencyTimers}
                        onCheckedChange={(checked) => handleInputChange("proposal", "enableUrgencyTimers", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showDiscountExpiration" className="font-medium">Show Discount Expiration</Label>
                        <p className="text-sm text-gray-500">Display when special pricing or discounts will expire</p>
                      </div>
                      <Switch
                        id="showDiscountExpiration"
                        checked={proposalSettings.showDiscountExpiration}
                        onCheckedChange={(checked) => handleInputChange("proposal", "showDiscountExpiration", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoGenerateScopeNotes" className="font-medium">Auto-Generate Scope Notes</Label>
                        <p className="text-sm text-gray-500">Automatically generate detailed scope notes based on product selections</p>
                      </div>
                      <Switch
                        id="autoGenerateScopeNotes"
                        checked={proposalSettings.autoGenerateScopeNotes}
                        onCheckedChange={(checked) => handleInputChange("proposal", "autoGenerateScopeNotes", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="highImpactUpsellSuggestions" className="font-medium">High-Impact Upsell Suggestions</Label>
                        <p className="text-sm text-gray-500">Show high-conversion upsell options during the proposal creation process</p>
                      </div>
                      <Switch
                        id="highImpactUpsellSuggestions"
                        checked={proposalSettings.highImpactUpsellSuggestions}
                        onCheckedChange={(checked) => handleInputChange("proposal", "highImpactUpsellSuggestions", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="includeBrandingInProposals" className="font-medium">Include Branding in Proposals</Label>
                        <p className="text-sm text-gray-500">Display company logo and branding in customer-facing proposals</p>
                      </div>
                      <Switch
                        id="includeBrandingInProposals"
                        checked={proposalSettings.includeBrandingInProposals}
                        onCheckedChange={(checked) => handleInputChange("proposal", "includeBrandingInProposals", checked)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Financial Settings */}
              <TabsContent value="financial" className="space-y-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="defaultFinancingTerm">Default Financing Term (months)</Label>
                      <Select
                        value={financialSettings.defaultFinancingTerm}
                        onValueChange={(value) => handleInputChange("financial", "defaultFinancingTerm", value)}
                      >
                        <SelectTrigger id="defaultFinancingTerm">
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="36">36 months</SelectItem>
                          <SelectItem value="48">48 months</SelectItem>
                          <SelectItem value="60">60 months</SelectItem>
                          <SelectItem value="72">72 months</SelectItem>
                          <SelectItem value="84">84 months</SelectItem>
                          <SelectItem value="120">120 months</SelectItem>
                          <SelectItem value="180">180 months</SelectItem>
                          <SelectItem value="240">240 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultInterestRate">Default Interest Rate (%)</Label>
                      <Input
                        id="defaultInterestRate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={financialSettings.defaultInterestRate}
                        onChange={(e) => handleInputChange("financial", "defaultInterestRate", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="defaultMinimumDeposit">Default Minimum Deposit (%)</Label>
                      <Input
                        id="defaultMinimumDeposit"
                        type="number"
                        min="0"
                        max="100"
                        value={financialSettings.defaultMinimumDeposit}
                        onChange={(e) => handleInputChange("financial", "defaultMinimumDeposit", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxDiscountWithoutApproval">Max Discount Without Approval (%)</Label>
                      <Input
                        id="maxDiscountWithoutApproval"
                        type="number"
                        min="0"
                        max="100"
                        value={financialSettings.maxDiscountWithoutApproval}
                        onChange={(e) => handleInputChange("financial", "maxDiscountWithoutApproval", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Financing Display Options</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enableFinancingCalculator" className="font-medium">Enable Financing Calculator</Label>
                        <p className="text-sm text-gray-500">Allow users to calculate monthly payments based on different terms</p>
                      </div>
                      <Switch
                        id="enableFinancingCalculator"
                        checked={financialSettings.enableFinancingCalculator}
                        onCheckedChange={(checked) => handleInputChange("financial", "enableFinancingCalculator", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showMonthlyPayments" className="font-medium">Show Monthly Payments</Label>
                        <p className="text-sm text-gray-500">Display monthly payment options to customers</p>
                      </div>
                      <Switch
                        id="showMonthlyPayments"
                        checked={financialSettings.showMonthlyPayments}
                        onCheckedChange={(checked) => handleInputChange("financial", "showMonthlyPayments", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="displayFinancingTermOptions" className="font-medium">Display Financing Term Options</Label>
                        <p className="text-sm text-gray-500">Show different financing term options to customers</p>
                      </div>
                      <Switch
                        id="displayFinancingTermOptions"
                        checked={financialSettings.displayFinancingTermOptions}
                        onCheckedChange={(checked) => handleInputChange("financial", "displayFinancingTermOptions", checked)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Notification Settings */}
              <TabsContent value="notification" className="space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Notifications</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sendEmailOnProposalCreation" className="font-medium">Send Email on Proposal Creation</Label>
                        <p className="text-sm text-gray-500">Notify users when a new proposal is created</p>
                      </div>
                      <Switch
                        id="sendEmailOnProposalCreation"
                        checked={notificationSettings.sendEmailOnProposalCreation}
                        onCheckedChange={(checked) => handleInputChange("notification", "sendEmailOnProposalCreation", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sendEmailOnProposalSigned" className="font-medium">Send Email on Proposal Signed</Label>
                        <p className="text-sm text-gray-500">Notify users when a proposal is signed by the customer</p>
                      </div>
                      <Switch
                        id="sendEmailOnProposalSigned"
                        checked={notificationSettings.sendEmailOnProposalSigned}
                        onCheckedChange={(checked) => handleInputChange("notification", "sendEmailOnProposalSigned", checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Administrative Alerts</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifyAdminOnLargeDiscounts" className="font-medium">Notify Admin on Large Discounts</Label>
                        <p className="text-sm text-gray-500">Notify administrators when discounts exceed threshold</p>
                      </div>
                      <Switch
                        id="notifyAdminOnLargeDiscounts"
                        checked={notificationSettings.notifyAdminOnLargeDiscounts}
                        onCheckedChange={(checked) => handleInputChange("notification", "notifyAdminOnLargeDiscounts", checked)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emailNotifications">Email Notification Recipients</Label>
                      <Input
                        id="emailNotifications"
                        placeholder="Enter email addresses, comma separated"
                        value={notificationSettings.emailNotifications.join(", ")}
                        onChange={(e) => handleInputChange("notification", "emailNotifications", e.target.value.split(",").map(email => email.trim()))}
                      />
                      <p className="text-xs text-gray-500">Enter email addresses separated by commas</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 flex justify-end">
              <Button 
                className="bg-rose-600 hover:bg-rose-700" 
                onClick={handleSaveSettings}
              >
                <Save className="mr-2 h-4 w-4" />
                Save All Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
} 