"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface GarageDoorsData {
  model: string
  width: string
  height: string
  addons: string[]
  quantity: string
  totalPrice: string
  addonPrices: Record<string, string>
  showPricing: boolean
  showAddonPriceBreakdown: boolean
  scopeNotes: string
}

interface GarageDoorsProductFormProps {
  data: GarageDoorsData
  updateData: (data: GarageDoorsData) => void
}

export default function GarageDoorsProductForm({ data, updateData }: GarageDoorsProductFormProps) {
  const [formData, setFormData] = useState<GarageDoorsData>({
    model: data.model || "t50l",
    width: data.width || "16",
    height: data.height || "7",
    addons: data.addons || [],
    quantity: data.quantity || "1",
    totalPrice: data.totalPrice || "",
    addonPrices: data.addonPrices || {},
    showPricing: data.showPricing !== undefined ? data.showPricing : true,
    showAddonPriceBreakdown: data.showAddonPriceBreakdown !== undefined ? data.showAddonPriceBreakdown : false,
    scopeNotes: data.scopeNotes || generateScopeNotes("t50l", [], "16", "7"),
  })

  const models = [
    { value: "t50l", label: "T50L", description: "Standard non-insulated garage door" },
    { value: "t50s", label: "T50S", description: "Standard non-insulated garage door with windows" },
    { value: "4050", label: "4050", description: "Insulated garage door for energy efficiency" },
    { value: "4053", label: "4053", description: "Insulated garage door with windows" },
  ]

  const addonOptions = [
    { value: "clear-glass", label: "Clear Glass", description: "Clear glass window panels" },
    { value: "obscure-glass", label: "Obscure Glass", description: "Frosted glass for privacy" },
    { value: "liftmaster", label: "LiftMaster Opener", description: "Automatic door opener with remotes" },
  ]

  function generateScopeNotes(model: string, addons: string[], width: string, height: string): string {
    const isInsulated = model === "4050" || model === "4053"
    const hasWindows = model === "t50s" || model === "4053"

    let notes = `Garage Door Installation:\n- Model ${model.toUpperCase()} garage door (${width}' x ${height}')\n`

    if (isInsulated) {
      notes += "- Insulated door for improved energy efficiency\n"
    }

    if (hasWindows) {
      notes += "- Built-in window panels\n"
    }

    notes +=
      "- Remove and dispose of existing garage door\n- Professional installation with all hardware\n- Track and spring system installation\n- Testing and adjustment\n"

    if (addons.includes("clear-glass")) {
      notes += "- Clear glass window upgrade\n"
    }

    if (addons.includes("obscure-glass")) {
      notes += "- Obscure glass window upgrade for privacy\n"
    }

    if (addons.includes("liftmaster")) {
      notes += "- LiftMaster automatic opener with 2 remotes\n- Safety sensors and wall control\n"
    }

    return notes
  }

  const handleChange = (field: keyof GarageDoorsData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Auto-generate scope notes when key fields change
      if (field === "model" || field === "addons" || field === "width" || field === "height") {
        newData.scopeNotes = generateScopeNotes(
          field === "model" ? value : prev.model,
          field === "addons" ? value : prev.addons,
          field === "width" ? value : prev.width,
          field === "height" ? value : prev.height,
        )
      }

      return newData
    })
  }

  const handleAddonToggle = (addon: string) => {
    setFormData((prev) => {
      const newAddons = prev.addons.includes(addon) ? prev.addons.filter((a) => a !== addon) : [...prev.addons, addon]

      const newData = { ...prev, addons: newAddons }
      newData.scopeNotes = generateScopeNotes(prev.model, newAddons, prev.width, prev.height)

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

  // Calculate total add-on price
  const calculateTotalAddonPrice = () => {
    return Object.values(formData.addonPrices).reduce((total, price) => {
      return total + (parseFloat(price) || 0);
    }, 0).toFixed(2);
  }

  return (
    <div className="space-y-8">
      {/* Model Selection */}
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="6" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18" />
              <circle cx="18" cy="12" r="1" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Garage Door Model Selection</h3>
            <p className="text-gray-600 text-sm">Choose the garage door model that best fits your needs and style preferences</p>
          </div>
        </div>

        <RadioGroup
          value={formData.model}
          onValueChange={(value) => handleChange("model", value)}
          className="grid gap-4 md:grid-cols-2"
        >
          {models.map((model) => (
            <Card
              key={model.value}
              className={`cursor-pointer transition-all duration-300 border-2 ${
                formData.model === model.value
                  ? "border-blue-500 bg-blue-50 shadow-lg transform scale-105"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102"
              }`}
              onClick={() => handleChange("model", model.value)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                <RadioGroupItem
                  value={model.value}
                  id={`model-${model.value}`}
                    className={`mt-1 ${formData.model === model.value ? "text-blue-600" : ""}`}
                />
                <div className="flex-1">
                    <Label htmlFor={`model-${model.value}`} className="font-semibold cursor-pointer text-gray-900">
                    {model.label}
                  </Label>
                    <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                  {(model.value === "4050" || model.value === "4053") && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">✓ Insulated upgrade</p>
                    )}
                    {formData.model === model.value && (
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

      {/* Door Specifications */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Door Specifications</h3>
            <p className="text-gray-600 text-sm">Configure door dimensions and quantity</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Width */}
          <Card className="border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <Label className="text-sm font-semibold text-gray-900">Width</Label>
              <p className="text-xs text-gray-600 mt-1">Door width in feet</p>
            </div>
            <CardContent className="p-4">
              <div className="relative">
          <Input
            type="number"
            min="8"
            max="20"
            step="1"
            value={formData.width}
            onChange={(e) => handleChange("width", e.target.value)}
                  placeholder="16"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">ft</span>
              </div>
              {formData.width && (
                <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                  ✓ {formData.width} feet wide
                </div>
              )}
            </CardContent>
          </Card>

          {/* Height */}
          <Card className="border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <Label className="text-sm font-semibold text-gray-900">Height</Label>
              <p className="text-xs text-gray-600 mt-1">Door height in feet</p>
        </div>
            <CardContent className="p-4">
              <div className="relative">
          <Input
            type="number"
            min="6"
            max="10"
            step="1"
            value={formData.height}
            onChange={(e) => handleChange("height", e.target.value)}
                  placeholder="7"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">ft</span>
              </div>
              {formData.height && (
                <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                  ✓ {formData.height} feet tall
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quantity */}
          <Card className="border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <Label className="text-sm font-semibold text-gray-900">Quantity</Label>
              <p className="text-xs text-gray-600 mt-1">Number of doors</p>
        </div>
            <CardContent className="p-4">
          <Input
            type="number"
            min="1"
            max="4"
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
                placeholder="1"
              />
              {formData.quantity && (
                <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                  ✓ {formData.quantity} door{formData.quantity !== "1" ? "s" : ""}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add-ons & Upgrades */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Add-ons & Upgrades</h3>
            <p className="text-gray-600 text-sm">Select additional components and upgrades for your garage door</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {addonOptions.map((addon) => (
            <Card
              key={addon.value}
              className={`cursor-pointer transition-all duration-300 border-2 ${
                formData.addons.includes(addon.value)
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
              <Checkbox
                id={`addon-${addon.value}`}
                checked={formData.addons.includes(addon.value)}
                onCheckedChange={() => handleAddonToggle(addon.value)}
                    className="mt-1"
              />
                  <div className="flex-1">
                    <Label htmlFor={`addon-${addon.value}`} className="font-semibold cursor-pointer text-gray-900">
                  {addon.label}
                </Label>
                    <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                    {formData.addons.includes(addon.value) && (
                      <div className="mt-2 text-sm text-blue-700 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Added to system
                      </div>
                    )}
              </div>
            </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing Configuration */}
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* Base Door Price */}
          <Card className="border border-gray-200 shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <Label className="text-sm font-semibold text-gray-900">Base Door Price</Label>
              <p className="text-xs text-gray-600 mt-1">Total garage door installation cost</p>
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
                  ✓ ${formData.totalPrice} base price
        </div>
              )}
            </CardContent>
          </Card>

          {/* Add-on Pricing Display */}
        {formData.addons.length > 0 && (
            <Card className="border border-gray-200 shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <Label className="text-sm font-semibold text-gray-900">Add-on Pricing</Label>
                <p className="text-xs text-gray-600 mt-1">Individual add-on costs</p>
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
            {formData.addons.map((addon) => (
                    <div key={addon} className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 flex-1">
                        {addonOptions.find(opt => opt.value === addon)?.label}:
                      </span>
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">$</span>
                  <Input
                          type="number"
                    value={formData.addonPrices[addon] || ""}
                    onChange={(e) => {
                      const newAddonPrices = {...formData.addonPrices, [addon]: e.target.value};
                      handleChange("addonPrices", newAddonPrices);
                    }}
                          placeholder="0.00"
                          className="pl-6 text-sm h-8"
                          min="0"
                          step="0.01"
                  />
                </div>
              </div>
            ))}
            
            {formData.addons.length > 1 && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Add-ons Total:</span>
                        <span className="text-sm font-bold text-blue-600">${calculateTotalAddonPrice()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pricing Display Options */}
        {formData.addons.length > 1 && (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-addon-breakdown" className="font-medium">Show Individual Add-on Prices</Label>
                  <p className="text-sm text-gray-600 mt-1">Display individual add-on prices or combine into total</p>
                </div>
                    <Switch
                  id="show-addon-breakdown"
                      checked={formData.showAddonPriceBreakdown}
                      onCheckedChange={(checked) => handleChange("showAddonPriceBreakdown", checked)}
                    />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Scope of Work Notes */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Scope of Work Notes</h3>
            <p className="text-gray-600 text-sm">Detailed description of garage door work to be performed</p>
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
