import type React from "react"
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"

// More condensed, formal contract-style PDF with less whitespace
const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 9, // Smaller base font size
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 30, // Reduced horizontal padding
    backgroundColor: "#ffffff",
    lineHeight: 1.3, // Tighter line height
  },

  // Header Section - More formal and condensed
  contractHeader: {
    marginBottom: 15, // Reduced margin
    paddingBottom: 10, // Reduced padding
    borderBottomWidth: 1,
    borderBottomColor: "#000000", // Black for formality
  },
  
  logoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  
  logo: {
    width: 250,
    height: 100,
    objectFit: "contain",
  },

  contractTitle: {
    fontSize: 14, // Smaller title
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  contractSubtitle: {
    fontSize: 10,
    fontFamily: "Times-Italic",
    textAlign: "center",
    marginTop: 3,
    marginBottom: 8,
  },

  proposalMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    fontSize: 8,
    color: "#000000",
    borderTopWidth: 0.5,
    borderTopColor: "#cccccc",
    paddingTop: 5,
  },

  // Reference numbers section
  referenceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#cccccc",
    paddingBottom: 5,
  },

  referenceItem: {
    flex: 1,
  },

  referenceLabel: {
    fontFamily: "Times-Bold",
  },

  // Party Information Section - More condensed
  partiesSection: {
    marginBottom: 15, // Reduced margin
    padding: 8, // Reduced padding
    backgroundColor: "#f5f5f5", // Lighter gray
    borderWidth: 0.5, // Thinner border
    borderColor: "#000000",
  },

  partiesSectionTitle: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    marginBottom: 6,
    textAlign: "center",
    textTransform: "uppercase",
  },

  partyInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0, // Removed margin
  },

  partyColumn: {
    flex: 1,
    paddingHorizontal: 5, // Reduced padding
  },

  partyTitle: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
    paddingBottom: 2,
  },

  partyDetail: {
    fontSize: 8,
    marginBottom: 2, // Reduced margin
  },

  // Section Headers - More formal
  sectionHeader: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    marginTop: 12,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
    textTransform: "uppercase",
  },

  // Article numbering for contract sections
  articleNumber: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    marginBottom: 5,
    marginTop: 12,
  },

  // Scope of Work - More professional without bounded container
  scopeContainer: {
    marginBottom: 15,
    marginTop: 5,
  },

  scopeTitle: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    marginBottom: 5,
    textAlign: "center",
    textTransform: "uppercase",
  },

  scopeDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginBottom: 8,
  },

  scopeItem: {
    fontSize: 10,
    marginBottom: 5,
    flexDirection: "row",
    paddingLeft: 5,
  },

  scopeBullet: {
    width: 10,
    textAlign: "center",
  },

  scopeItemContent: {
    flex: 1,
  },

  scopeSubItem: {
    fontSize: 10,
    marginBottom: 4,
    marginLeft: 15,
    flexDirection: "row",
  },

  scopeSubBullet: {
    width: 10,
    textAlign: "center",
  },

  scopeSubItemContent: {
    flex: 1,
  },

  scopeDetail: {
    fontSize: 9,
    marginLeft: 25,
    marginBottom: 4,
    lineHeight: 1.4,
  },

  scopeNote: {
    fontSize: 9,
    marginTop: 5,
    marginLeft: 25,
    marginBottom: 5,
    paddingTop: 5,
    lineHeight: 1.4,
  },

  scopeSection: {
    marginBottom: 10,
  },

  // Professional pricing table - More condensed
  pricingTable: {
    marginTop: 10,
    marginBottom: 15,
    borderWidth: 0.5,
    borderColor: "#000000",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000000",
    color: "white",
    fontFamily: "Times-Bold",
    fontSize: 8,
  },

  tableHeaderCell: {
    padding: 5,
    borderRightWidth: 0.5,
    borderRightColor: "#ffffff",
    textAlign: "center",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#cccccc",
    minHeight: 20, // Reduced height
  },

  tableRowAlternate: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#cccccc",
    backgroundColor: "#f5f5f5",
    minHeight: 20, // Reduced height
  },

  tableCell: {
    padding: 4, // Reduced padding
    borderRightWidth: 0.5,
    borderRightColor: "#cccccc",
    fontSize: 8,
    justifyContent: "center",
  },

  tableCellDescription: {
    flex: 2,
    textAlign: "left",
  },

  tableCellQuantity: {
    flex: 0.5,
    textAlign: "center",
  },

  tableCellAmount: {
    flex: 1,
    textAlign: "right",
    fontFamily: "Times-Bold",
  },

  // Contract totals section - More condensed
  totalsSection: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderWidth: 0.5,
    borderColor: "#000000",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    paddingBottom: 2,
  },

  totalLabel: {
    fontSize: 9,
    fontFamily: "Times-Bold",
  },

  totalAmount: {
    fontSize: 9,
    fontFamily: "Times-Bold",
  },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#000000",
    paddingTop: 5,
    marginTop: 5,
  },

  grandTotalLabel: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
  },

  grandTotalAmount: {
    fontSize: 10,
    fontFamily: "Times-Bold",
  },

  // Payment terms section - More condensed
  paymentTerms: {
    marginTop: 12,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderWidth: 0.5,
    borderColor: "#000000",
  },

  paymentTermsTitle: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    marginBottom: 5,
    textAlign: "center",
    textTransform: "uppercase",
    borderBottomWidth: 0.5,
    borderBottomColor: "#cccccc",
    paddingBottom: 3,
  },

  paymentSchedule: {
    fontSize: 8,
    marginBottom: 2,
    paddingLeft: 5,
  },

  // Signature section - formal contract style
  signatureSection: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#000000",
  },

  signatureTitle: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
  },

  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15, // Reduced margin
  },

  signatureBlock: {
    flex: 1,
    marginHorizontal: 10,
  },

  signatureLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
    height: 20, // Reduced height
    marginBottom: 3,
  },

  signatureLabel: {
    fontSize: 7,
    textAlign: "center",
  },

  signatureDate: {
    fontSize: 7,
    textAlign: "center",
    marginTop: 10,
  },

  // Footer - More condensed
  footer: {
    position: "absolute",
    bottom: 15,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 7,
    borderTopWidth: 0.5,
    borderTopColor: "#cccccc",
    paddingTop: 5,
  },

  // Page numbers
  pageNumber: {
    position: "absolute",
    bottom: 15,
    right: 30,
    fontSize: 7,
    fontFamily: "Times-Italic",
  },

  // Terms page specific styles - More condensed
  termsPage: {
    fontFamily: "Times-Roman",
    fontSize: 8,
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 30,
    backgroundColor: "#ffffff",
    lineHeight: 1.3,
  },

  termsHeader: {
    textAlign: "center",
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
  },

  termsTitle: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  termsArticle: {
    marginBottom: 10,
  },

  termsArticleTitle: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },

  termsText: {
    fontSize: 8,
    lineHeight: 1.3,
    textAlign: "justify",
    marginBottom: 4,
  },

  termsList: {
    marginLeft: 10,
    marginBottom: 5,
  },

  termsListItem: {
    fontSize: 8,
    marginBottom: 2,
    lineHeight: 1.3,
  },

  // Line numbers for terms
  lineNumbers: {
    position: "absolute",
    left: 20,
    top: 100,
    bottom: 40,
    width: 15,
    fontSize: 7,
    color: "#666666",
  },

  lineNumber: {
    marginBottom: 1.3,
    textAlign: "right",
  },
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
  bundleRules = [],
}): React.ReactElement => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Calculate service pricing exactly like the proposal view
  const getServicePrice = (service: string, productData: any) => {
    let servicePrice = 0

    if (service === "windows-doors") {
      const windowPrice = Number.parseFloat(productData.windowPrice) || 0
      const doorPrices = productData.doorPrices
        ? Object.values(productData.doorPrices).reduce(
            (sum: number, price: any) => sum + (Number.parseFloat(String(price)) || 0),
            0,
          )
        : 0
      servicePrice = windowPrice + doorPrices
    } else if (service === "hvac") {
      if (productData.totalPrice) {
        servicePrice = Number.parseFloat(productData.totalPrice) || 0
      } else {
        servicePrice =
          Number.parseFloat(productData.systemCost || "0") +
          Number.parseFloat(productData.ductworkCost || "0") +
          Number.parseFloat(productData.laborCost || "0")
      }
      if (productData.addonPrices) {
        Object.values(productData.addonPrices).forEach((price: any) => {
          servicePrice += Number.parseFloat(String(price)) || 0
        })
      }
    } else if (service === "garage-doors") {
      servicePrice = Number.parseFloat(productData.totalPrice) || 0
      if (productData.addonPrices) {
        Object.values(productData.addonPrices).forEach((price: any) => {
          servicePrice += Number.parseFloat(String(price)) || 0
        })
      }
    } else if (service === "paint") {
      servicePrice = Number.parseFloat(productData.totalPrice) || 0
    } else {
      servicePrice = Number.parseFloat(productData.totalPrice) || 0
    }

    return servicePrice
  }

  // Get selected upgrades from the selectedAddons prop
  const getSelectedUpgrades = () => {
    const selected: any[] = []
    const seenIds = new Set<string>()

    Object.values(selectedAddons).forEach((serviceAddons) => {
      serviceAddons.forEach((addon) => {
        if (addon.selected && !seenIds.has(addon.id)) {
          selected.push(addon)
          seenIds.add(addon.id)
        }
      })
    })
    return selected
  }

  // Deduplicate bundle rules
  const getUniqueBundleRules = () => {
    const uniqueBundles: any[] = []
    const seenIds = new Set<string>()
    const seenNames = new Set<string>()

    bundleRules.forEach((bundle) => {
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

  // Calculate totals
  const upgradesTotal = selectedUpgrades.reduce((sum, upgrade) => sum + (upgrade.price || 0), 0)
  const bundleDiscountTotal = uniqueBundleRules.reduce((sum, bundle) => sum + (bundle.discount_value || 0), 0)
  const customAddersTotal =
    proposal?.customAdders?.reduce((sum: number, adder: any) => sum + (Number.parseFloat(adder.cost) || 0), 0) || 0
  const appliedDiscountsTotal =
    proposal?.appliedDiscounts?.reduce(
      (sum: number, discount: any) => sum + (Number.parseFloat(discount.amount) || 0),
      0,
    ) || 0
  const customerDiscountsTotal =
    proposal?.customerDiscounts?.reduce(
      (sum: number, discount: any) => sum + (Number.parseFloat(discount.amount) || 0),
      0,
    ) || 0

  const baseTotal = proposal?.pricing?.total || 0
  const finalTotal = baseTotal + upgradesTotal + customAddersTotal - bundleDiscountTotal

  const baseMonthlyPayment = proposal?.pricing?.monthlyPayment || 0
  const paymentFactor =
    proposal?.pricing?.paymentFactor ||
    (proposal?.pricing?.total && proposal?.pricing?.monthlyPayment
      ? (proposal.pricing.monthlyPayment / proposal.pricing.total) * 100
      : null)

  // Generate line numbers for terms page
  const generateLineNumbers = (count: number) => {
    const numbers = []
    for (let i = 1; i <= count; i++) {
      numbers.push(
        <Text key={i} style={styles.lineNumber}>
          {i}
        </Text>,
      )
    }
    return numbers
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Contract Header */}
        <View style={styles.contractHeader}>
          <View style={styles.logoContainer}>
            <Image style={styles.logo} src="public\newlogo.png" />
          </View>
          <Text style={styles.contractTitle}>HOME IMPROVEMENT CONTRACT</Text>
          <Text style={styles.contractSubtitle}>Evergreen Energy Upgrades Services Agreement</Text>
          <View style={styles.proposalMeta}>
            <Text>Contract No: {proposal?.proposalNumber || "N/A"}</Text>
            <Text>Date: {formatDate(proposal?.createdAt)}</Text>
            <Text>Valid Until: {formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())}</Text>
          </View>
        </View>

        {/* Parties Section */}
        <View style={styles.partiesSection}>
          <Text style={styles.partiesSectionTitle}>CONTRACTING PARTIES</Text>
          <View style={styles.partyInfo}>
            <View style={styles.partyColumn}>
              <Text style={styles.partyTitle}>CONTRACTOR:</Text>
              <Text style={styles.partyDetail}>Evergreen Energy Upgrades</Text>
              <Text style={styles.partyDetail}>License #: CA-12345678</Text>
              <Text style={styles.partyDetail}>Phone: (408) 828-7377</Text>
              <Text style={styles.partyDetail}>Email: info@evergreenergy.io</Text>
            </View>
            <View style={styles.partyColumn}>
              <Text style={styles.partyTitle}>HOMEOWNER:</Text>
              <Text style={styles.partyDetail}>{proposal?.customer?.name || "N/A"}</Text>
              <Text style={styles.partyDetail}>{proposal?.customer?.address || "N/A"}</Text>
              <Text style={styles.partyDetail}>Phone: {proposal?.customer?.phone || "N/A"}</Text>
              <Text style={styles.partyDetail}>Email: {proposal?.customer?.email || "N/A"}</Text>
            </View>
          </View>
        </View>

        {/* Article I - Scope of Work */}
        <Text style={styles.articleNumber}>ARTICLE I - SCOPE OF WORK</Text>
        <Text style={styles.termsText}>
          Contractor agrees to furnish all labor, materials, equipment, and services necessary to complete the work
          described herein in accordance with the terms and conditions of this Contract.
        </Text>

        {proposal?.services?.map((service: string, index: number) => {
          const productData = proposal.products[service]
          if (!productData) return null

          return (
            <View key={index} style={styles.scopeContainer}>
              <Text style={styles.scopeTitle}>
                {service.charAt(0).toUpperCase() + service.slice(1).replace(/-/g, " & ")} Installation
              </Text>
              <View style={styles.scopeDivider} />

              {/* Service-specific details */}
              {service === "windows-doors" && (
                <View>
                  <View style={styles.scopeItem}>
                    <Text style={styles.scopeBullet}>•</Text>
                    <Text style={styles.scopeItemContent}>
                      Installation of {productData.windowCount || "0"}{" "}
                    {productData.windowType?.replace(/-/g, " ") || "windows"}, {productData.windowMaterial || "Vinyl"}{" "}
                    material, {productData.windowColor || "White"} color, {productData.energyRating || "Energy Star"}{" "}
                    rated.
                  </Text>
                  </View>
                  
                  {productData.hasDoors && (
                    <View style={styles.scopeItem}>
                      <Text style={styles.scopeBullet}>•</Text>
                      <Text style={styles.scopeItemContent}>
                        Installation of {productData.doorCount || "1"}{" "}
                      {productData.doorType?.replace(/-/g, " ") || "door(s)"}.
                    </Text>
                    </View>
                  )}
                  
                  {productData.scopeNotes && productData.scopeNotes.split(";").map((note: string, i: number) => (
                    <View key={i} style={styles.scopeSubItem}>
                      <Text style={styles.scopeSubBullet}>-</Text>
                      <Text style={styles.scopeSubItemContent}>{note.trim()}</Text>
                    </View>
                  ))}
                </View>
              )}

              {service === "hvac" && (
                <View>
                  <View style={styles.scopeItem}>
                    <Text style={styles.scopeBullet}>•</Text>
                    <Text style={styles.scopeItemContent}>
                      Installation of {productData.systemType?.replace(/-/g, " ") || "HVAC"} system, SEER Rating:{" "}
                    {productData.seerRating || "N/A"}, Size: {productData.tonnage || "N/A"} tons, Brand:{" "}
                    {productData.brand || "N/A"}, Model: {productData.model || "N/A"}
                  </Text>
                  </View>
                  
                  {productData.addons?.length > 0 && (
                    <View style={styles.scopeItem}>
                      <Text style={styles.scopeBullet}>•</Text>
                      <Text style={styles.scopeItemContent}>Additional components: {productData.addons.join(", ")}</Text>
                    </View>
                  )}
                  
                  {productData.scopeNotes && productData.scopeNotes.split(";").map((note: string, i: number) => (
                    <View key={i} style={styles.scopeSubItem}>
                      <Text style={styles.scopeSubBullet}>-</Text>
                      <Text style={styles.scopeSubItemContent}>{note.trim()}</Text>
                    </View>
                  ))}
                </View>
              )}

              {service === "roofing" && (
                <View>
                  <View style={styles.scopeItem}>
                    <Text style={styles.scopeBullet}>•</Text>
                    <Text style={styles.scopeItemContent}>
                      Complete roof replacement using {productData.material || "shingles"}, Coverage:{" "}
                    {productData.squareCount || "N/A"} squares
                  </Text>
                  </View>
                  
                  {productData.addGutters && (
                    <View style={styles.scopeItem}>
                      <Text style={styles.scopeBullet}>•</Text>
                      <Text style={styles.scopeItemContent}>
                        Gutter installation: {productData.gutterLength || "N/A"} linear feet
                    </Text>
                    </View>
                  )}
                  
                  {productData.addPlywood && (
                    <View style={styles.scopeItem}>
                      <Text style={styles.scopeBullet}>•</Text>
                      <Text style={styles.scopeItemContent}>
                        Plywood replacement: {productData.plywoodPercentage || "100"}% of roof deck
                    </Text>
                    </View>
                  )}
                  
                  <View style={styles.scopeSection}>
                    <View style={styles.scopeSubItem}>
                      <Text style={styles.scopeSubBullet}>-</Text>
                      <Text style={styles.scopeSubItemContent}>Complete roof replacement including:</Text>
                    </View>
                    <View style={styles.scopeSubItem}>
                      <Text style={styles.scopeSubBullet}>-</Text>
                      <Text style={styles.scopeSubItemContent}>Removal of existing roofing material down to the deck</Text>
                    </View>
                    <View style={styles.scopeSubItem}>
                      <Text style={styles.scopeSubBullet}>-</Text>
                      <Text style={styles.scopeSubItemContent}>Inspection and replacement of damaged decking (if necessary)</Text>
                    </View>
                    <View style={styles.scopeSubItem}>
                      <Text style={styles.scopeSubBullet}>-</Text>
                      <Text style={styles.scopeSubItemContent}>Installation of synthetic underlayment</Text>
                    </View>
                    <View style={styles.scopeSubItem}>
                      <Text style={styles.scopeSubBullet}>-</Text>
                      <Text style={styles.scopeSubItemContent}>Installation of ice and water shield in valleys and around penetrations</Text>
                    </View>
                  </View>
                  
                  {productData.scopeNotes && productData.scopeNotes.split(";").map((note: string, i: number) => (
                    <View key={i} style={styles.scopeSubItem}>
                      <Text style={styles.scopeSubBullet}>-</Text>
                      <Text style={styles.scopeSubItemContent}>{note.trim()}</Text>
                    </View>
                  ))}
                </View>
              )}

              {service === "garage-doors" && (
                <View>
                  <View style={styles.scopeItem}>
                    <Text style={styles.scopeBullet}>•</Text>
                    <Text style={styles.scopeItemContent}>
                      Installation of {productData.quantity || "1"} garage door(s), Model: {productData.model || "T50L"}
                    , Size: {productData.width || "16"}' × {productData.height || "7"}'
                  </Text>
                  </View>
                  
                  {productData.addons?.length > 0 && (
                    <View style={styles.scopeItem}>
                      <Text style={styles.scopeBullet}>•</Text>
                      <Text style={styles.scopeItemContent}>Add-ons: {productData.addons.join(", ")}</Text>
                    </View>
                  )}
                  
                  {productData.scopeNotes && productData.scopeNotes.split(";").map((note: string, i: number) => (
                    <View key={i} style={styles.scopeSubItem}>
                      <Text style={styles.scopeSubBullet}>-</Text>
                      <Text style={styles.scopeSubItemContent}>{note.trim()}</Text>
                    </View>
                  ))}
                </View>
              )}

              {service === "paint" && (
                <View>
                  <View style={styles.scopeItem}>
                    <Text style={styles.scopeBullet}>•</Text>
                    <Text style={styles.scopeItemContent}>
                      {productData.serviceType || "Exterior"} painting service, Coverage:{" "}
                    {productData.squareFootage || "0"} sq ft, {productData.colorTone || "1"}-tone finish
                  </Text>
                  </View>
                  
                  <View style={styles.scopeItem}>
                    <Text style={styles.scopeBullet}>•</Text>
                    <Text style={styles.scopeItemContent}>
                      Includes: {productData.includePaint ? "Paint, " : ""}
                    {productData.includePrimer ? "Primer, " : ""}
                    {productData.includePrep ? "Surface Preparation" : ""}
                  </Text>
                  </View>
                  
                  {productData.scopeNotes && productData.scopeNotes.split(";").map((note: string, i: number) => (
                    <View key={i} style={styles.scopeSubItem}>
                      <Text style={styles.scopeSubBullet}>-</Text>
                      <Text style={styles.scopeSubItemContent}>{note.trim()}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )
        })}

        {/* Article II - Contract Price */}
        <Text style={styles.articleNumber}>ARTICLE II - CONTRACT PRICE</Text>
        <Text style={styles.termsText}>
          Homeowner agrees to pay Contractor the total sum specified below for the work described in this Contract,
          subject to additions and deductions pursuant to authorized change orders.
        </Text>

        <View style={styles.pricingTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.tableCellDescription]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellQuantity]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellAmount]}>Amount</Text>
          </View>

          {/* Base services */}
          {proposal?.services?.map((service: string, index: number) => {
            const productData = proposal.products[service]
            if (!productData) return null

            const servicePrice = getServicePrice(service, productData)
            const isEven = index % 2 === 0

            return (
              <View key={index} style={isEven ? styles.tableRow : styles.tableRowAlternate}>
                <Text style={[styles.tableCell, styles.tableCellDescription]}>
                  {service.charAt(0).toUpperCase() + service.slice(1).replace("-", " & ")} Installation
                </Text>
                <Text style={[styles.tableCell, styles.tableCellQuantity]}>1</Text>
                <Text style={[styles.tableCell, styles.tableCellAmount]}>{formatCurrency(servicePrice)}</Text>
              </View>
            )
          })}

          {/* Custom adders */}
          {proposal?.customAdders?.map((adder: any, index: number) => {
            const isEven = (proposal?.services?.length || 0) + (index % 2) === 0
            return (
              <View key={`custom-${index}`} style={isEven ? styles.tableRow : styles.tableRowAlternate}>
                <Text style={[styles.tableCell, styles.tableCellDescription]}>{adder.description}</Text>
                <Text style={[styles.tableCell, styles.tableCellQuantity]}>1</Text>
                <Text style={[styles.tableCell, styles.tableCellAmount]}>{formatCurrency(adder.cost)}</Text>
              </View>
            )
          })}

          {/* Selected upgrades */}
          {selectedUpgrades.map((upgrade: any, index: number) => {
            const isEven = (proposal?.services?.length || 0) + (proposal?.customAdders?.length || 0) + (index % 2) === 0
            return (
              <View key={`upgrade-${index}`} style={isEven ? styles.tableRow : styles.tableRowAlternate}>
                <Text style={[styles.tableCell, styles.tableCellDescription]}>Upgrade: {upgrade.name}</Text>
                <Text style={[styles.tableCell, styles.tableCellQuantity]}>1</Text>
                <Text style={[styles.tableCell, styles.tableCellAmount]}>{formatCurrency(upgrade.price)}</Text>
              </View>
            )
          })}

          {/* Discounts */}
          {uniqueBundleRules.map((bundle: any, index: number) => {
            const totalItems =
              (proposal?.services?.length || 0) +
              (proposal?.customAdders?.length || 0) +
              (selectedUpgrades?.length || 0)
            const isEven = (totalItems + index) % 2 === 0
            return (
              <View key={`bundle-${index}`} style={isEven ? styles.tableRow : styles.tableRowAlternate}>
                <Text style={[styles.tableCell, styles.tableCellDescription]}>Bundle Discount: {bundle.name}</Text>
                <Text style={[styles.tableCell, styles.tableCellQuantity]}>1</Text>
                <Text style={[styles.tableCell, styles.tableCellAmount, { color: "#dc2626" }]}>
                  -{formatCurrency(bundle.discount_value || 0)}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Contract Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalAmount}>{formatCurrency(baseTotal + upgradesTotal + customAddersTotal)}</Text>
          </View>

          {bundleDiscountTotal > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Bundle Savings:</Text>
              <Text style={styles.totalAmount}>-{formatCurrency(bundleDiscountTotal)}</Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total Contract Price:</Text>
            <Text style={styles.grandTotalAmount}>{formatCurrency(finalTotal)}</Text>
          </View>

          {baseMonthlyPayment > 0 && (
            <View
              style={[styles.totalRow, { marginTop: 5, borderTopWidth: 0.5, borderTopColor: "#000000", paddingTop: 5 }]}
            >
              <Text style={styles.totalLabel}>Monthly Payment:</Text>
              <Text style={styles.totalAmount}>{formatCurrency(baseMonthlyPayment)}/month</Text>
            </View>
          )}
        </View>

        {/* Article III - Payment Terms */}
        <Text style={styles.articleNumber}>ARTICLE III - PAYMENT TERMS</Text>

        <View style={styles.paymentTerms}>
          <Text style={styles.paymentTermsTitle}>Payment Schedule</Text>
          <Text style={styles.paymentSchedule}>
            • Down Payment (10%): {formatCurrency(finalTotal * 0.1)} - Due upon contract signing
          </Text>
          <Text style={styles.paymentSchedule}>
            • Material Delivery (40%): {formatCurrency(finalTotal * 0.4)} - Due upon material delivery
          </Text>
          <Text style={styles.paymentSchedule}>
            • Substantial Completion (40%): {formatCurrency(finalTotal * 0.4)} - Due at substantial completion
          </Text>
          <Text style={styles.paymentSchedule}>
            • Final Payment (10%): {formatCurrency(finalTotal * 0.1)} - Due upon final completion and inspection
          </Text>

          {proposal?.pricing?.financingTerm && (
            <View style={{ marginTop: 5, paddingTop: 3, borderTopWidth: 0.5, borderTopColor: "#cccccc" }}>
              <Text style={[styles.paymentSchedule, { fontFamily: "Times-Bold" }]}>
                Financing Available: {proposal.pricing.financingTerm} months at {proposal.pricing.interestRate}% APR
              </Text>
              {proposal.pricing.financingPlanName && (
                <Text style={styles.paymentSchedule}>Plan: {proposal.pricing.financingPlanName}</Text>
              )}
            </View>
          )}
        </View>

        {/* Article IV - Timeline */}
        <Text style={styles.articleNumber}>ARTICLE IV - PROJECT TIMELINE</Text>
        <View style={styles.paymentTerms}>
          <Text style={styles.paymentTermsTitle}>Estimated Schedule</Text>
          <Text style={styles.paymentSchedule}>
            • Estimated Start Date: {formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString())}
          </Text>
          <Text style={styles.paymentSchedule}>
            • Estimated Completion: {formatDate(new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString())}
          </Text>
          <Text style={styles.paymentSchedule}>
            • All dates subject to permit approval, material availability, and weather conditions.
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>Contract Execution</Text>

          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine}></View>
              <Text style={styles.signatureLabel}>Homeowner Signature</Text>
              <Text style={styles.signatureLabel}>{proposal?.customer?.name || "N/A"}</Text>
            </View>

            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine}></View>
              <Text style={styles.signatureLabel}>Contractor Signature</Text>
              <Text style={styles.signatureLabel}>Evergreen Energy Upgrades</Text>
            </View>
          </View>

          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine}></View>
              <Text style={styles.signatureLabel}>Date</Text>
            </View>

            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine}></View>
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Evergreen Energy Upgrades | License #CA-12345678 | (408) 828-7377 | info@evergreenergy.io |
            www.evergreenenergy.io
          </Text>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 1 of 2</Text>
      </Page>

      {/* Terms and Conditions Page */}
      <Page size="A4" style={styles.termsPage}>
        {/* Line numbers for legal documents */}
        <View style={styles.lineNumbers}>{generateLineNumbers(50)}</View>

        <View style={styles.termsHeader}>
          <Text style={styles.termsTitle}>TERMS AND CONDITIONS</Text>
          <Text style={{ fontSize: 8, textAlign: "center", marginTop: 3 }}>
            Contract No: {proposal?.proposalNumber || "N/A"} | Customer: {proposal?.customer?.name || "N/A"}
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>ARTICLE V - GENERAL CONDITIONS</Text>
          <Text style={styles.termsText}>
            5.1 This contract shall be governed by the laws of the State of California. Any disputes arising from this
            agreement shall be resolved through binding arbitration in accordance with the rules of the American
            Arbitration Association.
          </Text>
          <Text style={styles.termsText}>
            5.2 Time is of the essence in this Contract. Contractor shall diligently pursue work and complete the
            project in a timely manner, subject to delays beyond Contractor's control including but not limited to: acts
            of God, adverse weather conditions, labor disputes, material shortages, or delays in permit issuance.
          </Text>
          <Text style={styles.termsText}>
            5.3 Contractor shall obtain all necessary permits and perform all work in compliance with applicable
            building codes and regulations. Permit costs are included in the contract price unless otherwise specified.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>ARTICLE VI - WARRANTIES AND GUARANTEES</Text>
          <Text style={styles.termsText}>
            6.1 Contractor warrants all work performed under this agreement for the following periods from date of
            completion:
          </Text>
          <View style={styles.termsList}>
            <Text style={styles.termsListItem}>• HVAC Systems: Two (2) years on workmanship</Text>
            <Text style={styles.termsListItem}>• Windows and Doors: One (1) year on installation</Text>
            <Text style={styles.termsListItem}>• Roofing: One (1) year on workmanship</Text>
            <Text style={styles.termsListItem}>• Painting: One (1) year on workmanship</Text>
          </View>
          <Text style={styles.termsText}>
            6.2 All materials carry manufacturer warranties, which will be provided to Homeowner upon completion of
            work. This workmanship warranty excludes damage due to abuse, neglect, improper maintenance, or acts of God.
          </Text>
          <Text style={styles.termsText}>
            6.3 For energy efficiency projects, estimated savings are based on current usage patterns and energy costs.
            Actual savings may vary based on occupancy, usage patterns, weather conditions, and utility rate changes.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>ARTICLE VII - CHANGE ORDERS</Text>
          <Text style={styles.termsText}>
            7.1 Any alterations or deviations from the specifications in this Contract, including but not limited to any
            cost increase or decrease, will be executed only upon written change orders signed by both Homeowner and
            Contractor.
          </Text>
          <Text style={styles.termsText}>
            7.2 Change orders shall clearly describe the change in work, resulting adjustment in contract price, and any
            adjustment to completion date. Additional work will be charged at prevailing labor and material rates.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>ARTICLE VIII - INSURANCE AND LIABILITY</Text>
          <Text style={styles.termsText}>
            8.1 Contractor maintains general liability insurance in the amount of $1,000,000 and workers' compensation
            insurance as required by law. Certificates of insurance will be provided upon request.
          </Text>
          <Text style={styles.termsText}>
            8.2 Contractor's liability under this agreement is limited to the total contract amount. Contractor is not
            responsible for damage to underground utilities not properly marked or existing structural defects not
            disclosed.
          </Text>
          <Text style={styles.termsText}>
            8.3 Homeowner shall maintain property insurance covering the full replacement value of the property and
            contents during the project. Contractor shall be named as an additional insured on Homeowner's policy for
            the duration of the project.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>ARTICLE IX - CANCELLATION RIGHTS</Text>
          <Text style={styles.termsText}>
            9.1 Homeowner has the right to cancel this contract within three (3) business days of signing by providing
            written notice to the contractor. Notice of cancellation must be delivered via certified mail, return
            receipt requested.
          </Text>
          <Text style={styles.termsText}>
            9.2 After the three-day period, cancellation may result in charges for work performed and materials ordered.
            Homeowner shall be responsible for payment of all work completed and materials ordered prior to
            cancellation.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>ARTICLE X - LIEN RIGHTS</Text>
          <Text style={styles.termsText}>
            10.1 Contractor reserves the right to file a mechanic's lien against the property for unpaid amounts due
            under this contract. Payment in full releases all lien rights.
          </Text>
          <Text style={styles.termsText}>
            10.2 Contractor shall provide lien releases from all subcontractors and material suppliers upon request
            after payment for their services has been made.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>ARTICLE XI - ENTIRE AGREEMENT</Text>
          <Text style={styles.termsText}>
            11.1 This Contract constitutes the entire agreement between the parties. No other agreements,
            representations, or warranties have been made except those expressly set forth herein.
          </Text>
          <Text style={styles.termsText}>
            11.2 This Contract may be modified only by written instrument signed by both parties. The invalidity or
            unenforceability of any provision shall not affect the validity or enforceability of any other provision.
          </Text>
        </View>

        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>Acknowledgment of Terms</Text>
          <Text style={styles.termsText}>
            By signing below, Homeowner acknowledges that they have read, understood, and agree to all terms and
            conditions contained in this Contract, including all articles on both pages.
          </Text>

          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine}></View>
              <Text style={styles.signatureLabel}>Homeowner Initials</Text>
            </View>

            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine}></View>
              <Text style={styles.signatureLabel}>Contractor Initials</Text>
            </View>
          </View>
        </View>

        {/* Footer for terms page */}
        <View style={styles.footer}>
          <Text>
            Evergreen Energy Upgrades | License #CA-12345678 | (408) 828-7377 | info@evergreenergy.io |
            www.evergreenenergy.io
          </Text>
          <Text>This contract consists of 2 pages and constitutes the entire agreement between the parties.</Text>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 2 of 2</Text>
      </Page>
    </Document>
  )
}

export default ProposalPDF
