"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface RoofingData {
  material: string
  addGutters: boolean
  gutterLength: string
  addPlywood: boolean
  plywoodPercentage: string
  totalPrice: string
  squareCount: string
  gutterPrice: string
  pricePerSquare: string
  downspoutCount: string
  downspoutPrice: string
  showPricePerSquare: boolean
  showPriceBreakdown: boolean
  showPricing: boolean
  scopeNotes: string
}

interface RoofingProductFormProps {
  data: RoofingData
  updateData: (data: RoofingData) => void
}

export default function RoofingProductForm({ data, updateData }: RoofingProductFormProps) {
  const hasUpdatedRef = useRef(false)

  // Generate scope notes function
  function generateScopeNotes(material: string, gutters: boolean, addPlywood: boolean, plywoodPercentage: string): string {
    let notes = `Complete roof replacement with ${material === "shingles" ? "architectural shingles" : material} including:
- Removal of existing roofing material down to the deck
- Inspection and replacement of damaged decking (if necessary)
- Installation of synthetic underlayment
- Installation of ice and water shield in valleys and around penetrations
- Installation of new ${material === "shingles" ? "architectural shingles" : material}
- Installation of ridge vents for proper attic ventilation
- Complete cleanup and haul away of all debris
- Please note that if you can see your roof sheathing under your eaves and it is not 3/4" thick or more, you will see the nail points penetrating your deck after the new roof installation is complete. The manufacturer specs and building codes require a minimum of 3/4" penetration for all nails into the wood roof sheathing for the proper wind resistance. With most roof sheathing this results in through penetration and visible nail tips along the eaves.`

    if (addPlywood) {
      notes += `\n\nPlywood Replacement:
- Standard includes 20% plywood replacement
- Additional ${plywoodPercentage}% plywood replacement included in this quote`
    }

    if (gutters) {
      notes += `\n\nAdditional gutter work:
- Remove existing gutters and downspouts
- Install new seamless gutters and downspouts
- Ensure proper drainage away from foundation`
    }

    return notes
  }

  // Calculate price per square
  const calculatePricePerSquare = (totalPrice: string, squareCount: string) => {
    if (!totalPrice || !squareCount || parseFloat(squareCount) === 0) return "0.00"
    const price = parseFloat(totalPrice) / parseFloat(squareCount)
    return price.toFixed(2)
  }

  // Auto-calculate total price based on squares and price per square
  const calculateTotalPrice = (squareCount: string, pricePerSquare: string) => {
    if (!squareCount || !pricePerSquare) return "0.00"
    const total = parseFloat(squareCount) * parseFloat(pricePerSquare)
    return total.toFixed(2)
  }

  // Calculate total with gutters and downspouts
  const calculateTotalWithAddons = (basePrice: string, gutterPrice: string, downspoutPrice: string) => {
    const base = parseFloat(basePrice) || 0
    const gutters = parseFloat(gutterPrice) || 0
    const downspouts = parseFloat(downspoutPrice) || 0
    return (base + gutters + downspouts).toFixed(2)
  }

  // Initialize state with proper defaults
  const [formData, setFormData] = useState<RoofingData>(() => {
    const material = data.material || "shingles"
    const addGutters = data.addGutters || false
    const addPlywood = data.addPlywood || false
    const squareCount = data.squareCount || ""
    const pricePerSquare = data.pricePerSquare || ""
    const totalPrice = data.totalPrice || (squareCount && pricePerSquare ? 
      calculateTotalPrice(squareCount, pricePerSquare) : "")

    return {
      material,
      addGutters,
      gutterLength: data.gutterLength || "",
      addPlywood: addPlywood,
      plywoodPercentage: data.plywoodPercentage || "0",
      totalPrice,
      squareCount,
      pricePerSquare,
      gutterPrice: data.gutterPrice || "",
      downspoutCount: data.downspoutCount || "",
      downspoutPrice: data.downspoutPrice || "",
      showPricePerSquare: data.showPricePerSquare !== undefined ? data.showPricePerSquare : false,
      showPriceBreakdown: data.showPriceBreakdown !== undefined ? data.showPriceBreakdown : true,
      showPricing: data.showPricing !== undefined ? data.showPricing : true,
      scopeNotes: data.scopeNotes || generateScopeNotes(material, addGutters, addPlywood, data.plywoodPercentage || "0"),
    }
  })

  // Handle form field changes
  const handleChange = useCallback((field: keyof RoofingData, value: any) => {
    setFormData((prev) => {
      // If value hasn't changed, don't update
      if (prev[field] === value) return prev

      const newData = { ...prev, [field]: value }

      // Auto-generate scope notes when material, gutters, or plywood options change
      if (field === "material" || field === "addGutters" || field === "addPlywood" || field === "plywoodPercentage") {
        newData.scopeNotes = generateScopeNotes(
          field === "material" ? value : prev.material,
          field === "addGutters" ? value : prev.addGutters,
          field === "addPlywood" ? value : prev.addPlywood,
          field === "plywoodPercentage" ? value : prev.plywoodPercentage,
        )
      }

      // Auto-calculate price per square when total price or square count changes
      if (field === "totalPrice" && prev.squareCount) {
        newData.pricePerSquare = calculatePricePerSquare(value, prev.squareCount)
      } 
      else if (field === "squareCount" && prev.pricePerSquare) {
        // If we have a price per square, recalculate total price
        newData.totalPrice = calculateTotalPrice(value, prev.pricePerSquare)
      }
      else if (field === "pricePerSquare" && prev.squareCount) {
        // If we have square count, recalculate total price
        newData.totalPrice = calculateTotalPrice(prev.squareCount, value)
      }

      // Mark that we need to update the parent
      hasUpdatedRef.current = false

      return newData
    })
  }, [])

  // Update parent component when form data changes
  useEffect(() => {
    // Skip if we've already updated with this data
    if (hasUpdatedRef.current) return

    // Only update if data has actually changed
    if (JSON.stringify(formData) !== JSON.stringify(data)) {
      updateData(formData)
      hasUpdatedRef.current = true
    }
  }, [formData, data, updateData])

  return (
    <div className="space-y-8">
      {/* Material Selection */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0V11a1 1 0 011-1h2a1 1 0 011 1v10m3 0a1 1 0 001-1V10M9 21h6" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Roofing Material Selection</h3>
            <p className="text-gray-600 text-sm">Choose the roofing material that best fits your project requirements</p>
          </div>
        </div>

        <RadioGroup
          value={formData.material}
          onValueChange={(value) => handleChange("material", value)}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {[
            { value: "shingles", label: "Shingles", description: "Architectural asphalt shingles" },
            { value: "tile", label: "Tile", description: "Concrete or clay roof tiles" },
            { value: "tpo", label: "TPO", description: "Thermoplastic polyolefin membrane" },
            { value: "tar-gravel", label: "Tar & Gravel", description: "Built-up roofing system" },
            { value: "metal", label: "Metal", description: "Standing seam metal roofing" },
          ].map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all duration-300 border-2 ${
                formData.material === option.value
                  ? "border-blue-500 bg-blue-50 shadow-lg transform scale-105"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102"
              }`}
              onClick={() => handleChange("material", option.value)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <RadioGroupItem
                    value={option.value}
                    id={`material-${option.value}`}
                    className={`mt-1 ${formData.material === option.value ? "text-blue-600" : ""}`}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`material-${option.value}`} className="font-semibold cursor-pointer text-gray-900">
                      {option.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    {formData.material === option.value && (
                      <div className="mt-2 text-sm text-blue-700 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Selected
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </div>

      {/* Project Specifications */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Project Specifications</h3>
            <p className="text-gray-600 text-sm">Enter roofing dimensions and pricing information</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Square Count */}
          <Card className="border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <Label className="text-sm font-semibold text-gray-900">Square Count</Label>
              <p className="text-xs text-gray-600 mt-1">Total roofing squares</p>
            </div>
            <CardContent className="p-4">
              <Input
                type="number"
                value={formData.squareCount}
                onChange={(e) => handleChange("squareCount", e.target.value)}
                placeholder="Enter squares"
                min="1"
                step="0.1"
              />
              {formData.squareCount && (
                <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                  ✓ {formData.squareCount} squares
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price per Square */}
          <Card className="border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <Label className="text-sm font-semibold text-gray-900">Price per Square</Label>
              <p className="text-xs text-gray-600 mt-1">Cost per roofing square</p>
            </div>
            <CardContent className="p-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={formData.pricePerSquare}
                  onChange={(e) => handleChange("pricePerSquare", e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
              {formData.pricePerSquare && (
                <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                  ✓ ${formData.pricePerSquare} per square
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Price */}
          <Card className="border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <Label className="text-sm font-semibold text-gray-900">Total Price</Label>
              <p className="text-xs text-gray-600 mt-1">Total project cost</p>
            </div>
            <CardContent className="p-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  value={formData.totalPrice}
                  onChange={(e) => handleChange("totalPrice", e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
              {formData.totalPrice && (
                <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                  ✓ ${formData.totalPrice} total
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Additional Services</h3>
            <p className="text-gray-600 text-sm">Select additional services for your roofing project</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Plywood Replacement */}
          <Card className={`border-2 transition-all duration-300 ${
            formData.addPlywood ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200"
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="add-plywood"
                  checked={formData.addPlywood}
                  onCheckedChange={(checked) => handleChange("addPlywood", checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="add-plywood" className="font-semibold cursor-pointer text-gray-900">
                    Plywood Replacement
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">Additional plywood replacement beyond standard 20%</p>
                  
                  {formData.addPlywood && (
                    <div className="mt-3 space-y-2">
                      <Label className="text-sm font-medium">Percentage of plywood to replace:</Label>
                      <Input
                        type="number"
                        value={formData.plywoodPercentage}
                        onChange={(e) => handleChange("plywoodPercentage", e.target.value)}
                        placeholder="0"
                        min="0"
                        max="100"
                        className="w-24"
                      />
                    </div>
                  )}
                  
                  {formData.addPlywood && (
                    <div className="mt-2 text-sm text-blue-700 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Added to project
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gutter Work */}
          <Card className={`border-2 transition-all duration-300 ${
            formData.addGutters ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200"
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="add-gutters"
                  checked={formData.addGutters}
                  onCheckedChange={(checked) => handleChange("addGutters", checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="add-gutters" className="font-semibold cursor-pointer text-gray-900">
                    Gutter Installation
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">New seamless gutters and downspouts</p>
                  
                  {formData.addGutters && (
                    <div className="mt-3 space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Linear feet of gutters:</Label>
                        <Input
                          type="number"
                          value={formData.gutterLength}
                          onChange={(e) => handleChange("gutterLength", e.target.value)}
                          placeholder="0"
                          min="0"
                          className="w-32"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Gutter price:</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                            <Input
                              type="number"
                              value={formData.gutterPrice}
                              onChange={(e) => handleChange("gutterPrice", e.target.value)}
                              placeholder="0.00"
                              className="pl-8"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Downspout count:</Label>
                          <Input
                            type="number"
                            value={formData.downspoutCount}
                            onChange={(e) => handleChange("downspoutCount", e.target.value)}
                            placeholder="0"
                            min="0"
                            className="w-20"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Downspout price:</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <Input
                            type="number"
                            value={formData.downspoutPrice}
                            onChange={(e) => handleChange("downspoutPrice", e.target.value)}
                            placeholder="0.00"
                            className="pl-8 w-32"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formData.addGutters && (
                    <div className="mt-2 text-sm text-blue-700 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Added to project
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total with Add-ons Display */}
        {(formData.addGutters || formData.totalPrice) && (
          <Card className="border border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-900">Total Project Cost:</span>
                <span className="text-xl font-bold text-blue-900">
                  ${calculateTotalWithAddons(formData.totalPrice, formData.gutterPrice, formData.downspoutPrice)}
                </span>
              </div>
              {formData.addGutters && (
                <div className="mt-2 text-sm text-blue-700">
                  Includes roofing: ${formData.totalPrice || "0.00"} + 
                  gutters: ${(parseFloat(formData.gutterPrice) + parseFloat(formData.downspoutPrice) || 0).toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Display Options */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pricing Configuration</h3>
            <p className="text-gray-600 text-sm">Set pricing details and display options</p>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showPricing"
                  checked={formData.showPricing}
                  onCheckedChange={(checked) => handleChange("showPricing", checked)}
                />
                <Label htmlFor="showPricing" className="text-sm font-medium">Show Pricing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showPriceBreakdown"
                  checked={formData.showPriceBreakdown}
                  onCheckedChange={(checked) => handleChange("showPriceBreakdown", checked)}
                />
                <Label htmlFor="showPriceBreakdown" className="text-sm font-medium">Show Breakdown</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showPricePerSquare"
                  checked={formData.showPricePerSquare}
                  onCheckedChange={(checked) => handleChange("showPricePerSquare", checked)}
                />
                <Label htmlFor="showPricePerSquare" className="text-sm font-medium">Show Price/Square</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scope Description */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Scope Description</h3>
            <p className="text-gray-600 text-sm">Detailed description of work to be performed</p>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <Textarea
              value={formData.scopeNotes}
              onChange={(e) => handleChange("scopeNotes", e.target.value)}
              rows={8}
              placeholder="Enter detailed scope of work notes..."
              className="resize-none"
            />
            <div className="mt-2 text-xs text-gray-500">
              Auto-generated based on your selections. You can edit as needed.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 