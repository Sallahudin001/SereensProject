"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Check, 
  CreditCard, 
  X, 
  FileText, 
  DollarSign, 
  ShoppingCart, 
  Sparkles, 
  Edit, 
  Clock, 
  Gift, 
  Target, 
  Heart, 
  Zap, 
  TrendingUp, 
  CheckCircle, 
  Star, 
  Award,
  Timer,
  Crown,
  Flame,
  BoltIcon
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { updateProposalStatus } from "@/app/actions/proposal-actions"
import { toast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

// Enhanced animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, type: "spring" } },
}

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
}

const bounceIn = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.6, 
      type: "spring", 
      stiffness: 400, 
      damping: 25 
    } 
  },
}

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (e) {
    return "Invalid Date";
  }
}

// Enhanced interfaces
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
  expiration_date?: Date
  is_active: boolean
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
  monthly_impact: number | string
  description: string
  is_active: boolean
}

interface OfferTimer {
  hours: number
  minutes: number
  seconds: number
}

interface EnhancedProposalViewProps {
  proposal: any
  readOnly?: boolean
}

export default function EnhancedProposalView({ proposal: initialProposal, readOnly = false }: EnhancedProposalViewProps) {
  const [proposal, setProposal] = useState(initialProposal)
  const [currentTab, setCurrentTab] = useState("review")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [signature, setSignature] = useState("")

  // Enhanced offers state
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([])
  const [bundleRules, setBundleRules] = useState<BundleRule[]>([])
  const [lifestyleUpsells, setLifestyleUpsells] = useState<LifestyleUpsell[]>([])
  const [selectedOffers, setSelectedOffers] = useState<Set<number>>(new Set())
  const [selectedUpsells, setSelectedUpsells] = useState<Set<number>>(new Set())
  const [appliedBundles, setAppliedBundles] = useState<BundleRule[]>([])
  const [offerTimers, setOfferTimers] = useState<Map<number, OfferTimer>>(new Map())
  const [offersLoading, setOffersLoading] = useState(true)
  const [offersError, setOffersError] = useState<string | null>(null)

  // Rejection states
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectionFeedback, setRejectionFeedback] = useState("")
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isRejected, setIsRejected] = useState(false)

  // Fetch offers when component mounts
  useEffect(() => {
    if (proposal?.services?.length > 0) {
      fetchOffers()
    }
  }, [proposal?.services])

  // Set up timers for time-sensitive offers
  useEffect(() => {
    const interval = setInterval(() => {
      updateOfferTimers()
    }, 1000)

    return () => clearInterval(interval)
  }, [specialOffers])

  // Auto-detect bundle opportunities
  useEffect(() => {
    if (bundleRules.length > 0 && proposal?.services?.length > 1) {
      detectBundleOpportunities()
    }
  }, [bundleRules, proposal?.services])

  const fetchOffers = async () => {
    setOffersLoading(true)
    setOffersError(null)
    
    try {
      // First try to fetch proposal-specific offers
      let foundProposalOffers = false
      
      if (proposal?.id) {
        try {
          const proposalOffersResponse = await fetch(`/api/proposals/offers/${proposal.id}`)
          if (proposalOffersResponse.ok) {
            const proposalOffersData = await proposalOffersResponse.json()
            
            if (proposalOffersData.success && proposalOffersData.offers && proposalOffersData.offers.length > 0) {
              foundProposalOffers = true
              
              // Process proposal-specific offers
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
                  expiration_type: 'hours', // Will be calculated from expiration_date
                  expiration_value: 72, // Default fallback
                  is_active: true
                }))
              
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
                  bonus_message: offer.description,
                  is_active: true
                }))
              
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

              setSpecialOffers(specialOffersList)
              setBundleRules(bundleRulesList)
              setLifestyleUpsells(lifestyleUpsellsList)
              
              // Initialize timers for proposal-specific offers
              initializeOfferTimers(specialOffersList)
            }
          }
        } catch (error) {
          console.error('Error fetching proposal-specific offers:', error)
        }
      }

      // If no proposal-specific offers found, fetch general offers
      if (!foundProposalOffers) {
        console.log('No proposal-specific offers found, fetching general offers')
        
      // Fetch special offers
      try {
        const specialResponse = await fetch('/api/offers?type=special')
        if (specialResponse.ok) {
          const special = await specialResponse.json()
          setSpecialOffers(special.filter((offer: SpecialOffer) => offer.is_active))
          initializeOfferTimers(special)
        }
      } catch (error) {
        console.error('Error fetching special offers:', error)
      }

      // Fetch bundle rules
      try {
        const bundleResponse = await fetch(`/api/offers?type=bundle&services=${proposal.services.join(',')}`)
        if (bundleResponse.ok) {
          const bundles = await bundleResponse.json()
          setBundleRules(bundles.filter((rule: BundleRule) => rule.is_active))
        }
      } catch (error) {
        console.error('Error fetching bundle rules:', error)
      }

      // Fetch lifestyle upsells
      try {
        const lifestyleResponse = await fetch('/api/offers?type=lifestyle')
        if (lifestyleResponse.ok) {
          const lifestyle = await lifestyleResponse.json()
          setLifestyleUpsells(lifestyle.filter((upsell: LifestyleUpsell) => upsell.is_active))
        }
      } catch (error) {
        console.error('Error fetching lifestyle upsells:', error)
        }
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
      setOffersError('Failed to load special offers. Some features may not be available.')
    } finally {
      setOffersLoading(false)
    }
  }

  const initializeOfferTimers = (offers: SpecialOffer[]) => {
    const timers = new Map<number, OfferTimer>()
    
    offers.forEach(offer => {
      if (offer.is_active) {
        if (offer.expiration_date) {
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
        } else if (offer.expiration_value) {
          // Use expiration_value and expiration_type
        const totalMinutes = offer.expiration_type === 'hours' 
          ? offer.expiration_value * 60 
          : offer.expiration_value * 24 * 60
        
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        
        timers.set(offer.id, { hours, minutes, seconds: 0 })
        } else {
          // Set a default timer (72 hours)
          timers.set(offer.id, { hours: 72, minutes: 0, seconds: 0 })
        }
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
          // Remove from selected offers if expired
          setSelectedOffers(prev => {
            const newSelected = new Set(prev)
            newSelected.delete(offerId)
            return newSelected
          })
        }
      })
      
      return updated
    })
  }

  const detectBundleOpportunities = () => {
    const applicableBundles = bundleRules.filter(rule => {
      const hasAllServices = rule.required_services.every(service => 
        proposal.services.includes(service)
      )
      return hasAllServices && proposal.services.length >= (rule.required_services.length || 2)
    })

    setAppliedBundles(applicableBundles)
  }

  const formatTimer = (timer: OfferTimer): string => {
    return `${timer.hours.toString().padStart(2, '0')}:${timer.minutes.toString().padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}`
  }

  const toggleSpecialOffer = (offerId: number) => {
    setSelectedOffers(prev => {
      const newSelected = new Set(prev)
      if (newSelected.has(offerId)) {
        newSelected.delete(offerId)
        toast({
          title: "Offer Removed",
          description: "Special offer has been removed from your proposal.",
          className: "bg-orange-50 border-orange-200"
        })
      } else {
        // Clear other offers and select this one
        newSelected.clear()
        newSelected.add(offerId)
        const offer = specialOffers.find(o => o.id === offerId)
        if (offer) {
          toast({
            title: "🎉 Offer Applied!",
            description: `${offer.name} has been added to your proposal!`,
            className: "bg-green-50 border-green-200"
          })
        }
      }
      return newSelected
    })
  }

  const toggleLifestyleUpsell = (upsellId: number) => {
    setSelectedUpsells(prev => {
      const newSelected = new Set(prev)
      if (newSelected.has(upsellId)) {
        newSelected.delete(upsellId)
      } else {
        newSelected.add(upsellId)
        const upsell = lifestyleUpsells.find(u => u.id === upsellId)
        if (upsell) {
          toast({
            title: "💡 Upgrade Added!",
            description: `${upsell.product_suggestion} added for just ${typeof upsell.monthly_impact === 'number' ? formatCurrency(upsell.monthly_impact) : '$' + upsell.monthly_impact}/month more!`,
            className: "bg-blue-50 border-blue-200"
          })
        }
      }
      return newSelected
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'comfort': return <Heart className="h-5 w-5" />
      case 'efficiency': return <Zap className="h-5 w-5" />
      case 'curb_appeal': return <TrendingUp className="h-5 w-5" />
      case 'smart_home': return <Target className="h-5 w-5" />
      case 'security': return <CheckCircle className="h-5 w-5" />
      default: return <Gift className="h-5 w-5" />
    }
  }

  const calculateTotalWithOffers = () => {
    let total = proposal?.pricing?.total || 0
    let additionalCost = 0
    let savings = 0

    // Add upsell costs
    selectedUpsells.forEach(upsellId => {
      const upsell = lifestyleUpsells.find(u => u.id === upsellId)
      if (upsell) {
        additionalCost += upsell.base_price
      }
    })

    // Calculate offer savings
    selectedOffers.forEach(offerId => {
      const offer = specialOffers.find(o => o.id === offerId)
      if (offer) {
        if (offer.discount_amount) {
          savings += offer.discount_amount
        } else if (offer.discount_percentage) {
          savings += total * (offer.discount_percentage / 100)
        }
      }
    })

    // Add bundle savings
    appliedBundles.forEach(bundle => {
      if (bundle.discount_type === 'percentage' && bundle.discount_value) {
        savings += total * (bundle.discount_value / 100)
      } else if (bundle.discount_type === 'fixed_amount' && bundle.discount_value) {
        savings += bundle.discount_value
      }
    })

    return {
      newTotal: Math.max(0, total + additionalCost - savings),
      additionalCost,
      savings,
      originalTotal: total
    }
  }

  const { newTotal, additionalCost, savings, originalTotal } = calculateTotalWithOffers()

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      if (!signature.trim()) {
        toast({
          title: "Signature Required",
          description: "Please type your full name to sign the proposal.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (proposal?.id) {
        const result = await updateProposalStatus(proposal.id.toString(), "signed")

        if (!result.success) {
          toast({
            title: "Error",
            description: result.error || "Failed to update proposal status.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      }

      // Simulate processing
      setTimeout(() => {
        setIsSubmitting(false)
        setIsComplete(true)
        toast({ 
          title: "🎉 Proposal Signed!", 
          description: "Your proposal has been successfully signed and payment processed.",
          className: "bg-green-50 border-green-200"
        })
      }, 2000)
    } catch (error) {
      console.error("Error submitting proposal:", error)
      setIsSubmitting(false)
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred while submitting. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRejectProposal = async () => {
    setIsRejecting(true)
    
    try {
      if (!rejectionReason) {
        toast({
          title: "Reason Required",
          description: "Please select a reason for rejecting the proposal.",
          variant: "destructive"
        })
        setIsRejecting(false)
        return
      }
      
      if (proposal?.id) {
        const result = await updateProposalStatus(proposal.id.toString(), "rejected")
        
        if (!result.success) {
          toast({
            title: "Error",
            description: result.error || "Failed to update proposal status.",
            variant: "destructive"
          })
          setIsRejecting(false)
          return
        }
        
        toast({
          title: "Proposal Rejected",
          description: "Thank you for your feedback. The proposal has been rejected.",
        })
        
        setIsRejected(true)
        setShowRejectionDialog(false)
      }
    } catch (error) {
      console.error("Error rejecting proposal:", error)
      setIsRejecting(false)
      toast({
        title: "Error",
        description: "An unexpected error occurred while rejecting the proposal.",
        variant: "destructive"
      })
    }
  }

  if (isComplete) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={bounceIn}
        className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4"
      >
        <Card className="max-w-lg w-full border-green-200 shadow-2xl overflow-hidden">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-3xl font-bold text-green-800 mb-3">🎉 Proposal Signed!</h2>
              <p className="text-green-700 mb-4 text-lg">
                Thank you for choosing us. Your proposal has been successfully signed and submitted.
              </p>
              <div className="bg-green-100 p-4 rounded-lg mb-4">
                <p className="text-sm text-green-800 font-medium">
                  Total Investment: <span className="text-xl">{formatCurrency(newTotal)}</span>
                </p>
                {savings > 0 && (
                  <p className="text-sm text-green-700">
                    You saved: {formatCurrency(savings)}!
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-600">
                You'll receive a confirmation email shortly with next steps.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (isRejected) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4"
      >
        <Card className="max-w-md w-full border-gray-200 shadow-xl">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <X className="w-10 h-10 text-gray-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Proposal Declined</h2>
            <p className="text-gray-600 mb-4">
              Thank you for your time and feedback. We appreciate the opportunity to serve you.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-7xl mx-auto p-4"
      >
        {/* Stunning Hero Header */}
        <motion.div
          variants={bounceIn}
          className="relative text-center mb-8 py-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl text-white shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-10 w-10" />
              </motion.div>
              <h1 className="text-5xl font-bold">Your Exclusive Proposal</h1>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star className="h-10 w-10" />
              </motion.div>
            </div>
            
            <div className="space-y-2 mb-6">
              <p className="text-2xl opacity-90">Proposal #{proposal?.proposalNumber || 'XXX-XXXX'}</p>
              <p className="text-lg opacity-80">Prepared exclusively for {proposal?.customer?.name}</p>
              <p className="text-sm opacity-70">{formatDate(proposal?.createdAt)}</p>
            </div>
            
            {/* Dynamic Savings & Upgrades Badge */}
            <AnimatePresence>
              {(savings > 0 || additionalCost > 0 || appliedBundles.length > 0) && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="inline-flex flex-wrap items-center gap-4 mt-6"
                >
                  {savings > 0 && (
                    <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-green-300/30">
                      <Award className="h-6 w-6" />
                      <span className="font-bold text-lg">Save {formatCurrency(savings)}</span>
                    </div>
                  )}
                  
                  {additionalCost > 0 && (
                    <div className="flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-300/30">
                      <Crown className="h-6 w-6" />
                      <span className="font-bold text-lg">+{formatCurrency(additionalCost)} Upgrades</span>
                    </div>
                  )}
                  
                  {appliedBundles.length > 0 && (
                    <div className="flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-purple-300/30">
                      <Gift className="h-6 w-6" />
                      <span className="font-bold text-lg">{appliedBundles.length} Bundle{appliedBundles.length !== 1 ? 's' : ''} Applied</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <div className="px-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl flex justify-center mb-8 shadow-lg">
            {readOnly ? (
              <TabsList className="inline-grid w-full max-w-md grid-cols-1 rounded-xl overflow-hidden shadow-lg">
                <TabsTrigger value="review" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=inactive]:bg-white py-4 text-lg font-medium transition-all duration-200">
                  Review Proposal
                </TabsTrigger>
              </TabsList>
            ) : (
              <TabsList className="inline-grid w-full max-w-3xl grid-cols-3 rounded-xl overflow-hidden shadow-lg">
                <TabsTrigger value="review" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=inactive]:bg-white py-4 text-lg font-medium transition-all duration-200">
                  1. Review
                </TabsTrigger>
                <TabsTrigger value="sign" disabled={isRejected || proposal?.status === 'signed'} className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=inactive]:bg-white py-4 text-lg font-medium transition-all duration-200 disabled:opacity-50">
                  2. Sign
                </TabsTrigger>
                <TabsTrigger value="payment" disabled={isRejected || proposal?.status === 'signed' || !signature.trim()} className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=inactive]:bg-white py-4 text-lg font-medium transition-all duration-200 disabled:opacity-50">
                  3. Payment
                </TabsTrigger>
              </TabsList>
            )}
          </div>

          <TabsContent value="review" className="space-y-8">
            <motion.div variants={staggerContainer} className="space-y-8">
              
              {/* Project Overview */}
              <motion.div variants={fadeIn}>
                <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-gray-50">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <CardTitle className="text-2xl">Project Overview</CardTitle>
                        <CardDescription className="text-gray-600">Your home improvement project details</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <span className="font-semibold text-gray-700">Homeowner:</span>
                          <p className="text-lg">{proposal?.customer?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Address:</span>
                          <p className="text-lg">{proposal?.customer?.address || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="font-semibold text-gray-700">Proposal Date:</span>
                          <p className="text-lg">{formatDate(proposal?.createdAt)}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Project Manager:</span>
                          <p className="text-lg">Jaime Sanchez (XXX-XXX-XXXX)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <span className="font-semibold text-gray-700 mb-4 block">Services Included:</span>
                      <div className="flex flex-wrap gap-3">
                        {proposal?.services?.map((service: string, index: number) => (
                          <Badge key={index} variant="secondary" className="px-4 py-2 text-sm bg-blue-100 text-blue-800">
                            {service.charAt(0).toUpperCase() + service.slice(1).replace("-", " & ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Time-Sensitive Offers - WOW FACTOR SECTION */}
              {!offersLoading && specialOffers.length > 0 && (
                <motion.div
                  variants={scaleIn}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-4 border-amber-300 shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-red-400/10"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/20 rounded-full -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-400/15 rounded-full -ml-16 -mb-16"></div>
                  
                  <div className="relative z-10 p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut" 
                        }}
                        className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-red-500 rounded-full shadow-lg"
                      >
                        <Clock className="h-8 w-8 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-3xl font-bold text-amber-900 flex items-center gap-2">
                          <Flame className="h-8 w-8 text-red-500" />
                          Limited Time Offers
                          <BoltIcon className="h-8 w-8 text-yellow-500" />
                        </h3>
                        <p className="text-amber-800 text-lg">Exclusive savings that won't last long!</p>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {specialOffers.map(offer => {
                        const timer = offerTimers.get(offer.id)
                        const isExpired = !timer || (timer.hours === 0 && timer.minutes === 0 && timer.seconds === 0)
                        const isSelected = selectedOffers.has(offer.id)
                        
                        return (
                          <motion.div
                            key={offer.id}
                            variants={bounceIn}
                            whileHover={{ scale: 1.03, rotateY: 5 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-6 rounded-xl border-3 transition-all cursor-pointer transform-gpu ${
                              isSelected 
                                ? 'border-amber-500 bg-gradient-to-br from-amber-100 to-yellow-100 shadow-2xl ring-4 ring-amber-300/50' 
                                : 'border-amber-300 bg-white/90 hover:border-amber-400 hover:shadow-xl'
                            } ${isExpired ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                            onClick={() => !isExpired && toggleSpecialOffer(offer.id)}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-amber-900 mb-2">{offer.name}</h4>
                                <p className="text-amber-800">{offer.description}</p>
                              </div>
                              {timer && !isExpired && (
                                <div className="text-center bg-red-500 text-white p-3 rounded-lg shadow-lg">
                                  <div className="text-xs font-bold mb-1">EXPIRES IN</div>
                                  <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="font-mono text-2xl font-bold"
                                  >
                                    {formatTimer(timer)}
                                  </motion.div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <Badge 
                                variant="outline" 
                                className="border-green-500 text-green-700 bg-green-50 text-lg px-4 py-2 font-bold"
                              >
                                {offer.discount_amount && `SAVE ${formatCurrency(offer.discount_amount)}`}
                                {offer.discount_percentage && `SAVE ${offer.discount_percentage}%`}
                                {offer.free_product_service && `FREE: ${offer.free_product_service}`}
                              </Badge>
                              
                              <div className="flex items-center gap-3">
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-1 text-green-600"
                                  >
                                    <CheckCircle className="h-6 w-6" />
                                  </motion.div>
                                )}
                                <Button
                                  size="lg"
                                  disabled={isExpired}
                                  variant={isSelected ? "default" : "outline"}
                                  className={`font-bold transition-all ${
                                    isSelected 
                                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg" 
                                      : "border-amber-500 text-amber-700 hover:bg-amber-50"
                                  }`}
                                >
                                  {isSelected ? '✓ APPLIED' : 'APPLY NOW'}
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Smart Bundle Detection - WOW FACTOR SECTION */}
              {appliedBundles.length > 0 && (
                <motion.div
                  variants={scaleIn}
                  className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-300 shadow-2xl overflow-hidden"
                >
                  <div className="relative p-8">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/20 rounded-full -mr-16 -mt-16"></div>
                    
                    <div className="flex items-center gap-4 mb-8">
                      <motion.div
                        animate={{ 
                          rotateY: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          ease: "easeInOut" 
                        }}
                        className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg"
                      >
                        <Gift className="h-8 w-8 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-3xl font-bold text-green-900">🎁 Smart Bundle Savings</h3>
                        <p className="text-green-800 text-lg">Automatic discounts detected for your services!</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {appliedBundles.map(bundle => (
                        <motion.div
                          key={bundle.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white/80 p-6 rounded-xl border-2 border-green-300 shadow-lg"
                        >
                          <Alert className="border-green-400 bg-green-50">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <AlertDescription className="text-green-800">
                              <div className="space-y-3">
                                <div className="font-bold text-xl">{bundle.name}</div>
                                <div className="text-lg">{bundle.bonus_message}</div>
                                <div className="flex flex-wrap gap-2">
                                  {bundle.required_services.map(service => (
                                    <Badge key={service} variant="secondary" className="bg-green-200 text-green-800 font-semibold">
                                      {service.replace('-', ' & ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Badge>
                                  ))}
                                </div>
                                {bundle.discount_value && (
                                  <div className="text-2xl font-bold text-green-700 flex items-center gap-2">
                                    <Award className="h-6 w-6" />
                                    Your Savings: {bundle.discount_type === 'percentage' ? `${bundle.discount_value}%` : formatCurrency(bundle.discount_value)}
                                  </div>
                                )}
                              </div>
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Lifestyle Upsells - WOW FACTOR SECTION */}
              {lifestyleUpsells.length > 0 && (
                <motion.div
                  variants={scaleIn}
                  className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border-4 border-blue-300 shadow-2xl overflow-hidden"
                >
                  <div className="relative p-8">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/20 rounded-full -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/15 rounded-full -ml-16 -mb-16"></div>
                    
                    <div className="flex items-center gap-4 mb-8">
                      <motion.div
                        animate={{ 
                          rotateZ: [0, 10, -10, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity,
                          ease: "easeInOut" 
                        }}
                        className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg"
                      >
                        <Target className="h-8 w-8 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-3xl font-bold text-blue-900">💡 Enhance Your Project</h3>
                        <p className="text-blue-800 text-lg">Smart upgrades that add value and comfort</p>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {lifestyleUpsells.map(upsell => {
                        const isSelected = selectedUpsells.has(upsell.id)
                        
                        return (
                          <motion.div
                            key={upsell.id}
                            variants={bounceIn}
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-6 rounded-xl border-3 transition-all cursor-pointer transform-gpu ${
                              isSelected 
                                ? 'border-blue-500 bg-gradient-to-br from-blue-100 to-purple-100 shadow-2xl ring-4 ring-blue-300/50' 
                                : 'border-blue-300 bg-white/90 hover:border-blue-400 hover:shadow-xl'
                            }`}
                            onClick={() => toggleLifestyleUpsell(upsell.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  {getCategoryIcon(upsell.category)}
                                  <h4 className="text-xl font-bold text-blue-900">{upsell.trigger_phrase}</h4>
                                </div>
                                <p className="text-blue-800 font-semibold text-lg mb-2">{upsell.product_suggestion}</p>
                                <p className="text-gray-600 mb-4">{upsell.description}</p>
                                
                                <Badge variant="outline" className="border-blue-400 text-blue-700 bg-blue-50">
                                  {upsell.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              </div>
                              
                              <div className="text-right ml-6">
                                <div className="text-2xl font-bold text-green-600 mb-1">
                                  {formatCurrency(upsell.base_price)}
                                </div>
                                <div className="text-blue-600 font-semibold mb-3">
                                  +${typeof upsell.monthly_impact === 'number' ? formatCurrency(upsell.monthly_impact) : '$' + upsell.monthly_impact}/month
                                </div>
                                <div>
                                  {isSelected ? (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="flex flex-col items-center gap-2"
                                    >
                                      <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg font-bold">
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        ADDED
                                      </Button>
                                    </motion.div>
                                  ) : (
                                    <Button size="lg" variant="outline" className="border-blue-500 text-blue-700 hover:bg-blue-50 font-bold">
                                      ADD UPGRADE
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Enhanced Total Investment Summary - ULTIMATE WOW FACTOR */}
              <motion.div
                variants={scaleIn}
                className="rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 border-4 border-purple-300 shadow-2xl overflow-hidden"
              >
                <div className="relative p-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-pink-400/5"></div>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-purple-400/10 rounded-full -mr-24 -mt-24"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-400/10 rounded-full -ml-20 -mb-20"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <motion.div
                        animate={{ 
                          rotateY: [0, 180, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          ease: "easeInOut" 
                        }}
                        className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
                      >
                        <DollarSign className="h-8 w-8 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-3xl font-bold text-purple-900">💰 Your Investment Summary</h3>
                        <p className="text-purple-800 text-lg">Complete breakdown with all savings and upgrades</p>
                      </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-purple-200">
                      <div className="space-y-6">
                        <motion.div 
                          className="flex justify-between items-center text-xl border-b border-gray-200 pb-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <span className="text-gray-700 font-semibold">Original Project Total</span>
                          <span className="font-bold">{formatCurrency(originalTotal)}</span>
                        </motion.div>

                        {additionalCost > 0 && (
                          <motion.div 
                            className="flex justify-between items-center text-lg text-blue-600"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <span className="flex items-center gap-2">
                              <Crown className="h-5 w-5" />
                              Selected Upgrades
                            </span>
                            <span className="font-bold">+{formatCurrency(additionalCost)}</span>
                          </motion.div>
                        )}

                        {savings > 0 && (
                          <motion.div 
                            className="flex justify-between items-center text-lg text-green-600"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <span className="flex items-center gap-2">
                              <Award className="h-5 w-5" />
                              Your Total Savings
                            </span>
                            <span className="font-bold">-{formatCurrency(savings)}</span>
                          </motion.div>
                        )}

                        <Separator className="my-6" />

                        <motion.div 
                          className="flex justify-between items-center bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl border-2 border-purple-300"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.4, type: "spring" }}
                        >
                          <span className="text-2xl font-bold text-gray-900">Your Total Investment</span>
                          <div className="text-right">
                            <motion.div
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-4xl font-bold text-purple-600"
                            >
                              {formatCurrency(newTotal)}
                            </motion.div>
                            {savings > 0 && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-lg text-green-600 font-bold flex items-center gap-1"
                              >
                                <Star className="h-5 w-5" />
                                You saved {formatCurrency(savings)}!
                              </motion.div>
                            )}
                          </div>
                        </motion.div>

                        {proposal?.pricing?.monthlyPayment && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 text-center"
                          >
                            <p className="text-gray-600 mb-2 font-semibold">Estimated Monthly Payment</p>
                            <motion.p
                              animate={{ scale: [1, 1.02, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="text-4xl font-bold text-blue-600 mb-2"
                            >
                              {formatCurrency(proposal.pricing.monthlyPayment)}
                            </motion.p>
                            <p className="text-sm text-gray-500">*Based on approved financing</p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              {!readOnly && !isRejected && proposal?.status !== 'signed' && (
                <motion.div 
                  variants={fadeIn}
                  className="flex flex-col sm:flex-row gap-6 mt-12"
                >
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    className="flex-1"
                  >
                    <Button 
                      onClick={() => setCurrentTab("sign")} 
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-6 text-xl font-bold rounded-xl shadow-2xl transition-all transform hover:shadow-3xl"
                      size="lg"
                    >
                      <Check className="w-6 h-6 mr-3" /> 
                      Continue to Sign Proposal
                    </Button>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    className="sm:w-64"
                  >
                    <Button 
                      onClick={() => setShowRejectionDialog(true)} 
                      variant="outline" 
                      className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 py-6 text-xl font-bold rounded-xl shadow-lg transition-all transform hover:shadow-xl"
                      size="lg"
                    >
                      <X className="h-6 w-6 mr-3" />
                      Decline Proposal
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>

          {/* Sign Tab Content */}
          <TabsContent value="sign" className="space-y-6">
            {!readOnly && currentTab === "sign" && !isRejected && proposal?.status !== 'signed' && (
              <motion.div
                key="sign"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={fadeIn}
                className="space-y-8 max-w-2xl mx-auto"
              >
                <div className="text-center">
                  <h3 className="text-3xl font-semibold text-gray-800 mb-2">Electronically Sign Your Proposal</h3>
                  <p className="text-gray-600 text-lg">
                    Please type your full name below to accept the terms and conditions of this project proposal.
                  </p>
                </div>

                <Card className="shadow-xl rounded-lg border-gray-200">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="signature" className="text-lg font-medium">Digital Signature</Label>
                        <Input
                          id="signature"
                          type="text"
                          placeholder="Type your full name here"
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          className="mt-2 text-lg p-4 border-2 border-gray-300 focus:border-blue-500"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          By typing your name above, you agree to the terms and conditions of this proposal.
                        </p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">Summary of Your Investment:</h4>
                        <div className="space-y-2 text-blue-800">
                          <div className="flex justify-between">
                            <span>Total Project Value:</span>
                            <span className="font-bold">{formatCurrency(newTotal)}</span>
                          </div>
                          {savings > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Total Savings:</span>
                              <span className="font-bold">{formatCurrency(savings)}</span>
                            </div>
                          )}
                          {proposal?.pricing?.monthlyPayment && (
                            <div className="flex justify-between">
                              <span>Monthly Payment:</span>
                              <span className="font-bold">{formatCurrency(proposal.pricing.monthlyPayment)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => setCurrentTab("payment")}
                        disabled={!signature.trim()}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 text-lg font-bold rounded-lg shadow-lg disabled:opacity-50"
                        size="lg"
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Payment Tab Content */}
          <TabsContent value="payment" className="space-y-6">
            {!readOnly && currentTab === "payment" && signature.trim() && !isRejected && proposal?.status !== 'signed' && (
              <motion.div
                key="payment"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={fadeIn}
                className="space-y-8 max-w-2xl mx-auto"
              >
                <div className="text-center">
                  <h3 className="text-3xl font-semibold text-gray-800 mb-2">Finalize Your Project</h3>
                  <p className="text-gray-600 text-lg">
                    Review your final investment and complete the signing process.
                  </p>
                </div>

                <Card className="shadow-xl rounded-lg border-gray-200">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-4 text-xl">Final Investment Summary</h4>
                        <div className="space-y-3 text-green-800">
                          <div className="flex justify-between text-lg">
                            <span>Project Total:</span>
                            <span className="font-bold">{formatCurrency(newTotal)}</span>
                          </div>
                          {savings > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Your Savings:</span>
                              <span className="font-bold">{formatCurrency(savings)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Signed by:</span>
                            <span className="font-bold italic">{signature}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-xl font-bold rounded-lg shadow-lg"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="flex items-center gap-3"
                          >
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                            Processing...
                          </motion.div>
                        ) : (
                          <>
                            <Check className="w-6 h-6 mr-3" />
                            Complete & Sign Proposal
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        {/* Rejection Dialog */}
        <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Decline Proposal</DialogTitle>
              <DialogDescription>
                We'd appreciate your feedback to help us improve our service.
              </DialogDescription>
            </DialogHeader>
            <div>
              <Label htmlFor="rejection-reason" className="text-lg font-medium">Reason for Rejection</Label>
              <Select
                value={rejectionReason}
                onValueChange={(value) => setRejectionReason(value)}
              >
                <SelectTrigger id="rejection-reason" className="mt-2">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {/* Add your rejection reasons here */}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Label htmlFor="rejection-feedback" className="text-lg font-medium">Feedback</Label>
              <Textarea
                id="rejection-feedback"
                value={rejectionFeedback}
                onChange={(e) => setRejectionFeedback(e.target.value)}
                placeholder="Enter your feedback here"
                className="mt-2"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleRejectProposal}
                disabled={isRejecting}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {isRejecting ? "Submitting..." : "Decline Proposal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}