import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font
} from '@react-pdf/renderer'

// Using standard fonts instead of custom fonts to avoid loading issues

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 0, // Remove top padding for header
    paddingBottom: 75, // Increased for footer
    paddingHorizontal: 0, // Remove horizontal padding for edge-to-edge header
    backgroundColor: '#ffffff'
  },
  contentContainer: {
    paddingHorizontal: 35,
    paddingTop: 20,
  },
  header: {
    backgroundColor: '#10b981',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  logo: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  headerTitleContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Helvetica',
  },
  subtitle: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    marginTop: 2,
    fontFamily: 'Helvetica',
  },
  proposalInfo: {
    textAlign: 'right',
    fontSize: 10,
    color: 'white',
  },
  proposalNumber: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  proposalDate: {
    fontSize: 10,
    color: 'white',
    opacity: 0.9,
  },
  documentActions: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    marginTop: 10,
    borderRadius: 4,
  },
  documentActionsTitle: {
    color: 'white',
    fontSize: 10,
    marginBottom: 5,
  },
  section: {
    marginBottom: 25,
    breakInside: 'avoid',
    orphans: 3,
    widows: 3
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: 12,
    paddingBottom: 5,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    backgroundColor: '#f0fdfa',
    padding: 8,
    borderRadius: 4
  },
  projectOverview: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',

  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  overviewColumn: {
    flex: 1,
    paddingRight: 15,
  },
  overviewItem: {
    marginBottom: 8,
    fontSize: 10,
    padding: 5,
    backgroundColor: '#f0f9ff',
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#0ea5e9',
  },
  overviewLabel: {
    fontWeight: 'bold',
    color: '#0369a1',
    fontSize: 11,
    marginBottom: 2,
  },
  overviewValue: {
    color: '#334155',
    fontSize: 10,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 5,
  },
  serviceTag: {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  serviceDetails: {
    backgroundColor: '#f8fafc',
    padding: 15,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    breakInside: 'avoid',
    orphans: 2,
    widows: 2
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#bae6fd',
    textAlign: 'center',
  },
  serviceInfo: {
    fontSize: 10,
    marginBottom: 5,
    color: '#334155',
    lineHeight: 1.4,
  },
  serviceInfoLabel: {
    fontWeight: 'bold',
    color: '#0369a1',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 10
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row'
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    textAlign: 'center',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 10
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    textAlign: 'center',
    padding: 8,
    fontSize: 10
  },
  tableColWide: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
    textAlign: 'left',
    padding: 8,
    fontSize: 10
  },
  totalSection: {
    marginTop: 25,
    padding: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#10b981',
    breakInside: 'avoid'
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065f46',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'Helvetica',
  },
  subtotalText: {
    fontSize: 13,
    color: '#047857',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 5,
    borderTopWidth: 1,
    borderTopColor: '#a7f3d0',
    paddingTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e293b',
    padding: 15,
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
  footerContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  footerLogo: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  footerCompanyName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 3,
  },
  footerContactInfo: {
    fontSize: 9,
    color: 'white',
    opacity: 0.8,
    marginBottom: 2,
  },
  footerCopyright: {
    fontSize: 8,
    color: 'white',
    opacity: 0.6,
    marginTop: 3,
  },
  signatureSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b'
  },
  signatureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 10,
    textAlign: 'center'
  },
  signatureText: {
    fontSize: 11,
    color: '#92400e',
    textAlign: 'center',
    marginBottom: 15
  },
  signatureLink: {
    fontSize: 11,
    color: '#1d4ed8',
    textDecoration: 'underline',
    textAlign: 'center'
  },
  upgradesSection: {
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  upgradesSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#075985',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#bae6fd',
    textAlign: 'center',
  },
  upgradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  upgradeItemLeft: {
    flex: 1,
    paddingRight: 15,
  },
  upgradeItemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#075985',
    marginBottom: 4,
  },
  upgradeItemDescription: {
    fontSize: 10,
    color: '#0369a1',
    lineHeight: 1.4,
  },
  upgradeItemRight: {
    alignItems: 'flex-end',
    minWidth: 80,
    justifyContent: 'center',
  },
  upgradeItemPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
    backgroundColor: 'rgba(224, 242, 254, 0.7)',
    padding: 5,
    borderRadius: 4,
    marginBottom: 4,
  },
  upgradeItemMonthly: {
    fontSize: 9,
    color: '#0284c7',
    backgroundColor: 'rgba(224, 242, 254, 0.4)',
    padding: 3,
    borderRadius: 4,
  },
  bundleSavingsSection: {
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  bundleSavingsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#bbf7d0',
    textAlign: 'center',
  },
  bundleItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#16a34a',
  },
  bundleItemLeft: {
    flex: 1,
    paddingRight: 15,
  },
  bundleItemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: 4,
  },
  bundleItemDescription: {
    fontSize: 10,
    color: '#166534',
    lineHeight: 1.4,
  },
  bundleItemSavings: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#059669',
    minWidth: 80,
    textAlign: 'right',
    backgroundColor: 'rgba(220, 252, 231, 0.7)',
    padding: 5,
    borderRadius: 4,
  },
  // Terms and Conditions styles
  termsPage: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 40,
    paddingBottom: 75,
    paddingHorizontal: 35,
    backgroundColor: '#ffffff'
  },
  termsHeader: {
    backgroundColor: '#1e293b',
    padding: 20,
    marginBottom: 25,
    borderRadius: 8,
  },
  termsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  termsSubtitle: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  termsSection: {
    marginBottom: 20,
  },
  termsSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#10b981',
  },
  termsText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'justify',
  },
  termsList: {
    marginLeft: 15,
    marginBottom: 8,
  },
  termsListItem: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#374151',
    marginBottom: 5,
  },
  companyInfo: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  companyInfoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  companyInfoText: {
    fontSize: 10,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 3,
  }
})

interface ProposalPDFProps {
  proposal: any
  includeSigningLink?: boolean
  selectedAddons?: Record<string, any[]>
  bundleRules?: any[]
}

const ProposalPDF: React.FC<ProposalPDFProps> = ({ 
  proposal, 
  includeSigningLink = false,
  selectedAddons = {},
  bundleRules = []
}): React.ReactElement => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Calculate service pricing exactly like the proposal view
  const getServicePrice = (service: string, productData: any) => {
    let servicePrice = 0
    
    if (service === 'windows-doors') {
      const windowPrice = parseFloat(productData.windowPrice) || 0
      const doorPrices = productData.doorPrices ? 
        Object.values(productData.doorPrices).reduce((sum: number, price: any) => 
          sum + (parseFloat(String(price)) || 0), 0) : 0
      servicePrice = windowPrice + doorPrices
    } else if (service === 'hvac') {
      // Try totalPrice first, then fall back to component costs
      if (productData.totalPrice) {
        servicePrice = parseFloat(productData.totalPrice) || 0
      } else {
        servicePrice = (parseFloat(productData.systemCost || '0') + 
                      parseFloat(productData.ductworkCost || '0') + 
                      parseFloat(productData.laborCost || '0'))
      }
      // Add addon prices if present
      if (productData.addonPrices) {
        Object.values(productData.addonPrices).forEach((price: any) => {
          servicePrice += parseFloat(String(price)) || 0
        })
      }
    } else if (service === 'garage-doors') {
      servicePrice = parseFloat(productData.totalPrice) || 0
      // Add addon prices if present
      if (productData.addonPrices) {
        Object.values(productData.addonPrices).forEach((price: any) => {
          servicePrice += parseFloat(String(price)) || 0
        })
      }
    } else if (service === 'paint') {
      servicePrice = parseFloat(productData.totalPrice) || 0
    } else {
      // Default case
      servicePrice = parseFloat(productData.totalPrice) || 0
    }
    
    return servicePrice
  }

  // Get selected upgrades from the selectedAddons prop (deduplicated)
  const getSelectedUpgrades = () => {
    const selected: any[] = []
    const seenIds = new Set<string>()
    
    Object.values(selectedAddons).forEach(serviceAddons => {
      serviceAddons.forEach(addon => {
        if (addon.selected && !seenIds.has(addon.id)) {
          selected.push(addon)
          seenIds.add(addon.id)
        }
      })
    })
    return selected
  }

  // Deduplicate bundle rules by ID and name
  const getUniqueBundleRules = () => {
    const uniqueBundles: any[] = []
    const seenIds = new Set<string>()
    const seenNames = new Set<string>()
    
    bundleRules.forEach(bundle => {
      const bundleId = bundle.id?.toString() || bundle.name
      if (!seenIds.has(bundleId) && !seenNames.has(bundle.name)) {
        uniqueBundles.push(bundle)
        seenIds.add(bundleId)
        seenNames.add(bundle.name)
      }
    })
    return uniqueBundles
  }

  const selectedUpgrades = getSelectedUpgrades()
  const uniqueBundleRules = getUniqueBundleRules()
  
  // Import calculation functions directly to ensure consistency
  const calculateTotalWithAdjustments = (
    baseTotal: number,
    additionalCost: number = 0,
    savings: number = 0,
    baseDiscount: number = 0
  ): number => {
    return baseTotal + additionalCost - savings - baseDiscount;
  }

  // Calculate totals exactly like proposal view
  const upgradesTotal = selectedUpgrades.reduce((sum, upgrade) => sum + (upgrade.price || 0), 0)
  const bundleDiscountTotal = uniqueBundleRules.reduce((sum, bundle) => sum + (bundle.discount_value || 0), 0)
  const customAddersTotal = proposal?.customAdders?.reduce((sum: number, adder: any) => sum + (parseFloat(adder.cost) || 0), 0) || 0
  const appliedDiscountsTotal = proposal?.appliedDiscounts?.reduce((sum: number, discount: any) => sum + (parseFloat(discount.amount) || 0), 0) || 0
  const customerDiscountsTotal = proposal?.customerDiscounts?.reduce((sum: number, discount: any) => sum + (parseFloat(discount.amount) || 0), 0) || 0
  
  // Base total from proposal (already includes some discounts)
  const baseTotal = proposal?.pricing?.total || 0
  
  // Calculate final total using the exact same function as the proposal view
  const finalTotal = calculateTotalWithAdjustments(
    baseTotal,
    upgradesTotal + customAddersTotal,
    bundleDiscountTotal, // Bundle savings aren't included in base total
    0 // Customer discounts already included in baseTotal
  )
  
  // Monthly payment calculation using the same functions as the proposal view
  const calculateMonthlyPaymentWithFactor = (total: number, paymentFactor: number): number => {
    return total * (paymentFactor / 100);
  }
  
  const calculateMonthlyPayment = (total: number, term: number, rate: number): number => {
    if (term === 0) return 0;
    
    const monthlyRate = rate / 100 / 12;
    
    if (monthlyRate === 0) {
      return total / term;
    }
    
    const numerator = total * monthlyRate * Math.pow(1 + monthlyRate, term);
    const denominator = Math.pow(1 + monthlyRate, term) - 1;
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
  
  const calculateAddonMonthlyImpact = (
    addonPrice: number, 
    paymentFactor?: number, 
    termMonths?: number
  ): number => {
    if (paymentFactor && paymentFactor > 0) {
      return calculateMonthlyPaymentWithFactor(addonPrice, paymentFactor);
    }
    const term = termMonths || 60;
    return addonPrice / term;
  }
  
  // Get payment factor if available
  const paymentFactor = proposal?.pricing?.paymentFactor || 
                       (proposal?.pricing?.total && proposal?.pricing?.monthlyPayment ? 
                        (proposal.pricing.monthlyPayment / proposal.pricing.total * 100) : 
                        null);
  
  // Base monthly payment from proposal
  const baseMonthlyPayment = proposal?.pricing?.monthlyPayment || 0;
  
  // Calculate upgrade impacts using the same method as proposal view
  const upgradesMonthlyImpact = selectedUpgrades.reduce((sum, upgrade) => {
    // If upgrade already has monthly_impact defined, use that
    if (typeof upgrade.monthly_impact === 'number') {
      return sum + upgrade.monthly_impact;
    }
    // Otherwise calculate it using the same method as the proposal view
    return sum + calculateAddonMonthlyImpact(
      upgrade.price,
      paymentFactor,
      proposal?.pricing?.financingTerm
    );
  }, 0)
  
  // Calculate the final monthly payment
  let finalMonthlyPayment = baseMonthlyPayment;
  
  // Recalculate monthly payment if payment factor is available
  if (paymentFactor) {
    finalMonthlyPayment = calculateMonthlyPaymentWithFactor(finalTotal, paymentFactor);
  } else if (upgradesMonthlyImpact > 0) {
    // Just add the upgrade impact if we don't have a payment factor
    finalMonthlyPayment = baseMonthlyPayment + upgradesMonthlyImpact;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const signingUrl = `${baseUrl}/proposals/view/${proposal?.id}`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Modern Header with Logo */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logo}>
              {/* Placeholder for logo - use a colored square instead of image */}
              <View style={{ width: 40, height: 40, backgroundColor: '#15803d', borderRadius: 4 }} />
            </View>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.title}>Home Improvement Proposal</Text>
              <Text style={styles.subtitle}>
                Prepared for: {proposal?.customer?.name || 'Valued Customer'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.proposalNumber}>Proposal #{proposal?.proposalNumber}</Text>
            <Text style={styles.proposalDate}>Date: {formatDate(proposal?.createdAt)}</Text>
            {/* Removed Status display from header as requested
            {proposal?.status && (
              <Text style={styles.proposalDate}>
                Status: {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </Text>
            )}
            */}
            {includeSigningLink && (
              <View style={styles.documentActions}>
                <Text style={styles.documentActionsTitle}>Document Actions</Text>
                <Text style={{ color: 'white', fontSize: 9 }}>
                  Download, preview, or sign your proposal
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Content Container */}
        <View style={styles.contentContainer}>

        {/* Project Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Overview</Text>
          <View style={styles.projectOverview}>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewColumn}>
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Homeowner: </Text>
                  <Text style={styles.overviewValue}>{proposal?.customer?.name || 'N/A'}</Text>
                </View>
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Address: </Text>
                  <Text style={styles.overviewValue}>{proposal?.customer?.address || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.overviewColumn}>
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Email: </Text>
                  <Text style={styles.overviewValue}>{proposal?.customer?.email || 'N/A'}</Text>
                </View>
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Phone: </Text>
                  <Text style={styles.overviewValue}>{proposal?.customer?.phone || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Services Included */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Included</Text>
          <View style={styles.servicesContainer}>
            {proposal?.serviceNames?.map((service: string, index: number) => (
              <Text key={index} style={styles.serviceTag}>
                {service}
              </Text>
            ))}
          </View>
        </View>

        {/* Bundle Savings Applied - Show if bundle rules exist */}
        {uniqueBundleRules.length > 0 && (
          <View style={styles.section}>
            <View style={styles.bundleSavingsSection}>
              <Text style={styles.bundleSavingsTitle}>🎉 Bundle Savings Applied!</Text>
              <Text style={{ fontSize: 10, color: '#166534', marginBottom: 10 }}>
                You're already saving money by combining multiple services.
              </Text>
              {uniqueBundleRules.map((bundle: any, index: number) => (
                <View key={index} style={styles.bundleItem}>
                  <View style={styles.bundleItemLeft}>
                    <Text style={styles.bundleItemName}>{bundle.name}</Text>
                    <Text style={styles.bundleItemDescription}>
                      {bundle.bonus_message || bundle.description || 'Bundle discount applied'}
                    </Text>
                  </View>
                  <Text style={styles.bundleItemSavings}>
                    {bundle.discount_type === 'percentage' ? `-${bundle.discount_value}%` : 
                     bundle.discount_type === 'fixed_amount' ? `-${formatCurrency(bundle.discount_value)}` : 
                     bundle.free_service ? `FREE: ${bundle.free_service}` : 
                     `-${formatCurrency(bundle.discount_value)}`}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Selected Upgrades - Show if any upgrades are selected */}
        {selectedUpgrades.length > 0 && (
          <View style={styles.section}>
            <View style={styles.upgradesSection}>
              <Text style={styles.upgradesSectionTitle}>✨ Selected Project Upgrades</Text>
              <Text style={{ fontSize: 10, color: '#075985', marginBottom: 10 }}>
                Additional enhancements to maximize your home's comfort and value.
              </Text>
              {selectedUpgrades.map((upgrade: any, index: number) => (
                <View key={index} style={styles.upgradeItem}>
                  <View style={styles.upgradeItemLeft}>
                    <Text style={styles.upgradeItemName}>{upgrade.name}</Text>
                    <Text style={styles.upgradeItemDescription}>
                      {upgrade.description}
                    </Text>
                  </View>
                  <View style={styles.upgradeItemRight}>
                    <Text style={styles.upgradeItemPrice}>{formatCurrency(upgrade.price)}</Text>
                    <Text style={styles.upgradeItemMonthly}>
                      +{formatCurrency(upgrade.monthly_impact)}/mo
                    </Text>
                  </View>
                </View>
              ))}
              <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#bae6fd' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#075985' }}>
                    Total Upgrades Value:
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#059669' }}>
                    {formatCurrency(upgradesTotal)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Detailed Scope of Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Scope of Work</Text>
          {proposal?.services?.map((service: string, index: number) => {
            const productData = proposal.products[service]
            if (!productData) return null

            return (
              <View key={index} style={styles.serviceDetails}>
                <Text style={styles.serviceTitle}>
                  {service.charAt(0).toUpperCase() + service.slice(1).replace('-', ' & ')}
                </Text>
                
                {/* Windows & Doors Details */}
                {service === 'windows-doors' && (
                  <View>
                    <Text style={styles.serviceInfo}>
                      <Text style={styles.serviceInfoLabel}>Window Type: </Text>
                      {productData.windowType?.replace(/-/g, ' ')?.replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'N/A'}
                    </Text>
                    <Text style={styles.serviceInfo}>
                      <Text style={styles.serviceInfoLabel}>Window Material: </Text>
                      {productData.windowMaterial?.charAt(0).toUpperCase() + productData.windowMaterial?.slice(1) || 'Vinyl'}
                    </Text>
                    <Text style={styles.serviceInfo}>
                      <Text style={styles.serviceInfoLabel}>Window Color: </Text>
                      {productData.windowColor?.charAt(0).toUpperCase() + productData.windowColor?.slice(1) || 'White'}
                    </Text>
                    <Text style={styles.serviceInfo}>
                      <Text style={styles.serviceInfoLabel}>Energy Rating: </Text>
                      {productData.energyRating || 'Energy Star'}
                    </Text>
                    <Text style={styles.serviceInfo}>
                      <Text style={styles.serviceInfoLabel}>Number of Windows: </Text>
                      {productData.windowCount || '0'}
                    </Text>
                    
                    {/* Window Price Section */}
                    <View style={{ marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                      {productData.windowPrice && (
                        <Text style={styles.serviceInfo}>
                          <Text style={styles.serviceInfoLabel}>Window Price: </Text>
                          {formatCurrency(parseFloat(productData.windowPrice) || 0)}
                        </Text>
                      )}
                      {productData.installationCost && (
                        <Text style={styles.serviceInfo}>
                          <Text style={styles.serviceInfoLabel}>Installation Cost: </Text>
                          {formatCurrency(parseFloat(productData.installationCost) || 0)}
                        </Text>
                      )}
                    </View>
                    
                    {/* Doors Section if present */}
                    {productData.hasDoors && (
                      <View style={{ marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1f2937', marginBottom: 3 }}>
                          Door Details:
                        </Text>
                        {productData.doorType && (
                          <Text style={styles.serviceInfo}>
                            <Text style={styles.serviceInfoLabel}>Door Type: </Text>
                            {productData.doorType.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                          </Text>
                        )}
                        {productData.doorCount && (
                          <Text style={styles.serviceInfo}>
                            <Text style={styles.serviceInfoLabel}>Number of Doors: </Text>
                            {productData.doorCount}
                          </Text>
                        )}
                        {productData.doorPrice && (
                          <Text style={styles.serviceInfo}>
                            <Text style={styles.serviceInfoLabel}>Door Price: </Text>
                            {formatCurrency(parseFloat(productData.doorPrice) || 0)}
                          </Text>
                        )}
                      </View>
                    )}
                    
                    {/* Display prices for individual doors if available */}
                    {productData.doorPrices && Object.keys(productData.doorPrices).length > 0 && (
                      <View style={{ marginTop: 3 }}>
                        <Text style={styles.serviceInfoLabel}>Door Prices:</Text>
                        {Object.entries(productData.doorPrices).map(([door, price]: [string, any], i: number) => (
                          <Text key={i} style={{ fontSize: 9, color: '#6b7280', marginLeft: 10 }}>
                            • {door.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}: {formatCurrency(parseFloat(String(price)) || 0)}
                          </Text>
                        ))}
                      </View>
                    )}
                    
                    {/* Total section */}
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#047857', marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                      Total Windows & Doors Price: {formatCurrency(
                        parseFloat(productData.totalPrice) || 
                        parseFloat(productData.windowPrice || '0') + 
                        (productData.doorPrices ? 
                          Object.values(productData.doorPrices).reduce((sum: number, price: any) => 
                            sum + (parseFloat(String(price)) || 0), 0) : 0)
                      )}
                    </Text>
                  </View>
                )}

                {/* HVAC Details */}
                {service === 'hvac' && (
                  <View>
                    <Text style={styles.serviceInfo}>
                      <Text style={styles.serviceInfoLabel}>System Type: </Text>
                      {productData.systemType?.replace(/-/g, ' ')?.replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'N/A'}
                    </Text>
                    <Text style={styles.serviceInfo}>
                      <Text style={styles.serviceInfoLabel}>SEER Rating: </Text>
                      {productData.seerRating || 'N/A'}
                    </Text>
                    {productData.tonnage && (
                      <Text style={styles.serviceInfo}>
                        <Text style={styles.serviceInfoLabel}>System Size: </Text>
                        {productData.tonnage} Tons
                      </Text>
                    )}
                    {productData.brand && (
                      <Text style={styles.serviceInfo}>
                        <Text style={styles.serviceInfoLabel}>Brand: </Text>
                        {productData.brand}
                      </Text>
                    )}
                    {productData.model && (
                      <Text style={styles.serviceInfo}>
                        <Text style={styles.serviceInfoLabel}>Model: </Text>
                        {productData.model}
                      </Text>
                    )}
                    
                    <View style={{ marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                      {productData.systemCost && (
                        <Text style={styles.serviceInfo}>
                          <Text style={styles.serviceInfoLabel}>System Cost: </Text>
                          {formatCurrency(parseFloat(productData.systemCost) || 0)}
                        </Text>
                      )}
                      {productData.ductworkCost && (
                        <Text style={styles.serviceInfo}>
                          <Text style={styles.serviceInfoLabel}>Ductwork Cost: </Text>
                          {formatCurrency(parseFloat(productData.ductworkCost) || 0)}
                        </Text>
                      )}
                      {productData.laborCost && (
                        <Text style={styles.serviceInfo}>
                          <Text style={styles.serviceInfoLabel}>Labor Cost: </Text>
                          {formatCurrency(parseFloat(productData.laborCost) || 0)}
                        </Text>
                      )}
                    </View>
                    
                    {/* Show system addons if they exist */}
                    {productData.addons?.length > 0 && (
                      <View style={{ marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                        <Text style={styles.serviceInfoLabel}>System Add-ons:</Text>
                        {productData.addons.map((addon: string, i: number) => (
                          <Text key={i} style={{ fontSize: 9, color: '#6b7280', marginLeft: 10 }}>
                            • {addon.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                            {productData.addonPrices && productData.addonPrices[addon] && 
                              ` - ${formatCurrency(parseFloat(productData.addonPrices[addon]) || 0)}`}
                          </Text>
                        ))}
                      </View>
                    )}
                    
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#047857', marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                      Total HVAC System Price: {formatCurrency(
                        (parseFloat(productData.systemCost || '0') + 
                        parseFloat(productData.ductworkCost || '0') + 
                        parseFloat(productData.laborCost || '0') + 
                        (Object.values(productData.addonPrices || {}) as string[]).reduce(
                          (sum: number, price: any) => sum + (parseFloat(String(price)) || 0), 0
                        )) || parseFloat(productData.totalPrice) || 0
                      )}
                    </Text>
                  </View>
                )}

                {/* Roofing Details */}
                {service === 'roofing' && (
                  <View>
                    <Text style={styles.serviceInfo}>
                      <Text style={styles.serviceInfoLabel}>Roofing Material: </Text>
                      {productData.material?.replace(/-/g, ' ')?.replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Shingles'}
                    </Text>
                    {productData.squareCount && (
                      <Text style={styles.serviceInfo}>
                        <Text style={styles.serviceInfoLabel}>Square Count: </Text>
                        {productData.squareCount}
                      </Text>
                    )}
                    
                    {/* Gutter Information Section */}
                    {productData.addGutters && (
                      <View style={{ marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                        <Text style={styles.serviceInfo}>
                          <Text style={styles.serviceInfoLabel}>Includes Gutters: </Text>
                          Yes
                        </Text>
                        {productData.gutterLength && (
                          <Text style={styles.serviceInfo}>
                            <Text style={styles.serviceInfoLabel}>Gutter Length: </Text>
                            {productData.gutterLength} ft
                          </Text>
                        )}
                        {productData.gutterPrice && (
                          <Text style={styles.serviceInfo}>
                            <Text style={styles.serviceInfoLabel}>Gutter Price: </Text>
                            {formatCurrency(parseFloat(productData.gutterPrice) || 0)}
                          </Text>
                        )}
                        {productData.downspoutCount && (
                          <Text style={styles.serviceInfo}>
                            <Text style={styles.serviceInfoLabel}>Number of Downspouts: </Text>
                            {productData.downspoutCount}
                          </Text>
                        )}
                        {productData.downspoutPrice && (
                          <Text style={styles.serviceInfo}>
                            <Text style={styles.serviceInfoLabel}>Downspout Price: </Text>
                            {formatCurrency(parseFloat(productData.downspoutPrice) || 0)}
                          </Text>
                        )}
                      </View>
                    )}
                    
                    {productData.addPlywood && (
                      <Text style={styles.serviceInfo}>
                        <Text style={styles.serviceInfoLabel}>Includes Plywood: </Text>
                        Yes {productData.plywoodPercentage && `(${productData.plywoodPercentage}% replacement)`}
                      </Text>
                    )}
                    
                    <View style={{ marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                      {productData.pricePerSquare && (
                        <Text style={styles.serviceInfo}>
                          <Text style={styles.serviceInfoLabel}>Price Per Square: </Text>
                          {formatCurrency(parseFloat(productData.pricePerSquare) || 0)}
                        </Text>
                      )}
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#047857', marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                        Total Roofing Price: {formatCurrency(parseFloat(productData.totalPrice) || 0)}
                      </Text>
                    </View>
                    
                    {productData.options?.length > 0 && (
                      <View style={{ marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                        <Text style={styles.serviceInfoLabel}>Additional Options:</Text>
                        {productData.options.map((option: string, i: number) => (
                          <Text key={i} style={{ fontSize: 9, color: '#6b7280', marginLeft: 10 }}>
                            • {option.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                            {productData.optionPrices && productData.optionPrices[option] && 
                              ` - ${formatCurrency(parseFloat(productData.optionPrices[option]) || 0)}`}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Garage Doors Details */}
                {service === 'garage-doors' && (
                  <View>
                    <Text style={styles.serviceInfo}>
                      <Text style={styles.serviceInfoLabel}>Door Model: </Text>
                      {productData.model?.toUpperCase() || 'T50L'}
                    </Text>
                    <Text style={styles.serviceInfo}>
                      <Text style={styles.serviceInfoLabel}>Dimensions: </Text>
                      {productData.width || '16'}' W × {productData.height || '7'}' H
                    </Text>
                    <Text style={styles.serviceInfo}>
                      <Text style={styles.serviceInfoLabel}>Quantity: </Text>
                      {productData.quantity || '1'} door(s)
                    </Text>
                    {productData.addons?.length > 0 && (
                      <View style={{ marginTop: 5 }}>
                        <Text style={styles.serviceInfoLabel}>Add-ons:</Text>
                        {productData.addons.map((addon: string, i: number) => (
                          <Text key={i} style={{ fontSize: 9, color: '#6b7280', marginLeft: 10 }}>
                            • {addon.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                            {productData.addonPrices && productData.addonPrices[addon] && 
                              ` - ${formatCurrency(parseFloat(productData.addonPrices[addon]) || 0)}`}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Paint Details */}
                {service === 'paint' && (
                  <View>
                    <Text style={styles.serviceInfo}>
                      <Text style={styles.serviceInfoLabel}>Service Type: </Text>
                      {productData.serviceType ? 
                        productData.serviceType.charAt(0).toUpperCase() + productData.serviceType.slice(1) : 
                        'Exterior'}
                    </Text>
                    <Text style={styles.serviceInfo}>
                      <Text style={styles.serviceInfoLabel}>Square Footage: </Text>
                      {productData.squareFootage || '0'} sq ft
                    </Text>
                    <Text style={styles.serviceInfo}>
                      <Text style={styles.serviceInfoLabel}>Color Tone: </Text>
                      {productData.colorTone || '1'}-Tone
                    </Text>
                    <Text style={styles.serviceInfo}>
                      <Text style={styles.serviceInfoLabel}>Paint Included: </Text>
                      {productData.includePaint ? 'Yes' : 'No'}
                    </Text>
                    
                    <View style={{ marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                      {productData.includePrimer && (
                        <Text style={styles.serviceInfo}>
                          <Text style={styles.serviceInfoLabel}>Includes: </Text>
                          Primer
                        </Text>
                      )}
                      {productData.includePrep && (
                        <Text style={styles.serviceInfo}>
                          <Text style={styles.serviceInfoLabel}>Includes: </Text>
                          Surface Preparation
                        </Text>
                      )}
                      
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#047857', marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                        Total Paint Price: {formatCurrency(parseFloat(productData.totalPrice) || 0)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Scope Notes - Improved Display */}
                {productData.scopeNotes && (
                  <View style={{ marginTop: 12, padding: 10, backgroundColor: '#f0f9ff', borderRadius: 6, borderWidth: 1, borderColor: '#bae6fd' }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#0369a1', marginBottom: 5 }}>
                      Scope of Work:
                    </Text>
                    {productData.scopeNotes.split('\n')
                      .filter((line: string) => line.trim().length > 0)
                      .map((line: string, i: number) => (
                        <Text key={i} style={{ fontSize: 9, color: '#334155', marginBottom: 3, lineHeight: 1.4 }}>
                          {line.startsWith('-') ? 
                            `• ${line.substring(1).trim()}` : 
                            line.endsWith(':') ? 
                              <Text style={{ fontWeight: 'bold' }}>{line}</Text> : 
                              line
                          }
                        </Text>
                      ))}
                  </View>
                )}
              </View>
            )
          })}
        </View>

        {/* Pricing Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Investment</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRow}>
              <Text style={styles.tableColWide}>Service</Text>
              <Text style={styles.tableColHeader}>Quantity</Text>
              <Text style={styles.tableColHeader}>Amount</Text>
            </View>
            
            {/* Service Items */}
            {proposal?.services?.map((service: string, index: number) => {
              const productData = proposal.products[service]
              if (!productData) return null
              
              const servicePrice = getServicePrice(service, productData)
              
              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableColWide}>
                    {service.charAt(0).toUpperCase() + service.slice(1).replace('-', ' & ')}
                  </Text>
                  <Text style={styles.tableCol}>1</Text>
                  <Text style={styles.tableCol}>
                    {formatCurrency(servicePrice)}
                  </Text>
                </View>
              )
            })}

            {/* Custom Adders */}
            {proposal?.customAdders?.map((adder: any, index: number) => (
              <View key={`custom-${index}`} style={styles.tableRow}>
                <Text style={styles.tableColWide}>
                  {adder.description}
                </Text>
                <Text style={styles.tableCol}>1</Text>
                <Text style={[styles.tableCol, { color: '#0369a1' }]}>
                  {formatCurrency(adder.cost)}
                </Text>
              </View>
            ))}

            {/* Selected Upgrades in Pricing Table */}
            {selectedUpgrades.map((upgrade: any, index: number) => (
              <View key={`upgrade-${index}`} style={styles.tableRow}>
                <Text style={styles.tableColWide}>
                  ✨ {upgrade.name}
                </Text>
                <Text style={styles.tableCol}>1</Text>
                <Text style={[styles.tableCol, { color: '#059669' }]}>
                  {formatCurrency(upgrade.price)}
                </Text>
              </View>
            ))}
            
            {/* Subtotal */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableColWide, { fontWeight: 'bold' }]}>Subtotal</Text>
              <Text style={styles.tableCol}></Text>
              <Text style={[styles.tableCol, { fontWeight: 'bold' }]}>
                {formatCurrency(baseTotal + upgradesTotal + customAddersTotal)}
              </Text>
            </View>
            
            {/* Applied Discounts from proposal */}
            {proposal?.appliedDiscounts?.map((discount: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableColWide}>{discount.name}</Text>
                <Text style={styles.tableCol}>1</Text>
                <Text style={[styles.tableCol, { color: '#dc2626' }]}>
                  -{formatCurrency(discount.amount)}
                </Text>
              </View>
            ))}

            {/* Bundle Savings in Pricing Table - DEDUPLICATED */}
            {uniqueBundleRules.map((bundle: any, index: number) => (
              <View key={`bundle-${index}`} style={styles.tableRow}>
                <Text style={styles.tableColWide}>
                  🎉 {bundle.name}
                </Text>
                <Text style={styles.tableCol}>1</Text>
                <Text style={[styles.tableCol, { color: '#16a34a' }]}>
                  -{formatCurrency(bundle.discount_value || 0)}
                </Text>
              </View>
            ))}

            {/* Customer Discounts */}
            {proposal?.customerDiscounts?.map((discount: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableColWide}>
                  {discount.type.charAt(0).toUpperCase() + discount.type.slice(1).replace(/_/g, ' ')} Discount
                </Text>
                <Text style={styles.tableCol}>1</Text>
                <Text style={[styles.tableCol, { color: '#dc2626' }]}>
                  -{formatCurrency(discount.amount)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Total Investment */}
        <View style={styles.totalSection}>
          <Text style={styles.totalText}>
            Total Project Investment: {formatCurrency(finalTotal)}
          </Text>
          {baseMonthlyPayment > 0 && (
            <Text style={styles.subtotalText}>
              {paymentFactor ? (
                // If payment factor available, show comprehensive monthly payment
                <Text>Monthly Payment: {formatCurrency(finalMonthlyPayment)}/mo</Text>
              ) : (
                // Otherwise show base + upgrades separately
                <Text>
                  Monthly Payment: {formatCurrency(baseMonthlyPayment)}/mo
                  {upgradesMonthlyImpact > 0 && (
                    <Text> + {formatCurrency(upgradesMonthlyImpact)}/mo upgrades</Text>
                  )}
                </Text>
              )}
            </Text>
          )}
          {proposal?.pricing?.financingTerm && (
            <Text style={{ fontSize: 10, color: '#166534', textAlign: 'center', marginTop: 3 }}>
              Financing: {proposal.pricing.financingTerm} months at {proposal.pricing.interestRate}% APR
              {proposal.pricing.financingPlanName && ` (${proposal.pricing.financingPlanName})`}
            </Text>
          )}
        </View>

        {/* Signature Section for Customer PDFs */}
        {includeSigningLink && (
          <View style={styles.signatureSection}>
            <Text style={styles.signatureTitle}>Ready to Move Forward?</Text>
            <Text style={styles.signatureText}>
              Click the link below to review and electronically sign this proposal:
            </Text>
            <Text style={styles.signatureLink}>{signingUrl}</Text>
            <Text style={{ fontSize: 10, color: '#92400e', textAlign: 'center', marginTop: 10 }}>
              This proposal is valid for 30 days from the date above.
            </Text>
          </View>
        )}

        </View> {/* Close content container */}
        
        {/* Modern Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContainer}>
            {/* Placeholder for logo - use a colored circle instead of image */}
            <View style={{ width: 25, height: 25, backgroundColor: '#34d399', borderRadius: 12.5 }} />
            <Text style={styles.footerCompanyName}>Evergreen Energy Upgrades</Text>
            <Text style={styles.footerContactInfo}>C: (408) 828-7377 | O: (408)333-9831</Text>
            <Text style={styles.footerContactInfo}>sereen@evergreenergry.io | info@evergreenergy.io</Text>
            <Text style={styles.footerContactInfo}>www.evergreenenergy.io</Text>
            <Text style={styles.footerCopyright}>© 2023 Evergreen Energy Upgrades. All Rights Reserved.</Text>
          </View>
        </View>
      </Page>

      {/* Terms and Conditions Page */}
      <Page size="A4" style={styles.termsPage}>
        <View style={styles.termsHeader}>
          <Text style={styles.termsTitle}>Terms and Conditions</Text>
          <Text style={styles.termsSubtitle}>Home Improvement Services Agreement</Text>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.termsSectionTitle}>1. Agreement Acceptance</Text>
          <Text style={styles.termsText}>
            By signing this proposal, you agree to these terms and conditions. This agreement becomes binding upon your signature and our acceptance. 
            This proposal is valid for 30 days from the date issued.
          </Text>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.termsSectionTitle}>2. Scope of Work</Text>
          <Text style={styles.termsText}>
            Evergreen Energy Upgrades will provide the services described in this proposal. Any changes to the scope of work must be agreed upon 
            in writing and may result in additional charges. We will obtain all necessary permits and perform work in accordance with local codes.
          </Text>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.termsSectionTitle}>3. Payment Terms</Text>
          <Text style={styles.termsText}>Payment schedule:</Text>
          <View style={styles.termsList}>
            <Text style={styles.termsListItem}>• Down payment: 10% upon contract signing</Text>
            <Text style={styles.termsListItem}>• Progress payment: 40% upon material delivery</Text>
            <Text style={styles.termsListItem}>• Progress payment: 40% at substantial completion</Text>
            <Text style={styles.termsListItem}>• Final payment: 10% upon final completion and inspection</Text>
          </View>
          <Text style={styles.termsText}>
            Payment may be made by cash, check, or approved financing. Late payments may incur a 1.5% monthly service charge.
          </Text>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.termsSectionTitle}>4. Materials and Labor</Text>
          <Text style={styles.termsText}>
            All materials will be new and installed by qualified technicians. Materials will carry manufacturer warranties. 
            We provide a 2-year warranty on workmanship for HVAC systems, 1-year warranty on windows and doors installation, 
            and 1-year warranty on roofing and painting work.
          </Text>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.termsSectionTitle}>5. Timeline and Completion</Text>
          <Text style={styles.termsText}>
            Work will commence within 2-4 weeks of contract signing, subject to permit approval and material availability. 
            Weather conditions, permit delays, or change orders may affect completion timeline. We will notify you of any 
            significant delays.
          </Text>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.termsSectionTitle}>6. Change Orders</Text>
          <Text style={styles.termsText}>
            Any modifications to the original scope of work must be documented in writing and signed by both parties before 
            implementation. Additional work will be charged at current labor and material rates.
          </Text>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.termsSectionTitle}>7. Liability and Insurance</Text>
          <Text style={styles.termsText}>
            Evergreen Energy Upgrades maintains general liability insurance and workers' compensation insurance. We are not 
            responsible for damage to underground utilities not properly marked or existing structural defects not disclosed. 
            Our liability is limited to the contract amount.
          </Text>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.termsSectionTitle}>8. Cancellation Policy</Text>
          <Text style={styles.termsText}>
            You have the right to cancel this contract within 3 business days of signing by providing written notice. 
            After this period, cancellation may result in charges for work performed and materials ordered.
          </Text>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.termsSectionTitle}>9. Permits and Inspections</Text>
          <Text style={styles.termsText}>
            We will obtain all required permits and schedule necessary inspections. Permit costs are included in the contract 
            price unless otherwise specified. Homeowner is responsible for providing access to work areas.
          </Text>
        </View>

        <View style={styles.termsSection}>
          <Text style={styles.termsSectionTitle}>10. Environmental Considerations</Text>
          <Text style={styles.termsText}>
            For energy efficiency projects, estimated savings are based on current usage patterns and energy costs. 
            Actual savings may vary based on occupancy, usage patterns, weather conditions, and utility rate changes.
          </Text>
        </View>

        <View style={styles.companyInfo}>
          <Text style={styles.companyInfoTitle}>Evergreen Energy Upgrades</Text>
          <Text style={styles.companyInfoText}>Licensed & Insured Home Improvement Contractor</Text>
          <Text style={styles.companyInfoText}>License #: CA-12345678</Text>
          <Text style={styles.companyInfoText}>Cell: (408) 828-7377 | Office: (408) 333-9831</Text>
          <Text style={styles.companyInfoText}>Email: info@evergreenergy.io</Text>
          <Text style={styles.companyInfoText}>Website: www.evergreenenergy.io</Text>
        </View>

        {/* Footer for Terms Page */}
        <View style={styles.footer}>
          <View style={styles.footerContainer}>
            <View style={{ width: 25, height: 25, backgroundColor: '#34d399', borderRadius: 12.5 }} />
            <Text style={styles.footerCompanyName}>Evergreen Energy Upgrades</Text>
            <Text style={styles.footerContactInfo}>Professional Home Improvement Services</Text>
            <Text style={styles.footerCopyright}>© 2023 Evergreen Energy Upgrades. All Rights Reserved.</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default ProposalPDF 