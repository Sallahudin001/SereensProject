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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time-Sensitive Offers
          </CardTitle>
          <CardDescription>Loading available offers...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="border border-amber-300 rounded-lg overflow-hidden">
      {/* Header section matching the pricing breakdown style */}
      <div className="bg-amber-100 border-b border-amber-300 p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" />
          <h4 className="text-amber-900 text-xl font-bold">⏰ Limited Time Offers</h4>
        </div>
        <p className="text-amber-700 mt-1 text-sm">
          Select time-sensitive offers to apply urgency and boost close rates. These will be visible to the customer with countdown timers.
        </p>
      </div>
      
      {/* Offers list */}
      <div className="bg-amber-50/60">
        {relevantOffers.length > 0 && (
          <div className="p-4 border-b border-amber-200">
            <h5 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Recommended for {services.join(' + ')}
            </h5>
            <div className="space-y-3">
              {relevantOffers.map(offer => (
                <div key={offer.id} className="p-4 border-b border-amber-200 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        id={`offer-${offer.id}`}
                        checked={selectedOffers.includes(offer.id)}
                        onCheckedChange={() => toggleOfferSelection(offer.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="mb-2">
                          <h6 className="text-amber-900 font-semibold text-lg">{offer.name}</h6>
                          <p className="text-amber-800">{offer.description}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-medium">
                            {offer.category}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                            {formatOfferValue(offer)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-xs text-amber-700">Expires in:</div>
                      <div className="text-amber-900 font-mono font-bold">
                        {formatExpiration(offer)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {generalOffers.length > 0 && (
          <div className="p-4 border-b border-amber-200">
            <h5 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
              <Gift className="h-4 w-4" />
              General Offers
            </h5>
            <div className="space-y-3">
              {generalOffers.map(offer => (
                <div key={offer.id} className="p-4 border-b border-amber-200 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        id={`offer-${offer.id}`}
                        checked={selectedOffers.includes(offer.id)}
                        onCheckedChange={() => toggleOfferSelection(offer.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="mb-2">
                          <h6 className="text-amber-900 font-semibold text-lg">{offer.name}</h6>
                          <p className="text-amber-800">{offer.description}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-medium">
                            {offer.category}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                            {formatOfferValue(offer)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-xs text-amber-700">Expires in:</div>
                      <div className="text-amber-900 font-mono font-bold">
                        {formatExpiration(offer)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedOffers.length > 0 && (
          <div className="p-4 bg-green-50 border-b border-amber-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">
                {selectedOffers.length} offer{selectedOffers.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              These will be shown to the customer with countdown timers to create urgency.
            </p>
          </div>
        )}

        {specialOffers.length === 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              <span>No time-sensitive offers are currently available. Check back later or contact an administrator.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 