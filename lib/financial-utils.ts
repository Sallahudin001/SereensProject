/**
 * Financial calculation utilities shared across components
 */

/**
 * Interface for the financing plan
 */
export interface FinancingPlan {
  id: number;
  plan_number: string;
  provider: string;
  plan_name: string;
  interest_rate: number;
  term_months: number;
  payment_factor: number;
  merchant_fee: number;
  notes: string;
  is_active: boolean;
}

/**
 * Calculate monthly payment using a financing plan's payment factor
 * This is the preferred method when a payment factor is available
 */
export function calculateMonthlyPaymentWithFactor(total: number, paymentFactor: number): number {
  return total * (paymentFactor / 100);
}

/**
 * Calculate monthly payment using standard amortization formula
 * Used as fallback when payment factor is not available
 */
export function calculateMonthlyPayment(total: number, term: number, rate: number): number {
  if (term === 0) return 0;
  
  const monthlyRate = rate / 100 / 12;
  
  if (monthlyRate === 0) {
    return total / term;
  }
  
  const numerator = total * monthlyRate * Math.pow(1 + monthlyRate, term);
  const denominator = Math.pow(1 + monthlyRate, term) - 1;
  
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Calculate addon's impact on monthly payment
 * Uses the payment factor if available, otherwise uses term-based calculation
 */
export function calculateAddonMonthlyImpact(
  addonPrice: number, 
  paymentFactor?: number, 
  termMonths?: number
): number {
  // If payment factor is available, use it (preferred method)
  if (paymentFactor && paymentFactor > 0) {
    return calculateMonthlyPaymentWithFactor(addonPrice, paymentFactor);
  }
  
  // Fallback to simple division by term
  const term = termMonths || 60; // Default to 60 months if not specified
  return addonPrice / term;
}

/**
 * Calculate total project cost with addons, offers, and discounts
 */
export function calculateTotalWithAdjustments(
  baseTotal: number,
  additionalCost: number = 0,
  savings: number = 0,
  baseDiscount: number = 0
): number {
  return baseTotal + additionalCost - savings - baseDiscount;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
} 