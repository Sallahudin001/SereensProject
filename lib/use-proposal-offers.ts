import { useState, useEffect } from 'react'

// Define interfaces for offers
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
  expiration_date?: Date
}

interface BundleRule {
  id: number
  name: string
  description: string
  required_services: string[]
  discount_type: string
  discount_value?: number
  free_service?: string
  bonus_message: string
  is_active: boolean
}

interface LifestyleUpsell {
  id: number
  trigger_phrase: string
  product_suggestion: string
  category: string
  base_price: number
  monthly_impact: number
  description: string
  is_active: boolean
}

interface OfferTimer {
  hours: number
  minutes: number
  seconds: number
}

interface UseProposalOffersResult {
  specialOffers: SpecialOffer[]
  bundleRules: BundleRule[]
  lifestyleUpsells: LifestyleUpsell[]
  selectedOffers: Set<number>
  offerTimers: Map<number, OfferTimer>
  isLoading: boolean
  error: string | null
  toggleSpecialOffer: (offerId: number) => void
  formatTimer: (timer: OfferTimer) => string
  timeSensitiveOffers: any[]
}

export function useProposalOffers(proposalId: number, services: string[] = []): UseProposalOffersResult {
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([])
  const [bundleRules, setBundleRules] = useState<BundleRule[]>([])
  const [lifestyleUpsells, setLifestyleUpsells] = useState<LifestyleUpsell[]>([])
  const [selectedOffers, setSelectedOffers] = useState<Set<number>>(new Set())
  const [offerTimers, setOfferTimers] = useState<Map<number, OfferTimer>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeSensitiveOffers, setTimeSensitiveOffers] = useState<any[]>([])
  
  // Fetch offers linked to this proposal
  useEffect(() => {
    if (!proposalId) return
    
    const fetchOffers = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch offers specifically linked to this proposal
        const proposalOffersResponse = await fetch(`/api/proposals/offers/${proposalId}`)
        
        if (proposalOffersResponse.ok) {
          const proposalOffersData = await proposalOffersResponse.json()
          
          if (proposalOffersData.success && proposalOffersData.offers) {
            // Process special offers
            const specialOffersList = proposalOffersData.offers
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
                expiration_type: 'hours', // Default value for timer calculation
                expiration_value: 72, // Default value for timer calculation
                is_active: true
              }))
            
            setSpecialOffers(specialOffersList)
            
            // Process bundle rules
            const bundleRulesList = proposalOffersData.offers
              .filter((offer: any) => offer.offer_type === 'bundle_rule')
              .map((offer: any) => ({
                id: Number(offer.offer_id),
                name: offer.name,
                description: offer.description,
                required_services: [],
                discount_type: 'fixed_amount',
                discount_value: Number(offer.discount_amount) || 0,
                free_service: offer.free_item,
                bonus_message: '',
                is_active: true
              }))
            
            setBundleRules(bundleRulesList)
            
            // Process lifestyle upsells
            const lifestyleUpsellsList = proposalOffersData.offers
              .filter((offer: any) => offer.offer_type === 'lifestyle_upsell')
              .map((offer: any) => ({
                id: Number(offer.offer_id),
                trigger_phrase: '',
                product_suggestion: offer.name,
                description: offer.description,
                category: offer.category,
                base_price: 0,
                monthly_impact: 0,
                is_active: true
              }))
            
            setLifestyleUpsells(lifestyleUpsellsList)
            
            // Initialize selected offers
            const selectedOfferIds = new Set<number>(
              proposalOffersData.offers
                .filter((offer: any) => offer.offer_type === 'special_offer')
                .map((offer: any) => Number(offer.offer_id))
            )
            
            setSelectedOffers(selectedOfferIds)
            
            // Initialize timers
            initializeOfferTimers(specialOffersList)
            
            return // Exit early if proposal-specific offers were found
          }
        }
        
        // Fallback: If no proposal-specific offers or API failed, fetch all offers
        console.log('Falling back to generic offers')
        
        const [specialResponse, bundleResponse, lifestyleResponse] = await Promise.all([
          fetch('/api/offers?type=special'),
          fetch(`/api/offers?type=bundle&services=${services.join(',')}`),
          fetch('/api/offers?type=lifestyle')
        ])
        
        if (specialResponse.ok) {
          const special = await specialResponse.json()
          setSpecialOffers(special.filter((o: SpecialOffer) => o.is_active))
          initializeOfferTimers(special)
        }
        
        if (bundleResponse.ok) {
          const bundles = await bundleResponse.json()
          setBundleRules(bundles.filter((b: BundleRule) => b.is_active))
        }
        
        if (lifestyleResponse.ok) {
          const lifestyle = await lifestyleResponse.json()
          setLifestyleUpsells(lifestyle.filter((l: LifestyleUpsell) => l.is_active))
        }
      } catch (err) {
        console.error('Error fetching offers:', err)
        setError('Failed to load offers')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchOffers()
  }, [proposalId, services])
  
  // Set up timers for time-sensitive offers
  useEffect(() => {
    const interval = setInterval(() => {
      updateOfferTimers()
    }, 1000)
    
    return () => clearInterval(interval)
  }, [specialOffers])
  
  // Process special offers into time-sensitive offers format
  useEffect(() => {
    if (specialOffers.length > 0) {
      const offers = specialOffers.map(offer => {
        // Format the timer display for this offer
        const timer = offerTimers.get(offer.id)
        const countdown = timer ? 
          `${timer.hours.toString().padStart(3, '0')}:${timer.minutes.toString().padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}` : 
          "000:00:00"
        
        return {
          id: offer.id,
          title: offer.name,
          description: offer.description,
          serviceCategory: offer.category,
          freeItem: offer.free_product_service,
          countdown,
          discountAmount: offer.discount_amount,
          discountPercentage: offer.discount_percentage
        }
      })
      
      setTimeSensitiveOffers(offers)
    }
  }, [specialOffers, offerTimers])
  
  // Initialize offer timers
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
      } else if (offer.expiration_date) {
        // Calculate remaining time until expiration date
        const now = new Date()
        const expirationDate = new Date(offer.expiration_date)
        const diffMs = expirationDate.getTime() - now.getTime()
        
        if (diffMs > 0) {
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
          const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
          const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000)
          
          timers.set(offer.id, { 
            hours: diffHours, 
            minutes: diffMinutes, 
            seconds: diffSeconds 
          })
        }
      } else {
        // Set a default expiration of 167 hours (~ 1 week) for demo purposes
        timers.set(offer.id, { hours: 167, minutes: 59, seconds: 55 })
      }
    })
    
    setOfferTimers(timers)
  }
  
  // Update offer timers
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
        }
      })
      
      return updated
    })
  }
  
  // Format timer for display
  const formatTimer = (timer: OfferTimer): string => {
    return `${timer.hours.toString().padStart(2, '0')}:${timer.minutes.toString().padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}`
  }
  
  // Toggle special offer selection and persist to backend
  const toggleSpecialOffer = (offerId: number) => {
    setSelectedOffers(prev => {
      const newSelected = new Set(prev)
      const isCurrentlySelected = newSelected.has(offerId)
      
      if (isCurrentlySelected) {
        newSelected.delete(offerId)
      } else {
        newSelected.add(offerId)
      }
      
      // Find the offer details to get discount amount
      const offer = specialOffers.find(o => o.id === offerId)
      if (offer) {
        // Persist the offer selection to the backend
        const discount = offer.discount_amount || 0
        
        // Call the offers usage API to track this interaction
        fetch('/api/offers/usage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            offer_type: 'special_offer',
            offer_id: offerId,
            proposal_id: proposalId,
            action: isCurrentlySelected ? 'deselected' : 'applied',
            discount_amount: discount
          })
        }).catch(error => {
          console.error('Error tracking offer usage:', error)
        })
      }
      
      return newSelected
    })
  }
  
  return {
    specialOffers,
    bundleRules,
    lifestyleUpsells,
    selectedOffers,
    offerTimers,
    isLoading,
    error,
    toggleSpecialOffer,
    formatTimer,
    timeSensitiveOffers
  }
} 