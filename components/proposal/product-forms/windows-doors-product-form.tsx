"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

interface WindowsDoorsData {
  windowType: string
  windowColor: string
  doorTypes: string[]
  windowCount: string
  doorCount: string
  customColors: boolean
  windowPrice: string
  doorPrices: Record<string, string>
  showPricing: boolean
  showDoorPriceBreakdown: boolean
  scopeNotes: string
}

interface WindowsDoorsProductFormProps {
  data: WindowsDoorsData
  updateData: (data: WindowsDoorsData) => void
}

export default function WindowsDoorsProductForm({ data, updateData }: WindowsDoorsProductFormProps) {
  const [formData, setFormData] = useState<WindowsDoorsData>({
    windowType: data.windowType || "vinyl-retrofit-dual",
    windowColor: data.windowColor || "white",
    doorTypes: data.doorTypes || [],
    windowCount: data.windowCount || "0",
    doorCount: data.doorCount || "0",
    customColors: data.customColors || false,
    windowPrice: data.windowPrice || "",
    doorPrices: data.doorPrices || {},
    showPricing: data.showPricing !== undefined ? data.showPricing : true,
    showDoorPriceBreakdown: data.showDoorPriceBreakdown !== undefined ? data.showDoorPriceBreakdown : true,
    scopeNotes: data.scopeNotes || generateScopeNotes("vinyl-retrofit-dual", "white", [], false),
  })

  const windowTypes = [
    { value: "vinyl-retrofit-dual", label: "Vinyl Retrofit Dual Pane", description: "Energy-efficient dual pane vinyl retrofit windows" },
    // Other window types can be added here if needed
  ]

  const windowColors = [
    { value: "white", label: "Standard White" },
    { value: "bronze", label: "Bronze", premium: true },
    { value: "black", label: "Black", premium: true },
    { value: "tan", label: "Tan", premium: true },
  ]

  const doorOptions = [
    { value: "slider", label: "Slider Door", description: "Horizontal sliding glass door" },
    { value: "patio", label: "Patio Door", description: "Hinged patio door with glass panels" },
    { value: "french", label: "French Door", description: "Double door with glass panels" },
    { value: "entry", label: "Entry Door", description: "Front entry door" },
    { value: "interior", label: "Interior Door", description: "Interior passage door" },
  ]

  function generateScopeNotes(
    windowType: string,
    windowColor: string,
    doorTypes: string[],
    customColors: boolean,
  ): string {
    let notes = ""

    if (windowType) {
      notes += `Window Installation:\n- ${windowType.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())} with ${
        windowColor
      } frames\n- Custom order to fit existing openings\n- Remove and dispose of existing windows\n- Professional installation with proper sealing and caulking\n- Clean up and haul away of all debris\n`

      if (customColors && windowColor !== "white") {
        notes += "- Premium color upgrade\n"
      }
    }

    if (doorTypes.length > 0) {
      notes += "\nDoor Installation:\n"
      doorTypes.forEach((type) => {
        notes += `- ${type.charAt(0).toUpperCase() + type.slice(1)} door installation\n`
      })
      notes +=
        "- Remove and dispose of existing doors\n- Professional installation with proper sealing\n- Hardware installation and adjustment\n"
    }

    return notes
  }

  const handleChange = (field: keyof WindowsDoorsData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Auto-generate scope notes when key fields change
      if (field === "windowType" || field === "windowColor" || field === "doorTypes" || field === "customColors") {
        newData.scopeNotes = generateScopeNotes(
          field === "windowType" ? value : prev.windowType,
          field === "windowColor" ? value : prev.windowColor,
          field === "doorTypes" ? value : prev.doorTypes,
          field === "customColors" ? value : prev.customColors,
        )
      }

      return newData
    })
  }

  const handleDoorToggle = (door: string) => {
    setFormData((prev) => {
      const newDoorTypes = prev.doorTypes.includes(door)
        ? prev.doorTypes.filter((d) => d !== door)
        : [...prev.doorTypes, door]

      const newData = { ...prev, doorTypes: newDoorTypes }
      newData.scopeNotes = generateScopeNotes(prev.windowType, prev.windowColor, newDoorTypes, prev.customColors)

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

  // Calculate total door price
  const calculateTotalDoorPrice = () => {
    return Object.values(formData.doorPrices).reduce((total, price) => {
      return total + (parseFloat(price) || 0);
    }, 0).toFixed(2);
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="windows" className="w-full">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="windows" className="flex-1">
            Windows
          </TabsTrigger>
          <TabsTrigger value="doors" className="flex-1">
            Doors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="windows" className="pt-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Window Type</h3>
            <RadioGroup
              value={formData.windowType}
              onValueChange={(value) => handleChange("windowType", value)}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {windowTypes.map((type) => (
                <Card
                  key={type.value}
                  className={`cursor-pointer border ${formData.windowType === type.value ? "border-emerald-600" : ""}`}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <RadioGroupItem
                      value={type.value}
                      id={`window-${type.value}`}
                      className={formData.windowType === type.value ? "text-emerald-600" : ""}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`window-${type.value}`} className="font-medium cursor-pointer">
                        {type.label}
                      </Label>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Window Color</h3>
            <RadioGroup
              value={formData.windowColor}
              onValueChange={(value) => handleChange("windowColor", value)}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {windowColors.map((color) => (
                <Card
                  key={color.value}
                  className={`cursor-pointer border ${formData.windowColor === color.value ? "border-emerald-600" : ""}`}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <RadioGroupItem
                      value={color.value}
                      id={`color-${color.value}`}
                      className={formData.windowColor === color.value ? "text-emerald-600" : ""}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`color-${color.value}`} className="font-medium cursor-pointer">
                        {color.label}
                      </Label>
                      {color.premium && <p className="text-xs text-emerald-600">Premium option</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="window-count">Number of Windows</Label>
            <Input
              id="window-count"
              type="number"
              min="0"
              value={formData.windowCount}
              onChange={(e) => handleChange("windowCount", e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="custom-colors"
              checked={formData.customColors}
              onCheckedChange={(checked) => handleChange("customColors", checked)}
              className={formData.customColors ? "text-emerald-600" : ""}
            />
            <div className="space-y-1">
              <Label htmlFor="custom-colors" className="font-medium cursor-pointer">
                Premium Color Upgrade
              </Label>
              <p className="text-sm text-gray-500">Additional charge for non-standard colors</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="doors" className="pt-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Door Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doorOptions.map((door) => (
                <div key={door.value} className="flex items-start space-x-3">
                  <Checkbox
                    id={`door-${door.value}`}
                    checked={formData.doorTypes.includes(door.value)}
                    onCheckedChange={() => handleDoorToggle(door.value)}
                    className={formData.doorTypes.includes(door.value) ? "text-emerald-600" : ""}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={`door-${door.value}`} className="font-medium cursor-pointer">
                      {door.label}
                    </Label>
                    <p className="text-sm text-gray-500">{door.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="door-count">Number of Doors</Label>
            <Input
              id="door-count"
              type="number"
              min="0"
              value={formData.doorCount}
              onChange={(e) => handleChange("doorCount", e.target.value)}
              className="max-w-xs"
            />
          </div>
        </TabsContent>
      </Tabs>

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
            <Label htmlFor="window-price">Windows Total Price</Label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="window-price"
                placeholder="0.00"
                value={formData.windowPrice}
                onChange={(e) => handleChange("windowPrice", e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        {formData.doorTypes.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Door Pricing</h4>
            
            {formData.doorTypes.map((doorType) => (
              <div key={doorType} className="space-y-2">
                <Label htmlFor={`door-price-${doorType}`}>
                  {doorType.charAt(0).toUpperCase() + doorType.slice(1)} Door Price
                </Label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id={`door-price-${doorType}`}
                    placeholder="0.00"
                    value={formData.doorPrices[doorType] || ""}
                    onChange={(e) => {
                      const newDoorPrices = {...formData.doorPrices, [doorType]: e.target.value};
                      handleChange("doorPrices", newDoorPrices);
                    }}
                    className="pl-8"
                  />
                </div>
              </div>
            ))}
            
            {formData.doorTypes.length > 1 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Total Door Price: ${calculateTotalDoorPrice()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-door-price-breakdown"
                    checked={formData.showDoorPriceBreakdown}
                    onCheckedChange={(checked) => handleChange("showDoorPriceBreakdown", checked)}
                    className="size-4"
                  />
                  <Label htmlFor="show-door-price-breakdown" className="text-xs">
                    Show individual door prices (or combine into one total)
                  </Label>
                </div>
              </div>
            )}
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
