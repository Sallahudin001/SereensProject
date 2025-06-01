"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  Gift,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Zap,
  Heart,
  DollarSign,
  Star,
  Award,
  Sparkles
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SpecialOffer {
  id: number
  name: string
  description: string
  category: string
  discount_amount?: number
  discount_percentage?: number
  free_product_service?: string
  expiration_date?: Date
  is_active: boolean
}

interface BundleRule {
  id: number
  name: string
  description: string
  discount_value?: number
  free_service?: string
  bonus_message: string
  is_active: boolean
}

interface LifestyleUpsell {
  id: number
  product_suggestion: string
  description: string
  category: string
  base_price: number
  monthly_impact: number
  is_active: boolean
}

interface OfferTimer {
  hours: number
  minutes: number
  seconds: number
}

interface InteractiveOffersProps {
  proposalId: number
  services: string[]
  currentTotal: number
  monthlyPayment: number
  onUpsellToggle: (upsellId: number, selected: boolean) => void
  onTotalUpdate: (newTotal: number, newMonthly: number) => void
}

export default function InteractiveOffers({
  proposalId,
  services,
  currentTotal,
  monthlyPayment,
  onUpsellToggle,
  onTotalUpdate
}: InteractiveOffersProps) {
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([])
  const [bundleRules, setBundleRules] = useState<BundleRule[]>([])
  const [lifestyleUpsells, setLifestyleUpsells] = useState<LifestyleUpsell[]>([])
  const [selectedUpsells, setSelectedUpsells] = useState<Set<number>>(new Set())
  const [offerTimers, setOfferTimers] = useState<Map<number, OfferTimer>>(new Map())
  const [loading, setLoading] = useState(true)

  // Fetch proposal-specific offers
  useEffect(() => {
    fetchProposalOffers()
  }, [proposalId])

  // Set up countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      updateTimers()
    }, 1000)

    return () => clearInterval(interval)
  }, [specialOffers])

  const fetchProposalOffers = async () => {
    setLoading(true)
    try {
      // Fetch proposal-specific offers
      const response = await fetch(`/api/proposals/offers/${proposalId}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.offers) {
          // Process special offers (time-sensitive)
          const specialOffersList = data.offers
            .filter((offer: any) => offer.offer_type === 'special_offer')
            .map((offer: any) => ({
              id: Number(offer.offer_id),
              name: offer.name,
              description: offer.description,
              category: offer.category,
              discount_amount: Number(offer.discount_amount) || 0,
              discount_percentage: Number(offer.discount_percentage) || 0,
              free_product_service: offer.free_item,
              expiration_date: offer.expiration_date ? new Date(offer.expiration_date) : undefined,
              is_active: true
            }))
          
          setSpecialOffers(specialOffersList)
          initializeTimers(specialOffersList)
          
          // Process bundle rules (auto-applied discounts)
          const bundleRulesList = data.offers
            .filter((offer: any) => offer.offer_type === 'bundle_rule')
            .map((offer: any) => ({
              id: Number(offer.offer_id),
              name: offer.name,
              description: offer.description,
              discount_value: Number(offer.discount_amount) || 0,
              free_service: offer.free_item,
              bonus_message: `Bundle Bonus Applied: $${offer.discount_amount} off for combining ${services.join(' + ')}`,
              is_active: true
            }))
          
          setBundleRules(bundleRulesList)
        }
      }
      
      // Fetch available lifestyle upsells (not auto-assigned)
      const upsellResponse = await fetch('/api/offers?type=lifestyle')
      if (upsellResponse.ok) {
        const upsells = await upsellResponse.json()
        setLifestyleUpsells(upsells.filter((u: LifestyleUpsell) => u.is_active))
      }
      
    } catch (error) {
      console.error('Error fetching offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeTimers = (offers: SpecialOffer[]) => {
    const timers = new Map<number, OfferTimer>()
    
    offers.forEach(offer => {
      if (offer.expiration_date) {
        const now = new Date()
        const expiration = new Date(offer.expiration_date)
        const diffMs = expiration.getTime() - now.getTime()
        
        if (diffMs > 0) {
          const totalSeconds = Math.floor(diffMs / 1000)
          const hours = Math.floor(totalSeconds / 3600)
          const minutes = Math.floor((totalSeconds % 3600) / 60)
          const seconds = totalSeconds % 60
          
          timers.set(offer.id, { hours, minutes, seconds })
        }
      }
    })
    
    setOfferTimers(timers)
  }

  const updateTimers = () => {
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
        }
      })
      
      return updated
    })
  }

  const formatTimer = (timer: OfferTimer): string => {
    if (timer.hours > 0) {
      return `${timer.hours}h ${timer.minutes}m ${timer.seconds}s`
    }
    return `${timer.minutes}m ${timer.seconds}s`
  }

  const toggleUpsell = (upsellId: number) => {
    const newSelected = new Set(selectedUpsells)
    const upsell = lifestyleUpsells.find(u => u.id === upsellId)
    
    if (!upsell) return
    
    if (newSelected.has(upsellId)) {
      newSelected.delete(upsellId)
      // Remove from total
      const newTotal = currentTotal - upsell.base_price
      const newMonthly = monthlyPayment - upsell.monthly_impact
      onTotalUpdate(newTotal, newMonthly)
      onUpsellToggle(upsellId, false)
    } else {
      newSelected.add(upsellId)
      // Add to total
      const newTotal = currentTotal + upsell.base_price
      const newMonthly = monthlyPayment + upsell.monthly_impact
      onTotalUpdate(newTotal, newMonthly)
      onUpsellToggle(upsellId, true)
    }
    
    setSelectedUpsells(newSelected)
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Bundle': return <Gift className="h-4 w-4" />
      case 'Roofing': return <Target className="h-4 w-4" />
      case 'Windows': return <Zap className="h-4 w-4" />
      case 'HVAC': return <TrendingUp className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Loading Your Exclusive Offers...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bundle Discounts - Always Visible */}
      {bundleRules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Award className="h-5 w-5" />
                🎉 Bundle Savings Applied!
              </CardTitle>
              <CardDescription className="text-green-700">
                You're already saving money by combining multiple services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bundleRules.map(bundle => (
                <div key={bundle.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div>
                    <div className="font-medium text-green-800">{bundle.name}</div>
                    <div className="text-sm text-green-600">{bundle.bonus_message}</div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ${bundle.discount_value} Saved
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Time-Sensitive Offers - Visible with Countdown */}
      {specialOffers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Clock className="h-5 w-5" />
                ⏰ Limited-Time Offers
              </CardTitle>
              <CardDescription className="text-orange-700">
                Exclusive deals that won't last long - act now to secure these savings!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {specialOffers.map(offer => {
                const timer = offerTimers.get(offer.id)
                
                return (
                  <div key={offer.id} className="p-4 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(offer.category)}
                          <span className="font-semibold text-gray-900">{offer.name}</span>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            {formatOfferValue(offer)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{offer.description}</p>
                        {timer && (
                          <div className="flex items-center gap-2 text-orange-600">
                            <Clock className="h-4 w-4" />
                            <span className="font-mono font-medium">
                              Expires in {formatTimer(timer)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Enhance Your Project Section */}
      {lifestyleUpsells.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-blue-800">💡 Enhance Your Project</CardTitle>
                  <CardDescription className="text-blue-700">
                    Small additions that make a big difference in your home's comfort and value
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {lifestyleUpsells.map(upsell => {
                const isSelected = selectedUpsells.has(upsell.id)
                
                return (
                  <div key={upsell.id} className="border rounded-lg overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Heart className={`h-5 w-5 ${isSelected ? 'text-rose-600' : 'text-blue-600'}`} />
                          <h4 className="font-semibold text-gray-900">Want it {upsell.product_suggestion.toLowerCase().includes('quiet') ? 'quieter' : 'better'} inside?</h4>
                        </div>
                        <div className="mt-1 font-medium text-blue-700">{upsell.product_suggestion}</div>
                        <div className="text-sm text-gray-600 mt-1">{upsell.description}</div>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {upsell.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="text-xl font-bold text-green-700">${upsell.base_price.toLocaleString()}</div>
                        <div className="text-sm text-blue-600">+${upsell.monthly_impact}/month</div>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isSelected}
                            onChange={() => toggleUpsell(upsell.id)}
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-gray-700 font-medium">Current Project Total</div>
                    <div className="text-2xl font-bold text-blue-900">${currentTotal.toLocaleString()}</div>
                    <div className="text-sm text-green-700 font-medium">Monthly payment: ${monthlyPayment.toLocaleString()}/mo</div>
                  </div>
                  <div className="text-right">
                    {selectedUpsells.size > 0 && (
                      <div className="text-blue-700 text-sm font-medium">
                        Enhancements added: +${Array.from(selectedUpsells).reduce((total: number, upsellId: number) => {
                          const upsell = lifestyleUpsells.find(u => u.id === upsellId)
                          return total + (upsell ? upsell.base_price : 0)
                        }, 0).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Real-Time Payment Updates */}
      {selectedUpsells.size > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert className="bg-green-50 border-green-200">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>Payment Updated!</strong> Your new monthly payment includes {selectedUpsells.size} upgrade{selectedUpsells.size !== 1 ? 's' : ''}.
              <br />
              <span className="font-mono font-medium">
                New total: ${monthlyPayment.toFixed(2)}/month
              </span>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  )
} 