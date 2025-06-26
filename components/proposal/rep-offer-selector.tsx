"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Clock,
  Gift,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Zap
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
}

interface RepOfferSelectorProps {
  services: string[]
  selectedOffers: number[]
  onOffersChange: (offerIds: number[]) => void
}

export default function RepOfferSelector({ 
  services, 
  selectedOffers, 
  onOffersChange 
}: RepOfferSelectorProps) {
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch time-sensitive offers for rep selection
  useEffect(() => {
    fetchSpecialOffers()
  }, [services])

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
    
    onOffersChange(newSelection)
  }

  const getOfferRelevance = (offer: SpecialOffer): 'high' | 'medium' | 'low' => {
    // Map service names to offer categories
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

  const formatOfferValue = (offer: SpecialOffer): string => {
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

  const formatExpiration = (offer: SpecialOffer): string => {
    if (!offer.expiration_value) return 'Limited time'
    
    return offer.expiration_type === 'hours' 
      ? `${offer.expiration_value} hour${offer.expiration_value !== 1 ? 's' : ''}`
      : `${offer.expiration_value} day${offer.expiration_value !== 1 ? 's' : ''}`
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
          Sales Offers & Finalization
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Select time-sensitive offers to create urgency and boost conversion rates. These offers will be visible to customers with countdown timers to encourage quick decisions.
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
                Boost your close rate with strategic urgency-creating offers
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
              {relevantOffers.map(offer => (
                  <Card key={offer.id} className={`transition-all duration-300 border-2 ${
                    selectedOffers.includes(offer.id) 
                      ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                      : 'border-gray-200 hover:border-emerald-300 hover:shadow-sm'
                  }`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                      <Checkbox
                        id={`offer-${offer.id}`}
                        checked={selectedOffers.includes(offer.id)}
                        onCheckedChange={() => toggleOfferSelection(offer.id)}
                        className="mt-1"
                      />
                        <div className="flex-1 space-y-3">
                          <div>
                            <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                              {getCategoryIcon(offer.category)}
                              {offer.name}
                            </h5>
                            <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                        </div>
                        
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-emerald-100 text-emerald-800">
                            {offer.category}
                            </Badge>
                            <Badge className="bg-green-100 text-green-800 font-semibold">
                            {formatOfferValue(offer)}
                            </Badge>
                            <Badge variant="outline" className="border-amber-300 text-amber-700">
                              ⏰ {formatExpiration(offer)}
                            </Badge>
                          </div>
                          
                          {selectedOffers.includes(offer.id) && (
                            <div className="text-sm text-emerald-700 font-medium flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Will appear to customer with countdown timer
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))}
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
              {generalOffers.map(offer => (
                  <Card key={offer.id} className={`transition-all duration-300 border-2 ${
                    selectedOffers.includes(offer.id) 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                      <Checkbox
                        id={`offer-${offer.id}`}
                        checked={selectedOffers.includes(offer.id)}
                        onCheckedChange={() => toggleOfferSelection(offer.id)}
                        className="mt-1"
                      />
                        <div className="flex-1 space-y-3">
                          <div>
                            <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                              {getCategoryIcon(offer.category)}
                              {offer.name}
                            </h5>
                            <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                        </div>
                        
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-blue-100 text-blue-800">
                            {offer.category}
                            </Badge>
                            <Badge className="bg-green-100 text-green-800 font-semibold">
                            {formatOfferValue(offer)}
                            </Badge>
                            <Badge variant="outline" className="border-amber-300 text-amber-700">
                              ⏰ {formatExpiration(offer)}
                            </Badge>
                          </div>
                          
                          {selectedOffers.includes(offer.id) && (
                            <div className="text-sm text-blue-700 font-medium flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Will appear to customer with countdown timer
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))}
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
                </h4>
                <p className="text-emerald-700 text-sm">
                  These offers will be displayed to the customer with countdown timers to create urgency
            </p>
          </div>
            </div>
          </CardContent>
        </Card>
        )}


    </div>
  )
} 