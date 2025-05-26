"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("general")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [settings, setSettings] = useState({
    general: {
      companyName: "Evergreen Energy Upgrades",
      companyEmail: "info@evergreen-energy.com",
      companyPhone: "(555) 123-4567",
      companyAddress: "123 Green Street, Eco City, EC 12345",
      timezone: "America/New_York",
      dateFormat: "MM/DD/YYYY",
      logo: "/images/evergreen-logo.png",
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      proposalCreated: true,
      proposalSigned: true,
      userRegistration: true,
      dailyDigest: false,
      marketingUpdates: false,
    },
    proposals: {
      defaultExpirationDays: 30,
      requireApproval: true,
      allowDiscounts: true,
      maxDiscountPercent: 15,
      showTaxes: true,
      defaultTaxRate: 7.5,
      termsAndConditions: "Standard terms and conditions apply to all proposals...",
      emailTemplate: "Dear {customer_name},\n\nThank you for your interest in our services...",
    },
    appearance: {
      theme: "light",
      primaryColor: "#6EB52F",
      accentColor: "#4A7B1F",
      logoPosition: "left",
      showPriceBreakdown: true,
      showComparisons: true,
    },
    security: {
      twoFactorAuth: false,
      passwordExpiration: 90,
      sessionTimeout: 30,
      ipRestriction: false,
      allowedIPs: "",
    },
    integrations: {
      crmIntegration: true,
      crmProvider: "salesforce",
      paymentGateway: "stripe",
      calendarIntegration: true,
      calendarProvider: "google",
    },
    backup: {
      autoBackup: true,
      backupFrequency: "daily",
      backupRetention: 30,
      backupLocation: "cloud",
    },
  })

  const handleSettingChange = (category, setting, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: value,
      },
    })
  }

  const handleSaveSettings = () => {
    // In a real application, this would save to a backend
    console.log("Saving settings:", settings)
    setShowSaveDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure and customize your system settings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSaveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">\
