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
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Garage Door Model</h3>
        <RadioGroup
          value={formData.model}
          onValueChange={(value) => handleChange("model", value)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
        >
          {models.map((model) => (
            <Card
              key={model.value}
              className={`cursor-pointer border w-full ${formData.model === model.value ? "border-rose-600" : ""}`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <RadioGroupItem
                  value={model.value}
                  id={`model-${model.value}`}
                  className={formData.model === model.value ? "text-rose-600" : ""}
                />
                <div className="flex-1">
                  <Label htmlFor={`model-${model.value}`} className="font-medium cursor-pointer">
                    {model.label}
                  </Label>
                  <p className="text-sm text-gray-500">{model.description}</p>
                  {(model.value === "4050" || model.value === "4053") && (
                    <p className="text-xs text-rose-600 mt-1">Insulated upgrade</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full">
        <div className="space-y-2 w-full">
          <Label htmlFor="door-width">Width (feet)</Label>
          <Input
            id="door-width"
            type="number"
            min="8"
            max="20"
            step="1"
            value={formData.width}
            onChange={(e) => handleChange("width", e.target.value)}
            className="w-full"
          />
        </div>
        <div className="space-y-2 w-full">
          <Label htmlFor="door-height">Height (feet)</Label>
          <Input
            id="door-height"
            type="number"
            min="6"
            max="10"
            step="1"
            value={formData.height}
            onChange={(e) => handleChange("height", e.target.value)}
            className="w-full"
          />
        </div>
        <div className="space-y-2 w-full">
          <Label htmlFor="door-quantity">Quantity</Label>
          <Input
            id="door-quantity"
            type="number"
            min="1"
            max="4"
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-4 w-full">
        <h3 className="text-lg font-medium">Add-ons</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
          {addonOptions.map((addon) => (
            <div key={addon.value} className="flex items-start space-x-3 w-full">
              <Checkbox
                id={`addon-${addon.value}`}
                checked={formData.addons.includes(addon.value)}
                onCheckedChange={() => handleAddonToggle(addon.value)}
                className={formData.addons.includes(addon.value) ? "text-rose-600" : ""}
              />
              <div className="space-y-1 flex-1">
                <Label htmlFor={`addon-${addon.value}`} className="font-medium cursor-pointer">
                  {addon.label}
                </Label>
                <p className="text-sm text-gray-500">{addon.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 w-full">
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

        <div className="space-y-2 w-full">
          <Label htmlFor="total-price">Garage Door Total Price</Label>
          <div className="relative w-full max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="total-price"
              placeholder="0.00"
              value={formData.totalPrice}
              onChange={(e) => handleChange("totalPrice", e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>

        {formData.addons.length > 0 && (
          <div className="space-y-4 border-t pt-4 w-full">
            <h4 className="font-medium">Add-on Pricing</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
              {formData.addons.map((addon) => (
                <div key={addon} className="space-y-2 w-full">
                  <Label htmlFor={`addon-price-${addon}`}>
                    {addon.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Price
                  </Label>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id={`addon-price-${addon}`}
                      placeholder="0.00"
                      value={formData.addonPrices[addon] || ""}
                      onChange={(e) => {
                        const newAddonPrices = {...formData.addonPrices, [addon]: e.target.value};
                        handleChange("addonPrices", newAddonPrices);
                      }}
                      className="pl-8 w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {formData.addons.length > 1 && (
              <div className="mt-4 space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Total Add-ons Price: ${calculateTotalAddonPrice()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-addon-price-breakdown"
                    checked={formData.showAddonPriceBreakdown}
                    onCheckedChange={(checked) => handleChange("showAddonPriceBreakdown", checked)}
                    className="size-4"
                  />
                  <Label htmlFor="show-addon-price-breakdown" className="text-xs">
                    Show individual add-on prices (or combine into total price)
                  </Label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4 w-full">
        <h3 className="text-lg font-medium">Scope Description</h3>
        <Textarea
          value={formData.scopeNotes}
          onChange={(e) => handleChange("scopeNotes", e.target.value)}
          rows={10}
          className="font-mono text-sm w-full"
        />
      </div>
    </div>
  )
}
