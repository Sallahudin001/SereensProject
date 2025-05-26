"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Gift,
  Target,
  TrendingUp
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SpecialOffer {
  id: number
  name: string
  description: string
  category: string
  discount_amount?: number
  discount_percentage?: number
  free_product_service?: string
  expiration_type: string
  expiration_value?: number
  is_active: boolean
  created_at: string
}

interface BundleRule {
  id: number
  name: string
  description: string
  required_services: string[]
  min_services: number
  discount_type: string
  discount_value?: number
  free_service?: string
  bonus_message: string
  priority: number
  is_active: boolean
}

interface LifestyleUpsell {
  id: number
  trigger_phrase: string
  product_suggestion: string
  category: string
  base_price: number
  monthly_impact: number | string
  description: string
  display_order: number
  is_active: boolean
}

export default function OffersPage() {
  const [activeTab, setActiveTab] = useState("special")
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([])
  const [bundleRules, setBundleRules] = useState<BundleRule[]>([])
  const [lifestyleUpsells, setLifestyleUpsells] = useState<LifestyleUpsell[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Dialog states
  const [showSpecialDialog, setShowSpecialDialog] = useState(false)
  const [showBundleDialog, setShowBundleDialog] = useState(false)
  const [showLifestyleDialog, setShowLifestyleDialog] = useState(false)
  
  // Form states
  const [editingSpecial, setEditingSpecial] = useState<SpecialOffer | null>(null)
  const [editingBundle, setBundleRule] = useState<BundleRule | null>(null)
  const [editingLifestyle, setEditingLifestyle] = useState<LifestyleUpsell | null>(null)

  // Form data states
  const [specialForm, setSpecialForm] = useState({
    name: "",
    description: "",
    category: "Roofing",
    discount_amount: "",
    discount_percentage: "",
    free_product_service: "",
    expiration_type: "days",
    expiration_value: "",
    is_active: true
  })

  const [bundleForm, setBundleForm] = useState({
    name: "",
    description: "",
    required_services: [] as string[],
    min_services: 2,
    discount_type: "percentage",
    discount_value: "",
    free_service: "",
    bonus_message: "",
    priority: 0,
    is_active: true
  })

  const [lifestyleForm, setLifestyleForm] = useState({
    trigger_phrase: "",
    product_suggestion: "",
    category: "comfort",
    base_price: "",
    monthly_impact: "",
    description: "",
    display_order: 0,
    is_active: true
  })

  const categories = ["Roofing", "Windows", "HVAC", "Paint", "Garage Doors", "Bundle", "Solar"]
  const services = ["roofing", "windows-doors", "hvac", "paint", "garage-doors"]
  const lifestyleCategories = ["comfort", "efficiency", "curb_appeal", "smart_home", "security"]

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/offers?type=all')
      if (!response.ok) throw new Error('Failed to fetch offers')
      
      const data = await response.json()
      setSpecialOffers(data.special || [])
      setBundleRules(data.bundles || [])
      setLifestyleUpsells(data.lifestyle || [])
    } catch (error) {
      console.error('Error fetching offers:', error)
      toast({
        title: "Error",
        description: "Failed to load offers. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSpecialOffer = async () => {
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'special', ...specialForm })
      })

      if (!response.ok) throw new Error('Failed to create offer')
      
      const newOffer = await response.json()
      setSpecialOffers([...specialOffers, newOffer])
      setShowSpecialDialog(false)
      resetSpecialForm()
      
      toast({
        title: "Success",
        description: "Special offer created successfully!"
      })
    } catch (error) {
      console.error('Error creating special offer:', error)
      toast({
        title: "Error",
        description: "Failed to create special offer.",
        variant: "destructive"
      })
    }
  }

  const handleCreateBundleRule = async () => {
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'bundle', ...bundleForm })
      })

      if (!response.ok) throw new Error('Failed to create bundle rule')
      
      const newRule = await response.json()
      setBundleRules([...bundleRules, newRule])
      setShowBundleDialog(false)
      resetBundleForm()
      
      toast({
        title: "Success",
        description: "Bundle rule created successfully!"
      })
    } catch (error) {
      console.error('Error creating bundle rule:', error)
      toast({
        title: "Error",
        description: "Failed to create bundle rule.",
        variant: "destructive"
      })
    }
  }

  const handleCreateLifestyleUpsell = async () => {
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'lifestyle', ...lifestyleForm })
      })

      if (!response.ok) throw new Error('Failed to create lifestyle upsell')
      
      const newUpsell = await response.json()
      setLifestyleUpsells([...lifestyleUpsells, newUpsell])
      setShowLifestyleDialog(false)
      resetLifestyleForm()
      
      toast({
        title: "Success",
        description: "Lifestyle upsell created successfully!"
      })
    } catch (error) {
      console.error('Error creating lifestyle upsell:', error)
      toast({
        title: "Error",
        description: "Failed to create lifestyle upsell.",
        variant: "destructive"
      })
    }
  }

  const toggleOfferStatus = async (type: string, id: number, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, is_active: !currentStatus })
      })

      if (!response.ok) throw new Error('Failed to update offer status')
      
      // Update local state
      if (type === 'special') {
        setSpecialOffers(offers => 
          offers.map(offer => 
            offer.id === id ? { ...offer, is_active: !currentStatus } : offer
          )
        )
      } else if (type === 'bundle') {
        setBundleRules(rules => 
          rules.map(rule => 
            rule.id === id ? { ...rule, is_active: !currentStatus } : rule
          )
        )
      } else if (type === 'lifestyle') {
        setLifestyleUpsells(upsells => 
          upsells.map(upsell => 
            upsell.id === id ? { ...upsell, is_active: !currentStatus } : upsell
          )
        )
      }

      toast({
        title: "Success",
        description: `Offer ${!currentStatus ? 'activated' : 'deactivated'} successfully!`
      })
    } catch (error) {
      console.error('Error updating offer status:', error)
      toast({
        title: "Error",
        description: "Failed to update offer status.",
        variant: "destructive"
      })
    }
  }

  const deleteOffer = async (type: string, id: number) => {
    if (!confirm('Are you sure you want to delete this offer?')) return

    try {
      const response = await fetch(`/api/offers?type=${type}&id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete offer')
      
      // Update local state
      if (type === 'special') {
        setSpecialOffers(offers => offers.filter(offer => offer.id !== id))
      } else if (type === 'bundle') {
        setBundleRules(rules => rules.filter(rule => rule.id !== id))
      } else if (type === 'lifestyle') {
        setLifestyleUpsells(upsells => upsells.filter(upsell => upsell.id !== id))
      }

      toast({
        title: "Success",
        description: "Offer deleted successfully!"
      })
    } catch (error) {
      console.error('Error deleting offer:', error)
      toast({
        title: "Error",
        description: "Failed to delete offer.",
        variant: "destructive"
      })
    }
  }

  const resetSpecialForm = () => {
    setSpecialForm({
      name: "",
      description: "",
      category: "Roofing",
      discount_amount: "",
      discount_percentage: "",
      free_product_service: "",
      expiration_type: "days",
      expiration_value: "",
      is_active: true
    })
    setEditingSpecial(null)
  }

  const resetBundleForm = () => {
    setBundleForm({
      name: "",
      description: "",
      required_services: [],
      min_services: 2,
      discount_type: "percentage",
      discount_value: "",
      free_service: "",
      bonus_message: "",
      priority: 0,
      is_active: true
    })
    setBundleRule(null)
  }

  const resetLifestyleForm = () => {
    setLifestyleForm({
      trigger_phrase: "",
      product_suggestion: "",
      category: "comfort",
      base_price: "",
      monthly_impact: "",
      description: "",
      display_order: 0,
      is_active: true
    })
    setEditingLifestyle(null)
  }

  const handleServiceToggle = (service: string) => {
    setBundleForm(prev => ({
      ...prev,
      required_services: prev.required_services.includes(service)
        ? prev.required_services.filter(s => s !== service)
        : [...prev.required_services, service]
    }))
  }

  const filteredSpecialOffers = specialOffers.filter(offer =>
    offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredBundleRules = bundleRules.filter(rule =>
    rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredLifestyleUpsells = lifestyleUpsells.filter(upsell =>
    upsell.trigger_phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
    upsell.product_suggestion.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Offers & Upsells Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage time-sensitive offers, bundle discounts, and lifestyle-based upsells
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search offers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="special" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time-Sensitive Offers
          </TabsTrigger>
          <TabsTrigger value="bundle" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Bundle Rules
          </TabsTrigger>
          <TabsTrigger value="lifestyle" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Lifestyle Upsells
          </TabsTrigger>
        </TabsList>

        {/* Time-Sensitive Offers Tab */}
        <TabsContent value="special" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Time-Sensitive Special Offers</CardTitle>
                  <CardDescription>
                    Create offers with expiration timers that reps can add to proposals
                  </CardDescription>
                </div>
                <Dialog open={showSpecialDialog} onOpenChange={setShowSpecialDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={resetSpecialForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Offer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Time-Sensitive Offer</DialogTitle>
                      <DialogDescription>
                        Set up a special offer with time constraints that reps can apply to proposals
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="special-name">Offer Name</Label>
                          <Input
                            id="special-name"
                            value={specialForm.name}
                            onChange={(e) => setSpecialForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Free Gutters & Downspouts"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="special-category">Category</Label>
                          <Select
                            value={specialForm.category}
                            onValueChange={(value) => setSpecialForm(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="special-description">Description</Label>
                        <Textarea
                          id="special-description"
                          value={specialForm.description}
                          onChange={(e) => setSpecialForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the offer details..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="discount-amount">Dollar Discount</Label>
                          <Input
                            id="discount-amount"
                            type="number"
                            value={specialForm.discount_amount}
                            onChange={(e) => setSpecialForm(prev => ({ ...prev, discount_amount: e.target.value }))}
                            placeholder="500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="discount-percentage">Percentage Discount</Label>
                          <Input
                            id="discount-percentage"
                            type="number"
                            value={specialForm.discount_percentage}
                            onChange={(e) => setSpecialForm(prev => ({ ...prev, discount_percentage: e.target.value }))}
                            placeholder="10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="free-service">Free Service/Product</Label>
                          <Input
                            id="free-service"
                            value={specialForm.free_product_service}
                            onChange={(e) => setSpecialForm(prev => ({ ...prev, free_product_service: e.target.value }))}
                            placeholder="Smart Thermostat"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiration-type">Expiration Type</Label>
                          <Select
                            value={specialForm.expiration_type}
                            onValueChange={(value) => setSpecialForm(prev => ({ ...prev, expiration_type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hours">Hours</SelectItem>
                              <SelectItem value="days">Days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiration-value">Expiration Value</Label>
                          <Input
                            id="expiration-value"
                            type="number"
                            value={specialForm.expiration_value}
                            onChange={(e) => setSpecialForm(prev => ({ ...prev, expiration_value: e.target.value }))}
                            placeholder={specialForm.expiration_type === 'hours' ? '72' : '7'}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="special-active"
                          checked={specialForm.is_active}
                          onCheckedChange={(checked) => setSpecialForm(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="special-active">Active</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowSpecialDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateSpecialOffer}>
                        Create Offer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading offers...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSpecialOffers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{offer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {offer.description.length > 50 
                                ? `${offer.description.substring(0, 50)}...`
                                : offer.description
                              }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{offer.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {offer.discount_amount && `$${offer.discount_amount}`}
                          {offer.discount_percentage && `${offer.discount_percentage}%`}
                          {offer.free_product_service && `Free: ${offer.free_product_service}`}
                        </TableCell>
                        <TableCell>
                          {offer.expiration_value} {offer.expiration_type}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={offer.is_active}
                              onCheckedChange={() => toggleOfferStatus('special', offer.id, offer.is_active)}
                            />
                            {offer.is_active ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteOffer('special', offer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bundle Rules Tab */}
        <TabsContent value="bundle" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Smart Bundle Discount Rules</CardTitle>
                  <CardDescription>
                    Automatic discounts applied when customers select multiple services
                  </CardDescription>
                </div>
                <Dialog open={showBundleDialog} onOpenChange={setShowBundleDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={resetBundleForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Bundle Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Create Bundle Discount Rule</DialogTitle>
                      <DialogDescription>
                        Set up automatic discounts when customers select specific service combinations
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bundle-name">Rule Name</Label>
                          <Input
                            id="bundle-name"
                            value={bundleForm.name}
                            onChange={(e) => setBundleForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Roof + Windows Bundle"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bundle-priority">Priority</Label>
                          <Input
                            id="bundle-priority"
                            type="number"
                            value={bundleForm.priority}
                            onChange={(e) => setBundleForm(prev => ({ ...prev, priority: Number(e.target.value) }))}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bundle-description">Description</Label>
                        <Textarea
                          id="bundle-description"
                          value={bundleForm.description}
                          onChange={(e) => setBundleForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe when this bundle applies..."
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Required Services</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {services.map(service => (
                            <div key={service} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`service-${service}`}
                                checked={bundleForm.required_services.includes(service)}
                                onChange={() => handleServiceToggle(service)}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={`service-${service}`} className="text-sm">
                                {service.replace('-', ' & ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="discount-type">Discount Type</Label>
                          <Select
                            value={bundleForm.discount_type}
                            onValueChange={(value) => setBundleForm(prev => ({ ...prev, discount_type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage</SelectItem>
                              <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                              <SelectItem value="free_service">Free Service</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="discount-value">Discount Value</Label>
                          <Input
                            id="discount-value"
                            type="number"
                            value={bundleForm.discount_value}
                            onChange={(e) => setBundleForm(prev => ({ ...prev, discount_value: e.target.value }))}
                            placeholder={bundleForm.discount_type === 'percentage' ? '5' : '1000'}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="free-service-bundle">Free Service</Label>
                          <Input
                            id="free-service-bundle"
                            value={bundleForm.free_service}
                            onChange={(e) => setBundleForm(prev => ({ ...prev, free_service: e.target.value }))}
                            placeholder="Smart Thermostat"
                            disabled={bundleForm.discount_type !== 'free_service'}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bonus-message">Bonus Message</Label>
                        <Textarea
                          id="bonus-message"
                          value={bundleForm.bonus_message}
                          onChange={(e) => setBundleForm(prev => ({ ...prev, bonus_message: e.target.value }))}
                          placeholder="Bundle a roof + new windows today and get an automatic 5% off."
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="bundle-active"
                          checked={bundleForm.is_active}
                          onCheckedChange={(checked) => setBundleForm(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="bundle-active">Active</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowBundleDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateBundleRule}>
                        Create Bundle Rule
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading bundle rules...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Required Services</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBundleRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rule.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {rule.bonus_message?.length > 40 
                                ? `${rule.bonus_message.substring(0, 40)}...`
                                : rule.bonus_message
                              }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {rule.required_services.map(service => (
                              <Badge key={service} variant="secondary" className="text-xs">
                                {service.replace('-', ' & ')}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {rule.discount_type === 'percentage' && `${rule.discount_value}%`}
                          {rule.discount_type === 'fixed_amount' && `$${rule.discount_value}`}
                          {rule.discount_type === 'free_service' && `Free: ${rule.free_service}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={rule.is_active}
                              onCheckedChange={() => toggleOfferStatus('bundle', rule.id, rule.is_active)}
                            />
                            {rule.is_active ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteOffer('bundle', rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lifestyle Upsells Tab */}
        <TabsContent value="lifestyle" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Lifestyle-Based Upsells</CardTitle>
                  <CardDescription>
                    Emotional trigger-based upsells that show monthly payment impacts
                  </CardDescription>
                </div>
                <Dialog open={showLifestyleDialog} onOpenChange={setShowLifestyleDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={resetLifestyleForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Lifestyle Upsell
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Lifestyle Upsell</DialogTitle>
                      <DialogDescription>
                        Create emotional trigger-based upsells with monthly payment impacts
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="trigger-phrase">Trigger Phrase</Label>
                          <Input
                            id="trigger-phrase"
                            value={lifestyleForm.trigger_phrase}
                            onChange={(e) => setLifestyleForm(prev => ({ ...prev, trigger_phrase: e.target.value }))}
                            placeholder="Want it quieter inside?"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="product-suggestion">Product Suggestion</Label>
                          <Input
                            id="product-suggestion"
                            value={lifestyleForm.product_suggestion}
                            onChange={(e) => setLifestyleForm(prev => ({ ...prev, product_suggestion: e.target.value }))}
                            placeholder="Add dual-pane windows"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lifestyle-category">Category</Label>
                        <Select
                          value={lifestyleForm.category}
                          onValueChange={(value) => setLifestyleForm(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {lifestyleCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>
                                {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="base-price">Base Price ($)</Label>
                          <Input
                            id="base-price"
                            type="number"
                            value={lifestyleForm.base_price}
                            onChange={(e) => setLifestyleForm(prev => ({ ...prev, base_price: e.target.value }))}
                            placeholder="4000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="monthly-impact">Monthly Impact ($)</Label>
                          <Input
                            id="monthly-impact"
                            type="number"
                            step="0.01"
                            value={lifestyleForm.monthly_impact}
                            onChange={(e) => setLifestyleForm(prev => ({ ...prev, monthly_impact: e.target.value }))}
                            placeholder="40.00"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lifestyle-description">Description</Label>
                        <Textarea
                          id="lifestyle-description"
                          value={lifestyleForm.description}
                          onChange={(e) => setLifestyleForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Dual-pane windows significantly reduce outside noise"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="display-order">Display Order</Label>
                          <Input
                            id="display-order"
                            type="number"
                            value={lifestyleForm.display_order}
                            onChange={(e) => setLifestyleForm(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                            placeholder="0"
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                          <Switch
                            id="lifestyle-active"
                            checked={lifestyleForm.is_active}
                            onCheckedChange={(checked) => setLifestyleForm(prev => ({ ...prev, is_active: checked }))}
                          />
                          <Label htmlFor="lifestyle-active">Active</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowLifestyleDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateLifestyleUpsell}>
                        Create Lifestyle Upsell
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading lifestyle upsells...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trigger Phrase</TableHead>
                      <TableHead>Product Suggestion</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price Impact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLifestyleUpsells.map((upsell) => (
                      <TableRow key={upsell.id}>
                        <TableCell>
                          <div className="font-medium">{upsell.trigger_phrase}</div>
                          <div className="text-sm text-muted-foreground">
                            {upsell.description?.length > 30 
                              ? `${upsell.description.substring(0, 30)}...`
                              : upsell.description
                            }
                          </div>
                        </TableCell>
                        <TableCell>{upsell.product_suggestion}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {upsell.category.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">${upsell.base_price}</div>
                            <div className="text-sm text-muted-foreground">
                              +${upsell.monthly_impact}/mo
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={upsell.is_active}
                              onCheckedChange={() => toggleOfferStatus('lifestyle', upsell.id, upsell.is_active)}
                            />
                            {upsell.is_active ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteOffer('lifestyle', upsell.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 