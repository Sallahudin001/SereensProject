"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface PaintData {
  serviceType: string
  squareFootage: string
  colorTone: string
  includePaint: boolean
  includePrimer: boolean
  includePrep: boolean
  scopeNotes: string
  totalPrice: string
  showPricing: boolean
  showPriceBreakdown: boolean
}

interface PaintProductFormProps {
  data: PaintData
  updateData: (data: PaintData) => void
}

export default function PaintProductForm({ data, updateData }: PaintProductFormProps) {
  const [formData, setFormData] = useState<PaintData>({
    serviceType: data.serviceType || "exterior",
    squareFootage: data.squareFootage || "",
    colorTone: data.colorTone || "1",
    includePaint: data.includePaint !== undefined ? data.includePaint : true,
    includePrimer: data.includePrimer || true,
    includePrep: data.includePrep || true,
    scopeNotes: data.scopeNotes || generateScopeNotes("exterior", "1", true, true, true),
    totalPrice: data.totalPrice || "",
    showPricing: data.showPricing !== undefined ? data.showPricing : true,
    showPriceBreakdown: data.showPriceBreakdown !== undefined ? data.showPriceBreakdown : true,
  })

  const serviceTypes = [
    { value: "exterior", label: "Exterior", description: "Exterior house painting" },
    { value: "interior", label: "Interior", description: "Interior room painting" },
    { value: "both", label: "Both", description: "Complete interior and exterior painting" },
  ]

  const colorTones = [
    { value: "1", label: "1 Color" },
    { value: "2", label: "2-Tone" },
    { value: "3", label: "3-Tone" },
  ]

  function generateScopeNotes(
    serviceType: string,
    colorTone: string,
    includePrep: boolean,
    includePrimer: boolean,
    includePaint: boolean,
  ): string {
    let notes = `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Painting Services:\n`

    if (includePrep) {
      notes += "- Surface preparation including cleaning, scraping, and sanding\n"
      if (serviceType === "exterior" || serviceType === "both") {
        notes += "- Pressure washing of exterior surfaces\n"
      }
      notes += "- Repair of minor surface imperfections\n"
      notes += "- Masking and protection of non-painted surfaces\n"
    }

    if (includePrimer) {
      notes += "- Application of primer to prepared surfaces\n"
    }

    notes += `- ${colorTone}-tone color application\n`

    if (includePaint) {
      notes += "- Paint color will be selected by the homeowner from provided options.\n"
    } else {
      notes += "- Homeowner will purchase and supply the paint separately.\n"
    }

    notes += "- Clean up and removal of all painting materials\n"
    notes += "- Final inspection with homeowner\n"

    return notes
  }

  const handleChange = (field: keyof PaintData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Auto-generate scope notes when key fields change
      if (
        field === "serviceType" ||
        field === "colorTone" ||
        field === "includePrep" ||
        field === "includePrimer" ||
        field === "includePaint"
      ) {
        newData.scopeNotes = generateScopeNotes(
          field === "serviceType" ? value : prev.serviceType,
          field === "colorTone" ? value : prev.colorTone,
          field === "includePrep" ? value : prev.includePrep,
          field === "includePrimer" ? value : prev.includePrimer,
          field === "includePaint" ? value : prev.includePaint,
        )
      }

      return newData
    })
  }

  useEffect(() => {
    // Avoid unnecessary updates that could cause render loops
    const currentFormDataString = JSON.stringify(formData)
    const newDataString = JSON.stringify(data)

    if (currentFormDataString !== newDataString) {
      updateData(formData)
    }
  }, [formData, updateData, data])

  return (
    <div className="space-y-8">
      {/* Service Type Selection */}
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6l1.5 1.5M6 18h12" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Painting Service Type</h3>
            <p className="text-gray-600 text-sm">Choose the type of painting service for your project</p>
          </div>
        </div>

        <RadioGroup
          value={formData.serviceType}
          onValueChange={(value) => handleChange("serviceType", value)}
          className="grid gap-4 md:grid-cols-3"
        >
          {serviceTypes.map((service) => (
            <Card
              key={service.value}
              className={`cursor-pointer transition-all duration-300 border-2 ${
                formData.serviceType === service.value
                  ? "border-blue-500 bg-blue-50 shadow-lg transform scale-105"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102"
              }`}
              onClick={() => handleChange("serviceType", service.value)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                <RadioGroupItem
                  value={service.value}
                  id={`service-${service.value}`}
                    className={`mt-1 ${formData.serviceType === service.value ? "text-blue-600" : ""}`}
                />
                <div className="flex-1">
                    <Label htmlFor={`service-${service.value}`} className="font-semibold cursor-pointer text-gray-900">
                    {service.label}
                  </Label>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    {formData.serviceType === service.value && (
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
            <p className="text-gray-600 text-sm">Enter area dimensions and color configuration</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Square Footage */}
          <Card className="border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <Label className="text-sm font-semibold text-gray-900">Square Footage</Label>
              <p className="text-xs text-gray-600 mt-1">Total area to be painted</p>
            </div>
            <CardContent className="p-4">
          <Input
            type="number"
            min="0"
            placeholder="Enter square footage"
            value={formData.squareFootage}
            onChange={(e) => handleChange("squareFootage", e.target.value)}
          />
              {formData.squareFootage && (
                <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                  ✓ {formData.squareFootage} sq ft
                </div>
              )}
            </CardContent>
          </Card>

          {/* Color Tone Options */}
          <Card className="border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <Label className="text-sm font-semibold text-gray-900">Color Configuration</Label>
              <p className="text-xs text-gray-600 mt-1">Number of color tones</p>
        </div>
            <CardContent className="p-4">
          <RadioGroup
            value={formData.colorTone}
            onValueChange={(value) => handleChange("colorTone", value)}
            className="flex flex-wrap gap-4"
          >
            {colorTones.map((tone) => (
              <div key={tone.value} className="flex items-center space-x-2">
                <RadioGroupItem value={tone.value} id={`tone-${tone.value}`} />
                    <Label htmlFor={`tone-${tone.value}`} className="font-medium">{tone.label}</Label>
            </div>
            ))}
          </RadioGroup>
              {formData.colorTone && (
                <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                  ✓ {colorTones.find(t => t.value === formData.colorTone)?.label} selected
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Total Price */}
        <Card className="border border-gray-200 shadow-sm">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <Label className="text-sm font-semibold text-gray-900">Total Project Cost</Label>
            <p className="text-xs text-gray-600 mt-1">Complete painting service cost</p>
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
                ✓ ${formData.totalPrice} total cost
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Inclusions */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Service Inclusions</h3>
            <p className="text-gray-600 text-sm">Select what's included in your painting service</p>
        </div>
      </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Surface Preparation */}
          <Card className={`border-2 transition-all duration-300 ${
            formData.includePrep ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200"
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
            <Checkbox
              id="include-prep"
              checked={formData.includePrep}
              onCheckedChange={(checked) => handleChange("includePrep", checked)}
                  className="mt-1"
            />
                <div className="flex-1">
                  <Label htmlFor="include-prep" className="font-semibold cursor-pointer text-gray-900">
                Surface Preparation
              </Label>
                  <p className="text-sm text-gray-600 mt-1">Cleaning, scraping, sanding, and masking</p>
                  {formData.includePrep && (
                    <div className="mt-2 text-sm text-blue-700 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Included
                    </div>
                  )}
            </div>
          </div>
            </CardContent>
          </Card>

          {/* Primer Application */}
          <Card className={`border-2 transition-all duration-300 ${
            formData.includePrimer ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200"
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
            <Checkbox
              id="include-primer"
              checked={formData.includePrimer}
              onCheckedChange={(checked) => handleChange("includePrimer", checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="include-primer" className="font-semibold cursor-pointer text-gray-900">
                    Primer Application
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">High-quality primer for better paint adhesion</p>
                  {formData.includePrimer && (
                    <div className="mt-2 text-sm text-blue-700 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Included
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paint Material */}
          <Card className={`border-2 transition-all duration-300 ${
            formData.includePaint ? "border-blue-500 bg-blue-50 shadow-md" : "border-orange-500 bg-orange-50"
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="include-paint"
                  checked={formData.includePaint}
                  onCheckedChange={(checked) => handleChange("includePaint", checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="include-paint" className="font-semibold cursor-pointer text-gray-900">
                    Paint Material Included
              </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.includePaint 
                      ? "Paint selection from provided color options" 
                      : "Customer provides paint (labor-only quote)"}
                  </p>
                  <div className={`mt-2 text-sm font-medium flex items-center gap-1 ${
                    formData.includePaint ? "text-blue-700" : "text-orange-700"
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {formData.includePaint ? "Paint included" : "Labor-only pricing"}
                  </div>
            </div>
          </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pricing Display Options */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-100 rounded-full">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pricing Display Options</h3>
            <p className="text-gray-600 text-sm">Control what pricing information is visible to customers</p>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-2">
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scope Notes */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Scope of Work Notes</h3>
            <p className="text-gray-600 text-sm">Detailed description of painting work to be performed</p>
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
