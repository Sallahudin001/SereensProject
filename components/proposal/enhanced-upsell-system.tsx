"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Clock,
  Gift,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Zap,
  Heart,
  DollarSign
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

interface OfferTimer {
  hours: number
  minutes: number
  seconds: number
}

interface EnhancedUpsellSystemProps {
  services: string[]
  currentTotal: number
  onOfferApplied: (offerData: any) => void
  onUpsellSelected: (upsellData: any) => void
  proposalId?: number
}

export default function EnhancedUpsellSystem({
  services,
  currentTotal,
  onOfferApplied,
  onUpsellSelected,
  proposalId
}: EnhancedUpsellSystemProps) {
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([])
  const [bundleRules, setBundleRules] = useState<BundleRule[]>([])
  const [lifestyleUpsells, setLifestyleUpsells] = useState<LifestyleUpsell[]>([])
  const [selectedOffer, setSelectedOffer] = useState<SpecialOffer | null>(null)
  const [appliedBundles, setAppliedBundles] = useState<BundleRule[]>([])
  const [selectedUpsells, setSelectedUpsells] = useState<Set<number>>(new Set())
  const [offerTimers, setOfferTimers] = useState<Map<number, OfferTimer>>(new Map())
  const [loading, setLoading] = useState(true)

  // Fetch all available offers when component mounts or services change
  useEffect(() => {
    fetchOffers()
    detectBundleOpportunities()
  }, [services])

  // Set up timers for time-sensitive offers
  useEffect(() => {
    const interval = setInterval(() => {
      updateOfferTimers()
    }, 1000)

    return () => clearInterval(interval)
  }, [specialOffers])

  const fetchOffers = async () => {
    setLoading(true)
    try {
      // Fetch special offers for current services
      const [specialResponse, bundleResponse, lifestyleResponse] = await Promise.all([
        fetch('/api/offers?type=special'),
        fetch(`/api/offers?type=bundle&services=${services.join(',')}`),
        fetch('/api/offers?type=lifestyle')
      ])

      if (specialResponse.ok) {
        const special = await specialResponse.json()
        setSpecialOffers(special)
        initializeOfferTimers(special)
      }

      if (bundleResponse.ok) {
        const bundles = await bundleResponse.json()
        setBundleRules(bundles)
      }

      if (lifestyleResponse.ok) {
        const lifestyle = await lifestyleResponse.json()
        setLifestyleUpsells(lifestyle)
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
      toast({
        title: "Error",
        description: "Failed to load offers. Please refresh the page.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const initializeOfferTimers = (offers: SpecialOffer[]) => {
    const timers = new Map<number, OfferTimer>()
    
    offers.forEach(offer => {
      if (offer.expiration_value) {
        const totalMinutes = offer.expiration_type === 'hours' 
          ? offer.expiration_value * 60 
          : offer.expiration_value * 24 * 60
        
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        
        timers.set(offer.id, { hours, minutes, seconds: 0 })
      }
    })
    
    setOfferTimers(timers)
  }

  const updateOfferTimers = () => {
    setOfferTimers(prev => {
      const updated = new Map(prev)
      
      updated.forEach((timer, offerId) => {
        if (timer.seconds > 0) {
          timer.seconds--
        } else if (timer.minutes > 0) {
          timer.minutes--
          timer.seconds = 59
        } else if (timer.hours > 0) {
          timer.hours--
          timer.minutes = 59
          timer.seconds = 59
        } else {
          // Timer expired
          updated.delete(offerId)
          toast({
            title: "Offer Expired",
            description: "A time-sensitive offer has expired.",
            variant: "destructive"
          })
        }
      })
      
      return updated
    })
  }

  const detectBundleOpportunities = () => {
    const applicableBundles = bundleRules.filter(rule => {
      const hasAllServices = rule.required_services.every(service => 
        services.includes(service)
      )
      return hasAllServices && services.length >= rule.min_services
    })

    setAppliedBundles(applicableBundles)
    
    // Auto-apply the highest priority bundle
    if (applicableBundles.length > 0) {
      const bestBundle = applicableBundles[0] // Already sorted by priority
      applyBundleDiscount(bestBundle)
    }
  }

  const applySpecialOffer = (offer: SpecialOffer) => {
    setSelectedOffer(offer)
    
    const offerData = {
      type: 'special_offer',
      id: offer.id,
      name: offer.name,
      description: offer.description,
      discount_amount: offer.discount_amount || 0,
      discount_percentage: offer.discount_percentage || 0,
      free_service: offer.free_product_service,
      expiration_date: calculateExpirationDate(offer)
    }

    onOfferApplied(offerData)
    
    // Track offer usage
    if (proposalId) {
      trackOfferUsage('special_offer', offer.id, offerData.discount_amount)
    }

    toast({
      title: "Offer Applied",
      description: `${offer.name} has been added to your proposal!`,
      className: "bg-green-50 border-green-200"
    })
  }

  const applyBundleDiscount = (bundle: BundleRule) => {
    let discountAmount = 0
    
    if (bundle.discount_type === 'percentage') {
      discountAmount = currentTotal * (bundle.discount_value! / 100)
    } else if (bundle.discount_type === 'fixed_amount') {
      discountAmount = bundle.discount_value!
    }

    const bundleData = {
      type: 'bundle_discount',
      id: bundle.id,
      name: bundle.name,
      description: bundle.description,
      discount_amount: discountAmount,
      free_service: bundle.free_service,
      bonus_message: bundle.bonus_message
    }

    onOfferApplied(bundleData)
    
    if (proposalId) {
      trackOfferUsage('bundle_rule', bundle.id, discountAmount)
    }
  }

  const toggleLifestyleUpsell = (upsell: LifestyleUpsell) => {
    const isSelected = selectedUpsells.has(upsell.id)
    
    if (isSelected) {
      selectedUpsells.delete(upsell.id)
      setSelectedUpsells(new Set(selectedUpsells))
    } else {
      selectedUpsells.add(upsell.id)
      setSelectedUpsells(new Set(selectedUpsells))
      
      const upsellData = {
        type: 'lifestyle_upsell',
        id: upsell.id,
        trigger_phrase: upsell.trigger_phrase,
        product_suggestion: upsell.product_suggestion,
        category: upsell.category,
        base_price: upsell.base_price,
        monthly_impact: upsell.monthly_impact,
        description: upsell.description
      }

      onUpsellSelected(upsellData)
      
      if (proposalId) {
        trackOfferUsage('lifestyle_upsell', upsell.id, upsell.base_price)
      }

      toast({
        title: "Upsell Added",
        description: `${upsell.product_suggestion} added for just $${typeof upsell.monthly_impact === 'number' ? upsell.monthly_impact.toFixed(2) : upsell.monthly_impact}/month more!`,
        className: "bg-blue-50 border-blue-200"
      })
    }
  }

  const calculateExpirationDate = (offer: SpecialOffer): Date => {
    const now = new Date()
    if (offer.expiration_type === 'hours') {
      now.setHours(now.getHours() + (offer.expiration_value || 0))
    } else {
      now.setDate(now.getDate() + (offer.expiration_value || 0))
    }
    return now
  }

  const trackOfferUsage = async (offerType: string, offerId: number, amount: number) => {
    try {
      await fetch('/api/offers/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_type: offerType,
          offer_id: offerId,
          proposal_id: proposalId,
          discount_amount: amount,
          action: 'applied'
        })
      })
    } catch (error) {
      console.error('Error tracking offer usage:', error)
    }
  }

  const formatTimer = (timer: OfferTimer): string => {
    return `${timer.hours.toString().padStart(2, '0')}:${timer.minutes.toString().padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}`
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'comfort': return <Heart className="h-4 w-4" />
      case 'efficiency': return <Zap className="h-4 w-4" />
      case 'curb_appeal': return <TrendingUp className="h-4 w-4" />
      case 'smart_home': return <Target className="h-4 w-4" />
      case 'security': return <CheckCircle className="h-4 w-4" />
      default: return <Gift className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading offers...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time-Sensitive Special Offers */}
      {specialOffers.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-800">⏰ Limited Time Offers</CardTitle>
            </div>
            <CardDescription className="text-amber-700">
              Act fast! These exclusive offers won't last long.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {specialOffers.filter(offer => offer.is_active).map(offer => {
              const timer = offerTimers.get(offer.id)
              const isExpired = !timer || (timer.hours === 0 && timer.minutes === 0 && timer.seconds === 0)
              
              return (
                <div 
                  key={offer.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedOffer?.id === offer.id 
                      ? 'border-amber-400 bg-amber-100' 
                      : 'border-amber-200 bg-white hover:border-amber-300'
                  } ${isExpired ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900">{offer.name}</h4>
                      <p className="text-sm text-amber-700 mt-1">{offer.description}</p>
                    </div>
                    {timer && !isExpired && (
                      <div className="text-right">
                        <div className="text-xs text-amber-600 mb-1">Expires in:</div>
                        <div className="font-mono text-lg font-bold text-red-600">
                          {formatTimer(timer)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {offer.category}
                      </Badge>
                      <Badge variant="outline" className="border-green-300 text-green-700">
                        {offer.discount_amount && `$${offer.discount_amount} OFF`}
                        {offer.discount_percentage && `${offer.discount_percentage}% OFF`}
                        {offer.free_product_service && `FREE: ${offer.free_product_service}`}
                      </Badge>
                    </div>
                    
                    <Button
                      size="sm"
                      disabled={isExpired || selectedOffer?.id === offer.id}
                      onClick={() => applySpecialOffer(offer)}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {selectedOffer?.id === offer.id ? 'Applied' : 'Apply Offer'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Auto-Detected Bundle Opportunities */}
      {appliedBundles.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">🎁 Smart Bundle Savings</CardTitle>
            </div>
            <CardDescription className="text-green-700">
              Great news! You qualify for automatic bundle discounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {appliedBundles.map(bundle => (
              <Alert key={bundle.id} className="border-green-300 bg-green-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="font-semibold">{bundle.name}</div>
                  <div className="text-sm mt-1">{bundle.bonus_message}</div>
                  <div className="flex gap-2 mt-2">
                    {bundle.required_services.map(service => (
                      <Badge key={service} variant="secondary" className="bg-green-200 text-green-800">
                        {service.replace('-', ' & ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Lifestyle-Based Upsells */}
      {lifestyleUpsells.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-800">💡 Enhance Your Project</CardTitle>
            </div>
            <CardDescription>
              Small additions that make a big difference in your home's comfort and value
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lifestyleUpsells
              .filter(upsell => upsell.is_active)
              .sort((a, b) => a.display_order - b.display_order)
              .map(upsell => {
                const isSelected = selectedUpsells.has(upsell.id)
                
                return (
                  <div 
                    key={upsell.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => toggleLifestyleUpsell(upsell)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(upsell.category)}
                          <h4 className="font-semibold text-blue-900">{upsell.trigger_phrase}</h4>
                        </div>
                        <p className="text-blue-700 font-medium">{upsell.product_suggestion}</p>
                        <p className="text-sm text-gray-600 mt-1">{upsell.description}</p>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-green-600">
                          ${upsell.base_price.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-600">
                          +${typeof upsell.monthly_impact === 'number' ? upsell.monthly_impact.toFixed(2) : upsell.monthly_impact}/month
                        </div>
                        <Switch
                          checked={isSelected}
                          onCheckedChange={() => toggleLifestyleUpsell(upsell)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <Badge variant="outline" className="border-blue-300 text-blue-700">
                        {upsell.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      
                      {isSelected && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Added to proposal</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      {(selectedOffer || appliedBundles.length > 0 || selectedUpsells.size > 0) && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-purple-800">💰 Your Total Savings & Additions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedOffer && (
                <div className="flex justify-between items-center p-3 bg-amber-100 rounded-lg">
                  <span className="font-medium text-amber-800">{selectedOffer.name}</span>
                  <span className="font-bold text-green-600">
                    {selectedOffer.discount_amount && `-$${selectedOffer.discount_amount}`}
                    {selectedOffer.discount_percentage && `-${selectedOffer.discount_percentage}%`}
                    {selectedOffer.free_product_service && `FREE: ${selectedOffer.free_product_service}`}
                  </span>
                </div>
              )}
              
              {appliedBundles.map(bundle => (
                <div key={bundle.id} className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                  <span className="font-medium text-green-800">{bundle.name}</span>
                  <span className="font-bold text-green-600">
                    {bundle.discount_type === 'percentage' && `-${bundle.discount_value}%`}
                    {bundle.discount_type === 'fixed_amount' && `-$${bundle.discount_value}`}
                    {bundle.discount_type === 'free_service' && `FREE: ${bundle.free_service}`}
                  </span>
                </div>
              ))}

              {Array.from(selectedUpsells).map(upsellId => {
                const upsell = lifestyleUpsells.find(u => u.id === upsellId)
                if (!upsell) return null
                
                return (
                  <div key={upsellId} className="flex justify-between items-center p-3 bg-blue-100 rounded-lg">
                    <span className="font-medium text-blue-800">{upsell.product_suggestion}</span>
                    <span className="font-bold text-blue-600">
                      +${upsell.base_price.toLocaleString()} (+${typeof upsell.monthly_impact === 'number' ? upsell.monthly_impact.toFixed(2) : upsell.monthly_impact}/mo)
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 