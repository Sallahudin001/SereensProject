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
    fontFamily: "Times-Roman",
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
    marginBottom: 20,
    marginTop: 10,
    paddingTop: 5,
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
    marginBottom: 12,
  },

  // Updated styles for scope items
  scopeServiceContainer: {
    marginBottom: 14,
  },

  scopeServiceTitle: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    marginBottom: 6,
    paddingBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: "#888888",
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },

  scopeServiceDetails: {
    marginLeft: 15,
    marginBottom: 6,
  },

  scopeItemRow: {
    flexDirection: "row",
    marginBottom: 3,
    paddingVertical: 1,
  },

  scopeItemLabel: {
    width: 90,
    fontSize: 10,
    fontFamily: "Times-Bold",
  },

  scopeItemValue: {
    flex: 1,
    fontSize: 10,
    paddingRight: 5,
  },

  scopeItem: {
    fontSize: 10,
    marginBottom: 4,
    flexDirection: "row",
    paddingLeft: 5,
  },

  scopeBullet: {
    width: 12,
    textAlign: "center",
    fontSize: 10,
  },

  scopeItemContent: {
    flex: 1,
    fontSize: 10,
  },

  scopeSubItem: {
    fontSize: 10,
    marginBottom: 3,
    marginLeft: 15,
    flexDirection: "row",
  },

  scopeSubBullet: {
    width: 12,
    textAlign: "center",
    fontSize: 10,
  },

  scopeSubItemContent: {
    flex: 1,
    fontSize: 10,
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

  // Construction Lender section
  constructionLenderSection: {
    marginTop: 15,
    marginBottom: 15,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderWidth: 0.5,
    borderColor: "#000000",
  },

  constructionLenderTitle: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    marginBottom: 8,
  },

  constructionLenderLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
    minHeight: 20,
    marginBottom: 5,
  },

  constructionLenderLabel: {
    fontSize: 8,
    color: "#666666",
    textAlign: "center",
    marginTop: 2,
  },

  // Additional contract sections
  contractSection: {
    marginTop: 12,
    marginBottom: 10,
  },

  contractSectionText: {
    fontSize: 9,
    lineHeight: 1.3,
    textAlign: "justify",
    marginBottom: 5,
  },

  contractSectionTitle: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    marginBottom: 5,
  },

  ownerAgeSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  noticeBoxesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 15,
  },

  noticeBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000000",
    padding: 8,
    marginHorizontal: 2,
  },

  noticeBoxTitle: {
    fontSize: 8,
    fontFamily: "Times-Bold",
    textAlign: "center",
    marginBottom: 5,
    textTransform: "uppercase",
  },

  noticeBoxText: {
    fontSize: 7,
    lineHeight: 1.2,
    textAlign: "justify",
  },

  checkboxContainer: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: "#000000",
    marginRight: 8,
  },

  finalSignatureSection: {
    marginTop: 15,
    padding: 10,
   
  },

  finalSignatureText: {
    fontSize: 9,
    lineHeight: 1.3,
    textAlign: "justify",
    marginBottom: 10,
  },

  signatureLineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },

  xSignature: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    marginRight: 5,
  },

  signatureLineWithLabel: {
    flex: 1,
    marginHorizontal: 5,
  },

  underlineText: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#000000",
    minHeight: 20,
    marginBottom: 2,
  },

  salesmanSection: {
    marginTop: 10,
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
    marginBottom: 3,
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
          <Text style={styles.contractSubtitle}>NOT APPLICABLE TO SWIMMING POOLS OR SPAS</Text>
          <Text style={[styles.contractSubtitle, { fontSize: 10, marginTop: 2 }]}>
            (Complies with Section 7159 of California Business and Professions Code, and Civil Code Section 8170 as amended)
          </Text>
          <Text style={styles.contractSubtitle}>Evergreen Home Upgrades Services Agreement</Text>
          <Text style={[styles.contractSubtitle, { fontSize: 10, marginTop: 2 }]}>
            AGREEMENT BETWEEN DIRECT CONTRACTOR AND PROPERTY OWNER
          </Text>
          <Text style={[styles.contractSubtitle, { fontSize: 9, marginTop: 2 }]}>
            The Notice of Cancellation may be mailed to the address of the direct contractor as shown below:
          </Text>
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



        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Evergreen Home Upgrades | License #1116631 | (408) 828-7377 | info@evergreenergy.io | www.evergreenenergy.io
          </Text>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 1 of 10</Text>
      </Page>

      {/* Page 2 - Scope of Work */}
      <Page size="A4" style={styles.page} wrap={false}>
       

        {/* Article I - Scope of Work */}
        <Text style={[styles.articleNumber,{textAlign:"center"}]}>ARTICLE I - SCOPE OF WORK</Text>
        <Text style={{ fontSize: 8, textAlign: "center", marginTop: 3, marginBottom: 15 }}>
          Contract No: {proposal?.proposalNumber || "N/A"} | Customer: {proposal?.customer?.name || "N/A"}
        </Text>
        <Text style={styles.termsText}>
          Contractor agrees to furnish all labor, materials, equipment, and services necessary to complete the work
          described herein in accordance with the terms and conditions of this Contract.
        </Text>

        {proposal?.services?.map((service: string, index: number) => {
          const productData = proposal.products[service]
          if (!productData) return null

          // Calculate approximate height needed for this service section
          const serviceHeight = 300 // Base height in points
          
          return (
            <View key={index} style={[styles.scopeContainer]} wrap={false}>
              <View style={{ marginBottom: 6 }}>
              <Text style={styles.scopeTitle}>
                {service.charAt(0).toUpperCase() + service.slice(1).replace(/-/g, " & ")} Installation
              </Text>
              <View style={styles.scopeDivider} />
              </View>

              {/* Service-specific details with improved layout */}
                              {service === "windows-doors" && (
                <View>
                  {/* Product Specifications - Horizontal Layout */}
                  <View style={styles.scopeServiceContainer} wrap={false}>
                    <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#888888', paddingBottom: 2, marginBottom: 8 }}>
                      <Text style={[styles.scopeServiceTitle, { textTransform: 'uppercase', letterSpacing: 0.2, borderBottomWidth: 0 }]}>
                        Product Specifications
                      </Text>
                    </View>
                    
                    {/* Windows and Doors side by side */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {/* Left Column - Windows */}
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                          • Window Installation:
                        </Text>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Type:</Text>
                          <Text style={styles.scopeItemValue}>{productData.windowType?.replace(/-/g, " ") || "Standard Windows"}</Text>
                        </View>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Material:</Text>
                          <Text style={styles.scopeItemValue}>{productData.windowMaterial || "Vinyl"} frame construction</Text>
                        </View>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Color:</Text>
                          <Text style={styles.scopeItemValue}>{productData.windowColor || "White"} factory-finished</Text>
                        </View>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Energy Rating:</Text>
                          <Text style={styles.scopeItemValue}>{productData.energyRating || "Energy Star"} certified efficiency</Text>
                        </View>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Quantity:</Text>
                          <Text style={styles.scopeItemValue}>{productData.windowCount || "0"} unit(s)</Text>
                        </View>
                      </View>
                      
                      {/* Right Column - Doors if applicable */}
                      {productData.hasDoors && (
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                            • Door Installation:
                          </Text>
                          <View style={styles.scopeItemRow}>
                            <Text style={styles.scopeItemLabel}>Type:</Text>
                            <Text style={styles.scopeItemValue}>{productData.doorType?.replace(/-/g, " ") || "Standard Doors"}</Text>
                          </View>
                          <View style={styles.scopeItemRow}>
                            <Text style={styles.scopeItemLabel}>Quantity:</Text>
                            <Text style={styles.scopeItemValue}>{productData.doorCount || "1"} unit(s)</Text>
                          </View>
                          {/* Add empty rows to balance columns */}
                          <View style={{ height: 20 }}></View>
                          <View style={{ height: 20 }}></View>
                          <View style={{ height: 20 }}></View>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Installation and Additional Information - Horizontal Layout */}
                  <View style={styles.scopeServiceContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {/* Left Column - Installation Process */}
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                          • Installation Process:
                        </Text>
                        <View style={{ paddingLeft: 5, paddingTop: 2 }}>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Careful removal and proper disposal of existing windows/doors</Text>
                          </View>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Professional installation with industry-standard sealing and caulking</Text>
                          </View>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Custom measurement and fitting to ensure proper alignment</Text>
                          </View>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Thorough clean-up and debris removal upon completion</Text>
                          </View>
                        </View>
                      </View>

                      {/* Right Column - Additional Specifications */}
                      {productData.scopeNotes && (
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                            • Additional Specifications:
                          </Text>
                          <View style={{ paddingLeft: 5, paddingTop: 2 }}>
                            {productData.scopeNotes.split(";").map((note: string, i: number) => (
                              <View key={i} style={styles.scopeSubItem}>
                                <Text style={styles.scopeSubBullet}>•</Text>
                                <Text style={styles.scopeSubItemContent}>{note.trim()}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}

                              {service === "hvac" && (
                <View>
                  {/* HVAC System - Horizontal Layout */}
                  <View style={styles.scopeServiceContainer}>
                    <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#888888', paddingBottom: 2, marginBottom: 8 }}>
                      <Text style={[styles.scopeServiceTitle, { textTransform: 'uppercase', letterSpacing: 0.2, borderBottomWidth: 0 }]}>
                        HVAC System Specifications
                      </Text>
                    </View>
                    
                    {/* HVAC Details - Horizontal layout */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {/* Left Column - System Specs */}
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                          • System Specifications:
                        </Text>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>System Type:</Text>
                          <Text style={styles.scopeItemValue}>{productData.systemType?.replace(/-/g, " ") || "Complete HVAC"} system</Text>
                        </View>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>SEER Rating:</Text>
                          <Text style={styles.scopeItemValue}>{productData.seerRating || "N/A"} (Seasonal Energy Efficiency Ratio)</Text>
                        </View>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Capacity:</Text>
                          <Text style={styles.scopeItemValue}>{productData.tonnage || "N/A"} tons cooling capacity</Text>
                        </View>
                      </View>
                      
                      {/* Right Column - Brand/Model */}
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                          • Manufacturer Details:
                        </Text>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Manufacturer:</Text>
                          <Text style={styles.scopeItemValue}>{productData.brand || "N/A"}</Text>
                        </View>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Model Series:</Text>
                          <Text style={styles.scopeItemValue}>{productData.model || "N/A"}</Text>
                        </View>
                        <View style={{ height: 20 }}></View>
                      </View>
                    </View>
                  </View>

                  {/* Components and Installation Notes - Horizontal Layout */}
                  <View style={styles.scopeServiceContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {/* Left Column - HVAC Components */}
                      {productData.addons?.length > 0 && (
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                            • System Components:
                          </Text>
                          <View style={{ paddingLeft: 5, paddingTop: 2 }}>
                            {productData.addons.map((addon: string, i: number) => (
                              <View key={i} style={styles.scopeSubItem}>
                                <Text style={styles.scopeSubBullet}>•</Text>
                                <Text style={styles.scopeSubItemContent}>{addon}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                      
                      {/* Right Column - Installation Notes */}
                      {productData.scopeNotes && (
                        <View style={{ flex: 1, marginLeft: productData.addons?.length > 0 ? 10 : 0 }}>
                          <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                            • Installation Notes:
                          </Text>
                          <View style={{ paddingLeft: 5, paddingTop: 2 }}>
                            {productData.scopeNotes.split(";").map((note: string, i: number) => (
                              <View key={i} style={styles.scopeSubItem}>
                                <Text style={styles.scopeSubBullet}>•</Text>
                                <Text style={styles.scopeSubItemContent}>{note.trim()}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}

                              {service === "roofing" && (
                <View>
                  {/* Roofing - Horizontal Layout */}
                  <View style={styles.scopeServiceContainer}>
                    <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#888888', paddingBottom: 2, marginBottom: 8 }}>
                      <Text style={[styles.scopeServiceTitle, { textTransform: 'uppercase', letterSpacing: 0.2, borderBottomWidth: 0 }]}>
                        Roofing Specifications
                      </Text>
                    </View>
                    
                    {/* Materials and Add-ons - Horizontal layout */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {/* Left Column - Materials */}
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                          • Materials & Coverage:
                        </Text>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Material:</Text>
                          <Text style={styles.scopeItemValue}>{productData.material || "Architectural shingles"}</Text>
                        </View>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Coverage Area:</Text>
                          <Text style={styles.scopeItemValue}>{productData.squareCount || "N/A"} squares (100 sq. ft. per square)</Text>
                        </View>
                      </View>
                      
                      {/* Right Column - Add-ons */}
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                          • Additional Components:
                        </Text>
                        {productData.addGutters && (
                          <View style={styles.scopeItemRow}>
                            <Text style={styles.scopeItemLabel}>Gutter System:</Text>
                            <Text style={styles.scopeItemValue}>{productData.gutterLength || "N/A"} linear feet with downspouts</Text>
                          </View>
                        )}
                        {productData.addPlywood && (
                          <View style={styles.scopeItemRow}>
                            <Text style={styles.scopeItemLabel}>Decking:</Text>
                            <Text style={styles.scopeItemValue}>{productData.plywoodPercentage || "100"}% replacement of roof decking as needed</Text>
                          </View>
                        )}
                        {!productData.addGutters && !productData.addPlywood && (
                          <View style={styles.scopeItemRow}>
                            <Text style={styles.scopeItemLabel}>Standard:</Text>
                            <Text style={styles.scopeItemValue}>Drip edge, flashing, and ridge venting included</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Installation and Notes - Horizontal Layout */}
                  <View style={styles.scopeServiceContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {/* Left Column - Installation Process */}
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                          • Installation Process:
                        </Text>
                        <View style={{ paddingLeft: 5, paddingTop: 2 }}>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Complete removal and proper disposal of existing roofing materials</Text>
                          </View>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Thorough inspection and replacement of damaged decking as necessary</Text>
                          </View>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Installation of premium synthetic underlayment for enhanced protection</Text>
                          </View>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Application of ice and water shield in valleys and around roof penetrations</Text>
                          </View>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Installation of new {productData.material || "shingles"} according to manufacturer specifications</Text>
                          </View>
                        </View>
                      </View>

                      {/* Right Column - Additional Notes */}
                      {productData.scopeNotes && (
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                            • Additional Notes:
                          </Text>
                          <View style={{ paddingLeft: 5, paddingTop: 2 }}>
                            {productData.scopeNotes.split(";").map((note: string, i: number) => (
                              <View key={i} style={styles.scopeSubItem}>
                                <Text style={styles.scopeSubBullet}>•</Text>
                                <Text style={styles.scopeSubItemContent}>{note.trim()}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}

                              {service === "garage-doors" && (
                <View>
                  {/* Garage Door - Horizontal Layout */}
                  <View style={styles.scopeServiceContainer}>
                    <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#888888', paddingBottom: 2, marginBottom: 8 }}>
                      <Text style={[styles.scopeServiceTitle, { textTransform: 'uppercase', letterSpacing: 0.2, borderBottomWidth: 0 }]}>
                        Garage Door Specifications
                      </Text>
                    </View>
                    
                    {/* Door Specs - Horizontal layout */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {/* Left Column - Door Details */}
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                          • Door Specifications:
                        </Text>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Model Series:</Text>
                          <Text style={styles.scopeItemValue}>{productData.model || "T50L"} professional-grade door</Text>
                        </View>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Dimensions:</Text>
                          <Text style={styles.scopeItemValue}>{productData.width || "16"}' Width × {productData.height || "7"}' Height</Text>
                        </View>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Units:</Text>
                          <Text style={styles.scopeItemValue}>{productData.quantity || "1"} door unit(s)</Text>
                        </View>
                      </View>
                      
                      {/* Right Column - Add-ons */}
                      {productData.addons?.length > 0 && (
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                            • Premium Add-ons:
                          </Text>
                          <View style={{ paddingLeft: 5, paddingTop: 2 }}>
                            {productData.addons.map((addon: string, i: number) => (
                              <View key={i} style={styles.scopeSubItem}>
                                <Text style={styles.scopeSubBullet}>•</Text>
                                <Text style={styles.scopeSubItemContent}>{addon}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Installation and Notes - Horizontal Layout */}
                  <View style={styles.scopeServiceContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {/* Left Column - Installation Process */}
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                          • Installation Process:
                        </Text>
                        <View style={{ paddingLeft: 5, paddingTop: 2 }}>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Safe removal and proper disposal of existing garage door system</Text>
                          </View>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Complete professional installation with all required hardware and mounting accessories</Text>
                          </View>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Precision track alignment and spring system installation for smooth operation</Text>
                          </View>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Comprehensive safety testing and operational adjustments</Text>
                          </View>
                        </View>
                      </View>

                      {/* Right Column - Additional Notes */}
                      {productData.scopeNotes && (
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                            • Additional Notes:
                          </Text>
                          <View style={{ paddingLeft: 5, paddingTop: 2 }}>
                            {productData.scopeNotes.split(";").map((note: string, i: number) => (
                              <View key={i} style={styles.scopeSubItem}>
                                <Text style={styles.scopeSubBullet}>•</Text>
                                <Text style={styles.scopeSubItemContent}>{note.trim()}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}

                              {service === "paint" && (
                <View>
                  {/* Paint Service - Horizontal Layout */}
                  <View style={styles.scopeServiceContainer}>
                    <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#888888', paddingBottom: 2, marginBottom: 8 }}>
                      <Text style={[styles.scopeServiceTitle, { textTransform: 'uppercase', letterSpacing: 0.2, borderBottomWidth: 0 }]}>
                        Professional Painting Specifications
                      </Text>
                    </View>
                    
                    {/* Project and Materials - Horizontal layout */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {/* Left Column - Project Details */}
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                          • Project Specifications:
                        </Text>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Service Type:</Text>
                          <Text style={styles.scopeItemValue}>{productData.serviceType || "Exterior"} professional painting service</Text>
                        </View>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Coverage Area:</Text>
                          <Text style={styles.scopeItemValue}>{productData.squareFootage || "0"} square feet of surface area</Text>
                        </View>
                        <View style={styles.scopeItemRow}>
                          <Text style={styles.scopeItemLabel}>Color Scheme:</Text>
                          <Text style={styles.scopeItemValue}>{productData.colorTone || "1"}-tone professional finish</Text>
                        </View>
                      </View>
                      
                      {/* Right Column - Materials */}
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                          • Included Materials:
                        </Text>
                        <View style={{ paddingLeft: 5, paddingTop: 2 }}>
                          {productData.includePaint && (
                            <View style={styles.scopeSubItem}>
                              <Text style={styles.scopeSubBullet}>•</Text>
                              <Text style={styles.scopeSubItemContent}>Premium-grade paint materials with color-matching</Text>
                            </View>
                          )}
                          {productData.includePrimer && (
                            <View style={styles.scopeSubItem}>
                              <Text style={styles.scopeSubBullet}>•</Text>
                              <Text style={styles.scopeSubItemContent}>Professional-grade primer for superior adhesion</Text>
                            </View>
                          )}
                          {productData.includePrep && (
                            <View style={styles.scopeSubItem}>
                              <Text style={styles.scopeSubBullet}>•</Text>
                              <Text style={styles.scopeSubItemContent}>Comprehensive surface preparation and cleaning</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Process and Notes - Horizontal Layout */}
                  <View style={styles.scopeServiceContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      {/* Left Column - Application Process */}
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                          • Application Process:
                        </Text>
                        <View style={{ paddingLeft: 5, paddingTop: 2 }}>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Thorough surface preparation including cleaning, scraping, and sanding as needed</Text>
                          </View>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>High-pressure washing of exterior surfaces to ensure proper adhesion</Text>
                          </View>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Professional repair of minor surface imperfections and damage</Text>
                          </View>
                          <View style={styles.scopeSubItem}>
                            <Text style={styles.scopeSubBullet}>•</Text>
                            <Text style={styles.scopeSubItemContent}>Precision application of primer and paint using industry-best practices</Text>
                          </View>
                        </View>
                      </View>

                      {/* Right Column - Additional Notes */}
                      {productData.scopeNotes && (
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={{ fontSize: 11, fontFamily: "Times-Bold", borderBottomWidth: 0.5, borderBottomColor: '#aaaaaa', paddingBottom: 3, marginBottom: 5 }}>
                            • Additional Notes:
                          </Text>
                          <View style={{ paddingLeft: 5, paddingTop: 2 }}>
                            {productData.scopeNotes.split(";").map((note: string, i: number) => (
                              <View key={i} style={styles.scopeSubItem}>
                                <Text style={styles.scopeSubBullet}>•</Text>
                                <Text style={styles.scopeSubItemContent}>{note.trim()}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}
            </View>
          )
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Evergreen Home Upgrades | License #1116631 | (408) 828-7377 | info@evergreenergy.io | www.evergreenenergy.io
          </Text>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 2 of 10</Text>
      </Page>

      {/* Page 3 - Construction Lender, Contract Price and Contract Execution */}
      <Page size="A4" style={styles.page}>
       

        {/* Construction Lender Section */}
        <View style={styles.constructionLenderSection}>
          <Text style={styles.constructionLenderTitle}>
            CONSTRUCTION LENDER: ________________________________________________________________
          </Text>
          <Text style={styles.constructionLenderLabel}>
            (Name and Address of Construction Fund Holder)
          </Text>
          
          <View style={{ marginTop: 15 }}>
            <Text style={styles.constructionLenderTitle}>
              Substantial commencement of work under this contract is described as: ________________________________________________
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
            <View style={{ flex: 1, marginRight: 20 }}>
              <Text style={styles.constructionLenderTitle}>
                Approximate Start Date: _________________________________
              </Text>
              <Text style={styles.constructionLenderLabel}>
                (Work will begin)
              </Text>
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={styles.constructionLenderTitle}>
                Approximate Completion Date: _________________________________
              </Text>
              <Text style={styles.constructionLenderLabel}>
                (Work is to be completed)
              </Text>
            </View>
          </View>
        </View>

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

        {/* Contract Execution Section - Positioned before footer */}
        <View style={[styles.signatureSection, { position: 'absolute', bottom: 20, left: 30, right: 30 }]}>
          <Text style={styles.signatureTitle}>Contract Execution</Text>

          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <Text style={[styles.contractSectionText, { fontSize: 10 }]}>______________________________________</Text>
              <Text style={styles.signatureLabel}>Homeowner Signature</Text>
              <Text style={styles.signatureLabel}>{proposal?.customer?.name || "N/A"}</Text>
            </View>

            <View style={styles.signatureBlock}>
              <Text style={[styles.contractSectionText, { fontSize: 10 }]}>______________________________________</Text>
              <Text style={styles.signatureLabel}>Contractor Signature</Text>
              <Text style={styles.signatureLabel}>Evergreen Home Upgrades</Text>
            </View>
          </View>

          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <Text style={[styles.contractSectionText, { fontSize: 10 }]}>______________________________________</Text>
              <Text style={styles.signatureLabel}>Date</Text>
            </View>

            <View style={styles.signatureBlock}>
              <Text style={[styles.contractSectionText, { fontSize: 10 }]}>______________________________________</Text>
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
        <Text style={styles.pageNumber}>Page 3 of 10</Text>
      </Page>

      {/* Payment Terms Page */}
      <Page size="A4" style={styles.page}>
        

        {/* Article III - Payment Terms */}
        <Text style={[styles.articleNumber,{textAlign:"center"}]}>ARTICLE III - PAYMENT TERMS</Text>
        <Text style={{ fontSize: 8, textAlign: "center", marginTop: 3 }}>
            Contract No: {proposal?.proposalNumber || "N/A"} | Customer: {proposal?.customer?.name || "N/A"}
          </Text> 
          <View style={styles.termsHeader}></View>

        <View style={styles.paymentTerms}>
          <Text style={styles.paymentTermsTitle}>Payment Terms</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={{ flex: 1, marginRight: 20 }}>
              <Text style={styles.constructionLenderTitle}>
                CONTRACT PRICE: $ ________________________________
          </Text>
              <Text style={styles.constructionLenderLabel}>
                (Owner agrees to pay Contractor total cash price)
          </Text>
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={styles.constructionLenderTitle}>
                DOWN PAYMENT: $ ________________________________
          </Text>
              <Text style={styles.constructionLenderLabel}>
                (If any; if not applicable, put "none")
              </Text>
            </View>
          </View>
          
          <Text style={[styles.constructionLenderTitle, { fontSize: 10, marginBottom: 8 }]}>
            THE DOWN PAYMENT MAY NOT EXCEED $1,000 OR 10 PERCENT OF THE CONTRACT PRICE, WHICHEVER IS LESS.
          </Text>
          
          <Text style={styles.constructionLenderTitle}>
            FINANCE CHARGE $ _______________________________________
          </Text>
          <Text style={styles.constructionLenderLabel}>
            (Must be stated separately from the contract amount in dollars and cents; if none, put "none")
          </Text>
          
          <View style={{ marginTop: 15 }}>
            <Text style={[styles.constructionLenderTitle, { fontSize: 10, marginBottom: 8 }]}>
              SCHEDULE OF PROGRESS PAYMENTS: The schedule of progress payments must specifically describe each phase of work, including the type and amount of work or services scheduled to be supplied in each phase, along with the amount of each proposed progress payment. IT IS AGAINST THE LAW FOR A CONTRACTOR TO COLLECT PAYMENT FOR WORK NOT YET COMPLETED, OR FOR MATERIALS NOT YET DELIVERED. HOWEVER, A CONTRACTOR MAY REQUIRE A DOWN PAYMENT.
            </Text>
          </View>

          {/* Progress Payment Schedule Table */}
          <View style={{ marginTop: 10, marginBottom: 15 }}>
            {/* Table Headers */}
            <View style={{ flexDirection: 'row', marginBottom: 5 }}>
              <View style={{ flex: 0.5 }}></View>
              <View style={{ flex: 3, alignItems: 'center' }}>
                <Text style={[styles.constructionLenderLabel, { fontSize: 7 }]}>
                  (Work or Services to be Performed or Materials to be Supplied)
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.constructionLenderLabel, { fontSize: 7 }]}>
                  (Date)
                </Text>
              </View>
            </View>

            {/* Table Rows */}
            {[1, 2, 3, 4].map((num) => (
              <View key={num} style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 }}>
                <View style={{ flex: 0.3, alignItems: 'flex-start' }}>
                  <Text style={[styles.constructionLenderTitle, { fontSize: 11 }]}>
                    {num}.
                  </Text>
                </View>
                <View style={{ flex: 0.7, alignItems: 'flex-start' }}>
                  <Text style={[styles.contractSectionText, { fontSize: 10 }]}>$___________</Text>
                </View>
                <View style={{ flex: 3, marginRight: 15, marginLeft: 10 }}>
                  <Text style={[styles.contractSectionText, { fontSize: 10 }]}>___________________________________________________________</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.contractSectionText, { fontSize: 10 }]}>_________________</Text>
                </View>
              </View>
            ))}

            <Text style={[styles.constructionLenderLabel, { fontSize: 7, marginTop: 10, textAlign: 'center' }]}>
              (If necessary, continue the description of the work on an additional attachment page and describe the{'\n'}
              attachment in the section below entitled, "List of Documents to be Incorporated into the Contract.")
            </Text>
          </View>

          {proposal?.pricing?.financingTerm && (
            <View style={{ marginTop: 15, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: "#cccccc" }}>
              <Text style={[styles.paymentSchedule, { fontFamily: "Times-Bold" }]}>
                Financing Available: {proposal.pricing.financingTerm} months at {proposal.pricing.interestRate}% APR
              </Text>
              {proposal.pricing.financingPlanName && (
                <Text style={styles.paymentSchedule}>Plan: {proposal.pricing.financingPlanName}</Text>
              )}
            </View>
          )}
        </View>

        {/* Release Section */}
       
        <View style={styles.contractSection}>
          <Text style={styles.contractSectionTitle}>Release.</Text>
          <Text style={styles.contractSectionText}>
            Upon satisfactory payment being made for any portion of the work performed, the Contractor shall, prior to any further payment being made, furnish to each person contracting for the home improvement work a full and unconditional release from any claim or mechanic's lien for the portion of the work for which payment has been made pursuant to Sections 8400 and 8404 of the Civil Code for that portion of the work for which payment has been made.
          </Text>
        </View>
     
        {/* Allowances Section */}
        <View style={styles.contractSection}>
          <Text style={styles.contractSectionTitle}>Allowances:</Text>
          <Text style={styles.contractSectionText}>
            The following items or specific prices as indicated are included in the contract price as allowances. The contract price shall be adjusted upward or downward based on actual amounts rather than estimated amounts herein.
          </Text>
           <Text style={styles.constructionLenderTitle}>
              ________________________________
              </Text>
        </View>

        {/* List of Documents Section */}
        <View style={styles.contractSection}>
          <Text style={styles.contractSectionTitle}>List of Documents to be Incorporated into the Contract:</Text>
          <Text style={styles.contractSectionText}>
            Notice of Cancellation; Arbitration of Disputes; Three-Day Right to Cancel; Five-Day Right to Cancel; Mechanics Lien Warning; Information about Contractor's State License Board.
          </Text>
          <Text style={styles.constructionLenderTitle}>
              ________________________________
              </Text>
        </View>

        {/* Insurance Notice */}
        <View style={styles.contractSection}>
          <Text style={styles.contractSectionText}>
            A notice concerning commercial general liability insurance and workers' compensation insurance is attached to this contract. Owner acknowledges receipt of a fully completed copy of this agreement and all documents listed above:
          </Text>
          
          <Text style={[styles.constructionLenderLabel, { textAlign: "right", marginTop: 5 }]}>
            (Property Owner's Initials)
          </Text>
        </View>

        {/* Owner Age Section */}
        <View style={styles.ownerAgeSection}>
          <Text style={styles.contractSectionText}>Owner affirms their age(s) is/are: <Text style={styles.constructionLenderTitle}>
              ________________________________;_______________________________
              </Text></Text>
          <View style={styles.constructionLenderLine}></View>
          <View style={styles.constructionLenderLine}></View>
        </View>
        
        <Text style={[styles.contractSectionText, { color: "#dc2626",  textAlign:"center" }]}>
            Initial the appropriate box below:
        </Text>
        
        {/* Notice Boxes */}
        <View style={styles.noticeBoxesContainer}>
          <View style={styles.noticeBox}>
            <View style={styles.checkboxContainer}></View>
            <Text style={styles.noticeBoxTitle}>NOTICE OF RIGHT TO CANCEL</Text>
            <Text style={styles.noticeBoxTitle}>3-DAY</Text>
            <Text style={styles.noticeBoxText}>
              The law requires that the contractor give you a notice explaining your right to cancel. Initial the checkbox if the contractor has given you a "Notice of the Three-Day Right to Cancel."
            </Text>
          </View>

          <View style={styles.noticeBox}>
            <View style={styles.checkboxContainer}></View>
            <Text style={styles.noticeBoxTitle}>NOTICE OF RIGHT TO CANCEL</Text>
            <Text style={styles.noticeBoxTitle}>5-DAY (owners 65 and over)</Text>
            <Text style={styles.noticeBoxText}>
              The law requires that the contractor give you a notice explaining your right to cancel. Initial the checkbox if the contractor has given you a "Notice of the Five-Day Right to Cancel."
            </Text>
          </View>

          <View style={styles.noticeBox}>
            <View style={styles.checkboxContainer}></View>
            <Text style={styles.noticeBoxTitle}>ARBITRATION OF DISPUTES</Text>
            <Text style={styles.noticeBoxText}>
              OWNER: Initial this box if you agree to arbitration. Review the "Arbitration of Disputes" section attached.
            </Text>
          </View>
        </View>

        {/* Final Signature Section */}
        <View style={styles.finalSignatureSection}>
          <Text style={styles.finalSignatureText}>
            You are entitled to a completely filled in copy of this agreement, signed by both you and the contractor, before any work may be started.
          </Text>
          <Text style={styles.finalSignatureText}>
            You (the owner or tenant) have the right to require the Contractor to have a performance and payment bond; however, the Contractor can charge you for the costs of procuring a bond.
          </Text>

          {/* First signature row */}
          <View style={{ marginBottom: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 5 }}>
              <Text style={styles.xSignature}>X</Text>
              <View style={{ flex: 2, marginRight: 20 }}>
                <Text style={[styles.contractSectionText, { fontSize: 10 }]}>______________________________________</Text>
              </View>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.contractSectionText, { fontSize: 10 }]}>___________________</Text>
              </View>
              <View style={{ flex: 2 }}>
                <Text style={[styles.contractSectionText, { fontSize: 10 }]}>______________________________________</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', fontSize: 7 }}>
              <View style={{ flex: 0.2 }}></View>
              <View style={{ flex: 2, marginRight: 20 }}>
                <Text style={[styles.constructionLenderLabel, { textAlign: "left", fontSize: 7 }]}>
                  (Owner Sign Here — Read notice on{'\n'}Arbitration, Mechanics Lien Warning)
                </Text>
              </View>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.constructionLenderLabel, { textAlign: "center", fontSize: 7 }]}>
                  (Date)
                </Text>
              </View>
              <View style={{ flex: 2 }}>
                <Text style={[styles.constructionLenderLabel, { textAlign: "center", fontSize: 7 }]}>
                  (Direct Contractor's Firm Name)
                </Text>
              </View>
            </View>
          </View>

          {/* Second signature row */}
          <View style={{ marginBottom: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 5 }}>
              <Text style={styles.xSignature}>X</Text>
              <View style={{ flex: 2, marginRight: 20 }}>
                <Text style={[styles.contractSectionText, { fontSize: 10 }]}>______________________________________</Text>
              </View>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.contractSectionText, { fontSize: 10 }]}>___________________</Text>
              </View>
              <View style={{ flex: 2 }}>
                <Text style={[styles.contractSectionText, { fontSize: 10 }]}>______________________________________</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', fontSize: 7 }}>
              <View style={{ flex: 0.2 }}></View>
              <View style={{ flex: 2, marginRight: 20 }}>
                <Text style={[styles.constructionLenderLabel, { textAlign: "left", fontSize: 7 }]}>
                  (If more than one Owner, please Sign Here)
                </Text>
              </View>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.constructionLenderLabel, { textAlign: "center", fontSize: 7 }]}>
                  (Date)
                </Text>
              </View>
              <View style={{ flex: 2 }}>
                <Text style={[styles.constructionLenderLabel, { textAlign: "center", fontSize: 7 }]}>
                  (Direct Contractor or Agent Sign Here)        
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.salesmanSection}>
            <Text style={styles.contractSectionText}>Salesman who solicited or negotiated contract:</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
              <View style={{ flex: 1, marginRight: 20 }}>
                <Text style={styles.contractSectionText}>Name:</Text>
                <Text style={[styles.contractSectionText, { fontSize: 10 }]}>______________________________________</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contractSectionText}>State Registration Number:</Text>
                <Text style={[styles.contractSectionText, { fontSize: 10 }]}>______________________________________</Text>
              </View>
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
        <Text style={styles.pageNumber}>Page 4 of 10</Text>
      </Page>

      {/* Terms and Conditions Page */}
      <Page size="A4" style={styles.termsPage}>
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
            coverings, paint, tile, cabinetry, or any other improvements that may be affected by normal construction
            activities. Owner acknowledges that the work to be performed may result in damage to existing improvements
            and agrees to hold Contractor harmless for any such damage. Contractor agrees to conduct operations in a
            manner that will minimize damage to existing improvements.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>13. Assignment</Text>
          <Text style={styles.termsText}>
            This Agreement and all the rights and obligations hereunder may not be assigned by Owner without the prior
            written consent of Contractor. Contractor may assign this Agreement and the Owner hereby consents to such
            assignment.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>14. Integration</Text>
          <Text style={styles.termsText}>
            This Agreement represents the entire contract between the parties. The Owner acknowledges that he or she has
            read and understood all the terms and conditions contained in this Contract, including all articles on both pages.
          </Text>
        </View>

        <View style={styles.termsArticle}>
          <Text style={styles.termsArticleTitle}>15. Entire Agreement</Text>
          <Text style={styles.termsText}>
            This contract constitutes the complete agreement between the parties and supersedes all prior negotiations,
            representations, or agreements relating to the subject matter of this contract. This contract may be
            modified only by written agreement of both parties.
          </Text>
        </View>

        {/* Footer for terms page */}
        <View style={styles.footer}>
          <Text>
            Evergreen Home Upgrades | License #1116631 | (408) 828-7377 | info@evergreenergy.io | www.evergreenenergy.io
          </Text>
        </View>

       

        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 5 of 10</Text>
      </Page>

      {/* Three-Day Right to Cancel Page */}
      <Page size="A4" style={styles.termsPage}>
        <View style={styles.termsHeader}>
          <Text style={styles.termsTitle}>THREE-DAY RIGHT TO CANCEL</Text>
          <Text style={{ fontSize: 8, textAlign: "center", marginTop: 3 }}>
            Contract No: {proposal?.proposalNumber || "N/A"} | Customer: {proposal?.customer?.name || "N/A"}
          </Text>
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
              <Text style={[styles.fieldLabel, { marginRight: 120 }]}>(Date)</Text>
            </View>
          </View>
        </View>

        <View style={styles.termsArticle}>
          <View>
            <Text style={styles.termsText}>I, ____________________________________________________ hereby acknowledge that on ______________ I was provided this document</Text>
            <View style={{ flexDirection: 'row', justifyContent: "space-around" }}>
              <Text style={[styles.fieldLabel, { marginRight: 20 }]}>(Owner)</Text>
              <Text style={[styles.fieldLabel, { marginRight: 1 }]}>(Date)</Text>
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
        <Text style={styles.pageNumber}>Page 6 of 10</Text>
      </Page>

      {/* Five-Day Right to Cancel Page */}
      <Page size="A4" style={styles.termsPage}>
        <View style={styles.termsHeader}>
          <Text style={styles.termsTitle}>FIVE-DAY RIGHT TO CANCEL (For owners 65 and over)</Text>
          <Text style={{ fontSize: 8, textAlign: "center", marginTop: 3 }}>
            Contract No: {proposal?.proposalNumber || "N/A"} | Customer: {proposal?.customer?.name || "N/A"}
          </Text>
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
              <Text style={[styles.fieldLabel, { marginRight: 120 }]}>(Date)</Text>
            </View>
          </View>
        </View>

        <View style={styles.termsArticle}>
          <View>
            <Text style={styles.termsText}>I, ____________________________________________________ hereby acknowledge that on ______________ I was provided this document</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Text style={[styles.fieldLabel, { marginRight: 20 }]}>(Owner)</Text>
              <Text style={[styles.fieldLabel, { marginRight: 1 }]}>(Date)</Text>
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
        <Text style={styles.pageNumber}>Page 7 of 10</Text>
      </Page>

      {/* Mechanics Lien Warning Page */}
      <Page size="A4" style={styles.termsPage}>
        <View style={styles.termsHeader}>
          <Text style={styles.termsTitle}>MECHANICS LIEN WARNING</Text>
          <Text style={{ fontSize: 8, textAlign: "center", marginTop: 3 }}>
            Contract No: {proposal?.proposalNumber || "N/A"} | Customer: {proposal?.customer?.name || "N/A"}
          </Text>
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
        <Text style={styles.pageNumber}>Page 8 of 10</Text>
      </Page>

      {/* Insurance and Arbitration Page */}
      <Page size="A4" style={styles.termsPage}>
        <View style={styles.termsArticle}>
          <Text style={[styles.termsArticleTitle,{textAlign:"center"}]}>WORKERS' COMPENSATION INSURANCE</Text>
          <Text style={{ fontSize: 8, textAlign: "center", marginTop: 3 }}>
            Contract No: {proposal?.proposalNumber || "N/A"} | Customer: {proposal?.customer?.name || "N/A"}
          </Text>
          <View style={styles.termsHeader}></View>
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
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Evergreen Home Upgrades | License #1116631 | (408) 828-7377 | info@evergreenergy.io | www.evergreenenergy.io
          </Text>
        </View>
        
        {/* Page Number */}
        <Text style={styles.pageNumber}>Page 9 of 10</Text>
      </Page>

      {/* Page 10 - Arbitration and Customer Acknowledgment */}
      <Page size="A4" style={styles.page}>
        <View style={styles.termsArticle}>
          <Text style={[styles.termsArticleTitle,{textAlign:"center"}]}>ARBITRATION OF DISPUTES</Text>
          <Text style={{ fontSize: 8, textAlign: "center", marginTop: 3 }}>
            Contract No: {proposal?.proposalNumber || "N/A"} | Customer: {proposal?.customer?.name || "N/A"}
          </Text>
          <View style={styles.termsHeader}></View>
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
        <Text style={styles.pageNumber}>Page 10 of 10</Text>
      </Page>
    </Document>
  )
}

export default ProposalPDF