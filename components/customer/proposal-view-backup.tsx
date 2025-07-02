"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, CreditCard, X, AlertTriangle, Info, FileText, DollarSign, Eye, EyeOff, ShoppingCart, Sparkles, Edit, Clock, Gift, Target, Heart, Zap, TrendingUp, CheckCircle, Star, Award } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from 'next/image'
import { useProposalOffers } from "@/lib/use-proposal-offers"
import InteractiveOffers from "./interactive-offers"
import { 
  calculateMonthlyPaymentWithFactor, 
  calculateMonthlyPayment, 
  calculateAddonMonthlyImpact,
  calculateTotalWithAdjustments,
  formatCurrency as formatCurrencyUtil
} from "@/lib/financial-utils"
import ProductDetailsDisplay from "./product-details-display"
import { useRouter } from "next/navigation"

// Animation variants
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
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
}

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

// Helper function to format currency
const formatCurrency = formatCurrencyUtil;

// Enhanced interfaces
interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  monthly_impact: number;
  selected: boolean;
}

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
  monthly_impact: number | string
  description: string
  is_active: boolean
}

interface OfferTimer {
  hours: number
  minutes: number
  seconds: number
}

interface CustomerProposalViewProps {
  proposal: any
  readOnly?: boolean
}

// Define interface for EnhanceYourProject props
interface EnhanceYourProjectProps {
  services: string[];
  availableAddons: Record<string, Addon[]>;
  selectedAddons: Record<string, Addon[]>;
  onAddonToggle: (serviceKey: string, addonId: string, checked: boolean) => void;
  originalTotal: number;
  currentTotal: number;
  monthlyPayment: number;
}

// Add this EnhanceYourProject component
const EnhanceYourProject = ({ 
  services, 
  availableAddons, 
  selectedAddons, 
  onAddonToggle, 
  originalTotal, 
  currentTotal, 
  monthlyPayment 
}: EnhanceYourProjectProps) => {
  return (
    <Card className="mb-8 overflow-hidden border-blue-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle>💡 Enhance Your Project</CardTitle>
            <CardDescription>Small additions that make a big difference in your home's comfort and value</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {services.map(service => {
            const addons = availableAddons[service] || [];
            if (addons.length === 0) return null;
            
            return (
              <div key={service} className="space-y-4">
                {addons.map((addon: Addon) => {
                  const isSelected = selectedAddons[service]?.some((a: Addon) => a.id === addon.id && a.selected) || false;
                  
                  return (
                    <div key={addon.id} className="border rounded-lg overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Heart className={`h-5 w-5 ${isSelected ? 'text-rose-600' : 'text-blue-600'}`} />
                            <h4 className="font-semibold text-gray-900">Want it {addon.name.toLowerCase().includes('quiet') ? 'quieter' : 'better'} inside?</h4>
                          </div>
                          <div className="mt-1 font-medium text-blue-700">{addon.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{addon.description}</div>
                          <div className="mt-2">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                              {service.replace('-', ' & ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <div className="text-xl font-bold text-green-700">{formatCurrency(addon.price)}</div>
                          <div className="text-sm text-blue-600">+{formatCurrency(addon.monthly_impact)}/month</div>
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={isSelected}
                              onChange={e => onAddonToggle(service, addon.id, e.target.checked)}
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-gray-700 font-medium">Current Project Total</div>
                <div className="text-2xl font-bold text-blue-900">{formatCurrency(currentTotal)}</div>
                <div className="text-sm text-green-700 font-medium">Monthly payment: {formatCurrency(monthlyPayment)}/mo</div>
              </div>
              <div className="text-right">
                {currentTotal > originalTotal && (
                  <div className="text-blue-700 text-sm font-medium">
                    Enhancements added: +{formatCurrency(currentTotal - originalTotal)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CustomerProposalView({ proposal: initialProposal, readOnly = false }: CustomerProposalViewProps) {
  const [proposal, setProposal] = useState(initialProposal);
  const [currentTab, setCurrentTab] = useState("review");
  const [showDetail, setShowDetail] = useState(false);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [availableAddons, setAvailableAddons] = useState<Record<string, Addon[]>>({
    roofing: [
      { id: "gutter_addon", name: "Seamless Gutters", description: "Protect your home with new seamless gutters.", price: 1500, monthly_impact: 15, selected: false },
      { id: "skylight_addon", name: "Skylight Installation", description: "Add natural light to your home.", price: 2500, monthly_impact: 25, selected: false },
    ],
    windows: [
      { id: "patio_door_addon", name: "New Patio Door", description: "Upgrade to a stylish and energy-efficient patio door.", price: 3100, monthly_impact: 35, selected: false },
      { id: "window_color_upgrade", name: "Window Color Upgrade (Bronze/Black)", description: "Enhance curb appeal with premium window colors.", price: 65, monthly_impact: 2, selected: false },
    ],
    hvac: [
      { id: "smart_thermostat_addon", name: "Smart Thermostat", description: "Optimize your energy usage with a smart thermostat.", price: 350, monthly_impact: 5, selected: false },
    ],
    paint: [
      { id: "premium_paint_addon", name: "Premium Paint Upgrade", description: "Longer-lasting and more vibrant colors.", price: 800, monthly_impact: 8, selected: false },
    ]
  });
  const [selectedAddons, setSelectedAddons] = useState<Record<string, Addon[]>>({});
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [signature, setSignature] = useState("");
  const [showLineItemPricing, setShowLineItemPricing] = useState(initialProposal?.pricing?.showLineItems !== false);

  // Store calculated values - Initialize these early to avoid reference errors
  const [currentTotal, setCurrentTotal] = useState(proposal?.pricing?.total || 0);
  const [currentMonthlyPayment, setCurrentMonthlyPayment] = useState(proposal?.pricing?.monthlyPayment || 0);

  // Enhanced offers using custom hook
  const {
    specialOffers,
    bundleRules, 
    lifestyleUpsells,
    selectedOffers,
    offerTimers,
    isLoading: offersLoading,
    error: offersError,
    toggleSpecialOffer,
    formatTimer,
    timeSensitiveOffers
  } = useProposalOffers(proposal?.id, proposal?.services || [])

  // For lifestyle upsells - temporary until fully moved to the hook
  const [selectedUpsells, setSelectedUpsells] = useState<Set<number>>(new Set())

  // Rejection states
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectionFeedback, setRejectionFeedback] = useState("")
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isRejected, setIsRejected] = useState(false)

  // Function to update proposal data, e.g., after adding/removing an addon
  // This function now performs client-side optimistic updates based on initialProposal and current selectedAddons.
  const refreshProposalData = useCallback(() => {
    if (!initialProposal || !initialProposal.pricing) return;

    let newSubtotal = initialProposal.pricing.subtotal;
    let newTotal = initialProposal.pricing.total;
    let newMonthlyPayment = initialProposal.pricing.monthlyPayment;
    let addonsTotalPrice = 0;
    let addonsMonthlyImpactTotal = 0;

    // Get payment factor if available (either directly or calculated from existing values)
    const paymentFactor = initialProposal.pricing.paymentFactor || 
                         (initialProposal.pricing.total && initialProposal.pricing.monthlyPayment ? 
                          (initialProposal.pricing.monthlyPayment / initialProposal.pricing.total * 100) : 
                          null);
    
    // Calculate addons price and monthly impact
    Object.values(selectedAddons).flat().forEach(addon => {
      if (addon.selected) {
        addonsTotalPrice += addon.price;
        
        // Calculate monthly impact using standardized function
        addonsMonthlyImpactTotal += calculateAddonMonthlyImpact(
          addon.price,
          paymentFactor,
          initialProposal.pricing.financingTerm
        );
      }
    });

    newSubtotal += addonsTotalPrice; // Addons typically add to subtotal before final total calculation
    
    // Use the standardized calculation for the total
    newTotal = calculateTotalWithAdjustments(
      initialProposal.pricing.subtotal, 
      addonsTotalPrice, 
      0, // No savings to apply here
      initialProposal.pricing.discount
    );
    
    // Calculate the new monthly payment using the proper financing method
    if (paymentFactor) {
      // Use payment factor calculation (most accurate)
      newMonthlyPayment = calculateMonthlyPaymentWithFactor(newTotal, paymentFactor);
    } else if (initialProposal.pricing.financingTerm && initialProposal.pricing.interestRate) {
      // Use standard amortization formula
      newMonthlyPayment = calculateMonthlyPayment(
        newTotal, 
        initialProposal.pricing.financingTerm, 
        initialProposal.pricing.interestRate
      );
    } else {
      // Fallback to simple addition of the monthly impact
    newMonthlyPayment = initialProposal.pricing.monthlyPayment + addonsMonthlyImpactTotal;
    }
    
    // Update UI state values immediately for real-time display
    setCurrentTotal(newTotal);
    setCurrentMonthlyPayment(newMonthlyPayment);
    
    setProposal((prev: any) => ({
      ...prev, // Keep other proposal details
      // Update only the pricing part of the proposal state
      pricing: {
        ...(prev.pricing || initialProposal.pricing), // Base on previous pricing or initial if not set
        subtotal: newSubtotal, // This is now base subtotal + addons price
        total: newTotal,       // Recalculated total
        monthlyPayment: newMonthlyPayment, // Recalculated monthly payment
        // Ensure other fields like discount, financingPlanId, etc., are preserved from prev.pricing
      },
    }));
  }, [initialProposal, selectedAddons]);

  // Initialize selected addons and refresh data on initial load or if initialProposal changes
  useEffect(() => {
    const initialSelected: Record<string, Addon[]> = {};
    const proposalAddonIds = new Set(initialProposal?.addons?.map((a: any) => a.id || a) || []); // Handle if addons are objects or just IDs

    // Extract payment factor from proposal to ensure consistent calculations
    const paymentFactor = initialProposal?.pricing?.paymentFactor || 
                         (initialProposal?.pricing?.total && initialProposal?.pricing?.monthlyPayment ? 
                          (initialProposal.pricing.monthlyPayment / initialProposal.pricing.total * 100) : 
                          null);

    Object.keys(availableAddons).forEach(serviceKey => {
      initialSelected[serviceKey] = availableAddons[serviceKey].map(addon => {
        // If we have a payment factor, recalculate the monthly impact using consistent approach
        let monthlyImpact = addon.monthly_impact;
        if (paymentFactor && typeof addon.price === 'number') {
          monthlyImpact = calculateAddonMonthlyImpact(addon.price, paymentFactor);
        }

        return {
        ...addon,
          monthly_impact: monthlyImpact,
        selected: proposalAddonIds.has(addon.id)
        };
      });
    });
    setSelectedAddons(initialSelected);
  }, [initialProposal, availableAddons]);

  // Effect to run refreshProposalData when selectedAddons change or initialProposal changes (after selectedAddons initialized)
  useEffect(() => {
    refreshProposalData();
  }, [selectedAddons, refreshProposalData]); // refreshProposalData is now a dependency

  // Add an effect to update the currentTotal and currentMonthlyPayment when proposal pricing changes
  useEffect(() => {
    if (proposal?.pricing) {
      setCurrentTotal(proposal.pricing.total);
      setCurrentMonthlyPayment(proposal.pricing.monthlyPayment);
    }
  }, [proposal?.pricing]);

  const handleAddonToggle = async (serviceKey: string, addonId: string, checked: boolean) => {
    // Optimistically update selectedAddons state
    setSelectedAddons(prev => {
      const updatedServiceAddons = prev[serviceKey]?.map(addon =>
        addon.id === addonId ? { ...addon, selected: checked } : addon
      ) || [];
      const newState = { ...prev, [serviceKey]: updatedServiceAddons };
      return newState;
    });

    // `refreshProposalData` will be called by the useEffect watching `selectedAddons`,
    // providing an immediate optimistic UI update for pricing.

    const addon = availableAddons[serviceKey]?.find(a => a.id === addonId);
    if (!addon) return;

    // **BACKEND INTEGRATION POINT**
    // When backend is integrated, uncomment and implement these calls.
    // The backend should persist the addon change and return the FULLY UPDATED proposal object (with recalculated pricing).
    try {
      let updatedProposalFromServer;
      if (checked) {
        // Add addon to proposal - this would be a real API call
        // updatedProposalFromServer = await fetch('/api/proposals/addons', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     proposalId: proposal.id,
        //     addonId: addon.id,
        //     serviceKey: serviceKey,
        //     price: addon.price,
        //     monthlyImpact: addon.monthly_impact
        //   })
        // }).then(res => res.json());
        
        toast({ 
          title: "Upgrade Added", 
          description: `${addon.name} added to your proposal.`,
          variant: "default"
        });
      } else {
        // Remove addon from proposal - this would be a real API call
        // updatedProposalFromServer = await fetch('/api/proposals/addons', {
        //   method: 'DELETE',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     proposalId: proposal.id,
        //     addonId: addon.id
        //   })
        // }).then(res => res.json());
        
        toast({ 
          title: "Upgrade Removed", 
          description: `${addon.name} removed from your proposal.`,
          variant: "default"
        });
      }

      // Note: useEffect will automatically update totals when selectedAddons changes

      // **IMPORTANT**: After backend call, update the main proposal state with authoritative data.
      // if (updatedProposalFromServer) {
      //   setProposal(updatedProposalFromServer);
      //   // If the server sends back selected addons in a specific format, you might need to re-sync `selectedAddons` state too.
      // }
    } catch (error) {
      console.error("Error updating addon:", error);
      toast({ 
        title: "Error", 
        description: "Could not update your selection. Please try again.", 
        variant: "destructive" 
      });
      
      // Revert optimistic update of selectedAddons if backend call fails
      setSelectedAddons(prev => {
        const revertedServiceAddons = prev[serviceKey]?.map(a =>
          a.id === addonId ? { ...a, selected: !checked } : a
        ) || [];
        return { ...prev, [serviceKey]: revertedServiceAddons };
      });
    }
  };


  // Mark the proposal as viewed when the customer opens it
  useEffect(() => {
    if (!readOnly && proposal?.id && proposal?.status === "sent") {
      const markAsViewed = async () => {
        try {
          await updateProposalStatus(proposal.id.toString(), "viewed")
          // No need to fetch /api/proposals/view, use server action
        } catch (error) {
          console.error("Error marking proposal as viewed:", error)
          // Optionally show a toast to the user if this fails, though it's a background task.
        }
      }
      markAsViewed()
    }
    if (proposal?.status === "rejected") {
      setIsRejected(true)
    }
  }, [proposal?.id, proposal?.status, readOnly])

  const handleTabChange = (value: string) => {
    if (value === "sign" && currentTab === "review") {
      setCurrentTab("sign")
    } else if (value === "payment" && currentTab === "sign" && signature.trim()) {
      setCurrentTab("payment")
    } else if (value === "review") {
      setCurrentTab("review")
    } else {
      if (value === "payment" && currentTab === "sign" && !signature.trim()) {
        toast({
          title: "Signature Required",
          description: "Please sign the proposal before proceeding to payment.",
          variant: "destructive",
        })
      }
    }
  }

  const sendConfirmationEmail = async () => {
    try {
      const response = await fetch("/api/email", { // Assuming this API route exists and is configured
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: proposal?.customer?.email,
          name: proposal?.customer?.name,
          proposalId: proposal?.id,
          proposalNumber: proposal?.proposalNumber,
          message: `Your proposal has been signed and your deposit has been processed successfully. Thank you for choosing Evergreen Home Upgrades. Our team will contact you shortly to schedule your project.`,
        }),
      })

      const result = await response.json()
      if (!result.success) {
        console.error("Error sending confirmation email:", result.error)
        toast({ title: "Email Error", description: "Confirmation email could not be sent.", variant: "destructive"})
      }
      return result.success
    } catch (error) {
      console.error("Error sending confirmation email:", error)
      toast({ title: "Email Error", description: "Failed to send confirmation email.", variant: "destructive"})
      return false
    }
  }

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
        // First, update any selected addons to the proposal object if they are not already part of it.
        // This step depends on how your `proposal` object and `createProposal` / `updateProposal` actions handle addons.
        // For this example, let's assume `updateProposalStatus` or a dedicated action would persist these.
        // You might need a new action like `finalizeProposalWithAddons(proposal.id, selectedAddons)`

        const result = await updateProposalStatus(proposal.id.toString(), "signed") // Pass selectedAddons if action supports it

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

      // Simulate processing payment
      // In a real app, integrate with a payment gateway here (Stripe, PayPal, etc.)
      // For now, we simulate a delay.
      setTimeout(async () => {
        await sendConfirmationEmail()
        setIsSubmitting(false)
        setIsComplete(true)
        toast({ title: "Proposal Signed!", description: "Your proposal has been successfully signed and payment processed."})
      }, 1500)
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
        });
        setIsRejecting(false);
        return;
      }
      
      if (proposal?.id) {
        const result = await updateProposalStatus(proposal.id.toString(), "rejected");
        
        if (!result.success) {
          toast({
            title: "Error",
            description: result.error || "Failed to update proposal status.",
            variant: "destructive"
          });
          setIsRejecting(false);
          return;
        }
        
        try {
          const response = await fetch('/api/proposals/feedback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              proposalId: Number(proposal.id),
              reason: rejectionReason,
              feedback: rejectionFeedback || ""
            }),
          });

          const feedbackResult = await response.json();
          
          if (!response.ok || !feedbackResult.success) {
            console.error("Failed to save feedback:", feedbackResult);
            toast({ title: "Feedback Error", description: "Could not save feedback, but proposal rejected.", variant: "default"})
          }
        } catch (feedbackError) {
          console.error("Error saving feedback:", feedbackError);
          toast({ title: "Feedback Error", description: "An error occurred while saving feedback.", variant: "default"})
        }
        
        toast({
          title: "Proposal Rejected",
          description: "Thank you for your feedback. The proposal has been rejected.",
        });
        
        setIsRejected(true);
        setShowRejectionDialog(false);
      }
    } catch (error) {
      console.error("Error rejecting proposal:", error);
      toast({
        title: "Rejection Error",
        description: "An unexpected error occurred while rejecting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRejecting(false);
    }
  };

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
  
  // Calculate total with offers, addons, and other adjustments
  const calculateTotalWithOffers = () => {
    let total = proposal?.pricing?.total || 0;
    let additionalCost = 0;
    let savings = 0;

    // Calculate addon costs (already included in proposal.pricing.total)
    // This is just for reference in the breakdown

    // Calculate lifestyle upsell costs
    selectedUpsells.forEach(upsellId => {
      const upsell = lifestyleUpsells.find(u => u.id === upsellId)
      if (upsell) {
        additionalCost += upsell.base_price;
      }
    });

    // Calculate offer savings
    selectedOffers.forEach(offerId => {
      const offer = specialOffers.find(o => o.id === offerId)
      if (offer) {
        if (offer.discount_amount) {
          savings += offer.discount_amount;
        } else if (offer.discount_percentage) {
          savings += total * (offer.discount_percentage / 100);
        }
      }
    });
    
    // Calculate the new total based on adjustments
    const newTotal = calculateTotalWithAdjustments(
      proposal?.pricing?.total || 0,
      additionalCost,
      savings
    );
    
    // Calculate the updated monthly payment using the proper financing calculation
    let newMonthlyPayment = 0;
    
    // Get payment factor if available (either directly or calculated from existing values)
    const paymentFactor = proposal?.pricing?.paymentFactor || 
                         (proposal?.pricing?.total && proposal?.pricing?.monthlyPayment ? 
                          (proposal.pricing.monthlyPayment / proposal.pricing.total * 100) : 
                          null);
    
    if (paymentFactor) {
      // Use payment factor calculation (most accurate)
      newMonthlyPayment = calculateMonthlyPaymentWithFactor(newTotal, paymentFactor);
    } else if (proposal?.pricing?.financingTerm && proposal?.pricing?.interestRate) {
      // Use standard amortization formula
      newMonthlyPayment = calculateMonthlyPayment(
        newTotal, 
        proposal.pricing.financingTerm, 
        proposal.pricing.interestRate
      );
    } else {
      // Fallback to simple adjustment of existing monthly payment
      const baseMonthlyPayment = proposal?.pricing?.monthlyPayment || 0;
      const termMonths = proposal?.pricing?.financingTerm || 60;
      
      // Calculate impacts using standardized function
      const additionalMonthlyImpact = Array.from(selectedUpsells).reduce((total: number, upsellId: number) => {
        const upsell = lifestyleUpsells.find(u => u.id === upsellId);
        if (upsell) {
          return total + calculateAddonMonthlyImpact(upsell.base_price, paymentFactor, termMonths);
        }
        return total;
      }, 0);
      
      const savingsMonthlyImpact = savings / termMonths;
      newMonthlyPayment = baseMonthlyPayment + additionalMonthlyImpact - savingsMonthlyImpact;
    }

    return {
      newTotal,
      additionalCost,
      savings,
      originalTotal: total,
      newMonthlyPayment
    };
  };
  
  // Use useEffect to update state based on calculation results
  useEffect(() => {
    const calculationResults = calculateTotalWithOffers();
    setCurrentTotal(calculationResults.newTotal);
    setCurrentMonthlyPayment(calculationResults.newMonthlyPayment);
  }, [selectedOffers, selectedUpsells, proposal?.pricing?.total, proposal?.pricing?.monthlyPayment]);

  // Simplified stub for lifestyle upsells (not fully implemented)
  const toggleLifestyleUpsell = (upsellId: number) => {
    setSelectedUpsells(prev => {
      const newSelected = new Set(prev)
      if (newSelected.has(upsellId)) {
        newSelected.delete(upsellId)
      } else {
        newSelected.add(upsellId)
      }
      return newSelected
    })
  }

  // Helper for category icons
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

  // Get calculation results for rendering without setting state
  const { newTotal, additionalCost, savings, originalTotal } = calculateTotalWithOffers()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-slate-200 py-8 sm:py-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="container mx-auto px-4 max-w-5xl"
      >
        <Card className="shadow-2xl rounded-xl overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-2 rounded-lg shadow-sm">
                  <Image src="/sereenh-04.png" alt="Evergreen Home Upgrades Logo" width={60} height={60} className="rounded-sm" /> 
                </div>
                <div>
                    <CardTitle className="text-3xl sm:text-4xl font-bold">Home Improvement Proposal</CardTitle>
                    <CardDescription className="text-green-100 text-sm sm:text-base">Prepared for: {proposal?.customer?.name || 'Valued Customer'}</CardDescription>
                </div>
              </div>
              <div className="text-right mt-4 sm:mt-0 self-start sm:self-center">
                <p className="text-sm font-medium">Proposal #{proposal?.proposalNumber}</p>
                <p className="text-xs">Date: {formatDate(proposal?.createdAt)}</p>
                {isRejected && (
                  <p className="text-xs font-semibold text-red-200 bg-red-700 px-2 py-1 rounded mt-1 inline-block">Status: Rejected</p>
                )}
                 {proposal?.status === 'signed' && (
                  <p className="text-xs font-semibold text-emerald-200 bg-emerald-700 px-2 py-1 rounded mt-1 inline-block">Status: Signed</p>
                )}
              </div>
            </div>
          </CardHeader>

          <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
            <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-center">
              {readOnly ? (
                <TabsList className="inline-grid w-full max-w-md grid-cols-1 rounded-lg overflow-hidden shadow">
                  <TabsTrigger value="review" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=inactive]:bg-white py-3 text-base font-medium transition-colors duration-150">Review Proposal</TabsTrigger>
                </TabsList>
              ) : (
                <TabsList className="inline-grid w-full max-w-2xl grid-cols-3 rounded-lg overflow-hidden shadow">
                  <TabsTrigger value="review" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=inactive]:bg-white py-3 text-base font-medium transition-colors duration-150">1. Review</TabsTrigger>
                  <TabsTrigger value="sign" disabled={isRejected || proposal?.status === 'signed'} className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=inactive]:bg-white py-3 text-base font-medium transition-colors duration-150 disabled:opacity-50 disabled:bg-gray-100">2. Sign</TabsTrigger>
                  <TabsTrigger value="payment" disabled={isRejected || proposal?.status === 'signed' || currentTab !== "sign" || !signature.trim()} className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=inactive]:bg-white py-3 text-base font-medium transition-colors duration-150 disabled:opacity-50 disabled:bg-gray-100">
                    3. Payment
                  </TabsTrigger>
                </TabsList>
              )}
            </div>

            <CardContent className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {currentTab === "review" && (
                  <motion.div
                    key="review"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={fadeIn}
                    className="space-y-8"
                  >
                    {/* Customer Information Section - Updated to Project Overview */}
                    <motion.div variants={fadeIn} className="pb-6 border-b border-gray-200">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FileText className="w-6 h-6 mr-3 text-emerald-600" /> Project Overview
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-base text-gray-700">
                            <div><strong>Homeowner:</strong> {proposal?.customer?.name || 'N/A'}</div>
                            <div><strong>Address:</strong> {proposal?.customer?.address || 'N/A'}</div>
                            <div><strong>Proposal Date:</strong> {formatDate(proposal?.createdAt)}</div>
                            <div><strong>Sales Representative:</strong> {proposal?.rep_first_name && proposal?.rep_last_name ? 
                              `${proposal.rep_first_name} ${proposal.rep_last_name}` : 'N/A'}</div>
                            <div><strong>Rep Phone:</strong> {proposal?.rep_phone || 'N/A'}</div>
                        </div>
                    </motion.div>

                    {/* Services Included Section */}
                    <motion.div variants={fadeIn}>
                      <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        <ShoppingCart className="w-6 h-6 mr-3 text-emerald-600" /> Services Included
                      </h3>
                      <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-wrap gap-3"
                      >
                        {proposal?.serviceNames?.map((service: string, index: number) => (
                          <motion.span
                            key={index}
                            variants={fadeIn}
                            className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                          >
                            {service.charAt(0).toUpperCase() + service.slice(1).replace("-", " & ")}
                          </motion.span>
                        ))}
                      </motion.div>
                    </motion.div>
                    
                    {/* Enhanced Project Options - Only for customers */}
                    {!readOnly && !isRejected && proposal?.status !== 'signed' && (
                      <motion.div variants={fadeIn}>
                        <EnhanceYourProject
                          services={proposal?.services || []}
                          availableAddons={availableAddons}
                          selectedAddons={selectedAddons}
                          onAddonToggle={handleAddonToggle}
                          originalTotal={proposal?.pricing?.total || 0}
                          currentTotal={currentTotal}
                          monthlyPayment={currentMonthlyPayment}
                        />
                      </motion.div>
                    )}

                    {/* Scope of Work Section */}
                    <motion.div variants={fadeIn} className="pt-6 border-t border-gray-200">
                      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                         <Edit className="w-6 h-6 mr-3 text-emerald-600" /> Detailed Scope of Work
                      </h3>
                      
                      {/* Product Details Display */}
                      <ProductDetailsDisplay 
                        proposal={proposal} 
                        showLineItemPricing={showLineItemPricing} 
                      />
                      
                      <div className="space-y-6 mt-8">
                        <h4 className="text-xl font-semibold text-gray-700">Scope Descriptions</h4>
                        {proposal?.services?.map((service: string, index: number) => {
                          const productData = proposal.products[service]
                          if (!productData) return null

                          return (
                            <motion.div key={index} variants={fadeIn} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                              <h4 className="text-xl font-semibold text-emerald-700 mb-3">
                                {service.charAt(0).toUpperCase() + service.slice(1).replace("-", " & ")}
                              </h4>
                              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-md border font-sans">
                                {productData.scopeNotes}
                              </pre>
                              {/* Display Addons for this service */}
                              {selectedAddons[service] && selectedAddons[service].length > 0 && (
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                  <h5 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                                    <Sparkles className="w-5 h-5 mr-2 text-amber-500" /> Available Upgrades for {service.charAt(0).toUpperCase() + service.slice(1).replace("-", " & ")}:
                                  </h5>
                                  <div className="space-y-3">
                                    {selectedAddons[service].map((addon: Addon) => (
                                      <motion.div 
                                        key={addon.id} 
                                        variants={fadeIn}
                                        className={`flex items-center justify-between p-4 rounded-md border transition-all duration-300 ${addon.selected ? 'bg-emerald-50 border-emerald-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                                      >
                                        <div>
                                          <Label htmlFor={`addon-${service}-${addon.id}`} className="font-medium text-gray-800 flex items-center cursor-pointer">
                                            <Checkbox 
                                                id={`addon-${service}-${addon.id}`}
                                                checked={addon.selected}
                                                onCheckedChange={(checked) => handleAddonToggle(service, addon.id, !!checked)}
                                                className="mr-3 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                                disabled={readOnly || isRejected || proposal?.status === 'signed'}
                                            />
                                            {addon.name}
                                          </Label>
                                          <p className="text-xs text-gray-600 ml-7">{addon.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-emerald-600">{formatCurrency(addon.price)}</p>
                                            <p className="text-xs text-gray-500"> (approx. {formatCurrency(addon.monthly_impact)}/mo)</p>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>

                    {/* Pricing Section */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="pt-8 border-t border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
                            <DollarSign className="w-6 h-6 mr-3 text-emerald-600" /> Project Investment
                        </h3>
                        {!readOnly && (
                            <div className="flex items-center gap-2">
                                <Label htmlFor="show-line-items" className="text-sm text-gray-600 cursor-pointer">
                                    {showLineItemPricing ? "Hide Line Items" : "Show Line Items"}
                                </Label>
                                <Button variant="outline" size="sm" onClick={() => setShowLineItemPricing(!showLineItemPricing)}>
                                    {showLineItemPricing ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                            </div>
                        )}
                      </div>
                      
                      <Card className="bg-white shadow-lg rounded-lg border border-gray-200">
                        <CardContent className="p-6 space-y-3">
                          <div className="flex justify-between py-2 border-b border-dashed">
                            <span className="text-gray-600">Base Proposal Subtotal</span>
                            <span className="font-medium">{formatCurrency(proposal?.pricing?.subtotal || 0)}</span>
                          </div>

                          {/* Product-specific pricing breakdown */}
                          {showLineItemPricing && proposal.services && proposal.services.length > 0 && (
                            <div className="space-y-1 pt-1">
                              {proposal.services.map((service: string) => {
                                const productData = proposal.products[service];
                                if (!productData) return null;
                                
                                // Get service-specific pricing
                                let servicePrice = 0;
                                
                                // Roofing price calculation
                                if (service === "roofing" && productData.totalPrice) {
                                  servicePrice = parseFloat(productData.totalPrice);
                                  
                                  // Add gutters and downspouts if present
                                  if (productData.gutterPrice) {
                                    servicePrice += parseFloat(productData.gutterPrice);
                                  }
                                  if (productData.downspoutPrice) {
                                    servicePrice += parseFloat(productData.downspoutPrice);
                                  }
                                }
                                
                                // HVAC price calculation
                                else if (service === "hvac") {
                                  if (productData.systemCost) {
                                    servicePrice += parseFloat(productData.systemCost);
                                  }
                                  if (productData.ductworkCost) {
                                    servicePrice += parseFloat(productData.ductworkCost);
                                  }
                                }
                                
                                // Windows & Doors price calculation
                                else if (service === "windows-doors") {
                                  if (productData.windowPrice) {
                                    servicePrice += parseFloat(productData.windowPrice);
                                  }
                                  
                                  // Add door prices if present
                                  if (productData.doorPrices) {
                                    Object.values(productData.doorPrices).forEach((price: any) => {
                                      servicePrice += parseFloat(price || 0);
                                    });
                                  }
                                }
                                
                                // Garage doors price calculation
                                else if (service === "garage-doors" && productData.totalPrice) {
                                  servicePrice = parseFloat(productData.totalPrice);
                                  
                                  // Add addon prices if present
                                  if (productData.addonPrices) {
                                    Object.values(productData.addonPrices).forEach((price: any) => {
                                      servicePrice += parseFloat(price || 0);
                                    });
                                  }
                                }
                                
                                // Skip if no price found
                                if (servicePrice <= 0) return null;
                                
                                const serviceName = service.charAt(0).toUpperCase() + service.slice(1).replace("-", " & ");
                                
                                return (
                                  <div key={service} className="flex justify-between py-1 pl-4 text-sm border-b border-dashed border-gray-100">
                                    <span className="text-gray-500">{serviceName}</span>
                                    <span className="font-medium text-gray-600">{formatCurrency(servicePrice)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Custom Adders Display */}
                          {showLineItemPricing && proposal?.pricing?.customAdders && proposal.pricing.customAdders.length > 0 && (
                            <div className="space-y-1 pt-1">
                              <p className="text-sm font-medium text-gray-600">Custom Additions:</p>
                              {proposal.pricing.customAdders.map((adder: any, index: number) => (
                            <div key={index} className="flex justify-between py-1 pl-4 text-sm border-b border-dashed border-gray-100">
                                  <span className="text-gray-500">{adder.description}</span>
                                  <span className="font-medium text-gray-600">{formatCurrency(adder.cost)}</span>
                            </div>
                          ))}
                            </div>
                          )}

                          {/* Selected Addons Display - keep existing code */}
                          {Object.values(selectedAddons).flat().some(addon => addon.selected) && (
                             <div className="pt-2">
                               <h4 className="text-sm font-medium text-gray-500 mb-1">Selected Upgrades:</h4>
                                {Object.values(selectedAddons).flat().map(addon => addon.selected && (
                                    <div key={addon.id} className="flex justify-between py-1 pl-4 text-sm border-b border-dashed border-gray-100">
                                        <span className="text-gray-500">{addon.name}</span>
                                        <span className="font-medium text-gray-600">{formatCurrency(addon.price)}</span>
                                    </div>
                                ))}
                             </div>
                          )}

                          <div className="flex justify-between py-2 border-b border-dashed">
                            <span className="text-gray-600">Discounts</span>
                            <span className="font-medium text-red-600">-{formatCurrency(proposal?.pricing?.discount || 0)}</span>
                          </div>
                          
                          {/* Total Before Tax (if applicable) - Add logic if taxes are needed */}

                          <Separator className="my-3"/>

                          <div className="flex justify-between items-center py-2 text-xl font-bold text-emerald-700 bg-emerald-50 px-4 rounded-md">
                            <span>Total Project Investment</span>
                            <span>{formatCurrency(currentTotal || 0)}</span>
                          </div>
                          {(proposal?.pricing?.monthlyPayment > 0 || currentMonthlyPayment > 0) && (
                            <div className="flex justify-between items-center text-lg font-semibold text-sky-600 pt-2">
                                <span>Estimated Monthly Payment</span>
                                <span>{formatCurrency(currentMonthlyPayment || 0)}/mo*</span> 
                            </div>
                          )}
                           {proposal?.pricing?.financingPlanName && (
                                <p className="text-xs text-gray-500 text-right">
                                    *Based on {proposal.pricing.financingPlanName}. Terms and conditions apply.
                                </p>
                            )}
                        </CardContent>
                      </Card>

                       {/* Combined Offers Section - Bundle Discounts and Time-Sensitive Offers */} 
                       {((bundleRules && bundleRules.length > 0) || (specialOffers && specialOffers.length > 0)) && (
                            <motion.div 
                                variants={fadeIn}
                                className="mt-6 space-y-4"
                            >
                                {/* Bundle Discounts - Always show if they exist */}
                                {bundleRules && bundleRules.length > 0 && (
                                    <div className="border border-green-300 rounded-lg overflow-hidden">
                                        <div className="bg-green-100 border-b border-green-300 p-4">
                                            <div className="flex items-center gap-2">
                                                <Award className="h-5 w-5 text-green-600" />
                                                <h4 className="text-green-900 text-xl font-bold">🎉 Bundle Savings Applied!</h4>
                                            </div>
                                            <p className="text-green-700 mt-1 text-sm">You're already saving money by combining multiple services.</p>
                                        </div>
                                        <div className="bg-green-50/60">
                                            {bundleRules.map((bundle: any, index: number) => (
                                                <div key={index} className="p-4 border-b border-green-200 last:border-b-0">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h5 className="text-green-900 font-semibold text-lg">{bundle.name}</h5>
                                                            <p className="text-green-800">{bundle.bonus_message}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                                                                Bundle Discount
                                                            </span>
                                                            <span className="px-2 py-1 bg-green-200 text-green-900 rounded-md text-xs font-medium font-bold">
                                                                ${bundle.discount_value} Saved
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Time-Sensitive Offers - Only show if rep selected them */}
                                {specialOffers && specialOffers.length > 0 && (
                                    <div className="border border-amber-300 rounded-lg overflow-hidden">
                                        <div className="bg-amber-100 border-b border-amber-300 p-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-5 w-5 text-amber-600" />
                                                <h4 className="text-amber-900 text-xl font-bold">⏰ Limited Time Offers</h4>
                                            </div>
                                            <p className="text-amber-700 mt-1 text-sm">Act fast! These exclusive offers won't last long.</p>
                                        </div>
                                        <div className="bg-amber-50/60">
                                            {specialOffers.map((offer: any, index: number) => {
                                                const timer = offerTimers.get(offer.id)
                                                
                                                return (
                                                    <div key={index} className="p-4 border-b border-amber-200 last:border-b-0">
                                                        <div className="mb-2">
                                                            <h5 className="text-amber-900 font-semibold text-lg">{offer.name}</h5>
                                                            <p className="text-amber-800">{offer.description}</p>
                                                        </div>
                                                        
                                                        <div className="flex justify-between items-center mt-3">
                                                            <div className="flex gap-2">
                                                                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-medium">
                                                                    {offer.category}
                                                                </span>
                                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                                                                    {offer.discount_amount ? `$${offer.discount_amount} off` : 
                                                                     offer.discount_percentage ? `${offer.discount_percentage}% off` :
                                                                     offer.free_product_service ? `FREE: ${offer.free_product_service}` : "Special Offer"}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="text-right">
                                                                <div className="text-xs text-amber-700">
                                                                    {timer ? "Expires in:" : "Limited Time"}
                                                                </div>
                                                                <div className="text-amber-900 font-mono font-bold">
                                                                    {timer ? `${timer.hours}h ${timer.minutes}m ${timer.seconds}s` : "Act Now"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                    </motion.div>

                    {!readOnly && !isRejected && proposal?.status !== 'signed' && (
                      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-300">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                          <Button 
                            onClick={() => setCurrentTab("sign")} 
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg rounded-lg shadow-md transition-transform transform hover:scale-105"
                            size="lg"
                          >
                            <Check className="w-5 h-5 mr-2" /> Continue to Sign
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
                          <Button 
                            onClick={() => setShowRejectionDialog(true)} 
                            variant="outline" 
                            className="w-full border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 py-3 text-lg rounded-lg shadow-md transition-transform transform hover:scale-105"
                            size="lg"
                          >
                            <X className="h-5 w-5 mr-2" />
                            Reject Proposal
                          </Button>
                        </motion.div>
                      </div>
                    )}
                    
                    {(isRejected || proposal?.status === 'signed') && (
                      <div className={`mt-8 p-6 rounded-lg shadow-md ${isRejected ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                        <h3 className={`text-2xl font-semibold flex items-center ${isRejected ? 'text-red-800' : 'text-green-800'}`}>
                          {isRejected ? <AlertTriangle className="w-7 h-7 mr-3" /> : <Check className="w-7 h-7 mr-3" />}
                          {isRejected ? "Proposal Rejected" : "Proposal Signed"}
                        </h3>
                        <p className={`mt-2 text-base ${isRejected ? 'text-red-700' : 'text-green-700'}`}>
                          {isRejected 
                            ? "You have rejected this proposal. Thank you for your feedback."
                            : `This proposal was signed on ${formatDate(proposal?.signedAt)}. Our team will be in touch soon!` // Assuming signedAt field
                          }
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

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
                        <CardContent className="p-8 space-y-6">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="signature" className="text-lg font-medium text-gray-700">Your Full Name</Label>
                                <Input
                                id="signature"
                                placeholder="E.g., Jane Doe"
                                value={signature}
                                onChange={(e) => setSignature(e.target.value)}
                                className="py-3 px-4 text-lg border-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md shadow-sm"
                                />
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                                className="border-t border-gray-200 pt-6 mt-6"
                            >
                                <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                    By typing my name above and clicking "Sign & Continue to Payment", I acknowledge that I have read, understood, and agree to all terms, conditions, and scope of work outlined in this proposal document. I authorize Evergreen Home Upgrades to proceed with the project as described herein.
                                    </p>
                                </div>
                            </motion.div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                        <Button
                          onClick={() => signature.trim() ? setCurrentTab("payment") : toast({ title: "Signature Required", description: "Please type your full name to sign.", variant: "destructive" })}
                          disabled={!signature.trim() || isSubmitting}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg rounded-lg shadow-md transition-transform transform hover:scale-105"
                          size="lg"
                        >
                          <Check className="w-5 h-5 mr-2"/> Sign & Continue to Payment
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
                        <Button 
                          onClick={() => setCurrentTab("review")} 
                          variant="outline" 
                          className="w-full border-gray-400 text-gray-700 hover:bg-gray-100 py-3 text-lg rounded-lg shadow-md transition-transform transform hover:scale-105"
                          size="lg"
                        >
                          Back to Review
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {!readOnly && currentTab === "payment" && !isRejected && proposal?.status !== 'signed' && (
                  <motion.div
                    key="payment"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={fadeIn}
                    className="space-y-8 max-w-2xl mx-auto"
                  >
                    {isComplete ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "elasticOut" }}
                        className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 sm:p-12 rounded-xl shadow-2xl text-center"
                      >
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
                            <Check className="h-20 w-20 sm:h-24 sm:w-24 text-yellow-300 bg-white bg-opacity-20 rounded-full p-3 mx-auto mb-6 shadow-lg" />
                        </motion.div>
                        <h3 className="text-3xl sm:text-4xl font-bold mb-4">Thank You, {proposal?.customer?.name}!</h3>
                        <p className="text-lg sm:text-xl text-green-100 mb-6">
                          Your proposal has been successfully signed and the deposit processed.
                        </p>
                        <p className="text-base text-green-200 mb-8">
                          A confirmation email has been sent to <strong>{proposal?.customer?.email}</strong>. Our team will contact you within 24-48 hours to schedule your project. We're excited to work with you!
                        </p>
                        <Button 
                            onClick={() => window.location.reload()} // Or redirect to a thank you page
                            className="bg-yellow-400 hover:bg-yellow-500 text-green-800 font-semibold py-3 px-8 text-lg rounded-lg shadow-md transition-transform transform hover:scale-105"
                        >
                            View Confirmation (Reload)
                        </Button>
                      </motion.div>
                    ) : (
                      <>
                        <div className="text-center">
                          <h3 className="text-3xl font-semibold text-gray-800 mb-2">Secure Deposit Payment</h3>
                          <p className="text-gray-600 text-lg">Finalize your project by submitting the deposit.</p>
                        </div>

                        <Card className="shadow-xl rounded-lg border-gray-200">
                            <CardHeader className="bg-gray-50 p-6 border-b rounded-t-lg">
                                <h4 className="text-xl font-semibold text-gray-700">Payment Details</h4>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-gray-600">Total Project Investment:</span>
                                    <span className="font-bold text-gray-800">{formatCurrency(currentTotal || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xl">
                                    <span className="text-emerald-600 font-medium">Deposit Amount (25%):</span>
                                    <span className="font-bold text-emerald-700">{formatCurrency((currentTotal || 0) * 0.25)}</span>
                                </div>
                                <Separator />
                                <p className="text-sm text-gray-500">
                                    The remaining balance of {formatCurrency((currentTotal || 0) * 0.75)} will be due upon project completion.
                                </p>

                                <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full pt-4">
                                    <TabsList className="grid w-full grid-cols-2 rounded-lg overflow-hidden shadow-sm">
                                    <TabsTrigger value="credit-card" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white py-3 text-base font-medium flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Credit Card
                                    </TabsTrigger>
                                    <TabsTrigger value="paypal" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white py-3 text-base font-medium flex items-center gap-2" disabled> {/* PayPal disabled for now */}
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 8.5H4.5C3.4 8.5 2.5 9.4 2.5 10.5V17.5C2.5 18.6 3.4 19.5 4.5 19.5H19.5C20.6 19.5 21.5 18.6 21.5 17.5V10.5C21.5 9.4 20.6 8.5 19.5 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M7 15.5H7.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.5 11.5H20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        PayPal (Coming Soon)
                                    </TabsTrigger>
                                    </TabsList>

                                    <AnimatePresence mode="wait">
                                    {paymentMethod === "credit-card" && (
                                        <motion.div
                                        key="credit-card"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-6 border p-6 rounded-md bg-gray-50 shadow-inner"
                                        >
                                        <p className="text-center text-gray-600 mb-4 text-sm">Demo Payment: No real card will be charged.</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                            <Label htmlFor="card-name" className="font-medium text-gray-700">Name on Card</Label>
                                            <Input id="card-name" placeholder="John M. Doe" className="py-3 px-4"/>
                                            </div>
                                            <div className="space-y-2">
                                            <Label htmlFor="card-number" className="font-medium text-gray-700">Card Number</Label>
                                            <Input id="card-number" placeholder="•••• •••• •••• ••••" className="py-3 px-4" />
                                            </div>
                                            <div className="space-y-2">
                                            <Label htmlFor="expiry" className="font-medium text-gray-700">Expiry Date</Label>
                                            <Input id="expiry" placeholder="MM / YY" className="py-3 px-4" />
                                            </div>
                                            <div className="space-y-2">
                                            <Label htmlFor="cvv" className="font-medium text-gray-700">CVV</Label>
                                            <Input id="cvv" placeholder="•••" className="py-3 px-4" />
                                            </div>
                                        </div>
                                        </motion.div>
                                    )}
                                    </AnimatePresence>
                                </Tabs>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                            <Button
                              onClick={handleSubmit}
                              disabled={isSubmitting}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg rounded-lg shadow-md transition-transform transform hover:scale-105"
                              size="lg"
                            >
                              {isSubmitting ? (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="flex items-center justify-center"
                                >
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                  Processing Deposit...
                                </motion.div>
                              ) : (
                                <><CreditCard className="w-5 h-5 mr-2"/> Submit Deposit & Finalize</>
                              )}
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
                            <Button 
                              onClick={() => setCurrentTab("sign")} 
                              variant="outline" 
                              className="w-full border-gray-400 text-gray-700 hover:bg-gray-100 py-3 text-lg rounded-lg shadow-md transition-transform transform hover:scale-105"
                              size="lg"
                              disabled={isSubmitting}
                            >
                              Back to Sign
                            </Button>
                          </motion.div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
             {/* Footer with company info */}
            <CardFooter className="bg-gray-800 text-gray-300 p-6 sm:p-8 text-center sm:text-left rounded-b-xl">
                <div className="container mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                    <div className="sm:col-span-1">
                        <Image src="/sereenh-04.png" alt="Evergreen Logo" width={80} height={80} className="rounded-md opacity-80 mx-auto sm:mx-0"/>
                    </div>
                    <div className="sm:col-span-2 text-sm">
                        <p className="font-semibold text-lg text-white mb-1">Evergreen Home Upgrades</p>
                        <p>(408) 333-9831</p>
                        <p>info@evergreenenergy.io</p>
                        <p>www.evergreenenergy.io</p>
                        <p className="mt-3 text-xs text-gray-400">&copy; {new Date().getFullYear()} Evergreen Home Upgrades. All Rights Reserved.</p>
                    </div>
                </div>
            </CardFooter>
          </Tabs>
        </Card>
      </motion.div>
      
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-xl">
          <DialogHeader className="p-6 bg-gray-50 rounded-t-lg border-b">
            <DialogTitle className="text-2xl font-semibold text-gray-800 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3 text-red-500"/> Reject Proposal
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-1">
              We're sorry to hear that. Please let us know why you're rejecting this proposal so we can improve.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="font-medium text-gray-700">Reason for Rejection <span className="text-red-500">*</span></Label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger id="rejection-reason" className="w-full py-3 px-4 text-base rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-md shadow-lg">
                  <SelectItem value="too-expensive" className="py-2 px-4 hover:bg-gray-100 cursor-pointer">Price is too high</SelectItem>
                  <SelectItem value="scope-incorrect" className="py-2 px-4 hover:bg-gray-100 cursor-pointer">Scope of work is incorrect/incomplete</SelectItem>
                  <SelectItem value="going-elsewhere" className="py-2 px-4 hover:bg-gray-100 cursor-pointer">Chose another contractor/provider</SelectItem>
                  <SelectItem value="postponing" className="py-2 px-4 hover:bg-gray-100 cursor-pointer">Postponing the project for now</SelectItem>
                  <SelectItem value="not-ready" className="py-2 px-4 hover:bg-gray-100 cursor-pointer">Not ready to make a decision</SelectItem>
                  <SelectItem value="other" className="py-2 px-4 hover:bg-gray-100 cursor-pointer">Other (please specify below)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback" className="font-medium text-gray-700">Additional Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Your comments are valuable to us..."
                value={rejectionFeedback}
                onChange={(e) => setRejectionFeedback(e.target.value)}
                className="min-h-[120px] p-3 rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-base"
              />
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3 p-6 bg-gray-50 rounded-b-lg border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRejectionDialog(false)}
              className="w-full sm:w-auto border-gray-400 text-gray-700 hover:bg-gray-100 py-2.5 px-6 rounded-md text-base transition-colors"
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRejectProposal}
              disabled={isRejecting || !rejectionReason}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white py-2.5 px-6 rounded-md text-base transition-colors disabled:opacity-70"
            >
              {isRejecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Submitting...
                </>
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
