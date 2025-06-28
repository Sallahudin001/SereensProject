"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Clock,
  Zap,
  Target,
  Gift,
  CheckCircle,
  AlertTriangle,
  Edit,
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

interface CustomizedOffer {
  originalOfferId: number
  name: string
  description: string
  discount_amount?: number
  discount_percentage?: number
  free_product_service?: string
  expiration_value?: number
  expiration_type: string
}

interface EnhancedRepOfferSelectorProps {
  services: string[]
  selectedOffers: number[]
  customizedOffers?: CustomizedOffer[]
  onOffersChange: (offerIds: number[], customizedOffers?: CustomizedOffer[]) => void
}

export default function EnhancedRepOfferSelector({ 
  services, 
  selectedOffers, 
  customizedOffers = [],
  onOffersChange 
}: EnhancedRepOfferSelectorProps) {
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([])
  const [currentCustomizedOffers, setCurrentCustomizedOffers] = useState<CustomizedOffer[]>(customizedOffers)
  const [loading, setLoading] = useState(true)
  
  // Customization dialog state
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false)
  const [customizingOffer, setCustomizingOffer] = useState<SpecialOffer | null>(null)
  const [customForm, setCustomForm] = useState({
    name: "",
    description: "",
    discount_amount: "",
    discount_percentage: "",
    free_product_service: "",
    expiration_type: "hours",
    expiration_value: "",
    offer_type: "discount_amount" // discount_amount, discount_percentage, free_service
  })

  useEffect(() => {
    fetchSpecialOffers()
  }, [services])

  useEffect(() => {
    setCurrentCustomizedOffers(customizedOffers)
  }, [customizedOffers])

  const fetchSpecialOffers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/offers?type=special')
      if (response.ok) {
        const offers = await response.json()
        setSpecialOffers(offers.filter((offer: SpecialOffer) => offer.is_active))
      }
    } catch (error) {
      console.error('Error fetching special offers:', error)
      toast({
        title: "Error",
        description: "Failed to load special offers. Please refresh the page.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleOfferSelection = (offerId: number) => {
    const newSelection = selectedOffers.includes(offerId)
      ? selectedOffers.filter(id => id !== offerId)
      : [...selectedOffers, offerId]
    
    onOffersChange(newSelection, currentCustomizedOffers)
  }

  const handleCustomizeOffer = (offer: SpecialOffer) => {
    setCustomizingOffer(offer)
    
    // Check if this offer already has customizations
    const existingCustomization = currentCustomizedOffers.find(
      c => c.originalOfferId === offer.id
    )
    
    if (existingCustomization) {
      setCustomForm({
        name: existingCustomization.name,
        description: existingCustomization.description,
        discount_amount: existingCustomization.discount_amount?.toString() || "",
        discount_percentage: existingCustomization.discount_percentage?.toString() || "",
        free_product_service: existingCustomization.free_product_service || "",
        expiration_type: existingCustomization.expiration_type,
        expiration_value: existingCustomization.expiration_value?.toString() || "",
        offer_type: existingCustomization.discount_amount ? "discount_amount" : 
                   existingCustomization.discount_percentage ? "discount_percentage" : "free_service"
      })
    } else {
      setCustomForm({
        name: offer.name,
        description: offer.description,
        discount_amount: offer.discount_amount?.toString() || "",
        discount_percentage: offer.discount_percentage?.toString() || "",
        free_product_service: offer.free_product_service || "",
        expiration_type: offer.expiration_type,
        expiration_value: offer.expiration_value?.toString() || "",
        offer_type: offer.discount_amount ? "discount_amount" : 
                   offer.discount_percentage ? "discount_percentage" : "free_service"
      })
    }
    setShowCustomizeDialog(true)
  }

  const handleSaveCustomization = () => {
    if (!customizingOffer) return

    // Validate form
    if (!customForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Offer name is required.",
        variant: "destructive"
      })
      return
    }

    if (customForm.offer_type === "discount_amount" && !customForm.discount_amount) {
      toast({
        title: "Validation Error", 
        description: "Discount amount is required.",
        variant: "destructive"
      })
      return
    }

    if (customForm.offer_type === "discount_percentage" && !customForm.discount_percentage) {
      toast({
        title: "Validation Error",
        description: "Discount percentage is required.",
        variant: "destructive"
      })
      return
    }

    if (customForm.offer_type === "free_service" && !customForm.free_product_service) {
      toast({
        title: "Validation Error",
        description: "Free service description is required.",
        variant: "destructive"
      })
      return
    }

    // Create customized offer
    const customizedOffer: CustomizedOffer = {
      originalOfferId: customizingOffer.id,
      name: customForm.name,
      description: customForm.description,
      discount_amount: customForm.offer_type === "discount_amount" ? 
        parseFloat(customForm.discount_amount) : undefined,
      discount_percentage: customForm.offer_type === "discount_percentage" ? 
        parseFloat(customForm.discount_percentage) : undefined,
      free_product_service: customForm.offer_type === "free_service" ? 
        customForm.free_product_service : undefined,
      expiration_value: parseInt(customForm.expiration_value) || customizingOffer.expiration_value,
      expiration_type: customForm.expiration_type
    }

    // Update customized offers list
    const updatedCustomizedOffers = currentCustomizedOffers.filter(
      offer => offer.originalOfferId !== customizingOffer.id
    )
    updatedCustomizedOffers.push(customizedOffer)
    setCurrentCustomizedOffers(updatedCustomizedOffers)

    // Auto-select the customized offer
    const newSelection = selectedOffers.includes(customizingOffer.id) 
      ? selectedOffers 
      : [...selectedOffers, customizingOffer.id]

    onOffersChange(newSelection, updatedCustomizedOffers)

    setShowCustomizeDialog(false)
    setCustomizingOffer(null)
    
    toast({
      title: "Offer Customized",
      description: "Your customized offer has been saved and will be applied to this proposal.",
    })
  }

  const getOfferRelevance = (offer: SpecialOffer): 'high' | 'medium' | 'low' => {
    const serviceCategories = services.map(service => {
      switch (service.toLowerCase()) {
        case 'roofing': return 'Roofing'
        case 'windows-doors': return 'Windows'
        case 'hvac': return 'HVAC'
        case 'paint': return 'Paint'
        case 'garage-doors': return 'Garage Doors'
        default: return 'Any'
      }
    })

    if (offer.category === 'Bundle' || serviceCategories.includes(offer.category as any)) {
      return 'high'
    }
    if (offer.category === 'Any') {
      return 'medium'
    }
    return 'low'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Bundle': return <Gift className="h-4 w-4" />
      case 'Roofing': return <Target className="h-4 w-4" />
      case 'Windows': return <Zap className="h-4 w-4" />
      case 'HVAC': return <TrendingUp className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const formatOfferValue = (offer: SpecialOffer, customization?: CustomizedOffer): string => {
    if (customization) {
      if (customization.discount_amount) {
        return `$${customization.discount_amount} off`
      }
      if (customization.discount_percentage) {
        return `${customization.discount_percentage}% off`
      }
      if (customization.free_product_service) {
        return `FREE: ${customization.free_product_service}`
      }
    }

    if (offer.discount_amount) {
      return `$${offer.discount_amount} off`
    }
    if (offer.discount_percentage) {
      return `${offer.discount_percentage}% off`
    }
    if (offer.free_product_service) {
      return `FREE: ${offer.free_product_service}`
    }
    return 'Special offer'
  }

  const formatExpiration = (offer: SpecialOffer, customization?: CustomizedOffer): string => {
    const expirationValue = customization?.expiration_value || offer.expiration_value
    const expirationType = customization?.expiration_type || offer.expiration_type
    
    if (!expirationValue) return 'Limited time'
    
    return expirationType === 'hours' 
      ? `${expirationValue} hour${expirationValue !== 1 ? 's' : ''}`
      : `${expirationValue} day${expirationValue !== 1 ? 's' : ''}`
  }

  const getCustomization = (offerId: number): CustomizedOffer | undefined => {
    return currentCustomizedOffers.find(c => c.originalOfferId === offerId)
  }

  // Group offers by relevance
  const relevantOffers = specialOffers.filter(offer => getOfferRelevance(offer) === 'high')
  const generalOffers = specialOffers.filter(offer => getOfferRelevance(offer) === 'medium')

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Sales Offers</h2>
          <p className="text-gray-600">Loading available time-sensitive offers...</p>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Clock className="h-6 w-6 text-amber-600" />
          Sales Offers & Customization
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Select and customize time-sensitive offers to match your customer's needs. 
          You can adjust discount amounts, descriptions, and timing to maximize conversion.
        </p>
      </div>
      
      {/* Offers Selection Card */}
      <Card className="border-2 border-amber-200 shadow-lg">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-full">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-900">⚡ Limited Time Offers</h3>
              <p className="text-amber-700 text-sm">
                Select offers and customize them to fit your customer's specific situation
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Recommended Offers */}
          {relevantOffers.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-emerald-600" />
                <h4 className="text-lg font-semibold text-gray-900">
                  🎯 Recommended for {services.join(' + ')}
                </h4>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  High Conversion
                </Badge>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {relevantOffers.map(offer => {
                  const customization = getCustomization(offer.id)
                  const isSelected = selectedOffers.includes(offer.id)
                  const isCustomized = !!customization
                  
                  return (
                    <Card key={offer.id} className={`transition-all duration-300 border-2 ${
                      isSelected 
                        ? isCustomized
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-emerald-500 bg-emerald-50 shadow-md'
                        : 'border-gray-200 hover:border-emerald-300 hover:shadow-sm'
                    }`}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={`offer-${offer.id}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleOfferSelection(offer.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-3">
                            <div>
                              <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                {getCategoryIcon(offer.category)}
                                {customization ? customization.name : offer.name}
                                {isCustomized && (
                                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                                    Customized
                                  </Badge>
                                )}
                              </h5>
                              <p className="text-sm text-gray-600 mt-1">
                                {customization ? customization.description : offer.description}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <Badge className="bg-emerald-100 text-emerald-800">
                                {offer.category}
                              </Badge>
                              <Badge className="bg-green-100 text-green-800 font-semibold">
                                {formatOfferValue(offer, customization)}
                              </Badge>
                              <Badge variant="outline" className="border-amber-300 text-amber-700">
                                ⏰ {formatExpiration(offer, customization)}
                              </Badge>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCustomizeOffer(offer)}
                                className="text-xs"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                {isCustomized ? 'Edit Custom' : 'Customize'}
                              </Button>
                            </div>
                            
                            {isSelected && (
                              <div className={`text-sm font-medium flex items-center gap-1 ${
                                isCustomized ? 'text-purple-700' : 'text-emerald-700'
                              }`}>
                                <CheckCircle className="h-4 w-4" />
                                {isCustomized 
                                  ? 'Customized offer will appear to customer'
                                  : 'Will appear to customer with countdown timer'
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* General Offers */}
          {generalOffers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Gift className="h-5 w-5 text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-900">💼 General Offers</h4>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Universal Appeal
                </Badge>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {generalOffers.map(offer => {
                  const customization = getCustomization(offer.id)
                  const isSelected = selectedOffers.includes(offer.id)
                  const isCustomized = !!customization
                  
                  return (
                    <Card key={offer.id} className={`transition-all duration-300 border-2 ${
                      isSelected 
                        ? isCustomized
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={`offer-${offer.id}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleOfferSelection(offer.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-3">
                            <div>
                              <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                {getCategoryIcon(offer.category)}
                                {customization ? customization.name : offer.name}
                                {isCustomized && (
                                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                                    Customized
                                  </Badge>
                                )}
                              </h5>
                              <p className="text-sm text-gray-600 mt-1">
                                {customization ? customization.description : offer.description}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <Badge className="bg-blue-100 text-blue-800">
                                {offer.category}
                              </Badge>
                              <Badge className="bg-green-100 text-green-800 font-semibold">
                                {formatOfferValue(offer, customization)}
                              </Badge>
                              <Badge variant="outline" className="border-amber-300 text-amber-700">
                                ⏰ {formatExpiration(offer, customization)}
                              </Badge>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCustomizeOffer(offer)}
                                className="text-xs"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                {isCustomized ? 'Edit Custom' : 'Customize'}
                              </Button>
                            </div>
                            
                            {isSelected && (
                              <div className={`text-sm font-medium flex items-center gap-1 ${
                                isCustomized ? 'text-purple-700' : 'text-blue-700'
                              }`}>
                                <CheckCircle className="h-4 w-4" />
                                {isCustomized 
                                  ? 'Customized offer will appear to customer'
                                  : 'Will appear to customer with countdown timer'
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* No Offers State */}
          {relevantOffers.length === 0 && generalOffers.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Offers Available</h4>
              <p className="text-gray-600">
                There are currently no time-sensitive offers configured. Contact your administrator to set up promotional offers.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Selection Summary */}
      {selectedOffers.length > 0 && (
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-full">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-900">
                  {selectedOffers.length} Offer{selectedOffers.length !== 1 ? 's' : ''} Selected
                  {currentCustomizedOffers.length > 0 && ` (${currentCustomizedOffers.length} customized)`}
                </h4>
                <p className="text-emerald-700 text-sm">
                  These offers will be displayed to the customer with countdown timers to create urgency
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customization Dialog */}
      <Dialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customize Offer: {customizingOffer?.name}</DialogTitle>
            <DialogDescription>
              Adjust this offer to better match your customer's needs and situation.
              Changes only apply to this proposal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="custom-name">Offer Name</Label>
              <Input
                id="custom-name"
                value={customForm.name}
                onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter custom offer name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="custom-description">Description</Label>
              <Textarea
                id="custom-description"
                value={customForm.description}
                onChange={(e) => setCustomForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the offer details"
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-4">
              <Label>Offer Type</Label>
              <Select 
                value={customForm.offer_type}
                onValueChange={(value) => setCustomForm(prev => ({ ...prev, offer_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount_amount">Dollar Amount Discount</SelectItem>
                  <SelectItem value="discount_percentage">Percentage Discount</SelectItem>
                  <SelectItem value="free_service">Free Service/Product</SelectItem>
                </SelectContent>
              </Select>

              {customForm.offer_type === "discount_amount" && (
                <div className="space-y-2">
                  <Label htmlFor="discount-amount">Discount Amount ($)</Label>
                  <Input
                    id="discount-amount"
                    type="number"
                    value={customForm.discount_amount}
                    onChange={(e) => setCustomForm(prev => ({ ...prev, discount_amount: e.target.value }))}
                    placeholder="500"
                  />
                </div>
              )}

              {customForm.offer_type === "discount_percentage" && (
                <div className="space-y-2">
                  <Label htmlFor="discount-percentage">Discount Percentage (%)</Label>
                  <Input
                    id="discount-percentage"
                    type="number"
                    max="50"
                    value={customForm.discount_percentage}
                    onChange={(e) => setCustomForm(prev => ({ ...prev, discount_percentage: e.target.value }))}
                    placeholder="10"
                  />
                </div>
              )}

              {customForm.offer_type === "free_service" && (
                <div className="space-y-2">
                  <Label htmlFor="free-service">Free Service/Product</Label>
                  <Input
                    id="free-service"
                    value={customForm.free_product_service}
                    onChange={(e) => setCustomForm(prev => ({ ...prev, free_product_service: e.target.value }))}
                    placeholder="Free smart thermostat upgrade"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiration-type">Expiration Type</Label>
                <Select 
                  value={customForm.expiration_type}
                  onValueChange={(value) => setCustomForm(prev => ({ ...prev, expiration_type: value }))}
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
                <Label htmlFor="expiration-value">Duration</Label>
                <Input
                  id="expiration-value"
                  type="number"
                  value={customForm.expiration_value}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, expiration_value: e.target.value }))}
                  placeholder={customForm.expiration_type === "hours" ? "48" : "3"}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomizeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCustomization}>
              Save Customization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 