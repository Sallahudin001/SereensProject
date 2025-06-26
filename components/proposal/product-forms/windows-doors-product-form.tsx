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
  showCombinedTotal: boolean
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
    showCombinedTotal: data.showCombinedTotal !== undefined ? data.showCombinedTotal : true,
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
  
  // Calculate total price (windows + doors)
  const calculateTotalPrice = () => {
    const windowPrice = parseFloat(formData.windowPrice) || 0;
    const doorPrice = Object.values(formData.doorPrices).reduce((total, price) => {
      return total + (parseFloat(price) || 0);
    }, 0);
    
    return (windowPrice + doorPrice).toFixed(2);
  }

  return (
    <div className="space-y-8">
      {/* Service Type Tabs */}
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v14M3 11h18" />
              <circle cx="8" cy="8" r="1" fill="currentColor"/>
              <circle cx="16" cy="14" r="1" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Windows & Doors Configuration</h3>
            <p className="text-gray-600 text-sm">Configure windows and door specifications for your project</p>
          </div>
        </div>

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
            {/* Window Type Selection */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Window Type Selection</h4>
                  <p className="text-gray-600 text-sm">Choose the window type for your installation</p>
                </div>
              </div>

            <RadioGroup
              value={formData.windowType}
              onValueChange={(value) => handleChange("windowType", value)}
                className="grid gap-4"
            >
              {windowTypes.map((type) => (
                <Card
                  key={type.value}
                    className={`cursor-pointer transition-all duration-300 border-2 ${
                      formData.windowType === type.value
                        ? "border-blue-500 bg-blue-50 shadow-lg transform scale-105"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102"
                    }`}
                    onClick={() => handleChange("windowType", type.value)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                    <RadioGroupItem
                      value={type.value}
                      id={`window-${type.value}`}
                          className={`mt-1 ${formData.windowType === type.value ? "text-blue-600" : ""}`}
                    />
                    <div className="flex-1">
                          <Label htmlFor={`window-${type.value}`} className="font-semibold cursor-pointer text-gray-900">
                        {type.label}
                      </Label>
                          <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                          {formData.windowType === type.value && (
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

            {/* Window Color Selection */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Window Frame Color</h4>
                  <p className="text-gray-600 text-sm">Select the color for your window frames</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {windowColors.map((color) => (
                <Card
                  key={color.value}
                    className={`cursor-pointer transition-all duration-300 border-2 ${
                      formData.windowColor === color.value
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                    }`}
                    onClick={() => handleChange("windowColor", color.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          color.value === "white" ? "bg-white border-gray-300" :
                          color.value === "bronze" ? "bg-amber-600 border-amber-700" :
                          color.value === "black" ? "bg-black border-gray-700" :
                          color.value === "tan" ? "bg-yellow-700 border-yellow-800" : "bg-gray-200"
                        }`} />
                        <Label className="font-medium cursor-pointer text-gray-900">{color.label}</Label>
                        {color.premium && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Premium</span>
                        )}
                      </div>
                      {formData.windowColor === color.value && (
                        <div className="mt-2 text-sm text-blue-700 font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Selected
                    </div>
                      )}
                  </CardContent>
                </Card>
              ))}
              </div>
            </div>

            {/* Window Specifications */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Window Specifications</h4>
                  <p className="text-gray-600 text-sm">Enter window count and pricing details</p>
                </div>
          </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Window Count */}
                <Card className="border border-gray-200 shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <Label className="text-sm font-semibold text-gray-900">Window Count</Label>
                    <p className="text-xs text-gray-600 mt-1">Number of windows to install</p>
                  </div>
                  <CardContent className="p-4">
            <Input
              type="number"
              min="0"
              value={formData.windowCount}
              onChange={(e) => handleChange("windowCount", e.target.value)}
                      placeholder="0"
                    />
                    {formData.windowCount && formData.windowCount !== "0" && (
                      <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                        ✓ {formData.windowCount} window{formData.windowCount !== "1" ? "s" : ""}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Window Price */}
                <Card className="border border-gray-200 shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <Label className="text-sm font-semibold text-gray-900">Window Price</Label>
                    <p className="text-xs text-gray-600 mt-1">Total window installation cost</p>
                  </div>
                  <CardContent className="p-4">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        value={formData.windowPrice}
                        onChange={(e) => handleChange("windowPrice", e.target.value)}
                        placeholder="0.00"
                        className="pl-8"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {formData.windowPrice && (
                      <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                        ✓ ${formData.windowPrice} total
                      </div>
                    )}
                  </CardContent>
                </Card>
          </div>

              {/* Custom Colors Toggle */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="custom-colors" className="font-medium">Premium Color Upgrade</Label>
                      <p className="text-sm text-gray-600 mt-1">Enable premium color options</p>
                    </div>
                    <Switch
              id="custom-colors"
              checked={formData.customColors}
              onCheckedChange={(checked) => handleChange("customColors", checked)}
                    />
                  </div>
                  {formData.customColors && (
                    <div className="mt-3 text-sm text-blue-700 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Premium colors enabled
            </div>
                  )}
                </CardContent>
              </Card>
          </div>
        </TabsContent>

        <TabsContent value="doors" className="pt-4 space-y-6">
            {/* Door Type Selection */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8l4 4 4-4m6 4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h12a2 2 0 012 2v4z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Door Type Selection</h4>
                  <p className="text-gray-600 text-sm">Select the types of doors to install</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {doorOptions.map((door) => (
                  <Card
                    key={door.value}
                    className={`cursor-pointer transition-all duration-300 border-2 ${
                      formData.doorTypes.includes(door.value)
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                  <Checkbox
                    id={`door-${door.value}`}
                    checked={formData.doorTypes.includes(door.value)}
                    onCheckedChange={() => handleDoorToggle(door.value)}
                          className="mt-1"
                  />
                        <div className="flex-1">
                          <Label htmlFor={`door-${door.value}`} className="font-semibold cursor-pointer text-gray-900">
                      {door.label}
                    </Label>
                          <p className="text-sm text-gray-600 mt-1">{door.description}</p>
                          {formData.doorTypes.includes(door.value) && (
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
            </div>
          </div>

            {/* Door Specifications */}
            {formData.doorTypes.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Door Specifications & Pricing</h4>
                    <p className="text-gray-600 text-sm">Configure door count and individual pricing</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Door Count */}
                  <Card className="border border-gray-200 shadow-sm">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <Label className="text-sm font-semibold text-gray-900">Total Door Count</Label>
                      <p className="text-xs text-gray-600 mt-1">Number of doors to install</p>
                    </div>
                    <CardContent className="p-4">
            <Input
              type="number"
              min="0"
              value={formData.doorCount}
              onChange={(e) => handleChange("doorCount", e.target.value)}
                        placeholder="0"
                      />
                      {formData.doorCount && formData.doorCount !== "0" && (
                        <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                          ✓ {formData.doorCount} door{formData.doorCount !== "1" ? "s" : ""}
            </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Individual Door Pricing */}
                  <Card className="border border-gray-200 shadow-sm">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <Label className="text-sm font-semibold text-gray-900">Individual Door Pricing</Label>
                      <p className="text-xs text-gray-600 mt-1">Price per door type</p>
          </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
            {formData.doorTypes.map((doorType) => (
                          <div key={doorType} className="flex items-center gap-2">
                            <span className="text-sm text-gray-700 flex-1">
                              {doorOptions.find(d => d.value === doorType)?.label}:
                            </span>
                            <div className="relative w-24">
                              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">$</span>
                  <Input
                                type="number"
                                value={formData.doorPrices[doorType] || ""}
                                onChange={(e) => handleChange("doorPrices", { ...formData.doorPrices, [doorType]: e.target.value })}
                    placeholder="0.00"
                                className="pl-6 text-sm h-8"
                                min="0"
                                step="0.01"
                  />
                </div>
              </div>
            ))}
            
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">Doors Total:</span>
                            <span className="text-sm font-bold text-blue-600">${calculateTotalDoorPrice()}</span>
                          </div>
                        </div>
                  </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Total Project Cost */}
      {(formData.windowPrice || Object.keys(formData.doorPrices).length > 0) && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Project Total</h3>
              <p className="text-gray-600 text-sm">Combined windows and doors pricing</p>
            </div>
          </div>

          <Card className="border border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="space-y-2">
                {formData.windowPrice && (
                  <div className="flex justify-between">
                    <span className="text-blue-900">Windows:</span>
                    <span className="font-medium text-blue-900">${formData.windowPrice}</span>
                  </div>
                )}
                {Object.keys(formData.doorPrices).length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-900">Doors:</span>
                    <span className="font-medium text-blue-900">${calculateTotalDoorPrice()}</span>
                  </div>
                )}
                <div className="border-t border-blue-300 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-900">Grand Total:</span>
                    <span className="text-xl font-bold text-blue-900">${calculateTotalPrice()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        )}
        
      {/* Display Options */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pricing Display Options</h3>
            <p className="text-gray-600 text-sm">Control what pricing information is visible to customers</p>
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
                  id="showDoorPriceBreakdown"
                  checked={formData.showDoorPriceBreakdown}
                  onCheckedChange={(checked) => handleChange("showDoorPriceBreakdown", checked)}
                />
                <Label htmlFor="showDoorPriceBreakdown" className="text-sm font-medium">Show Door Breakdown</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showCombinedTotal"
                  checked={formData.showCombinedTotal}
                  onCheckedChange={(checked) => handleChange("showCombinedTotal", checked)}
                />
                <Label htmlFor="showCombinedTotal" className="text-sm font-medium">Show Combined Total</Label>
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
