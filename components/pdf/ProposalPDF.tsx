import type React from "react"
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"

// More condensed, formal contract-style PDF with less whitespace
const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 11, // Professional base font size
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 30, // Reduced horizontal padding
    backgroundColor: "#ffffff",
    lineHeight: 1.4, // Professional line height
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
    fontSize: 16, // Professional title size
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  contractSubtitle: {
    fontSize: 12,
    fontFamily: "Times-Italic",
    textAlign: "center",
    marginTop: 3,
    marginBottom: 8,
  },

  proposalMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    fontSize: 10,
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
    fontSize: 10,
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
    fontSize: 12,
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
    fontSize: 11,
    fontFamily: "Times-Bold",
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
    paddingBottom: 2,
  },

  partyDetail: {
    fontSize: 10,
    marginBottom: 2, // Reduced margin
  },

  // Section Headers - More formal
  sectionHeader: {
    fontSize: 12,
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
    fontSize: 12,
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
    fontSize: 14,
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
    fontSize: 11,
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
    fontSize: 11,
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
    fontSize: 10,
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

  // Form field labels
  fieldLabel: {
    fontSize: 9,
    color: "#333333",
    textAlign: "justify",
    marginTop: 2,
    fontFamily: "Times-Roman",
  },

  // Professional form lines
  formLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
    minHeight: 15,
    marginBottom: 2,
  },

  // Checkbox styles
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 0.5,
    borderColor: "#000000",
    marginRight: 5,
  },

  // Initial boxes
  initialBox: {
    width: 40,
    height: 15,
    borderWidth: 0.5,
    borderColor: "#000000",
    marginHorizontal: 5,
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
    fontSize: 12,
    fontFamily: "Times-Bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },

  termsText: {
    fontSize: 10,
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
          <Text style={styles.contractSubtitle}>Evergreen Home Upgrades Services Agreement</Text>
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
              <Text style={styles.partyDetail}>Evergreen Home Upgrades</Text>
              <Text style={styles.partyDetail}>License #: 1116631</Text>
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

                  {productData.scopeNotes &&
                    productData.scopeNotes.split(";").map((note: string, i: number) => (
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
                      <Text style={styles.scopeItemContent}>
                        Additional components: {productData.addons.join(", ")}
                      </Text>
                    </View>
                  )}

                  {productData.scopeNotes &&
                    productData.scopeNotes.split(";").map((note: string, i: number) => (
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
                      <Text style={styles.scopeSubItemContent}>
                        Removal of existing roofing material down to the deck
                      </Text>
                    </View>
                    <View style={styles.scopeSubItem}>
                      <Text style={styles.scopeSubBullet}>-</Text>
                      <Text style={styles.scopeSubItemContent}>
                        Inspection and replacement of damaged decking (if necessary)
                      </Text>
                    </View>
                    <View style={styles.scopeSubItem}>
                      <Text style={styles.scopeSubBullet}>-</Text>
                      <Text style={styles.scopeSubItemContent}>Installation of synthetic underlayment</Text>
                    </View>
                    <View style={styles.scopeSubItem}>
                      <Text style={styles.scopeSubBullet}>-</Text>
                      <Text style={styles.scopeSubItemContent}>
                        Installation of ice and water shield in valleys and around penetrations
                      </Text>
                    </View>
                  </View>

                  {productData.scopeNotes &&
                    productData.scopeNotes.split(";").map((note: string, i: number) => (
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

                  {productData.scopeNotes &&
                    productData.scopeNotes.split(";").map((note: string, i: number) => (
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

                  {productData.scopeNotes &&
                    productData.scopeNotes.split(";").map((note: string, i: number) => (
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
          <Text style={styles.paymentTermsTitle}>Financing Terms</Text>
          {/* <Text style={styles.paymentSchedule}>
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
          </Text> */}

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
              <Text style={styles.signatureLabel}>Evergreen Home Upgrades</Text>
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
            Evergreen Home Upgrades | License #1116631 | (408) 828-7377 | info@evergreenergy.io | www.evergreenenergy.io
          </Text>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 1 of 6</Text>
      </Page>

      {/* Terms and Conditions Page */}
      <Page size="A4" style={styles.termsPage}>
        {/* Line numbers for legal documents */}
      

        <View style={styles.termsHeader}>
          <Text style={styles.termsTitle}>TERMS AND CONDITIONS</Text>
          <Text style={{ fontSize: 8, textAlign: "center", marginTop: 3 }}>
            Contract No: {proposal?.proposalNumber || "N/A"} | Customer: {proposal?.customer?.name || "N/A"}
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>1. Owner's Responsibilities</Text>
          <Text style={styles.termsText}>
            The Owner is responsible to supply water, gas, sewer and electrical utilities unless otherwise agreed to in
            writing. Electricity and water to the site is necessary. Owner agrees to allow and provide Contractor and
            his equipment access to the property. The Owner is responsible for having sufficient funds to comply with
            this agreement. This is a cash transaction unless otherwise specified. The Owner is responsible to remove or
            protect any personal property and Contractor is not responsible for same or for any carpets, drapes,
            furniture, driveways, lawns, shrubs, etc. The Owner shall point out and warrant the property lines to
            Contractor, and shall hold Contractor harmless for any disputes or errors in the property line or setback
            locations.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>2. Delays</Text>
          <Text style={styles.termsText}>
            Contractor agrees to start and diligently pursue work through to completion, but shall not be responsible
            for delays for any of the following reasons: failure of the issuance of all necessary building permits
            within a reasonable length of time, funding of loans, disbursement of funds into control or escrow, acts of
            neglect or omission of Owner or Owner's employees or Owner's agent, acts of God, stormy or inclement
            weather, strikes, lockouts, boycotts or other labor union activities, extra work ordered by Owner, acts of
            public enemy, riots or civil commotion, inability to secure material through regular recognized channels,
            imposition of Government priority or allocation of materials, failure of Owner to make payments when due, or
            delays caused by inspection or changes ordered by the inspectors of authorized Governmental bodies, or for
            acts of independent Contractors, or other causes beyond Contractor's reasonable control.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>3. Plans and Specifications</Text>
          <Text style={styles.termsText}>
            If plans and specifications are prepared for this job, they shall be attached to and become a part of the
            Agreement. Contractor will obtain and pay for all required building permits, but Owner will pay assessments
            and charges required by public bodies and utilities for financing or repaying the cost of sewers, storm
            drains, water service, other utilities, water hook-up charges and the like.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>4. Subcontracts</Text>
          <Text style={styles.termsText}>
            The Contractor may subcontract portions of this work to properly licensed and qualified subcontractors.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>5. Completion and Occupancy</Text>
          <Text style={styles.termsText}>
            Owner agrees to sign and record a notice of completion within five days after the project is complete and
            ready for occupancy. If the project passes final inspection by the public body but Owner fails to record
            Notice of Completion, then Owner hereby appoints Contractor as Owner's agent to sign and record a Notice of
            Completion on behalf of Owner. This agency is irrevocable and is an agency coupled with an interest. In the
            event the Owner occupies the project or any part thereof before the Contractor has received all payment due
            under this contract, such occupancy shall constitute full and unqualified acceptance of all the Contractor's
            work by the Owner and the Owner agrees that such occupancy shall be a waiver of any and all claims against
            the Contractor.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>6. Insurance and Deposits</Text>
          <Text style={styles.termsText}>
            Owner will procure at his own expense and before the commencement of any work hereunder, fire insurance with
            course of construction, vandalism and malicious mischief clauses attached, such insurance to be a sum at
            least equal to the contract price with loss, if any, payable to any beneficiary under any deed of trust
            covering the project, such insurance to name the Contractor and his subcontractors as additional insured,
            and to protect Owner, Contractor and his subcontractors and construction lender as their interests may
            appear; should Owner fail to do so, Contractor may procure such insurance as agent for and at the expense of
            Owner, but is not required to do so. If the project is destroyed or damaged by disaster, accident or
            calamity, such as fire, storm, earthquake, flood, landslide, or by theft or vandalism, any work done by the
            Contractor rebuilding or restoring the project shall be paid by the Owner as extra work.
          </Text>
          <Text style={styles.termsText}>
            Contractor shall carry Worker's Compensation Insurance for the protection of Contractor's employees during
            the progress of the work. Owner shall obtain and pay for insurance against injury to his own employees and
            persons under Owner's discretion and persons on the job site at Owner's invitation.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>7. Right to Stop Work</Text>
          <Text style={styles.termsText}>
            Contractor shall have the right to stop work if any payment shall not be made, when due, to Contractor under
            this agreement; Contractor may keep the job idle until all payments due are received. Such failure to make
            payment, when due, is a material breach of this Agreement. Overdue payments will bear interest at the rate
            of 1½% per month (18% per annum).
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>8. Clean Up</Text>
          <Text style={styles.termsText}>
            Contractor will remove from Owner's property debris and surplus material created by his operation and leave
            it in a neat and broom clean condition.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>9. Limitations</Text>
          <Text style={styles.termsText}>
            No action of any character arising from or related to this contract, or the performance thereof, shall be
            commenced by either party against the other more than two years after completion or cessation of work under
            this contract.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>10. Validity and Damages</Text>
          <Text style={styles.termsText}>
            In case one or more of the provisions of this Agreement or any application thereof shall be invalid,
            unenforceable or illegal, the validity, enforceability and legality of the remaining provisions and any
            other applications shall not in any way be impaired thereby. Any damages for which Contractor may be liable
            to Owner shall not, in any event, exceed the cash price of this contract.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>11. Asbestos, Lead, Mold, and other Hazardous Materials</Text>
          <Text style={styles.termsText}>
            Owner hereby represents that Owner has no knowledge of the existence on or in any portion of the premises
            affected by the Project of any asbestos, lead paint, mold (including all types of microbial matter or
            microbiological contamination, mildew or fungus), or other hazardous materials.
          </Text>
          <Text style={styles.termsText}>
            Testing for the existence of mold and other hazardous materials shall only be performed as expressly stated
            in writing. Contractor shall not be testing or performing any work whatsoever in an area that is not
            identified in the Scope of Work. Unless the contract specifically calls for the removal, disturbance, or
            transportation of asbestos, polychlorinated biphenyl (PCB), mold, lead paint, or other hazardous substances
            or materials, the parties acknowledge that such work requires special procedures, precautions, and/or
            licenses. Therefore, unless the contract specifically calls for same, if Contractor encounters such
            substances, Contractor shall immediately stop work and allow the Owner to obtain a duly qualified asbestos
            and/or hazardous material contractor to perform the work or Contractor may perform the work itself at
            Contractor's option. Said work will be treated as an extra under this contract, and the Contract Term
            setting forth the time for completion of the project may be delayed.
          </Text>
          <Text style={styles.termsText}>
            In the event that mold or microbial contamination is removed by Contractor, Owner understands and agrees
            that due to the unpredictable characteristics of mold and microbial contamination, Contractor shall not be
            responsible for any recurring incidents of mold or microbial contamination appearing in the same or any
            adjacent location, subsequent to the completion of the work performed by Contractor. Owner agrees to hold
            Contractor harmless, and shall indemnify Contractor harmless for any recurrence of mold or microbial
            contamination. Owner also agrees that Contractor shall not be responsible, and agrees to hold Contractor
            harmless and indemnify Contractor, for the existence of mold or microbial contamination in any area that
            Contractor was not contracted to test and/or remediate. Further, Owner is hereby informed, and hereby
            acknowledges, that most insurers expressly disclaim coverage for any actual or alleged damages arising from
            mold or microbial contamination.
          </Text>
          <Text style={styles.termsText}>
            Contractor makes no representations whatsoever as to coverage for mold contamination, though at Owner's
            additional expense, if requested in writing, Contractor will inquire as to the availability of additional
            coverage for such contamination or remediation, and if available, will obtain such coverage if the
            additional premium is paid for by Owner as an extra.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>12. Standards of Materials and Workmanship</Text>
          <Text style={styles.termsText}>
            Contractor shall use and install "standard grade" or "builder's grade" materials on the project unless
            otherwise stated in the Scope of Work, the plans, and/or specifications provided to Contractor prior to the
            execution of this Agreement. Unless expressly stated in the Scope of Work, Contractor shall have no
            liability or responsibility to restore or repair the whole or any part of the premises affected by the work
            of Contractor to be performed herein or by any subsequently agreed-upon change order, including as an
            illustration and not as a limitation, any landscaping, sprinkler system, flooring and carpet, wall
            coverings, paint, tile, or decorator items.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>13. Limited Warranty</Text>
          <Text style={styles.termsText}>
            Contractor warranties for (10) years all Work including labor. Client agrees that from ("Substantial
            Completion"). the Work has been done and installed in a good workmanlike manner in accordance with all
            building codes and California Authorities Having Jurisdiction specifications. Warranty on Equipment will be
            supplied by the manufacturer. All warranty coverage to equipment and workmanship installed by the contractor
            will be void if any alterations or repairs are performed by any other person/company not expressly
            authorized, in writing, by the contractor. Warranty does not cover damage caused by external forces such as
            but not limited to vandalism, theft, fire, or act of God, damage caused by weather effects exceeding
            manufacturer tolerances, normal wear and tear. Any implied warranties: Electric bills, water damages, or any
            other consequential damages: or damage to PV system or to its efficiency due to adjustments, moving, or
            tampering with the PV system or any of its components by individuals not approved by the Contractor
            constitute are considered out of warranty and not covered.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>14. Changes in the Work - Concealed Conditions</Text>
          <Text style={styles.termsText}>
            Should the Owner, construction lender, or any public body or inspector direct any modification or addition
            to the work covered by this contract, the contract price shall be adjusted accordingly. Modification or
            addition to the work shall be executed only when a Contract Change Order has been signed by both the Owner
            and the Contractor. The change in the Contract Price caused by such Contract Change Order shall be as agreed
            to in writing, or if the parties are not in agreement as to the change in Contract Price, the Contractor's
            actual cost of all labor, equipment, subcontracts and materials, plus a Contractor's fee of 20% or ___%
            shall be the change in Contract Price.
          </Text>
          <Text style={styles.termsText}>
            The Contract Change Order may also increase the time within which the contract is to be completed.
            Contractor shall promptly notify the Owner of (a) subsurface or latent physical conditions at the site
            differing materially from those indicated in the contract, or (b) unknown physical conditions differing
            materially from those ordinarily encountered and generally recognized as inherent in work of the character
            provided for in this contract. Any expense incurred due to such conditions shall be paid for by the Owner as
            added work. Payment for extra work will be made as extra work progresses.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>15. Fees, Taxes and Assessments, Compliance With Laws</Text>
          <Text style={styles.termsText}>
            Taxes, Permits, Fees, and assessments of all descriptions will be paid for by Owner. Contractor will obtain
            all required building permits, at the sole expense of Owner. Upon demand by Contractor, Owner shall provide
            ample funds to acquire any and all necessary permits on a timely basis. Owner will pay assessments and
            charges required by public bodies and utilities for financing or repaying the cost of sewers, storm drains,
            water service, schools and school facilities, other utilities, hook-up charges and the like. Contractor
            shall comply with all federal, state, county and local laws, ordinances and regulations.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>16. Labor and Material</Text>
          <Text style={styles.termsText}>
            Contractor shall pay all valid charges for labor and material incurred by Contractor and used in the
            construction or repair of the Project. Contractor is excused from this obligation for bills received in any
            period during which the Owner is in arrears in making progress payments to Contractor. No waiver or release
            of mechanic's lien given by Contractor shall be binding until all payments due to Contractor when the
            release was executed have been made.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>17. Right to Cure</Text>
          <Text style={styles.termsText}>
            In the event that Owner alleges that of the work is not or has not been done correctly or timely, Owner
            shall give Contractor a notice that Contractor shall commence to cure the condition Owner has alleged is
            insufficient within ten days.
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
            Evergreen Home Upgrades | License #1116631 | (408) 828-7377 | info@evergreenergy.io | www.evergreenenergy.io
          </Text>
          <Text>
            This contract consists of multiple pages and constitutes the entire agreement between the parties.
          </Text>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 2 of 6</Text>
      </Page>

      {/* Three-Day Right to Cancel Page */}
      <Page size="A4" style={styles.termsPage}>
        <View style={styles.termsHeader}>
          <Text style={styles.termsTitle}>THREE-DAY RIGHT TO CANCEL</Text>
        </View>

        <Text style={styles.termsText}>
          You, the buyer, have the right to cancel this contract within three business days. You may cancel by
          e-mailing, mailing, faxing, or delivering a written notice to the contractor at the contractor's place of
          business by midnight of the third business day after you received a signed and dated copy of the contract that
          includes this notice. Include your name, your address, and the date you received the signed copy of the
          contract and this notice.
        </Text>

        <Text style={styles.termsText}>
          If you cancel, the contractor must return to you anything you paid within 10 days of receiving the notice of
          cancellation. For your part, you must make available to the contractor at your residence, in substantially as
          good condition as you received them, goods delivered to you under this contract or sale. Or, you may, if you
          wish, comply with the contractor's instructions on how to return the goods at the contractor's expense and
          risk. If you do make the goods available to the contractor and the contractor does not pick them up within 20
          days of the date of your notice of cancellation, you may keep them without any further obligation. If you fail
          to make the goods available to the contractor, or if you agree to return the goods to the contractor and fail
          to do so, then you remain liable for performance of all obligations under the contract.
        </Text>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>3-DAY NOTICE OF CANCELLATION</Text>
          
          <Text style={styles.termsText}>DATE ____________________________</Text>
          
          <Text style={styles.termsText}>
            You may cancel this transaction, without any penalty or obligation, within three business days from the
            above date.
          </Text>
          <Text style={styles.termsText}>
            If you cancel, any property traded in, any payments made by you under the contract or sale, and any
            negotiable instrument executed by you will be returned within 10 days following receipt by the seller of
            your cancellation notice, and any security interest arising out of the transaction will be cancelled.
          </Text>
          <Text style={styles.termsText}>
            If you cancel, you must make available to the seller at your residence, in substantially as good condition
            as when received, any goods delivered to you under this contract or sale, or you may, if you wish, comply
            with the instructions of the seller regarding the return shipment of the goods at the seller's expense and
            risk.
          </Text>
          <Text style={styles.termsText}>
            If you do make the goods available to the seller and the seller does not pick them up within 20 days of the
            date of your notice of cancellation, you may retain or dispose of the goods without any further obligation.
            If you fail to make the goods available to the seller, or if you agree to return the goods to the seller and
            fail to do so, then you remain liable for performance of all obligations under the contract.
          </Text>
          <Text style={styles.termsText}>
            To cancel this transaction, mail or deliver a signed and dated copy of this cancellation notice, or any
            other written notice, or send a telegram to:
          </Text>
          
          <Text style={[styles.termsText, { marginTop: 8 }]}>
            ____________________________________________ at __________________________________________________________
          </Text>
          <Text style={styles.fieldLabel}>(Name of Seller)                                                                                                          (Address of Seller's Place of Business)</Text>
          
          <View style={{ marginTop: 10 }}>
            <Text style={styles.termsText}>not later than midnight of ______________________.</Text>
            <Text style={[styles.fieldLabel, { marginLeft: 140 }]}>(Date)</Text>
          </View>
          
          <View style={{ marginTop: 10 }}>
            <Text style={styles.termsText}>I hereby cancel this transaction ________________________________________    ________________________</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[styles.fieldLabel, { marginLeft: 150 }]}>(Buyer's Signature)</Text>
              <Text style={[styles.fieldLabel, { marginRight: 260 }]}>(Date)</Text>
            </View>
          </View>
        </View>

        <View style={styles.termsArticle}>
          <View>
            <Text style={styles.termsText}>I, ____________________________________________________ hereby acknowledge that on ______________ I was provided this document</Text>
            <View style={{ flexDirection: 'row', justifyContent: "space-around" }}>
              <Text style={[styles.fieldLabel, { marginRight: 20 }]}>(Owner)</Text>
              <Text style={[styles.fieldLabel, { marginRight: 250 }]}>(Date)</Text>
            </View>
          </View>
          
          <Text style={[styles.termsText, { marginTop: 5 }]}>entitled "Three Day Right to Cancel"</Text>
          
          <View style={{ marginTop: 15 }}>
            <View style={styles.signatureLine}></View>
            <Text style={[styles.fieldLabel, {marginLeft:200}]}>(Owner's Signature)</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Evergreen Home Upgrades | License #1116631 | (408) 828-7377 | info@evergreenergy.io | www.evergreenenergy.io
          </Text>
        </View>
        <Text style={styles.pageNumber}>Page 3 of 6</Text>
      </Page>

      {/* Five-Day Right to Cancel Page */}
      <Page size="A4" style={styles.termsPage}>
        <View style={styles.termsHeader}>
          <Text style={styles.termsTitle}>FIVE-DAY RIGHT TO CANCEL (For owners 65 and over)</Text>
        </View>

        <Text style={styles.termsText}>
          You, the buyer, have the right to cancel this contract within five business days. You may cancel by e-mailing,
          mailing, faxing, or delivering a written notice to the contractor at the contractor's place of business by
          midnight of the fifth business day after you received a signed and dated copy of the contract that includes
          this notice. Include your name, your address, and the date you received the signed copy of the contract and
          this notice.
        </Text>

        <Text style={styles.termsText}>
          If you cancel, the contractor must return to you anything you paid within 10 days of receiving the notice of
          cancellation. For your part, you must make available to the contractor at your residence, in substantially as
          good condition as you received them, goods delivered to you under this contract or sale. Or, you may, if you
          wish, comply with the contractor's instructions on how to return the goods at the contractor's expense and
          risk. If you do make the goods available to the contractor and the contractor does not pick them up within 20
          days of the date of your notice of cancellation, you may keep them without any further obligation. If you fail
          to make the goods available to the contractor, or if you agree to return the goods to the contractor and fail
          to do so, then you remain liable for performance of all obligations under the contract.
        </Text>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>5-DAY NOTICE OF CANCELLATION (For owners 65 and over)</Text>
          
          <Text style={styles.termsText}>DATE ____________________________</Text>
          
          <Text style={styles.termsText}>
            You may cancel this transaction, without any penalty or obligation, within five business days from the above
            date.
          </Text>
          <Text style={styles.termsText}>
            If you cancel, any property traded in, any payments made by you under the contract or sale, and any
            negotiable instrument executed by you will be returned within 10 days following receipt by the seller of
            your cancellation notice, and any security interest arising out of the transaction will be cancelled.
          </Text>
          <Text style={styles.termsText}>
            If you cancel, you must make available to the seller at your residence, in substantially as good condition
            as when received, any goods delivered to you under this contract or sale, or you may, if you wish, comply
            with the instructions of the seller regarding the return shipment of the goods at the seller's expense and
            risk.
          </Text>
          <Text style={styles.termsText}>
            If you do make the goods available to the seller and the seller does not pick them up within 20 days of the
            date of your notice of cancellation, you may retain or dispose of the goods without any further obligation.
            If you fail to make the goods available to the seller, or if you agree to return the goods to the seller and
            fail to do so, then you remain liable for performance of all obligations under the contract.
          </Text>
          <Text style={styles.termsText}>
            To cancel this transaction, mail or deliver a signed and dated copy of this cancellation notice, or any
            other written notice, or send a telegram to:
          </Text>
          
          <Text style={[styles.termsText, { marginTop: 8 }]}>
            ____________________________________________ at __________________________________________________________
          </Text>
          <Text style={styles.fieldLabel}>(Name of Seller)                                                                                                          (Address of Seller's Place of Business)</Text>
          
          <View style={{ marginTop: 10 }}>
            <Text style={styles.termsText}>not later than midnight of ______________________.</Text>
            <Text style={[styles.fieldLabel, { marginLeft: 140 }]}>(Date)</Text>
          </View>
          
          <View style={{ marginTop: 10 }}>
            <Text style={styles.termsText}>I hereby cancel this transaction ________________________________________    ________________________</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[styles.fieldLabel, { marginLeft: 150 }]}>(Buyer's Signature)</Text>
              <Text style={[styles.fieldLabel, { marginRight: 200 }]}>(Date)</Text>
            </View>
          </View>
        </View>

        <View style={styles.termsArticle}>
          <View>
            <Text style={styles.termsText}>I, ____________________________________________________ hereby acknowledge that on ______________ I was provided this document</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Text style={[styles.fieldLabel, { marginRight: 20 }]}>(Owner)</Text>
              <Text style={[styles.fieldLabel, { marginRight: 80 }]}>(Date)</Text>
            </View>
          </View>
          
          <Text style={[styles.termsText, { marginTop: 5 }]}>entitled "Five Day Right to Cancel"</Text>
          
          <View style={{ marginTop: 15 }}>
            <View style={styles.signatureLine}></View>
            <Text style={[styles.fieldLabel, {marginLeft:200}]}>(Owner's Signature)</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Evergreen Home Upgrades | License #1116631 | (408) 828-7377 | info@evergreenergy.io | www.evergreenenergy.io
          </Text>
        </View>
        <Text style={styles.pageNumber}>Page 4 of 6</Text>
      </Page>

      {/* Mechanics Lien Warning Page */}
      <Page size="A4" style={styles.termsPage}>
        <View style={styles.termsHeader}>
          <Text style={styles.termsTitle}>MECHANICS LIEN WARNING</Text>
        </View>

        <Text style={[styles.termsText, { fontFamily: "Times-Bold" }]}>
          HOME IMPROVEMENT CONTRACT MECHANICS LIEN WARNING. Anyone who helps improve your property, but who is not paid,
          may record what is called a mechanics lien on your property. A mechanics lien is a claim, like a mortgage or
          home equity loan, made against your property and recorded with the county recorder.
        </Text>

        <Text style={styles.termsText}>
          Even if you pay your contractor in full, unpaid subcontractors, suppliers, and laborers who helped to improve
          your property may record mechanics liens and sue you in court to foreclose the lien. If a court finds the lien
          is valid, you could be forced to pay twice or have a court officer sell your home to pay the lien. Liens can
          also affect your credit.
        </Text>

        <Text style={styles.termsText}>
          To preserve their right to record a lien, each subcontractor and material supplier must provide you with a
          document called a 'Preliminary Notice.' This notice is not a lien. The purpose of the notice is to let you
          know that the person who sends you the notice has the right to record a lien on your property if he or she is
          not paid.
        </Text>

        <Text style={[styles.termsText, { fontFamily: "Times-Bold" }]}>
          BE CAREFUL. The Preliminary Notice can be sent up to 20 days after the subcontractor starts work or the
          supplier provides material. This can be a big problem if you pay your contractor before you have received the
          Preliminary Notices.
        </Text>

        <Text style={styles.termsText}>
          You will not get Preliminary Notices from your prime contractor or from laborers who work on your project. The
          law assumes that you already know they are improving your property.
        </Text>

        <Text style={[styles.termsText, { fontFamily: "Times-Bold" }]}>
          PROTECT YOURSELF FROM LIENS. You can protect yourself from liens by getting a list from your contractor of all
          the sub- contractors and material suppliers that work on your project. Find out from your contractor when
          these subcontractors started work and when these suppliers delivered goods or materials. Then wait 20 days,
          paying attention to the Preliminary Notices you receive.
        </Text>

        <Text style={[styles.termsText, { fontFamily: "Times-Bold" }]}>
          PAY WITH JOINT CHECKS. One way to protect yourself is to pay with a joint check. When your contractor tells
          you it is time to pay for the work of a subcontractor or supplier who has provided you with a Preliminary
          Notice, write a joint check payable to both the contractor and the subcontractor or material supplier.
        </Text>

        <Text style={styles.termsText}>
          For other ways to prevent liens, visit CSLB's Internet Web site at www.cslb.ca.gov or call CSLB at
          800-321-CSLB (2752).
        </Text>

        <Text style={[styles.termsText, { fontFamily: "Times-Bold" }]}>
          REMEMBER, IF YOU DO NOTHING, YOU RISK HAVING A LIEN PLACED ON YOUR HOME. This can mean that you may have to
          pay twice, or face the forced sale of your home to pay what you owe.
        </Text>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>STATUTORY NOTICES</Text>
          <Text style={styles.termsArticleTitle}>Information about the Contractors' State License Board (CSLB)</Text>
          <Text style={styles.termsText}>
            CSLB is the state consumer protection agency that licenses and regulates construction contractors. Contact
            CSLB for information about the licensed contractor you are considering, including information about
            disclosable complaints, disciplinary actions and civil judgments that are reported to CSLB.
          </Text>
          <Text style={styles.termsText}>
            Use only licensed contractors. If you file a complaint against a licensed contractor within the legal
            deadline (usually four years), CSLB has authority to investigate the complaint. If you use an unlicensed
            contractor, CSLB may not be able to help you resolve your complaint. Your only remedy may be in civil court,
            and you may be liable for damages arising out of any injuries to the unlicensed contractor or the unlicensed
            contractor's employees.
          </Text>
          <Text style={styles.termsText}>For more information:</Text>
          <Text style={styles.termsText}>Visit CSLB's Internet Web site at www.cslb.ca.gov</Text>
          <Text style={styles.termsText}>Call CSLB at 800-321-CSLB (2752)</Text>
          <Text style={styles.termsText}>Write CSLB at P.O. Box 26000, Sacramento, CA 95826.</Text>
        </View>

        <View style={styles.footer}>
          <Text>
            Evergreen Home Upgrades | License #1116631 | (408) 828-7377 | info@evergreenergy.io | www.evergreenenergy.io
          </Text>
        </View>
        <Text style={styles.pageNumber}>Page 5 of 6</Text>
      </Page>

      {/* Insurance and Arbitration Page */}
      <Page size="A4" style={styles.termsPage}>
        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>WORKERS' COMPENSATION INSURANCE</Text>
          <Text style={[styles.termsText, { marginBottom: 8 }]}>Check the applicable box:</Text>
          
          <View style={styles.checkboxRow}>
            <View style={styles.checkbox}></View>
          <Text style={styles.termsText}>
            (A) This contractor has no employees and is exempt from workers' compensation requirements.
          </Text>
          </View>
          
          <View style={styles.checkboxRow}>
            <View style={styles.checkbox}></View>
          <Text style={styles.termsText}>
            (B) This contractor carries workers' compensation insurance for all employees.
          </Text>
          </View>
          
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>COMMERCIAL GENERAL LIABILITY INSURANCE (CGL)</Text>
          <Text style={[styles.termsText, { marginBottom: 8 }]}>Check the applicable box:</Text>
          
          <View>
            <View style={styles.checkboxRow}>
              <View style={styles.checkbox}></View>
              <Text style={styles.termsText}>(A) _________________ does not carry Commercial General Liability Insurance.</Text>
            </View>
            <Text style={[styles.fieldLabel, { marginLeft: 35 }]}>(Contractor's Name)</Text>
          </View>
          
          <View style={{ marginTop: 8 }}>
            <View style={styles.checkboxRow}>
              <View style={styles.checkbox}></View>
              <Text style={styles.termsText}>(B) _________________ carries Commercial General Liability Insurance.</Text>
            </View>
            <Text style={[styles.fieldLabel, { marginLeft: 35 }]}>(Contractor's Name)</Text>
          </View>
          
          <View style={{ marginTop: 8, marginLeft: 20 }}>
            <View>
              <Text style={styles.termsText}>The insurance company is _________________________.</Text>
              <Text style={[styles.fieldLabel, { marginLeft: 120 }]}>(Company Name)</Text>
            </View>
            
            <View style={{ marginTop: 8 }}>
              <Text style={styles.termsText}>You may call the insurance company at ___________________ to check the contractor's insurance coverage.</Text>
              <Text style={[styles.fieldLabel, { marginLeft: 133 }]}>(Telephone Number)</Text>
            </View>
          </View>
          
          <View style={{ marginTop: 8 }}>
            <View style={styles.checkboxRow}>
              <View style={styles.checkbox}></View>
              <Text style={styles.termsText}>(C) _________________ is self-insured.</Text>
            </View>
            <Text style={[styles.fieldLabel, { marginLeft: 35 }]}>(Contractor's Name)</Text>
          </View>
          
          <View style={{ marginTop: 8 }}>
            <View style={styles.checkboxRow}>
              <View style={styles.checkbox}></View>
              <Text style={styles.termsText}>(D) _________________ is a limited liability company that carries liability insurance or maintains other security as required by law. You may call</Text>
            </View>
            <View>
              <Text style={styles.termsText}>_________________ at _________________ to check on the contractor's insurance coverage or security.</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.fieldLabel, { marginLeft: 0 }]}>(Contractor's Name)</Text>
                <Text style={[styles.fieldLabel, { marginLeft: -50 }]}>(Insurance Company/Trust Company/Bank)</Text>
                <Text style={[styles.fieldLabel, { marginRight: 0 }]}>(Telephone Number)</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>NOTE ABOUT EXTRA WORK AND CHANGE ORDERS</Text>
          <Text style={styles.termsText}>
            Extra Work and Change Orders become part of the contract once the order is prepared in writing and signed by
            the parties prior to the commencement of any work covered by the new change order. The order must describe
            the scope of the extra work or change, the cost to be added or subtracted from the contract, and the effect
            the order will have on the schedule of progress payments.
          </Text>
          <Text style={styles.termsText}>
            You, the buyer, may not require a contractor to perform extra or change-order work without providing written
            authorization prior to the commencement of any work covered by the new change order.
          </Text>
          <Text style={styles.termsText}>
            Extra work or a change order is not enforceable against a buyer unless the change order also identifies all
            of the following in writing prior to the commencement of any work covered by the new change order:
          </Text>
          <Text style={styles.termsText}>(i)The scope of work encompassed by the order.</Text>
          <Text style={styles.termsText}>(ii)The amount to be added or subtracted from the contract.</Text>
          <Text style={styles.termsText}>
            (iii)The effect the order will make in the progress payments or the completion date.
          </Text>
          <Text style={styles.termsText}>
            The contractor's failure to comply with the requirements of this paragraph does not preclude the recovery of
            compensation for work performed based upon legal or equitable remedies designed to prevent unjust
            enrichment.
          </Text>
        </View>
      </Page>

      {/* Page 6 - Arbitration and Customer Acknowledgment */}
      <Page size="A4" style={styles.page}>
        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>ARBITRATION OF DISPUTES</Text>
          <Text style={styles.termsArticleTitle}>(In compliance with CA Business and Professions Code 7191)</Text>
          <Text style={styles.termsText}>
            ARBITRATION OF DISPUTES: ANY CONTROVERSY OR CLAIM ARISING OUT OF OR RELATED TO THIS CONTRACT, OR THE BREACH
            THEREOF, SHALL BE SETTLED BY BINDING ARBITRATION BEFORE THE AMERICAN ARBITRATION ASSOCIATION IN ACCORDANCE
            WITH ITS CONSTRUCTION INDUSTRY ARBITRATION RULES, AND JUDGMENT UPON THE AWARD RENDERED BY THE ARBITRATOR(S)
            MAY BE ENTERED IN ANY COURT HAVING JURISDICTION THEREOF. DISCOVERY IN ANY ARBITRATION SHALL BE LIMITED TO
            WHAT IS ALLOWED BY THE APPLICABLE ARBITRATION RULES AND THE ARBITRATOR'S POWERS ARE EXPRESSLY LIMITED TO THE
            APPLICABLE RULES; WHERE THE RULES PROVIDE THAT DISCOVERY OR DEPOSITION MAY BE ALLOWED IN EXTRAORDINARY
            CASES, IN THE INTERESTS OF JUDICIAL ECONOMY, THE ARBITRATOR MAY NOT ORDER DISCOVERY BROADER THAN THAT
            ALLOWED IN A LIMITED CIVIL CASE UNDER CODE OF CIVIL PROCEDURE SECTION 94.
          </Text>
          <Text style={styles.termsText}>
            ANY CLAIM FILED IN SMALL CLAIMS COURT SHALL NOT BE DEEMED TO BE A WAIVER OF THE RIGHT TO ARBITRATE, AND IF A
            COUNTER CLAIM IN EXCESS OF THE JURISDICTION OF THE SMALL CLAIMS COURT IS FILED IN THE MUNICIPAL OR SUPERIOR
            COURT, THEN THE PARTY FILING IN SMALL CLAIMS COURT MAY DEMAND ARBITRATION PURSUANT TO THIS PARAGRAPH.
          </Text>
          <Text style={styles.termsText}>
            NOTICE: BY INITIALING IN THE SPACE BELOW YOU ARE AGREEING TO HAVE ANY DISPUTE ARISING OUT OF THE MATTERS
            INCLUDED IN THE "ARBITRATION OF DISPUTES" PROVISION DECIDED BY NEUTRAL ARBITRATION AS PROVIDED BY CALIFORNIA
            LAW AND YOU ARE GIVING UP ANY RIGHTS YOU MIGHT POSSESS TO HAVE THE DISPUTE LITIGATED IN A COURT OR JURY
            TRIAL. BY INITIALING IN THE SPACE BELOW YOU ARE GIVING UP JUDICIAL RIGHTS TO DISCOVERY AND APPEAL, UNLESS
            THOSE RIGHTS ARE SPECIFICALLY INCLUDED IN THE "ARBITRATION OF DISPUTES" PROVISION. IF YOU REFUSE TO SUBMIT
            TO ARBITRATION AFTER AGREEING TO THIS PROVISION, YOU MAY BE COMPELLED TO ARBITRATE UNDER THE AUTHORITY OF
            THE BUSINESS AND PROFESSIONS CODE OR OTHER APPLICABLE LAWS. YOUR AGREEMENT TO THIS ARBITRATION PROVISION IS
            VOLUNTARY.
          </Text>
          <Text style={styles.termsText}>
            WE HAVE READ AND UNDERSTAND THE FOREGOING AND AGREE TO SUBMIT DISPUTES ARISING OUT OF THE MATTERS INCLUDED
            IN THE "ARBITRATION OF DISPUTES" PROVISION TO NEUTRAL ARBITRATION.
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.termsText}>I AGREE TO ARBITRATION.</Text>
              <View style={styles.initialBox}></View>
              <Text style={styles.fieldLabel}>(Direct Contractor's Initials)</Text>
            </View>
            
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.termsText}>I AGREE TO ARBITRATION.</Text>
              <View style={styles.initialBox}></View>
              <Text style={styles.fieldLabel}>(Owner's Initials)</Text>
            </View>
          </View>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>CUSTOMER ACKNOWLEDGMENT</Text>
          <Text style={[styles.termsText, { marginBottom: 8 }]}>I hereby acknowledge receipt of the following documents or Notices:</Text>
          
          {/* Two-column checkbox layout */}
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={styles.checkboxRow}>
                <View style={styles.checkbox}></View>
                <Text style={styles.termsText}>1. Home Improvement Contract</Text>
              </View>
              <View style={styles.checkboxRow}>
                <View style={styles.checkbox}></View>
                <Text style={styles.termsText}>2. Notice of Arbitration</Text>
              </View>
              <View style={styles.checkboxRow}>
                <View style={styles.checkbox}></View>
                <Text style={styles.termsText}>3. Notice Of Cancellation</Text>
              </View>
              <View style={styles.checkboxRow}>
                <View style={styles.checkbox}></View>
                <Text style={styles.termsText}>4. Three-Day Right to Cancel</Text>
              </View>
              <View style={styles.checkboxRow}>
                <View style={styles.checkbox}></View>
                <Text style={styles.termsText}>5. Five-Day Right to Cancel</Text>
              </View>
            </View>
            
            <View style={{ flex: 1, paddingLeft: 10 }}>
              <View style={styles.checkboxRow}>
                <View style={styles.checkbox}></View>
                <Text style={styles.termsText}>6. Disclosure re: Commercial General Liability Insurance</Text>
              </View>
              <View style={styles.checkboxRow}>
                <View style={styles.checkbox}></View>
                <Text style={styles.termsText}>7. Disclosure re: Workers' Compensation Insurance</Text>
              </View>
              <View style={styles.checkboxRow}>
                <View style={styles.checkbox}></View>
                <Text style={styles.termsText}>8. Statutory Notices</Text>
              </View>
              <View style={styles.checkboxRow}>
                <View style={styles.checkbox}></View>
                <Text style={styles.termsText}>9. Mechanics Lien Warning</Text>
              </View>
            </View>
          </View>
          
          <View style={{ marginTop: 15 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View style={{ width: '30%', textAlign: 'center' }}>
                <Text style={styles.termsText}>_________________________</Text>
                <Text style={[styles.fieldLabel, { textAlign: 'left', marginTop: 2 }]}>(Print Name of Owner)</Text>
              </View>
              
              <View style={{ width: '40%', textAlign: 'center' }}>
                <Text style={styles.termsText}>_________________________________________</Text>
                <Text style={[styles.fieldLabel, { textAlign: 'center', marginTop: 2 }]}>(Owner Sign Here)</Text>
              </View>
              
              <View style={{ width: '20%', textAlign: 'center' }}>
                <Text style={styles.termsText}>________________</Text>
                <Text style={[styles.fieldLabel, { textAlign: 'center', marginTop: 2 }]}>(Date)</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Evergreen Home Upgrades | License #1116631 | (408) 828-7377 | info@evergreenergy.io | www.evergreenenergy.io
          </Text>
        </View>
        <Text style={styles.pageNumber}>Page 6 of 6</Text>
      </Page>
    </Document>
  )
}

export default ProposalPDF