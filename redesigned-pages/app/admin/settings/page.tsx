"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

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

// Define types for settings
type GeneralSettings = {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  timezone: string;
  dateFormat: string;
  logo: string;
}

type NotificationSettings = {
  emailNotifications: boolean;
  proposalCreated: boolean;
  proposalSigned: boolean;
  userRegistration: boolean;
  dailyDigest: boolean;
  marketingUpdates: boolean;
}

type ProposalSettings = {
  defaultExpirationDays: number;
  requireApproval: boolean;
  allowDiscounts: boolean;
  maxDiscountPercent: number;
  showTaxes: boolean;
  defaultTaxRate: number;
  termsAndConditions: string;
  emailTemplate: string;
}

type AppearanceSettings = {
  theme: string;
  primaryColor: string;
  accentColor: string;
  logoPosition: string;
  showPriceBreakdown: boolean;
  showComparisons: boolean;
}

type SecuritySettings = {
  twoFactorAuth: boolean;
  passwordExpiration: number;
  sessionTimeout: number;
  ipRestriction: boolean;
  allowedIPs: string;
}

type IntegrationSettings = {
  crmIntegration: boolean;
  crmProvider: string;
  paymentGateway: string;
  calendarIntegration: boolean;
  calendarProvider: string;
}

type BackupSettings = {
  autoBackup: boolean;
  backupFrequency: string;
  backupRetention: number;
  backupLocation: string;
}

type AllSettings = {
  general: GeneralSettings;
  notifications: NotificationSettings;
  proposals: ProposalSettings;
  appearance: AppearanceSettings;
  security: SecuritySettings;
  integrations: IntegrationSettings;
  backup: BackupSettings;
}

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("general")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [settings, setSettings] = useState<AllSettings>({
    general: {
      companyName: "Evergreen Home Upgrades",
      companyEmail: "info@evergreenenergy.io",
      companyPhone: "(408) 333-9831",
      companyAddress: "123 Green Street, Eco City, EC 12345",
      timezone: "America/New_York",
      dateFormat: "MM/DD/YYYY",
      logo: "/evergreenlogo.svg",
    },
    notifications: {
      emailNotifications: true,
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

  const handleSettingChange = (category: keyof AllSettings, setting: string, value: any) => {
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
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic information about your company.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    value={settings.general.companyName} 
                    onChange={(e) => handleSettingChange("general", "companyName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email Address</Label>
                  <Input 
                    id="companyEmail" 
                    type="email" 
                    value={settings.general.companyEmail} 
                    onChange={(e) => handleSettingChange("general", "companyEmail", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how notifications are sent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <Switch 
                    id="emailNotifications" 
                    checked={settings.notifications.emailNotifications} 
                    onCheckedChange={(checked) => handleSettingChange("notifications", "emailNotifications", checked)}
                  />
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be similarly structured */}
        <TabsContent value="proposals">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Settings</CardTitle>
              <CardDescription>Configure proposal defaults and behaviors.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Proposal settings content */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your application.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Appearance settings content */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure access control and security options.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Security settings content */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Connect with external services and platforms.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Integration settings content */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>Manage system backups and restoration.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Backup settings content */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
