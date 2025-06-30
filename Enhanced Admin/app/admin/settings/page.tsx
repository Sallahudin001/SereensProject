"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Save,
  RefreshCw,
  Upload,
  Download,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  AlertCircle,
  CheckCircle,
  Database,
  CloudUpload,
} from "lucide-react"
import { QuickNav } from "@/components/admin/quick-nav"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  const [showBackupDialog, setShowBackupDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [restoreProgress, setRestoreProgress] = useState(0)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "Evergreen Home Upgrades",
    email: "info@evergreenenergy.io",
    phone: "(408) 333-9831",
    address: "123 Main Street, San Jose, CA 95129",
    website: "https://evergreenenergy.io",
    taxRate: 8.25,
    defaultCurrency: "USD",
    timezone: "America/Los_Angeles",
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    leadNotifications: true,
    contractSignedNotifications: true,
    dailyDigest: false,
    weeklyReport: true,
  })

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    primaryColor: "#10b981",
    accentColor: "#3b82f6",
    logoUrl: "/logo.png",
    showBranding: true,
    compactMode: false,
  })

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    passwordExpiration: 90,
    sessionTimeout: 30,
    ipRestriction: false,
    allowedIps: "",
    auditLogging: true,
  })

  const handleSaveSettings = () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setSuccessMessage("Settings saved successfully")
      setShowSuccessDialog(true)
    }, 1500)
  }

  const handleBackup = () => {
    setIsBackingUp(true)
    setBackupProgress(0)

    // Simulate backup process
    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsBackingUp(false)
          return 100
        }
        return prev + 10
      })
    }, 300)

    // Simulate completion
    setTimeout(() => {
      setIsBackingUp(false)
      setBackupProgress(100)
      setShowBackupDialog(false)
      setSuccessMessage("Backup created successfully")
      setShowSuccessDialog(true)
    }, 3500)
  }

  const handleRestore = () => {
    setIsRestoring(true)
    setRestoreProgress(0)

    // Simulate restore process
    const interval = setInterval(() => {
      setRestoreProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRestoring(false)
          return 100
        }
        return prev + 5
      })
    }, 200)

    // Simulate completion
    setTimeout(() => {
      setIsRestoring(false)
      setRestoreProgress(100)
      setShowRestoreDialog(false)
      setSuccessMessage("System restored successfully")
      setShowSuccessDialog(true)
    }, 4500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure system-wide settings and preferences.</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <QuickNav />

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic information about your company.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={generalSettings.companyName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company-email"
                      type="email"
                      className="pl-8"
                      value={generalSettings.email}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company-phone"
                      className="pl-8"
                      value={generalSettings.phone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company-website"
                      className="pl-8"
                      value={generalSettings.website}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, website: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company-address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company-address"
                      className="pl-8"
                      value={generalSettings.address}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    step="0.01"
                    value={generalSettings.taxRate}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, taxRate: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={generalSettings.defaultCurrency}
                    onValueChange={(value) => setGeneralSettings({ ...generalSettings, defaultCurrency: value })}
                  >
                    <SelectTrigger id="currency">
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
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when notifications are sent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                    }
                  />
                </div>
                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="appointment-reminders">Appointment Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send reminders for upcoming appointments</p>
                  </div>
                  <Switch
                    id="appointment-reminders"
                    checked={notificationSettings.appointmentReminders}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, appointmentReminders: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lead-notifications">New Lead Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications when new leads are created</p>
                  </div>
                  <Switch
                    id="lead-notifications"
                    checked={notificationSettings.leadNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, leadNotifications: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="contract-signed-notifications">Contract Signed Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications when contracts are signed</p>
                  </div>
                  <Switch
                    id="contract-signed-notifications"
                    checked={notificationSettings.contractSignedNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, contractSignedNotifications: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="daily-digest">Daily Digest</Label>
                    <p className="text-sm text-muted-foreground">Receive a daily summary of activities</p>
                  </div>
                  <Switch
                    id="daily-digest"
                    checked={notificationSettings.dailyDigest}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, dailyDigest: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-report">Weekly Report</Label>
                    <p className="text-sm text-muted-foreground">Receive a weekly summary report</p>
                  </div>
                  <Switch
                    id="weekly-report"
                    checked={notificationSettings.weeklyReport}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, weeklyReport: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={appearanceSettings.theme}
                    onValueChange={(value) => setAppearanceSettings({ ...appearanceSettings, theme: value })}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded-md border"
                      style={{ backgroundColor: appearanceSettings.primaryColor }}
                    />
                    <Input
                      id="primary-color"
                      type="text"
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, primaryColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded-md border"
                      style={{ backgroundColor: appearanceSettings.accentColor }}
                    />
                    <Input
                      id="accent-color"
                      type="text"
                      value={appearanceSettings.accentColor}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, accentColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input
                    id="logo-url"
                    value={appearanceSettings.logoUrl}
                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, logoUrl: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-branding">Show Branding</Label>
                    <p className="text-sm text-muted-foreground">Display company branding in the application</p>
                  </div>
                  <Switch
                    id="show-branding"
                    checked={appearanceSettings.showBranding}
                    onCheckedChange={(checked) =>
                      setAppearanceSettings({ ...appearanceSettings, showBranding: checked })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compact-mode">Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Use a more compact layout for the interface</p>
                  </div>
                  <Switch
                    id="compact-mode"
                    checked={appearanceSettings.compactMode}
                    onCheckedChange={(checked) =>
                      setAppearanceSettings({ ...appearanceSettings, compactMode: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access control settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor-auth">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require two-factor authentication for all users</p>
                  </div>
                  <Switch
                    id="two-factor-auth"
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                  />
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password-expiration">Password Expiration (days)</Label>
                    <Input
                      id="password-expiration"
                      type="number"
                      value={securitySettings.passwordExpiration}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          passwordExpiration: Number.parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of days before passwords expire. Set to 0 to disable.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) =>
                        setSecuritySettings({ ...securitySettings, sessionTimeout: Number.parseInt(e.target.value) })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of minutes of inactivity before a user is logged out.
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ip-restriction">IP Restriction</Label>
                    <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
                  </div>
                  <Switch
                    id="ip-restriction"
                    checked={securitySettings.ipRestriction}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, ipRestriction: checked })}
                  />
                </div>
                {securitySettings.ipRestriction && (
                  <div className="space-y-2">
                    <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                    <Textarea
                      id="allowed-ips"
                      placeholder="Enter IP addresses, one per line"
                      value={securitySettings.allowedIps}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, allowedIps: e.target.value })}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter IP addresses or CIDR ranges, one per line (e.g., 192.168.1.1 or 10.0.0.0/24)
                    </p>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="audit-logging">Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">Log all user actions for security auditing</p>
                  </div>
                  <Switch
                    id="audit-logging"
                    checked={securitySettings.auditLogging}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, auditLogging: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>Manage system backups and restoration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Backup System</CardTitle>
                    <CardDescription>Create a backup of your system data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Backups include all system data, including users, contracts, pricing, and settings.
                    </p>
                    <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <CloudUpload className="mr-2 h-4 w-4" />
                          Create Backup
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Create System Backup</DialogTitle>
                          <DialogDescription>This will create a complete backup of your system data.</DialogDescription>
                        </DialogHeader>
                        {isBackingUp ? (
                          <div className="space-y-4 py-4">
                            <div className="flex justify-between text-sm">
                              <span>Creating backup...</span>
                              <span>{backupProgress}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-300 ease-in-out"
                                style={{ width: `${backupProgress}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Please do not close this window while the backup is in progress.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4 py-4">
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                                <div>
                                  <p className="text-xs text-amber-700 dark:text-amber-400">
                                    Creating a backup may take several minutes depending on the amount of data.
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="backup-name">Backup Name</Label>
                              <Input
                                id="backup-name"
                                defaultValue={`Backup-${new Date().toISOString().split("T")[0]}`}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id="include-files" className="rounded" defaultChecked />
                              <Label htmlFor="include-files">Include uploaded files</Label>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          {!isBackingUp && (
                            <>
                              <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleBackup}>Start Backup</Button>
                            </>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Previous Backup
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Restore System</CardTitle>
                    <CardDescription>Restore your system from a backup</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Restoring will replace all current data with the data from the backup.
                    </p>
                    <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full" variant="outline">
                          <Upload className="mr-2 h-4 w-4" />
                          Restore from Backup
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Restore System</DialogTitle>
                          <DialogDescription>This will restore your system from a backup file.</DialogDescription>
                        </DialogHeader>
                        {isRestoring ? (
                          <div className="space-y-4 py-4">
                            <div className="flex justify-between text-sm">
                              <span>Restoring system...</span>
                              <span>{restoreProgress}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-300 ease-in-out"
                                style={{ width: `${restoreProgress}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Please do not close this window while the restoration is in progress.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4 py-4">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                                <div>
                                  <p className="text-xs text-red-700 dark:text-red-400">
                                    Warning: Restoring will replace all current data. This action cannot be undone.
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="backup-file">Select Backup File</Label>
                              <div
                                className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-md p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => {
                                  const fileInput = document.getElementById("backup-file");
                                  if (fileInput) fileInput.click();
                                }}
                              >
                                <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground">Backup file (.zip)</p>
                                <Input id="backup-file" type="file" accept=".zip" className="hidden" />
                              </div>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          {!isRestoring && (
                            <>
                              <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleRestore} variant="destructive">
                                Restore System
                              </Button>
                            </>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="w-full text-xs text-muted-foreground">
                      Last backup: <span className="font-medium">May 18, 2025 at 10:45 AM</span>
                    </div>
                  </CardFooter>
                </Card>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Automatic Backups</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      The system automatically creates daily backups at 2:00 AM. Backups are retained for 30 days.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center space-x-2 py-6">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <p className="text-lg font-semibold">{successMessage}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
