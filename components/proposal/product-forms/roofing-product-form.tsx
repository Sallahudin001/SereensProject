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

  // Initialize state with proper defaults
  const [formData, setFormData] = useState<RoofingData>(() => {
    const material = data.material || "shingles"
    const addGutters = data.addGutters || false
    const addPlywood = data.addPlywood || false

    return {
      material,
      addGutters,
      gutterLength: data.gutterLength || "",
      addPlywood: addPlywood,
      plywoodPercentage: data.plywoodPercentage || "0",
      totalPrice: data.totalPrice || "",
      squareCount: data.squareCount || "",
      gutterPrice: data.gutterPrice || "",
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
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Roofing Material</h3>
        <RadioGroup
          value={formData.material}
          onValueChange={(value) => handleChange("material", value)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
              className={`cursor-pointer border ${formData.material === option.value ? "border-rose-600" : ""}`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <RadioGroupItem
                  value={option.value}
                  id={`material-${option.value}`}
                  className={formData.material === option.value ? "text-rose-600" : ""}
                />
                <div className="flex-1">
                  <Label htmlFor={`material-${option.value}`} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Add-ons</h3>
        <div className="flex items-start space-x-3">
          <Checkbox
            id="add-gutters"
            checked={formData.addGutters}
            onCheckedChange={(checked) => handleChange("addGutters", !!checked)}
            className={formData.addGutters ? "text-rose-600" : ""}
          />
          <div className="space-y-1">
            <Label htmlFor="add-gutters" className="font-medium cursor-pointer">
              Gutters & Downspouts
            </Label>
            <p className="text-sm text-gray-500">New seamless gutters and downspouts</p>
          </div>
        </div>

        {formData.addGutters && (
          <div className="pl-7 space-y-2">
            <Label htmlFor="gutter-length">Linear Feet (optional)</Label>
            <Input
              id="gutter-length"
              placeholder="Enter linear feet"
              value={formData.gutterLength}
              onChange={(e) => handleChange("gutterLength", e.target.value)}
              className="max-w-xs"
            />
          </div>
        )}

        <div className="flex items-start space-x-3 mt-4">
          <Checkbox
            id="add-plywood"
            checked={formData.addPlywood}
            onCheckedChange={(checked) => handleChange("addPlywood", !!checked)}
            className={formData.addPlywood ? "text-rose-600" : ""}
          />
          <div className="space-y-1">
            <Label htmlFor="add-plywood" className="font-medium cursor-pointer">
              Additional Wood/Plywood
            </Label>
            <p className="text-sm text-gray-500">Additional plywood replacement beyond standard 20%</p>
          </div>
        </div>

        {formData.addPlywood && (
          <div className="pl-7 space-y-2">
            <Label htmlFor="plywood-percentage">Percentage of Plywood Replacement</Label>
            <Input
              id="plywood-percentage"
              placeholder="Enter percentage (e.g., 30)"
              value={formData.plywoodPercentage}
              onChange={(e) => handleChange("plywoodPercentage", e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-gray-500">
              If you included more than 20% plywood in your total estimate, increase this percentage accordingly.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Pricing</h3>
          <div className="flex items-center space-x-2">
            <Label htmlFor="show-pricing">Show to customer</Label>
            <Switch
              id="show-pricing"
              checked={formData.showPricing}
              onCheckedChange={(checked) => handleChange("showPricing", checked)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label htmlFor="total-price">Roofing Price</Label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <Input
                id="total-price"
              placeholder="0.00"
                value={formData.totalPrice}
                onChange={(e) => handleChange("totalPrice", e.target.value)}
              className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="square-count">Square Count</Label>
            <Input
              id="square-count"
              placeholder="0"
              value={formData.squareCount}
              onChange={(e) => handleChange("squareCount", e.target.value)}
              className="max-w-xs"
            />
          </div>

          {formData.addGutters && (
            <div className="space-y-2">
              <Label htmlFor="gutter-price">Gutters & Downspouts Price</Label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="gutter-price"
                  placeholder="0.00"
                  value={formData.gutterPrice}
                  onChange={(e) => handleChange("gutterPrice", e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          )}
        </div>

        {formData.totalPrice && formData.squareCount && parseFloat(formData.squareCount) > 0 && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-md">
            <p className="text-sm">
              Price per Square: ${calculatePricePerSquare(formData.totalPrice, formData.squareCount)}
            </p>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-price-per-square"
                checked={formData.showPricePerSquare}
                onCheckedChange={(checked) => handleChange("showPricePerSquare", checked)}
                className="size-4"
              />
              <Label htmlFor="show-price-per-square" className="text-xs">
                Show price per square on proposal
              </Label>
            </div>
          </div>
        )}

        {formData.addGutters && formData.totalPrice && formData.gutterPrice && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-price-breakdown"
                checked={formData.showPriceBreakdown}
                onCheckedChange={(checked) => handleChange("showPriceBreakdown", checked)}
                className="size-4"
              />
              <Label htmlFor="show-price-breakdown" className="text-xs">
                Show price breakdown (roofing vs. gutters)
              </Label>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Scope Description</h3>
        <Textarea
          value={formData.scopeNotes}
          onChange={(e) => handleChange("scopeNotes", e.target.value)}
          rows={10}
          className="font-mono text-sm"
        />
      </div>
    </div>
  )
}
